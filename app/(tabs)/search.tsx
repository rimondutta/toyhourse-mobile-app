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

export default function SearchScreen() {
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [debounceTimer, setDebounceTimer] = useState<ReturnType<typeof setTimeout> | null>(null);

  const { addToCart } = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();

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
      {/* Header */}
      <View className="px-6 pb-4">
        <Text className="text-text-primary text-3xl font-bold tracking-tight mb-5">Search</Text>
        <View className="bg-surface flex-row items-center px-4 rounded-2xl border border-surface">
          <Ionicons name="search" size={20} color="#64748B" />
          <TextInput
            className="flex-1 ml-3 py-4 text-text-primary text-base"
            placeholder="Search toys, kids, brands..."
            placeholderTextColor="#94A3B8"
            value={query}
            onChangeText={handleChangeText}
            returnKeyType="search"
            autoCorrect={false}
            autoCapitalize="none"
          />
          {query.length > 0 && (
            <TouchableOpacity onPress={clearSearch} activeOpacity={0.7}>
              <Ionicons name="close-circle" size={20} color="#64748B" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Results */}
      {isFetching ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#4F46E5" />
          <Text className="text-text-secondary mt-4">Searching...</Text>
        </View>
      ) : !debouncedQuery.trim() ? (
        <View className="flex-1 items-center justify-center px-6">
          <Ionicons name="search-outline" size={72} color="#94A3B8" />
          <Text className="text-text-primary font-bold text-xl mt-5">Find anything</Text>
          <Text className="text-text-secondary text-center mt-2">
            Search for toys, brands, or categories
          </Text>
        </View>
      ) : results && results.length === 0 ? (
        <View className="flex-1 items-center justify-center px-6">
          <Ionicons name="alert-circle-outline" size={72} color="#94A3B8" />
          <Text className="text-text-primary font-bold text-xl mt-5">No results</Text>
          <Text className="text-text-secondary text-center mt-2">
            Try a different keyword
          </Text>
        </View>
      ) : (
        <FlatList
          data={results}
          keyExtractor={(item) => item._id}
          numColumns={2}
          contentContainerStyle={{ paddingHorizontal: 12, paddingBottom: 120 }}
          columnWrapperStyle={{ gap: 8, marginBottom: 8 }}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => (
            <TouchableOpacity
              className="flex-1 bg-surface rounded-2xl overflow-hidden"
              activeOpacity={0.85}
              onPress={() => router.push(`/product/${item._id}` as any)}
            >
              <View className="relative">
                <Image
                  source={{ uri: item.images?.[0]?.url }}
                  style={{ height: 160, width: "100%" }}
                  contentFit="cover"
                />
                <TouchableOpacity
                  className="absolute top-2 right-2 bg-black/40 rounded-full p-2"
                  onPress={() => toggleWishlist(item)}
                  activeOpacity={0.7}
                >
                  <Ionicons
                    name={isInWishlist(item._id) ? "heart" : "heart-outline"}
                    size={16}
                    color={isInWishlist(item._id) ? "#EF4444" : "#FFFFFF"}
                  />
                </TouchableOpacity>
              </View>
              <View className="p-3">
                <Text className="text-text-primary font-semibold text-sm" numberOfLines={2}>
                  {item.title}
                </Text>
                <View className="flex-row items-center justify-between mt-2">
                  <Text className="text-primary font-bold text-base">
                    ৳{item.price.toFixed(0)}
                  </Text>
                  <TouchableOpacity
                    className="bg-primary rounded-full w-7 h-7 items-center justify-center"
                    activeOpacity={0.8}
                    onPress={() => addToCart({ productId: item._id, product: item, quantity: 1 })}
                  >
                    <Ionicons name="add" size={16} color="#0F172A" />
                  </TouchableOpacity>
                </View>
              </View>
            </TouchableOpacity>
          )}
        />
      )}
    </SafeScreen>
  );
}
