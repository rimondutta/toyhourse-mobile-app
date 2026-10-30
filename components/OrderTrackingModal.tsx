import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  ScrollView,

  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as WebBrowser from 'expo-web-browser';
import * as Clipboard from 'expo-clipboard';
import { Order, TrackingStep } from '@/types';

interface OrderTrackingModalProps {
  visible: boolean;
  order: Order | null;
  onClose: () => void;
}

export default function OrderTrackingModal({
  visible,
  order,
  onClose,
}: OrderTrackingModalProps) {
  const [copied, setCopied] = useState(false);

  if (!order) return null;

  const invoiceNumber =
    order.invoiceNumber || `TH-${order._id.slice(-6).toUpperCase()}`;
  const courierName = order.courier?.name || 'Standard Courier';
  const trackingId = order.courier?.trackingId || '';
  const trackingUrl = order.courier?.trackingUrl;

  const handleCopyTrackingId = async () => {
    if (trackingId) {
      await Clipboard.setStringAsync(trackingId);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleOpenCourierLink = async () => {
    if (trackingUrl) {
      await WebBrowser.openBrowserAsync(trackingUrl);
    } else {
      Alert.alert('Notice', 'No direct courier link available yet.');
    }
  };

  // Generate 5 visual tracking steps if not already populated
  const isCancelled = order.fulfillmentStatus === 'cancelled';
  let currentStepIndex = 0;
  if (order.fulfillmentStatus === 'delivered' || order.courierStatus === 'delivered') {
    currentStepIndex = 4;
  } else if (order.courierStatus === 'out_for_delivery') {
    currentStepIndex = 3;
  } else if (order.fulfillmentStatus === 'shipped' || order.courierStatus === 'in_transit') {
    currentStepIndex = 2;
  } else if (order.fulfillmentStatus === 'processing') {
    currentStepIndex = 1;
  }

  const steps: TrackingStep[] = order.steps || [
    {
      key: 'order_placed',
      title: 'Order Placed',
      description: 'Your order was confirmed.',
      completed: currentStepIndex >= 0 && !isCancelled,
      active: currentStepIndex === 0 && !isCancelled,
    },
    {
      key: 'processing',
      title: 'Processing',
      description: 'Packed & safety tested.',
      completed: currentStepIndex >= 1 && !isCancelled,
      active: currentStepIndex === 1 && !isCancelled,
    },
    {
      key: 'shipped',
      title: 'Handed to Courier',
      description: 'In transit with courier.',
      completed: currentStepIndex >= 2 && !isCancelled,
      active: currentStepIndex === 2 && !isCancelled,
    },
    {
      key: 'out_for_delivery',
      title: 'Out for Delivery',
      description: 'Agent on the way.',
      completed: currentStepIndex >= 3 && !isCancelled,
      active: currentStepIndex === 3 && !isCancelled,
    },
    {
      key: 'delivered',
      title: 'Delivered',
      description: 'Successfully delivered.',
      completed: currentStepIndex >= 4 && !isCancelled,
      active: currentStepIndex === 4 && !isCancelled,
    },
  ];

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View className="flex-1 justify-end bg-black/60">
        <View className="bg-white rounded-t-[32px] max-h-[85%] pb-8 shadow-2xl">
          {/* Header Bar */}
          <View className="px-6 py-5 border-b border-slate-100 flex-row items-center justify-between">
            <View className="flex-row items-center gap-3">
              <View className="w-10 h-10 rounded-2xl bg-violet-100 items-center justify-center">
                <Ionicons name="cube" size={22} color="#7C3AED" />
              </View>
              <View>
                <Text className="text-slate-900 font-bold text-lg">
                  {invoiceNumber}
                </Text>
                <Text className="text-slate-500 text-xs font-semibold">
                  Live Package Tracking
                </Text>
              </View>
            </View>

            <TouchableOpacity
              onPress={onClose}
              className="w-9 h-9 rounded-full bg-slate-100 items-center justify-center"
            >
              <Ionicons name="close" size={20} color="#475569" />
            </TouchableOpacity>
          </View>

          <ScrollView className="px-6 pt-5" showsVerticalScrollIndicator={false}>
            {/* Courier Info Card */}
            <View className="bg-slate-50 rounded-2xl p-4 border border-slate-200 mb-6">
              <View className="flex-row items-center justify-between mb-3">
                <Text className="text-slate-500 text-xs font-bold uppercase tracking-wider">
                  Partner Courier
                </Text>
                <View className="bg-violet-100 px-3 py-1 rounded-full">
                  <Text className="text-violet-800 font-bold text-xs">
                    {courierName}
                  </Text>
                </View>
              </View>

              {trackingId ? (
                <View className="flex-row items-center justify-between pt-2 border-t border-slate-200">
                  <Text className="text-slate-600 text-xs font-medium">
                    Tracking ID:
                  </Text>
                  <TouchableOpacity
                    onPress={handleCopyTrackingId}
                    className="flex-row items-center gap-1.5 bg-white px-2.5 py-1 rounded-lg border border-slate-200"
                  >
                    <Text className="text-violet-700 font-mono font-bold text-xs">
                      {trackingId}
                    </Text>
                    <Ionicons
                      name={copied ? 'checkmark-circle' : 'copy-outline'}
                      size={14}
                      color={copied ? '#10B981' : '#7C3AED'}
                    />
                  </TouchableOpacity>
                </View>
              ) : null}

              {trackingUrl ? (
                <TouchableOpacity
                  onPress={handleOpenCourierLink}
                  className="mt-3 bg-slate-900 py-3 rounded-xl flex-row items-center justify-center gap-2"
                >
                  <Text className="text-white font-bold text-xs uppercase tracking-wider">
                    Track on {courierName}
                  </Text>
                  <Ionicons name="open-outline" size={14} color="#FFFFFF" />
                </TouchableOpacity>
              ) : null}
            </View>

            {/* Stepper Progress Bar */}
            <View className="bg-white rounded-2xl p-5 border border-slate-200 mb-6">
              <Text className="text-slate-900 font-bold text-sm uppercase tracking-wider mb-5">
                Delivery Progress
              </Text>

              <View className="space-y-4">
                {steps.map((step, idx) => (
                  <View key={step.key} className="flex-row items-start gap-4">
                    {/* Stepper Dot / Line */}
                    <View className="items-center">
                      <View
                        className={`w-8 h-8 rounded-full items-center justify-center ${
                          step.completed
                            ? 'bg-emerald-500'
                            : step.active
                            ? 'bg-violet-600 ring-4 ring-violet-100'
                            : 'bg-slate-100 border border-slate-200'
                        }`}
                      >
                        {step.completed ? (
                          <Ionicons name="checkmark" size={16} color="#FFFFFF" />
                        ) : idx === 1 ? (
                          <Ionicons name="cube-outline" size={14} color={step.active ? '#FFF' : '#94A3B8'} />
                        ) : idx === 2 ? (
                          <Ionicons name="bus-outline" size={14} color={step.active ? '#FFF' : '#94A3B8'} />
                        ) : idx === 3 ? (
                          <Ionicons name="bicycle-outline" size={14} color={step.active ? '#FFF' : '#94A3B8'} />
                        ) : (
                          <Text
                            className={`font-bold text-xs ${
                              step.active ? 'text-white' : 'text-slate-400'
                            }`}
                          >
                            {idx + 1}
                          </Text>
                        )}
                      </View>

                      {idx < steps.length - 1 && (
                        <View
                          className={`w-0.5 h-6 my-1 ${
                            step.completed ? 'bg-emerald-500' : 'bg-slate-200'
                          }`}
                        />
                      )}
                    </View>

                    {/* Step Info */}
                    <View className="flex-1 pt-1">
                      <Text
                        className={`font-bold text-sm ${
                          step.completed || step.active
                            ? 'text-slate-900'
                            : 'text-slate-400'
                        }`}
                      >
                        {step.title}
                      </Text>
                      <Text className="text-slate-500 text-xs font-medium mt-0.5">
                        {step.description}
                      </Text>
                    </View>
                  </View>
                ))}
              </View>
            </View>

            {/* Checkpoint History Timeline */}
            {order.timeline && order.timeline.length > 0 ? (
              <View className="bg-slate-50 rounded-2xl p-5 border border-slate-200 mb-8">
                <Text className="text-slate-900 font-bold text-sm uppercase tracking-wider mb-4">
                  Checkpoint Log
                </Text>
                <View className="space-y-4">
                  {order.timeline.map((item, index) => (
                    <View key={index} className="border-l-2 border-violet-400 pl-3">
                      <Text className="font-bold text-xs text-slate-900">
                        {item.title}
                      </Text>
                      <Text className="text-slate-600 text-[11px] mt-0.5">
                        {item.description}
                      </Text>
                      <Text className="text-slate-400 text-[10px] mt-1 font-mono">
                        {new Date(item.timestamp).toLocaleString()}
                      </Text>
                    </View>
                  ))}
                </View>
              </View>
            ) : null}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}
