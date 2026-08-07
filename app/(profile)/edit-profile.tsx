import SafeScreen from "@/components/SafeScreen";
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator, Alert } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "@/context/AuthContext";
import { useState } from "react";
import apiClient from "@/lib/api";
import { router } from "expo-router";

export default function EditProfileScreen() {
  const { user, refreshUser } = useAuth();
  
  const [name, setName] = useState(user?.name || "");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSave = async () => {
    if (!name.trim()) {
      Alert.alert("Error", "Name cannot be empty");
      return;
    }

    setIsSubmitting(true);
    try {
      const { data } = await apiClient.put("/auth/mobile/update-profile", {
        name: name.trim(),
      });
      
      if (data.success) {
        await refreshUser();
        Alert.alert("Success", "Profile updated successfully!", [
          { text: "OK", onPress: () => router.back() }
        ]);
      } else {
        Alert.alert("Error", data.error || "Failed to update profile");
      }
    } catch (error: any) {
      Alert.alert("Error", error?.response?.data?.error || "An error occurred");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!user) return null;

  return (
    <SafeScreen>
      {/* Header */}
      <View className="flex-row items-center px-6 pb-4">
        <TouchableOpacity 
          className="w-10 h-10 bg-surface rounded-full items-center justify-center mr-4"
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={20} color="#0F172A" />
        </TouchableOpacity>
        <Text className="text-text-primary text-2xl font-bold">Edit Profile</Text>
      </View>

      <View className="px-6 mt-4">
        {/* Avatar placeholder */}
        <View className="items-center mb-8">
          <View className="w-24 h-24 rounded-full bg-primary/20 items-center justify-center relative">
            <Ionicons name="person" size={40} color="#00D9FF" />
            <View className="absolute bottom-0 right-0 bg-surface w-8 h-8 rounded-full items-center justify-center border-2 border-background">
              <Ionicons name="camera" size={14} color="#0F172A" />
            </View>
          </View>
          <Text className="text-text-secondary mt-3 text-sm">Tap to change (Coming soon)</Text>
        </View>

        {/* Form */}
        <View className="space-y-4">
          <View>
            <Text className="text-text-secondary text-sm font-semibold mb-2 ml-1">Full Name</Text>
            <View className="bg-surface flex-row items-center px-4 py-3 rounded-2xl border border-surface">
              <Ionicons name="person-outline" size={20} color="#64748B" />
              <TextInput
                className="flex-1 ml-3 text-text-primary text-base"
                value={name}
                onChangeText={setName}
                placeholder="Enter your full name"
                placeholderTextColor="#94A3B8"
              />
            </View>
          </View>

          <View>
            <Text className="text-text-secondary text-sm font-semibold mb-2 ml-1 mt-4">Email Address</Text>
            <View className="bg-surface/50 flex-row items-center px-4 py-3 rounded-2xl border border-surface/50 opacity-70">
              <Ionicons name="mail-outline" size={20} color="#64748B" />
              <TextInput
                className="flex-1 ml-3 text-text-secondary text-base"
                value={user.email}
                editable={false}
              />
            </View>
            <Text className="text-text-secondary text-xs mt-1 ml-1">Email cannot be changed</Text>
          </View>
        </View>

        {/* Submit Button */}
        <TouchableOpacity
          className={`bg-primary rounded-2xl py-4 mt-8 flex-row justify-center items-center ${
            isSubmitting || !name.trim() || name === user.name ? "opacity-50" : ""
          }`}
          disabled={isSubmitting || !name.trim() || name === user.name}
          onPress={handleSave}
          activeOpacity={0.8}
        >
          {isSubmitting ? (
            <ActivityIndicator color="#0F172A" />
          ) : (
            <Text className="text-background font-bold text-lg">Save Changes</Text>
          )}
        </TouchableOpacity>
      </View>
    </SafeScreen>
  );
}
