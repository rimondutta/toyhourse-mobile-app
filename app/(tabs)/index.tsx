import ProductsGrid from '@/components/ProductsGrid';
import SafeScreen from '@/components/SafeScreen';
import useCategories from '@/hooks/useCategories';
import useProducts from '@/hooks/useProducts';
import type { ProductsQueryParams } from '@/types/product';
import { useAuth } from '@/context/AuthContext';

import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useMemo, useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Dimensions,
  Animated,
} from 'react-native';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// Hero banner slides data
const HERO_SLIDES = [
  {
    id: '1',
    title: 'Featured Deal',
    subtitle: '20% off on selected toys',
    tag: 'Limited Time',
    bg: '#1E1B4B',
    accent: '#818CF8',
  },
  {
    id: '2',
    title: 'New Arrivals',
    subtitle: 'Fresh toys just landed',
    tag: 'New In',
    bg: '#064E3B',
    accent: '#6EE7B7',
  },
  {
    id: '3',
    title: 'Free Shipping',
    subtitle: 'On orders above ৳1500',
    tag: 'Today Only',
    bg: '#7C2D12',
    accent: '#FCA5A5',
  },
];

// Countdown timer hook
function useCountdown(durationMs: number) {
  const [remaining, setRemaining] = useState(durationMs);
  useEffect(() => {
    const interval = setInterval(() => {
      setRemaining((prev) => (prev > 1000 ? prev - 1000 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const h = Math.floor(remaining / 3_600_000);
  const m = Math.floor((remaining % 3_600_000) / 60_000);
  const s = Math.floor((remaining % 60_000) / 1000);
  return `${h}h ${m}m ${s}s`;
}

const ShopScreen = () => {
  const { user, isGuest } = useAuth();
  const [selectedSlug, setSelectedSlug] = useState<string | undefined>(undefined);
  const [heroIndex, setHeroIndex] = useState(0);
  const heroScroll = useRef<ScrollView>(null);
  const countdown = useCountdown(10 * 3600_000 + 5 * 60_000 + 3_000);

  // Auto-advance hero
  useEffect(() => {
    const t = setInterval(() => {
      const next = (heroIndex + 1) % HERO_SLIDES.length;
      setHeroIndex(next);
      heroScroll.current?.scrollTo({ x: next * (SCREEN_WIDTH - 48), animated: true });
    }, 4000);
    return () => clearInterval(t);
  }, [heroIndex]);

  const { data: categories, isLoading: catLoading } = useCategories();

  const queryParams: ProductsQueryParams = useMemo(() => {
    const params: ProductsQueryParams = { sort: 'newest', limit: 20 };
    if (selectedSlug) params.category = selectedSlug;
    return params;
  }, [selectedSlug]);

  const { data: products, isLoading, isError } = useProducts(queryParams);

  const greeting = isGuest ? 'Guest' : (user?.name?.split(' ')[0] ?? 'there');
  const firstLetter = greeting.charAt(0).toUpperCase();

  return (
    <SafeScreen>
      <ScrollView
        className="flex-1 bg-background"
        contentContainerStyle={{ paddingBottom: 120 }}
        showsVerticalScrollIndicator={false}
      >
        {/* ─── HEADER ─────────────────────────────────────── */}
        <View className="flex-row items-center justify-between px-6 pt-4 pb-5">
          {/* Avatar + Greeting */}
          <View className="flex-row items-center gap-3">
            <View className="w-11 h-11 rounded-full bg-primary items-center justify-center">
              {user?.image ? (
                <Image source={{ uri: user.image }} className="w-11 h-11 rounded-full" />
              ) : (
                <Text className="text-white font-bold text-base">{firstLetter}</Text>
              )}
            </View>
            <View>
              <Text className="text-text-secondary text-xs">Good day 👋</Text>
              <Text className="text-text-primary font-bold text-base">Hello, {greeting}</Text>
            </View>
          </View>

          {/* Icons */}
          <View className="flex-row items-center gap-3">
            <TouchableOpacity
              onPress={() => router.push('/(tabs)/search')}
              className="w-10 h-10 bg-surface rounded-full items-center justify-center shadow-sm shadow-black/5"
              activeOpacity={0.7}
            >
              <Ionicons name="search-outline" size={20} color="#0F172A" />
            </TouchableOpacity>
            <TouchableOpacity
              className="w-10 h-10 bg-surface rounded-full items-center justify-center shadow-sm shadow-black/5"
              activeOpacity={0.7}
            >
              <Ionicons name="notifications-outline" size={20} color="#0F172A" />
            </TouchableOpacity>
          </View>
        </View>

        {/* ─── HERO BANNER CAROUSEL ───────────────────────── */}
        <View className="px-6 mb-6">
          <ScrollView
            ref={heroScroll}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            scrollEventThrottle={16}
            onScroll={(e) => {
              const idx = Math.round(e.nativeEvent.contentOffset.x / (SCREEN_WIDTH - 48));
              setHeroIndex(idx);
            }}
            style={{ borderRadius: 24, overflow: 'hidden' }}
          >
            {HERO_SLIDES.map((slide) => (
              <View
                key={slide.id}
                style={{
                  width: SCREEN_WIDTH - 48,
                  height: 160,
                  backgroundColor: slide.bg,
                  borderRadius: 24,
                  padding: 20,
                  justifyContent: 'space-between',
                }}
              >
                {/* Countdown Pill */}
                <View
                  style={{ backgroundColor: 'rgba(255,255,255,0.15)', alignSelf: 'flex-start' }}
                  className="px-3 py-1.5 rounded-full"
                >
                  <Text className="text-white text-xs font-bold">{countdown}</Text>
                </View>

                {/* Text + Arrow */}
                <View className="flex-row items-end justify-between">
                  <View>
                    <Text className="text-white text-xl font-bold mb-0.5">{slide.title}</Text>
                    <Text style={{ color: slide.accent }} className="text-sm font-medium">
                      {slide.subtitle}
                    </Text>
                  </View>
                  <TouchableOpacity
                    className="w-10 h-10 bg-white/20 rounded-full items-center justify-center"
                    activeOpacity={0.8}
                  >
                    <Ionicons name="arrow-forward" size={18} color="#FFFFFF" />
                  </TouchableOpacity>
                </View>

                {/* Tag badge */}
                <View
                  style={{ position: 'absolute', top: 20, right: 20, backgroundColor: slide.accent + '33' }}
                  className="px-3 py-1 rounded-full"
                >
                  <Text style={{ color: slide.accent }} className="text-xs font-bold">
                    {slide.tag}
                  </Text>
                </View>
              </View>
            ))}
          </ScrollView>

          {/* Dot Indicators */}
          <View className="flex-row justify-center gap-2 mt-3">
            {HERO_SLIDES.map((_, i) => (
              <View
                key={i}
                style={{
                  height: 6,
                  width: i === heroIndex ? 20 : 6,
                  borderRadius: 3,
                  backgroundColor: i === heroIndex ? '#C9F31D' : '#CBD5E1',
                }}
              />
            ))}
          </View>
        </View>

        {/* ─── CATEGORIES ─────────────────────────────────── */}
        <View className="mb-6">
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: 24, gap: 16 }}
          >
            {/* All */}
            <TouchableOpacity
              onPress={() => setSelectedSlug(undefined)}
              className="items-center gap-2"
              activeOpacity={0.8}
            >
              <View
                className={`w-16 h-16 rounded-full items-center justify-center shadow-sm ${
                  !selectedSlug ? 'bg-primary' : 'bg-surface'
                }`}
                style={{ shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 8 }}
              >
                <Ionicons name="grid" size={26} color={!selectedSlug ? '#000000' : '#C9F31D'} />
              </View>
              <Text
                className={`text-xs font-semibold ${
                  !selectedSlug ? 'text-primary' : 'text-text-secondary'
                }`}
              >
                All
              </Text>
            </TouchableOpacity>

            {/* Dynamic */}
            {catLoading ? (
              <View className="w-16 h-16 rounded-full bg-surface items-center justify-center">
                <ActivityIndicator size="small" color="#C9F31D" />
              </View>
            ) : (
              categories?.map((cat) => {
                const isSelected = selectedSlug === cat.slug;
                return (
                  <TouchableOpacity
                    key={cat._id}
                    onPress={() => setSelectedSlug(isSelected ? undefined : cat.slug)}
                    className="items-center gap-2"
                    activeOpacity={0.8}
                  >
                    <View
                      className={`w-16 h-16 rounded-full items-center justify-center overflow-hidden ${
                        isSelected ? 'bg-primary' : 'bg-surface'
                      }`}
                      style={{ shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 8 }}
                    >
                      {cat.image ? (
                        <Image source={{ uri: cat.image }} style={{ width: 40, height: 40 }} resizeMode="contain" />
                      ) : (
                        <Ionicons name="pricetag" size={24} color={isSelected ? '#000000' : '#C9F31D'} />
                      )}
                    </View>
                    <Text
                      className={`text-xs font-semibold ${
                        isSelected ? 'text-primary' : 'text-text-secondary'
                      }`}
                      numberOfLines={1}
                    >
                      {cat.name}
                    </Text>
                  </TouchableOpacity>
                );
              })
            )}
          </ScrollView>
        </View>

        {/* ─── FEATURED PRODUCTS ──────────────────────────── */}
        <View className="px-6">
          <View className="flex-row items-center justify-between mb-4">
            <Text className="text-text-primary text-lg font-bold">Featured products</Text>
            <TouchableOpacity activeOpacity={0.7}>
              <Text className="text-primary text-sm font-semibold">View All</Text>
            </TouchableOpacity>
          </View>

          <ProductsGrid
            products={products ?? []}
            isLoading={isLoading}
            isError={isError}
          />
        </View>
      </ScrollView>
    </SafeScreen>
  );
};

export default ShopScreen;
