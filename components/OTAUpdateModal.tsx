import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Updates from 'expo-updates';
import type { OTAStatus } from '@/hooks/useOTAUpdate';

// ─────────────────────────────────────────────────────────────

interface OTAUpdateModalProps {
  visible: boolean;
  status: OTAStatus;
  updateMessage: string;
  error: string | null;
  /** If true, user cannot dismiss — must update */
  forceUpdate?: boolean;
  onDownload: () => Promise<void>;
  onApply: () => Promise<void>;
  onDismiss: () => void;
}

/**
 * OTAUpdateModal
 *
 * Follows the exact same design pattern as RatingModal and AppUpdateModal:
 *  - bg-black/70 backdrop
 *  - bg-surface rounded-3xl card
 *  - bg-primary CTA button
 *  - text-text-primary / text-text-secondary colours
 *
 * States:
 *  available   → "New Update Available" + Download button
 *  downloading → loading spinner, buttons disabled
 *  ready       → "Restart Now" button
 *  error       → error message, retry button
 */
export default function OTAUpdateModal({
  visible,
  status,
  updateMessage,
  error,
  forceUpdate = false,
  onDownload,
  onApply,
  onDismiss,
}: OTAUpdateModalProps) {
  const [isActing, setIsActing] = useState(false);

  const handleDownload = async () => {
    setIsActing(true);
    await onDownload();
    setIsActing(false);
  };

  const handleApply = async () => {
    setIsActing(true);
    await onApply();
    setIsActing(false);
  };

  // Get the current update ID or channel for display
  const updateId = Updates.updateId ?? null;
  const channel = Updates.channel ?? '—';

  const isDownloading = status === 'downloading' || isActing;
  const isReady       = status === 'ready';
  const hasError      = status === 'error' && !!error;

  // ── Backdrop ──────────────────────────────────────────────

  const Backdrop = ({ children }: { children: React.ReactNode }) =>
    forceUpdate ? (
      <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.85)', alignItems: 'center', justifyContent: 'center', paddingHorizontal: 16 }}>
        {children}
      </View>
    ) : (
      <TouchableWithoutFeedback onPress={isDownloading ? undefined : onDismiss}>
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.70)', alignItems: 'center', justifyContent: 'center', paddingHorizontal: 16 }}>
          <TouchableWithoutFeedback>
            <View>{children}</View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    );

  // ── Icon / title based on state ───────────────────────────

  const iconName = isReady ? 'checkmark-circle' : hasError ? 'alert-circle' : 'rocket';
  const iconColor = isReady ? '#10B981' : hasError ? '#EF4444' : '#8B5CF6';

  const title = isReady
    ? 'Update Ready ✅'
    : hasError
    ? 'Download Failed'
    : 'New Update Available 🚀';

  const description = isReady
    ? 'Restart the app to apply the latest update.'
    : hasError
    ? (error ?? 'Something went wrong.')
    : (updateMessage || 'A new update is available with improvements and bug fixes.');

  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent={true}
      onRequestClose={forceUpdate || isDownloading ? undefined : onDismiss}
    >
      <Backdrop>
        <View className="bg-surface rounded-3xl p-6 w-full max-w-sm">

          {/* Icon */}
          <View className="items-center mb-5">
            <View
              className="rounded-full w-20 h-20 items-center justify-center mb-4"
              style={{ backgroundColor: `${iconColor}20` }}
            >
              {isDownloading ? (
                <ActivityIndicator size="large" color="#8B5CF6" />
              ) : (
                <Ionicons name={iconName as any} size={40} color={iconColor} />
              )}
            </View>

            {/* Title */}
            <Text className="text-text-primary text-2xl font-bold text-center mb-2">
              {isDownloading ? 'Downloading…' : title}
            </Text>

            {/* Description */}
            <Text className="text-text-secondary text-center text-sm leading-5">
              {isDownloading
                ? 'Please wait while we download the update.'
                : description}
            </Text>
          </View>

          {/* Info row */}
          {!isDownloading && !isReady && (
            <View className="bg-background rounded-2xl p-4 mb-5 gap-2">
              <View className="flex-row justify-between items-center">
                <Text className="text-text-secondary text-sm">Channel</Text>
                <Text className="text-text-primary font-semibold text-sm">{channel}</Text>
              </View>
              {updateId && (
                <>
                  <View className="h-px bg-rule-grey/30" />
                  <View className="flex-row justify-between items-center">
                    <Text className="text-text-secondary text-sm">Update ID</Text>
                    <Text className="text-text-primary font-mono text-xs" numberOfLines={1}>
                      {updateId.slice(0, 12)}…
                    </Text>
                  </View>
                </>
              )}
            </View>
          )}

          {/* Buttons */}
          <View className="gap-3">
            {/* Primary action */}
            {isReady ? (
              <TouchableOpacity
                className="bg-primary rounded-2xl py-4 items-center"
                activeOpacity={0.8}
                onPress={handleApply}
                disabled={isActing}
              >
                <Text className="text-background font-bold text-base">Restart Now</Text>
              </TouchableOpacity>
            ) : hasError ? (
              <TouchableOpacity
                className="bg-primary rounded-2xl py-4 items-center"
                activeOpacity={0.8}
                onPress={handleDownload}
                disabled={isDownloading}
              >
                <Text className="text-background font-bold text-base">Try Again</Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                className="bg-primary rounded-2xl py-4 items-center"
                activeOpacity={0.8}
                onPress={handleDownload}
                disabled={isDownloading}
              >
                {isDownloading ? (
                  <ActivityIndicator size="small" color="#0F172A" />
                ) : (
                  <Text className="text-background font-bold text-base">Download Update</Text>
                )}
              </TouchableOpacity>
            )}

            {/* Secondary: Later (hidden for force updates and during download/ready) */}
            {!forceUpdate && !isDownloading && !isReady && (
              <TouchableOpacity
                className="bg-surface-lighter rounded-2xl py-4 items-center border border-rule-grey/30"
                activeOpacity={0.7}
                onPress={onDismiss}
              >
                <Text className="text-text-secondary font-semibold text-base">Later</Text>
              </TouchableOpacity>
            )}

            {/* On ready state, allow deferring restart */}
            {isReady && !forceUpdate && (
              <TouchableOpacity
                className="bg-surface-lighter rounded-2xl py-4 items-center border border-rule-grey/30"
                activeOpacity={0.7}
                onPress={onDismiss}
              >
                <Text className="text-text-secondary font-semibold text-base">Later</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </Backdrop>
    </Modal>
  );
}
