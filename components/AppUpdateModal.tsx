import React from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type { AppVersionConfig, UpdateType } from '@/hooks/useAppUpdate';
import { openUpdateUrl } from '@/hooks/useAppUpdate';

// ─────────────────────────────────────────────────────────────

interface AppUpdateModalProps {
  visible: boolean;
  updateType: UpdateType;
  config: AppVersionConfig;
  installedVersion: string;
  onDismiss: () => void;
}

/**
 * AppUpdateModal
 *
 * Matches the existing RatingModal / modal design of the app:
 *  - bg-black/70 backdrop
 *  - bg-surface rounded-3xl card
 *  - bg-primary CTA button
 *  - text-text-primary / text-text-secondary colours
 *
 * For forced updates the backdrop & "Later" button are non-interactive
 * so the user cannot dismiss the modal.
 */
export default function AppUpdateModal({
  visible,
  updateType,
  config,
  installedVersion,
  onDismiss,
}: AppUpdateModalProps) {
  const isForced = updateType === 'forced';

  const handleUpdate = () => openUpdateUrl(config.androidUrl);

  // Forced: wrap in a non-dismissible shell; Optional: allow backdrop tap
  const BackdropWrapper = ({ children }: { children: React.ReactNode }) =>
    isForced ? (
      // Non-interactive backdrop — user cannot dismiss
      <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.85)', alignItems: 'center', justifyContent: 'center', paddingHorizontal: 16 }}>
        {children}
      </View>
    ) : (
      <TouchableWithoutFeedback onPress={onDismiss}>
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.70)', alignItems: 'center', justifyContent: 'center', paddingHorizontal: 16 }}>
          <TouchableWithoutFeedback>
            <View>{children}</View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    );

  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent={true}
      // Forced: prevent hardware back button from closing the modal
      onRequestClose={isForced ? undefined : onDismiss}
    >
      <BackdropWrapper>
        <View className="bg-surface rounded-3xl p-6 w-full max-w-sm">
          {/* Icon */}
          <View className="items-center mb-5">
            <View className="bg-primary/20 rounded-full w-20 h-20 items-center justify-center mb-4">
              <Ionicons
                name={isForced ? 'alert-circle' : 'rocket'}
                size={40}
                color="#8B5CF6"
              />
            </View>

            {/* Title */}
            <Text className="text-text-primary text-2xl font-bold text-center mb-2">
              {isForced ? 'Update Required 🔒' : 'New Update Available 🚀'}
            </Text>

            {/* Message */}
            <Text className="text-text-secondary text-center text-sm leading-5">
              {config.updateMessage}
            </Text>
          </View>

          {/* Version info */}
          <View className="bg-background rounded-2xl p-4 mb-5 gap-2">
            <View className="flex-row justify-between items-center">
              <Text className="text-text-secondary text-sm">Installed version</Text>
              <Text className="text-text-primary font-semibold text-sm">
                v{installedVersion}
              </Text>
            </View>
            <View className="h-px bg-rule-grey/30" />
            <View className="flex-row justify-between items-center">
              <Text className="text-text-secondary text-sm">Latest version</Text>
              <View className="bg-primary/20 rounded-full px-3 py-0.5">
                <Text className="text-primary font-bold text-sm">
                  v{config.latestVersion}
                </Text>
              </View>
            </View>
          </View>

          {/* Buttons */}
          <View className="gap-3">
            <TouchableOpacity
              className="bg-primary rounded-2xl py-4 items-center"
              activeOpacity={0.8}
              onPress={handleUpdate}
            >
              <Text className="text-background font-bold text-base">
                Update Now
              </Text>
            </TouchableOpacity>

            {/* Only show Later for optional updates */}
            {!isForced && (
              <TouchableOpacity
                className="bg-surface-lighter rounded-2xl py-4 items-center border border-rule-grey/30"
                activeOpacity={0.7}
                onPress={onDismiss}
              >
                <Text className="text-text-secondary font-semibold text-base">
                  Later
                </Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </BackdropWrapper>
    </Modal>
  );
}
