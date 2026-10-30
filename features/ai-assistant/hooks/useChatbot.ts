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

    setMessages((prev) => [...prev, userMsg]);
    setStatus('loading');
    setErrorMessage(null);

    const backendUrl = process.env.EXPO_PUBLIC_API_URL ?? 'https://toyhourse.vercel.app/api';

    try {
      const tempId = (Date.now() + 1).toString();
      setMessages((prev) => [
        ...prev,
        { id: tempId, role: 'assistant', content: '', isStreaming: true },
      ]);

      const xhr = new XMLHttpRequest();
      xhr.open('POST', `${backendUrl}/chat`);
      xhr.setRequestHeader('Content-Type', 'application/json');

      let seenBytes = 0;
      let currentAssistantText = '';
      const discoveredProducts: RecommendedProduct[] = [];

      const parseChunks = (chunk: string) => {
        const lines = chunk.split('\n');
        for (const line of lines) {
          const trimmed = line.trim();
          if (!trimmed) continue;

          // 1. Modern Vercel AI SDK SSE format (data: {"type": ...})
          if (trimmed.startsWith('data: ')) {
            const jsonStr = trimmed.slice(6).trim();
            if (!jsonStr || jsonStr === '[DONE]') continue;
            try {
              const event = JSON.parse(jsonStr);
              // Text streaming delta
              if (event.type === 'text-delta' && typeof event.delta === 'string') {
                currentAssistantText += event.delta;
              }
              // Product tool execution output
              else if (event.type === 'tool-output-available' && event.output?.results) {
                if (Array.isArray(event.output.results)) {
                  event.output.results.forEach((p: any) => {
                    const slug = p.slug || p.link?.replace('/products/', '') || '';
                    if (slug && !discoveredProducts.some((item) => item.slug === slug)) {
                      const img =
                        p.image ||
                        p.images?.[0]?.url ||
                        (typeof p.images?.[0] === 'string' ? p.images[0] : undefined);
                      discoveredProducts.push({
                        id: p._id || p.id,
                        name: p.name || p.title || 'Toy',
                        slug,
                        price: p.price || p.originalPrice || 0,
                        compareAtPrice: p.compareAtPrice || (p.originalPrice && p.originalPrice > p.price ? p.originalPrice : undefined),
                        inStock: p.inStock ?? true,
                        badge: p.badge,
                        image: img,
                        rating: p.rating || 4.8,
                        reviewCount: p.reviewCount,
                        category: p.category?.name || (typeof p.category === 'string' ? p.category : undefined),
                      });
                    }
                  });
                }
              }
            } catch {
              // Ignore non-JSON SSE lines
            }
          }
          // 2. Legacy Vercel AI SDK format (0:"...")
          else if (trimmed.startsWith('0:')) {
            try {
              currentAssistantText += JSON.parse(trimmed.slice(2));
            } catch {
              // Ignore parse error
            }
          }
        }
      };

      xhr.onprogress = () => {
        setStatus('streaming');
        const newData = xhr.responseText.substring(seenBytes);
        seenBytes = xhr.responseText.length;

        parseChunks(newData);

        setMessages((prev) => {
          const newMsgs = [...prev];
          const last = newMsgs[newMsgs.length - 1];
          if (last && last.id === tempId) {
            last.content = currentAssistantText;
            if (discoveredProducts.length > 0) {
              last.products = [...discoveredProducts];
            }
          }
          return newMsgs;
        });
      };

      xhr.onload = () => {
        if (xhr.status >= 400) {
          let errorText = 'Failed to process chat request.';
          try {
            const errObj = JSON.parse(xhr.responseText);
            if (errObj.error) errorText = errObj.error;
          } catch {
            // Keep default error
          }
          setErrorMessage(errorText);
          setStatus('error');
          // Remove the empty placeholder assistant message on error
          setMessages((prev) => prev.filter((m) => m.id !== tempId));
          return;
        }

        // Parse any trailing bytes
        if (seenBytes < xhr.responseText.length) {
          parseChunks(xhr.responseText.substring(seenBytes));
        }

        // Fallback markdown link parser for products: [Product Name](/products/slug)
        const productRegex = /\[([^\]]+)\]\(\/products\/([^)]+)\)/g;
        let match;
        while ((match = productRegex.exec(currentAssistantText)) !== null) {
          const name = match[1];
          const slug = match[2];
          if (!discoveredProducts.some((p) => p.slug === slug)) {
            discoveredProducts.push({
              name,
              slug,
              price: 0,
              inStock: true,
            });
          }
        }

        setMessages((prev) => {
          const newMsgs = [...prev];
          const last = newMsgs[newMsgs.length - 1];
          if (last && last.id === tempId) {
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
        setErrorMessage('Network connection error. Please try again.');
        setStatus('error');
        setMessages((prev) => prev.filter((m) => m.id !== tempId));
      };

      // Construct Vercel AI SDK UI-message compatible payload with parts
      const payload = JSON.stringify({
        messages: [...messages, userMsg].map((m) => ({
          id: m.id,
          role: m.role,
          content: m.content,
          parts: [{ type: 'text', text: m.content }],
        })),
      });

      xhr.send(payload);
    } catch {
      setErrorMessage('An unexpected error occurred.');
      setStatus('error');
    }
  }, [messages]);

  const retryLastMessage = useCallback(() => {
    if (messages.length === 0) return;
    const lastUserMsg = messages.slice().reverse().find((m) => m.role === 'user');
    if (lastUserMsg) {
      sendMessage(lastUserMsg.content);
    }
  }, [messages, sendMessage]);

  const clearChat = useCallback(() => {
    setMessages([]);
    setStatus('idle');
    setErrorMessage(null);
  }, []);

  return {
    messages,
    status,
    errorMessage,
    sendMessage,
    retryLastMessage,
    clearChat,
  };
}
