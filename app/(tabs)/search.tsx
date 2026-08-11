import SafeScreen from "@/components/SafeScreen";
import { useState, useCallback } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  FlatList,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useQuery } from "@tanstack/react-query";
import apiClient from "@/lib/api";
import { Product } from "@/types";
import { Image } from "expo-image";
import { router } from "expo-router";
import useCart from "@/hooks/useCart";
import useWishlist from "@/hooks/useWishlist";
import * as ImagePicker from "expo-image-picker";
import { Alert } from "react-native";

const PURPLE = '#8B5CF6';
const LIGHT_PURPLE = '#F3E8FF';
const DARK_TEXT = '#1F2937';
const LIGHT_TEXT = '#9CA3AF';
const BACKGROUND = '#F9F5FF';

export default function SearchScreen() {
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [debounceTimer, setDebounceTimer] = useState<ReturnType<typeof setTimeout> | null>(null);

  const { addToCart } = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();
  
  const [isImageSearching, setIsImageSearching] = useState(false);

  const handleImageSearch = async () => {
    Alert.alert(
      "Image Search",
      "Choose a method to search by image",
      [
        {
          text: "Camera",
          onPress: async () => {
            const permissionResult = await ImagePicker.requestCameraPermissionsAsync();
            if (permissionResult.granted === false) {
              Alert.alert("Permission Denied", "You need to grant camera permissions to use this feature.");
              return;
            }
            const result = await ImagePicker.launchCameraAsync({
              mediaTypes: ['images'],
              allowsEditing: true,
              aspect: [4, 3],
              quality: 0.8,
            });
            processImageSearch(result);
          },
        },
        {
          text: "Gallery",
          onPress: async () => {
            const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
            if (permissionResult.granted === false) {
              Alert.alert("Permission Denied", "You need to grant gallery permissions to use this feature.");
              return;
            }
            const result = await ImagePicker.launchImageLibraryAsync({
              mediaTypes: ['images'],
              allowsEditing: true,
              aspect: [4, 3],
              quality: 0.8,
            });
            processImageSearch(result);
          },
        },
        {
          text: "Cancel",
          style: "cancel",
        },
      ]
    );
  };

  const processImageSearch = (result: ImagePicker.ImagePickerResult) => {
    if (!result.canceled) {
      // Mock an image search
      setIsImageSearching(true);
      setTimeout(() => {
        setIsImageSearching(false);
        Alert.alert(
          "Image Search Coming Soon",
          "Visual search functionality is currently under development. Stay tuned!"
        );
      }, 1500);
    }
  };

  const handleChangeText = useCallback(
    (text: string) => {
      setQuery(text);
      if (debounceTimer) clearTimeout(debounceTimer);
      const timer = setTimeout(() => {
        setDebouncedQuery(text);
      }, 400);
      setDebounceTimer(timer);
    },
    [debounceTimer]
  );

  const { data: results, isFetching } = useQuery<Product[]>({
    queryKey: ["search", debouncedQuery],
    queryFn: async () => {
      if (!debouncedQuery.trim()) return [];
      const { data } = await apiClient.get("/products", {
        params: { search: debouncedQuery, limit: 30 },
      });
      return data.data ?? [];
    },
    enabled: debouncedQuery.trim().length > 1,
  });

  const clearSearch = () => {
    setQuery("");
    setDebouncedQuery("");
  };

  return (
    <SafeScreen>
      <View style={{ flex: 1, backgroundColor: BACKGROUND }}>
        {/* Header */}
        <View style={{ paddingHorizontal: 24, paddingTop: 16, paddingBottom: 16 }}>
          <Text style={{ color: DARK_TEXT, fontSize: 32, fontWeight: '800', letterSpacing: -0.5, marginBottom: 20 }}>Search</Text>
          <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFFFFF', borderRadius: 24, paddingHorizontal: 20, height: 52, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.03, shadowRadius: 8, elevation: 2 }}>
            <Ionicons name="search" size={20} color={LIGHT_TEXT} />
            <TextInput
              style={{ flex: 1, marginLeft: 12, color: DARK_TEXT, fontSize: 15 }}
              placeholder="Search beauty essentials..."
              placeholderTextColor={LIGHT_TEXT}
              value={query}
              onChangeText={handleChangeText}
              returnKeyType="search"
              autoCorrect={false}
              autoCapitalize="none"
            />
            {query.length > 0 ? (
              <TouchableOpacity onPress={clearSearch} activeOpacity={0.7} style={{ padding: 4 }}>
                <Ionicons name="close-circle" size={20} color={LIGHT_TEXT} />
              </TouchableOpacity>
            ) : (
              <TouchableOpacity onPress={handleImageSearch} activeOpacity={0.7} style={{ padding: 4 }}>
                <Ionicons name="camera" size={22} color={PURPLE} />
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Results */}
        {isImageSearching ? (
          <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
            <ActivityIndicator size="large" color={PURPLE} />
            <Text style={{ color: LIGHT_TEXT, marginTop: 16, fontWeight: '500' }}>Analyzing image...</Text>
          </View>
        ) : isFetching ? (
          <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
            <ActivityIndicator size="large" color={PURPLE} />
            <Text style={{ color: LIGHT_TEXT, marginTop: 16, fontWeight: '500' }}>Searching...</Text>
          </View>
        ) : !debouncedQuery.trim() ? (
          <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 24 }}>
            <View style={{ width: 120, height: 120, borderRadius: 60, backgroundColor: LIGHT_PURPLE, alignItems: 'center', justifyContent: 'center', marginBottom: 24 }}>
              <Ionicons name="search-outline" size={56} color={PURPLE} />
            </View>
            <Text style={{ color: DARK_TEXT, fontSize: 24, fontWeight: '700', marginBottom: 8 }}>Find anything</Text>
            <Text style={{ color: LIGHT_TEXT, textAlign: 'center' }}>
              Search for your favorite beauty products, brands, or categories
            </Text>
          </View>
        ) : results && results.length === 0 ? (
          <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 24 }}>
            <View style={{ width: 120, height: 120, borderRadius: 60, backgroundColor: '#FEE2E2', alignItems: 'center', justifyContent: 'center', marginBottom: 24 }}>
              <Ionicons name="alert-circle-outline" size={56} color="#EF4444" />
            </View>
            <Text style={{ color: DARK_TEXT, fontSize: 24, fontWeight: '700', marginBottom: 8 }}>No results</Text>
            <Text style={{ color: LIGHT_TEXT, textAlign: 'center' }}>
              We couldn't find what you're looking for. Try a different keyword.
            </Text>
          </View>
        ) : (
          <FlatList
            data={results}
            keyExtractor={(item) => item._id}
            numColumns={2}
            contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 120 }}
            columnWrapperStyle={{ gap: 16, marginBottom: 16 }}
            showsVerticalScrollIndicator={false}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={{ flex: 1, backgroundColor: '#FFFFFF', borderRadius: 24, overflow: 'hidden', shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.05, shadowRadius: 12, elevation: 4 }}
                activeOpacity={0.85}
                onPress={() => router.push(`/product/${item._id}` as any)}
              >
                <View style={{ padding: 8 }}>
                  <Image
                    source={{ uri: item.images?.[0]?.url }}
                    style={{ height: 160, width: "100%", borderRadius: 16, backgroundColor: BACKGROUND }}
                    contentFit="cover"
                  />
                  <TouchableOpacity
                    style={{ position: 'absolute', top: 16, right: 16, backgroundColor: 'rgba(255,255,255,0.9)', borderRadius: 20, padding: 8, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 2 }}
                    onPress={() => toggleWishlist(item)}
                    activeOpacity={0.7}
                  >
                    <Ionicons
                      name={isInWishlist(item._id) ? "heart" : "heart-outline"}
                      size={18}
                      color={isInWishlist(item._id) ? "#EF4444" : LIGHT_TEXT}
                    />
                  </TouchableOpacity>
                </View>
                <View style={{ padding: 16, paddingTop: 8 }}>
                  <Text style={{ color: DARK_TEXT, fontWeight: '600', fontSize: 14, marginBottom: 8 }} numberOfLines={2}>
                    {item.title}
                  </Text>
                  <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Text style={{ color: PURPLE, fontWeight: '800', fontSize: 16 }}>
                      ৳{item.price.toFixed(0)}
                    </Text>
                    <TouchableOpacity
                      style={{ backgroundColor: PURPLE, width: 32, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center' }}
                      activeOpacity={0.8}
                      onPress={() => addToCart({ productId: item._id, product: item, quantity: 1 })}
                    >
                      <Ionicons name="add" size={20} color="#FFFFFF" />
                    </TouchableOpacity>
                  </View>
                </View>
              </TouchableOpacity>
            )}
          />
        )}
      </View>
    </SafeScreen>
  );
}
