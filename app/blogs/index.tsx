import SafeScreen from "@/components/SafeScreen";
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator } from "react-native";
import { Image } from "expo-image";
import { Ionicons } from "@expo/vector-icons";
import { useQuery } from "@tanstack/react-query";
import apiClient from "@/lib/api";
import { router } from "expo-router";

interface BlogPost {
  _id: string;
  title: string;
  slug: string;
  excerpt: string;
  featuredImage: { url: string; alt?: string };
  category: string;
  readingTime?: string;
  publishedAt: string;
  author: { name: string; avatar?: string };
}

export default function BlogsScreen() {
  const { data: posts, isLoading, isError, refetch } = useQuery<BlogPost[]>({
    queryKey: ["blogs"],
    queryFn: async () => {
      const { data } = await apiClient.get("/blogs");
      return Array.isArray(data) ? data : [];
    },
  });

  const formatDate = (dateStr: string) => {
    try {
      return new Date(dateStr).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
    } catch {
      return "";
    }
  };

  return (
    <SafeScreen>
      {/* Header */}
      <View className="px-6 pb-4">
        <Text className="text-text-primary text-3xl font-bold tracking-tight">Blog</Text>
        <Text className="text-text-secondary mt-1 text-sm">
          Tips, stories and toy guides
        </Text>
      </View>

      {isLoading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#4F46E5" />
          <Text className="text-text-secondary mt-4">Loading posts...</Text>
        </View>
      ) : isError ? (
        <View className="flex-1 items-center justify-center px-6">
          <Ionicons name="alert-circle-outline" size={64} color="#FF6B6B" />
          <Text className="text-text-primary font-semibold text-xl mt-4">Failed to load</Text>
          <TouchableOpacity
            className="bg-primary rounded-2xl px-6 py-3 mt-4"
            onPress={() => refetch()}
          >
            <Text className="text-background font-bold">Retry</Text>
          </TouchableOpacity>
        </View>
      ) : !posts || posts.length === 0 ? (
        <View className="flex-1 items-center justify-center px-6">
          <Ionicons name="newspaper-outline" size={72} color="#94A3B8" />
          <Text className="text-text-primary font-bold text-xl mt-5">No posts yet</Text>
          <Text className="text-text-secondary text-center mt-2">
            Check back soon for new content
          </Text>
        </View>
      ) : (
        <ScrollView
          className="flex-1"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 120 }}
        >
          {posts.map((post) => (
            <TouchableOpacity
              key={post._id}
              className="bg-surface rounded-3xl overflow-hidden mb-4"
              activeOpacity={0.85}
              onPress={() => router.push(`/blogs/${post.slug}` as any)}
            >
              <Image
                source={{ uri: post.featuredImage?.url }}
                style={{ height: 200, width: "100%" }}
                contentFit="cover"
              />
              <View className="p-4">
                <View className="flex-row items-center mb-2 gap-2">
                  <View className="bg-primary/20 px-3 py-1 rounded-full">
                    <Text className="text-primary text-xs font-bold uppercase">
                      {post.category}
                    </Text>
                  </View>
                  {post.readingTime && (
                    <Text className="text-text-secondary text-xs">{post.readingTime}</Text>
                  )}
                </View>
                <Text
                  className="text-text-primary font-bold text-lg leading-tight"
                  numberOfLines={2}
                >
                  {post.title}
                </Text>
                <Text
                  className="text-text-secondary text-sm mt-2 leading-relaxed"
                  numberOfLines={3}
                >
                  {post.excerpt}
                </Text>
                <View className="flex-row items-center justify-between mt-3">
                  <View className="flex-row items-center gap-2">
                    <View className="w-6 h-6 rounded-full bg-primary/20 items-center justify-center">
                      <Ionicons name="person" size={12} color="#4F46E5" />
                    </View>
                    <Text className="text-text-secondary text-xs">{post.author?.name}</Text>
                  </View>
                  <Text className="text-text-secondary text-xs">
                    {formatDate(post.publishedAt)}
                  </Text>
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}
    </SafeScreen>
  );
}
