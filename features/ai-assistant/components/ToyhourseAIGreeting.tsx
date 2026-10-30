import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';

interface ToyhourseAIGreetingProps {
  firstName?: string;
  onSelectPrompt: (prompt: string) => void;
  onOpenSearch?: () => void;
}

const PROMPT_SUGGESTIONS = [
  {
    icon: 'gift-outline' as const,
    title: 'Birthday Gift Ideas',
    description: 'Find gifts for 5-8 year olds',
    prompt: 'Help me find the best birthday gift for a 6 year old child.',
  },
  {
    icon: 'pricetag-outline' as const,
    title: 'Under ₦1,500',
    description: 'Top value toys on budget',
    prompt: 'Show me top rated, quality toys under ₦1500 in stock right now.',
  },
  {
    icon: 'school-outline' as const,
    title: 'STEM & Learning',
    description: 'Puzzles, robotics & science',
    prompt: 'What are the best educational and STEM learning toys for kids?',
  },
  {
    icon: 'flame-outline' as const,
    title: 'Trending Arrivals',
    description: 'Popular toys this week',
    prompt: 'What are your newest and most popular best-selling toys?',
  },
];

export default function ToyhourseAIGreeting({
  onSelectPrompt,
  onOpenSearch,
}: ToyhourseAIGreetingProps) {
  const handlePress = (prompt: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onSelectPrompt(prompt);
  };

  const handleOpenSearch = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onOpenSearch?.();
  };

  return (
    <Animated.View entering={FadeIn.duration(300)} exiting={FadeOut.duration(200)} style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Hero Section */}
        <View style={styles.heroSection}>
          <Text style={styles.greetingTitle}>How can I help you today?</Text>
        </View>

        {/* Featured AI Product Search Action Card */}
        {onOpenSearch && (
          <TouchableOpacity
            activeOpacity={0.85}
            onPress={handleOpenSearch}
            style={styles.searchBanner}
          >
            <View style={styles.searchBannerIconCircle}>
              <Ionicons name="search" size={18} color="#2D9E5F" />
            </View>
            <View style={styles.searchBannerTextCol}>
              <View style={styles.searchBannerTitleRow}>
                <Text style={styles.searchBannerTitle}>AI Product Search</Text>
                <View style={styles.liveBadge}>
                  <Text style={styles.liveBadgeText}>CATALOGUE</Text>
                </View>
              </View>
              <Text style={styles.searchBannerDesc}>
                Search toys by age, category, or budget
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color="#9CA3AF" />
          </TouchableOpacity>
        )}

        {/* Suggestions */}
        <View style={styles.suggestionsContainer}>
          <Text style={styles.suggestionsLabel}>SUGGESTED PROMPTS</Text>
          <View style={styles.grid}>
            {PROMPT_SUGGESTIONS.map((item, index) => (
              <TouchableOpacity
                key={index}
                activeOpacity={0.75}
                onPress={() => handlePress(item.prompt)}
                style={styles.card}
              >
                <View style={styles.cardHeader}>
                  <View style={styles.iconCircle}>
                    <Ionicons name={item.icon} size={16} color="#2D9E5F" />
                  </View>
                  <Ionicons name="arrow-forward" size={14} color="#9CA3AF" />
                </View>
                <Text style={styles.cardTitle}>{item.title}</Text>
                <Text style={styles.cardDesc}>{item.description}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </ScrollView>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 16,
    paddingTop: 20,
    paddingBottom: 20,
    backgroundColor: '#FFFFFF',
  },
  heroSection: {
    alignItems: 'flex-start',
    marginBottom: 20,
    marginTop: 4,
  },
  greetingTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#111827',
    letterSpacing: -0.4,
  },
  searchBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 14,
    gap: 12,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#D1EBD9',
  },
  searchBannerIconCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#EBF7F0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  searchBannerTextCol: {
    flex: 1,
  },
  searchBannerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 2,
  },
  searchBannerTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#111827',
  },
  liveBadge: {
    backgroundColor: '#EBF7F0',
    borderRadius: 6,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  liveBadgeText: {
    color: '#2D9E5F',
    fontSize: 9,
    fontWeight: '700',
  },
  searchBannerDesc: {
    fontSize: 12,
    color: '#6B7280',
    lineHeight: 16,
  },
  suggestionsContainer: {
    paddingBottom: 12,
  },
  suggestionsLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#9CA3AF',
    letterSpacing: 0.8,
    marginBottom: 10,
  },
  grid: {
    gap: 10,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: '#D1EBD9',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  iconCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#EBF7F0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 3,
  },
  cardDesc: {
    fontSize: 12,
    color: '#6B7280',
    lineHeight: 16,
  },
});
