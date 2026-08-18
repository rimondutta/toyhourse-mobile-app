import SafeScreen from "@/components/SafeScreen";
import { useAuth } from "@/context/AuthContext";
import { usePushNotifications } from "@/hooks/usePushNotifications";

import { ScrollView, Text, TouchableOpacity, View, RefreshControl } from "react-native";
import { Image } from "expo-image";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import * as ImagePicker from "expo-image-picker";
import { useState } from "react";
import { Alert, ActivityIndicator } from "react-native";
import apiClient from "@/lib/api";

const MENU_ITEMS = [
  { id: 1, icon: "person-outline", title: "Edit Profile", color: "#3B82F6", action: "/edit-profile", requiresAuth: true },
  { id: 2, icon: "list-outline", title: "Orders", color: "#10B981", action: "/orders", requiresAuth: true },
  { id: 3, icon: "location-outline", title: "Addresses", color: "#F59E0B", action: "/addresses", requiresAuth: true },
  { id: 4, icon: "heart-outline", title: "Wishlist", color: "#EF4444", action: "/wishlist", requiresAuth: true },
  { id: 5, icon: "newspaper-outline", title: "Blogs", color: "#8B5CF6", action: "/blogs" },
  { id: 6, icon: "information-circle-outline", title: "About Us", color: "#EC4899", action: "/about" },
  { id: 7, icon: "mail-outline", title: "Contact Us", color: "#14B8A6", action: "/contact" },
];

const ProfileScreen = () => {
  const { signOut, user, refreshUser } = useAuth();
  const { unreadCount } = usePushNotifications();
  const [localImage, setLocalImage] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = async () => {
    setRefreshing(true);
    await refreshUser();
    setRefreshing(false);
  };

  const handleMenuPress = (action: string) => {
    router.push(action as any);
  };

  const processProfileImage = async (result: ImagePicker.ImagePickerResult) => {
    if (result.canceled || !result.assets[0].base64) return;

    setIsUploading(true);
    setLocalImage(result.assets[0].uri);

    try {
      const base64Data = `data:${result.assets[0].mimeType || "image/jpeg"};base64,${result.assets[0].base64}`;
      const response = await apiClient.post("/users/profile/image", { imageBase64: base64Data });

      if (response.data?.success) {
        await refreshUser();
        Alert.alert("Success", "Profile photo updated successfully!");
      } else {
        throw new Error("Failed to upload image");
      }
    } catch (error: any) {
      console.error(error);
      Alert.alert("Error", "Could not upload profile photo.");
      setLocalImage(null);
    } finally {
      setIsUploading(false);
    }
  };

  const handleImageChange = async () => {
    if (isUploading) return;
    Alert.alert("Change Profile Photo", "Choose a method", [
      {
        text: "Camera",
        onPress: async () => {
          const { granted } = await ImagePicker.requestCameraPermissionsAsync();
          if (!granted) return Alert.alert("Permission Denied", "Camera permission is required.");
          const result = await ImagePicker.launchCameraAsync({
            mediaTypes: ["images"],
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.8,
            base64: true,
          });
          processProfileImage(result);
        },
      },
      {
        text: "Gallery",
        onPress: async () => {
          const { granted } = await ImagePicker.requestMediaLibraryPermissionsAsync();
          if (!granted) return Alert.alert("Permission Denied", "Gallery permission is required.");
          const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ["images"],
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.8,
            base64: true,
          });
          processProfileImage(result);
        },
      },
      { text: "Cancel", style: "cancel" },
    ]);
  };

  return (
    <SafeScreen>
      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 100 }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#8B5CF6"
            colors={["#8B5CF6"]}
          />
        }
      >
        {/* HEADER */}
        <View className="px-6 pb-8">
          <View className="bg-surface rounded-3xl p-6">
            {user ? (
              <View className="flex-row items-center">
                <TouchableOpacity className="relative" onPress={handleImageChange} activeOpacity={0.8}>
                  {localImage || user.image ? (
                    <Image
                      source={{ uri: (localImage || user.image) as string }}
                      style={{ width: 80, height: 80, borderRadius: 40 }}
                      transition={200}
                    />
                  ) : (
                    <View className="w-20 h-20 rounded-full bg-primary/20 items-center justify-center">
                      <Ionicons name="person" size={36} color="#00D9FF" />
                    </View>
                  )}
                  {isUploading ? (
                    <View className="absolute -bottom-1 -right-1 bg-surface rounded-full size-8 items-center justify-center border-2 border-surface shadow-sm">
                      <ActivityIndicator size="small" color="#8B5CF6" />
                    </View>
                  ) : (
                    <View className="absolute -bottom-1 -right-1 bg-primary rounded-full size-8 items-center justify-center border-2 border-surface shadow-sm">
                      <Ionicons name="camera" size={16} color="#0F172A" />
                    </View>
                  )}
                </TouchableOpacity>

                <View className="flex-1 ml-4">
                  <Text className="text-text-primary text-2xl font-bold mb-1">{user.name}</Text>
                  <Text className="text-text-secondary text-sm">{user.email}</Text>
                </View>
              </View>
            ) : (
              <View className="items-center py-2">
                <Ionicons name="person-circle-outline" size={64} color="#64748B" />
                <Text className="text-text-primary text-xl font-bold mt-2 mb-1">
                  You are not signed in
                </Text>
                <Text className="text-text-secondary text-center text-sm mb-6">
                  Sign in or create an account to manage your profile, orders, and addresses.
                </Text>
                <TouchableOpacity
                  className="bg-primary rounded-2xl w-full py-4 items-center"
                  activeOpacity={0.8}
                  onPress={() => router.push("/(auth)" as any)}
                >
                  <Text className="text-background font-bold text-base">Sign In / Register</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </View>

        {/* MENU ITEMS */}
        <View className="flex-row flex-wrap gap-2 mx-6 mb-3">
          {MENU_ITEMS.filter((item) => !item.requiresAuth || user).map((item) => (
            <TouchableOpacity
              key={item.id}
              className="bg-surface rounded-2xl p-6 items-center justify-center"
              style={{ width: "48%" }}
              activeOpacity={0.7}
              onPress={() => handleMenuPress(item.action)}
            >
              <View
                className="rounded-full w-16 h-16 items-center justify-center mb-4"
                style={{ backgroundColor: item.color + "20" }}
              >
                <Ionicons name={item.icon as any} size={28} color={item.color} />
              </View>
              <Text className="text-text-primary font-bold text-base">{item.title}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* NOTIFICATIONS BTN */}
        <View className="mb-3 mx-6 bg-surface rounded-2xl p-4">
          <TouchableOpacity
            className="flex-row items-center justify-between py-2"
            activeOpacity={0.7}
            onPress={() => router.push("/notifications" as any)}
          >
            <View className="flex-row items-center">
              <View style={{ position: "relative" }}>
                <Ionicons name="notifications-outline" size={22} color="#0F172A" />
                {unreadCount > 0 && (
                  <View
                    style={{
                      position: "absolute",
                      top: -4,
                      right: -6,
                      backgroundColor: "#EF4444",
                      borderRadius: 8,
                      minWidth: 16,
                      height: 16,
                      alignItems: "center",
                      justifyContent: "center",
                      paddingHorizontal: 3,
                    }}
                  >
                    <Text style={{ color: "#FFF", fontSize: 9, fontWeight: "800" }}>
                      {unreadCount > 99 ? "99+" : unreadCount}
                    </Text>
                  </View>
                )}
              </View>
              <Text className="text-text-primary font-semibold ml-3">Notifications</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#64748B" />
          </TouchableOpacity>
        </View>

        {/* PRIVACY AND SECURITY LINK */}
        <View className="mb-3 mx-6 bg-surface rounded-2xl p-4">
          <TouchableOpacity
            className="flex-row items-center justify-between py-2"
            activeOpacity={0.7}
            onPress={() => router.push("/privacy-security" as any)}
          >
            <View className="flex-row items-center">
              <Ionicons name="shield-checkmark-outline" size={22} color="#0F172A" />
              <Text className="text-text-primary font-semibold ml-3">Privacy & Security</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#64748B" />
          </TouchableOpacity>
        </View>

        {/* SIGN OUT BTN — only when signed in */}
        {user && (
          <TouchableOpacity
            className="mx-6 mb-3 bg-surface rounded-2xl py-5 flex-row items-center justify-center border-2 border-red-500/20"
            activeOpacity={0.8}
            onPress={() => signOut()}
          >
            <Ionicons name="log-out-outline" size={22} color="#EF4444" />
            <Text className="text-red-500 font-bold text-base ml-2">Sign Out</Text>
          </TouchableOpacity>
        )}

        <Text className="mx-6 mb-3 text-center text-text-secondary text-xs">Version 1.0.0</Text>
      </ScrollView>
    </SafeScreen>
  );
};

export default ProfileScreen;
