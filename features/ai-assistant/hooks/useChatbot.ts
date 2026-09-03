import { useState, useCallback } from 'react';
import type { ChatMessage, RecommendedProduct } from '../types';

export default function useChatbot() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [status, setStatus] = useState<'idle' | 'loading' | 'streaming' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  
  const sendMessage = useCallback(async (text: string) => {
    if (!text.trim()) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: text,
    };
    
    setMessages(prev => [...prev, userMsg]);
    setStatus('loading');
    setErrorMessage(null);

    const backendUrl = process.env.EXPO_PUBLIC_API_URL ?? 'https://toyhourse.vercel.app/api';

    try {
      const tempId = (Date.now() + 1).toString();
      setMessages(prev => [
        ...prev,
        { id: tempId, role: 'assistant', content: '', isStreaming: true }
      ]);

      // We use XMLHttpRequest here as a reliable way to stream in React Native 
      // without worrying about fetch() polyfill inconsistencies with getReader()
      const xhr = new XMLHttpRequest();
      xhr.open('POST', `${backendUrl}/chat`);
      xhr.setRequestHeader('Content-Type', 'application/json');
      
      let seenBytes = 0;
      let currentAssistantText = '';
      let discoveredProducts: RecommendedProduct[] = [];

      xhr.onprogress = () => {
        setStatus('streaming');
        const newData = xhr.responseText.substring(seenBytes);
        seenBytes = xhr.responseText.length;
        
        const lines = newData.split('\n');
        for (const line of lines) {
          if (line.startsWith('0:')) {
            try {
              currentAssistantText += JSON.parse(line.substring(2));
              setMessages(prev => {
                const newMsgs = [...prev];
                const last = newMsgs[newMsgs.length - 1];
                if (last.id === tempId) {
                  last.content = currentAssistantText;
                }
                return newMsgs;
              });
            } catch (e) {}
          } else if (line.length > 2) {
             // Attempt to scrape any product data from tool calls/results in the stream
             try {
               const payload = line.substring(2);
               if (payload.includes('"price"') && payload.includes('"name"')) {
                 const parsed = JSON.parse(payload);
                 // deeply search for products
                 const extractProducts = (obj: any) => {
                   if (Array.isArray(obj)) {
                     obj.forEach(extractProducts);
                   } else if (obj && typeof obj === 'object') {
                     if (obj.name && obj.price !== undefined && obj.slug) {
                       // Found a product
                       if (!discoveredProducts.some(p => p.slug === obj.slug)) {
                         discoveredProducts.push({
                           name: obj.name,
                           slug: obj.slug || obj.link?.replace('/products/', ''),
                           price: obj.price || obj.originalPrice || 0,
                           inStock: obj.inStock !== undefined ? obj.inStock : (obj.stock !== undefined ? obj.stock > 0 : true),
                           badge: obj.badge,
                         });
                       }
                     }
                     Object.values(obj).forEach(extractProducts);
                   }
                 };
                 extractProducts(parsed);
               }
             } catch (e) {}
          }
        }
      };

      xhr.onload = () => {
        // Fallback for markdown links if tool result parsing didn't catch them
        const productRegex = /\[([^\]]+)\]\(\/products\/([^)]+)\)/g;
        let match;
        while ((match = productRegex.exec(currentAssistantText)) !== null) {
          const name = match[1];
          const slug = match[2];
          if (!discoveredProducts.some(p => p.slug === slug)) {
            discoveredProducts.push({
              name,
              slug,
              price: 0,
              inStock: true,
            });
          }
        }

        setMessages(prev => {
          const newMsgs = [...prev];
          const last = newMsgs[newMsgs.length - 1];
          if (last.id === tempId) {
            last.isStreaming = false;
            last.content = currentAssistantText;
            if (discoveredProducts.length > 0) {
              last.products = [...discoveredProducts];
            }
          }
          return newMsgs;
        });
        setStatus('idle');
      };

      xhr.onerror = () => {
        setErrorMessage('Network error occurred. Please try again.');
        setStatus('error');
      };

      const payload = JSON.stringify({
        messages: [...messages, userMsg].map(m => ({ role: m.role, content: m.content })),
      });
      xhr.send(payload);

    } catch (error) {
      setErrorMessage('An unexpected error occurred.');
      setStatus('error');
    }
  }, [messages]);

  const retryLastMessage = useCallback(() => {
    if (messages.length === 0) return;
    const lastUserMsg = messages.slice().reverse().find(m => m.role === 'user');
    if (lastUserMsg) {
      sendMessage(lastUserMsg.content);
    }
  }, [messages, sendMessage]);

  return {
    messages,
    status,
    errorMessage,
    sendMessage,
    retryLastMessage,
  };
}
