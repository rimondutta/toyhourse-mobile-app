import SafeScreen from "@/components/SafeScreen";
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator } from "react-native";
import { Image } from "expo-image";
import { Ionicons } from "@expo/vector-icons";
import { useQuery } from "@tanstack/react-query";
import apiClient from "@/lib/api";
import { router, useLocalSearchParams } from "expo-router";

interface BlogPost {
  _id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  featuredImage: { url: string; alt?: string };
  category: string;
  readingTime?: string;
  publishedAt: string;
  author: { name: string; avatar?: string };
  tags?: string[];
}

export default function BlogDetailScreen() {
  const { slug } = useLocalSearchParams<{ slug: string }>();

  const { data: post, isLoading, isError } = useQuery<BlogPost>({
    queryKey: ["blog", slug],
    queryFn: async () => {
      const { data } = await apiClient.get(`/blogs/${slug}`);
      return data;
    },
    enabled: !!slug,
  });

  const formatDate = (dateStr: string) => {
    try {
      return new Date(dateStr).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    } catch {
      return "";
    }
  };

  // Render Markdown-like plain text from content (strip HTML tags)
  const stripHtml = (html: string) =>
    html?.replace(/<[^>]*>/g, "").replace(/&[a-z]+;/gi, " ").trim() ?? "";

  if (isLoading) {
    return (
      <SafeScreen>
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#4F46E5" />
          <Text className="text-text-secondary mt-4">Loading article...</Text>
        </View>
      </SafeScreen>
    );
  }

  if (isError || !post) {
    return (
      <SafeScreen>
        <View className="flex-1 items-center justify-center px-6">
          <Ionicons name="alert-circle-outline" size={64} color="#FF6B6B" />
          <Text className="text-text-primary font-semibold text-xl mt-4">Article not found</Text>
          <TouchableOpacity
            className="bg-primary rounded-2xl px-6 py-3 mt-4"
            onPress={() => router.back()}
          >
            <Text className="text-background font-bold">Go Back</Text>
          </TouchableOpacity>
        </View>
      </SafeScreen>
    );
  }

  return (
    <View className="flex-1 bg-background">
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 60 }}>
        {/* Hero Image */}
        <View className="relative">
          <Image
            source={{ uri: post.featuredImage?.url }}
            style={{ height: 300, width: "100%" }}
            contentFit="cover"
          />
          {/* Back Button */}
          <TouchableOpacity
            className="absolute top-12 left-4 bg-black/50 w-10 h-10 rounded-full items-center justify-center"
            onPress={() => router.back()}
            activeOpacity={0.8}
          >
            <Ionicons name="arrow-back" size={22} color="#0F172A" />
          </TouchableOpacity>
        </View>

        {/* Content */}
        <View className="px-5 pt-6">
          {/* Category & Reading Time */}
          <View className="flex-row items-center gap-3 mb-3">
            <View className="bg-primary/20 px-3 py-1 rounded-full">
              <Text className="text-primary text-xs font-bold uppercase">{post.category}</Text>
            </View>
            {post.readingTime && (
              <Text className="text-text-secondary text-xs">{post.readingTime}</Text>
            )}
          </View>

          {/* Title */}
          <Text className="text-text-primary text-2xl font-bold leading-tight mb-3">
            {post.title}
          </Text>

          {/* Author & Date */}
          <View className="flex-row items-center gap-3 pb-4 border-b border-surface mb-5">
            <View className="w-8 h-8 rounded-full bg-primary/20 items-center justify-center">
              <Ionicons name="person" size={14} color="#4F46E5" />
            </View>
            <View>
              <Text className="text-text-primary text-sm font-semibold">{post.author?.name}</Text>
              <Text className="text-text-secondary text-xs">{formatDate(post.publishedAt)}</Text>
            </View>
          </View>

          {/* Excerpt */}
          <Text className="text-text-secondary text-base leading-relaxed mb-4 italic">
            {post.excerpt}
          </Text>

          {/* Body Content */}
          <Text className="text-text-primary text-base leading-loose">
            {stripHtml(post.content)}
          </Text>

          {/* Tags */}
          {post.tags && post.tags.length > 0 && (
            <View className="flex-row flex-wrap gap-2 mt-6">
              {post.tags.map((tag) => (
                <View key={tag} className="bg-surface px-3 py-1 rounded-full">
                  <Text className="text-text-secondary text-xs">#{tag}</Text>
                </View>
              ))}
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
}
