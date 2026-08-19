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
  ActivityIndicator,
  Dimensions,
  TextInput,
  RefreshControl,
} from 'react-native';
import { Image } from 'expo-image';
import { optimizeCloudinaryUrl } from '@/lib/utils';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const PURPLE = '#8B5CF6';
const LIGHT_PURPLE = '#F3E8FF';
const DARK_TEXT = '#1F2937';
const LIGHT_TEXT = '#9CA3AF';
const BACKGROUND = '#F9F5FF';

// Mock hero banners for beauty/skincare theme
const HERO_SLIDES = [
  {
    id: '1',
    title: '30% Off Today',
    subtitle: 'All Toy Products',
    bg: '#D8B4FE', // Soft purple
    accent: '#581C87',
  },
  {
    id: '2',
    title: 'Free Shiping',
    subtitle: 'All Over Bangladesh',
    bg: '#FBCFE8', // Soft pink
    accent: '#831843',
  },
];

function UnreadBadge() {
  const { unreadCount } = require('@/hooks/useNotifications').useNotifications();
  
  if (unreadCount === 0) return null;
  
  return (
    <View style={{
      position: 'absolute', top: 4, right: 4, 
      backgroundColor: '#EF4444', 
      minWidth: 16, height: 16, borderRadius: 8, 
      alignItems: 'center', justifyContent: 'center',
      paddingHorizontal: 4,
      borderWidth: 1.5, borderColor: '#FFFFFF'
    }}>
      <Text style={{ color: '#FFFFFF', fontSize: 10, fontWeight: 'bold' }}>
        {unreadCount > 99 ? '99+' : unreadCount}
      </Text>
    </View>
  );
}

const ShopScreen = () => {
  const { user, isGuest } = useAuth();
  const [selectedSlug, setSelectedSlug] = useState<string | undefined>(undefined);
  const [heroIndex, setHeroIndex] = useState(0);
  const heroScroll = useRef<ScrollView>(null);

  // Auto-advance hero
  useEffect(() => {
    const t = setInterval(() => {
      const next = (heroIndex + 1) % HERO_SLIDES.length;
      setHeroIndex(next);
      heroScroll.current?.scrollTo({ x: next * (SCREEN_WIDTH - 48), animated: true });
    }, 5000);
    return () => clearInterval(t);
  }, [heroIndex]);

  const { data: categories, isLoading: catLoading, refetch: refetchCategories } = useCategories();

  const queryParams: ProductsQueryParams = useMemo(() => {
    const params: ProductsQueryParams = { sort: 'newest', limit: 20 };
    if (selectedSlug) params.category = selectedSlug;
    return params;
  }, [selectedSlug]);

  const { data: products, isLoading, isError, refetch: refetchProducts } = useProducts(queryParams);

  const [refreshing, setRefreshing] = useState(false);
  const onRefresh = async () => {
    setRefreshing(true);
    await Promise.all([refetchCategories(), refetchProducts()]);
    setRefreshing(false);
  };

  const greeting = isGuest ? 'Guest' : (user?.name?.split(' ')[0] ?? 'there');
  const firstLetter = greeting.charAt(0).toUpperCase();

  return (
    <SafeScreen>
      <ScrollView
        style={{ flex: 1, backgroundColor: BACKGROUND }}
        contentContainerStyle={{ paddingBottom: 120 }}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={PURPLE} colors={[PURPLE]} />}
      >
        {/* ─── HEADER ─────────────────────────────────────── */}
        <View style={{ paddingHorizontal: 24, paddingTop: 16, paddingBottom: 8 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
            {/* Avatar + Greeting */}
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
              <View style={{ width: 44, height: 44, borderRadius: 22, backgroundColor: PURPLE, alignItems: 'center', justifyContent: 'center' }}>
                {user?.image ? (
                  <Image
                    source={{ uri: optimizeCloudinaryUrl(user.image, 100) }}
                    style={{ width: 44, height: 44, borderRadius: 22 }}
                    contentFit="cover"
                    transition={200}
                  />
                ) : (
                  <Text style={{ color: '#FFF', fontWeight: '700', fontSize: 16 }}>{firstLetter}</Text>
                )}
              </View>
              <View>
                <Text style={{ color: LIGHT_TEXT, fontSize: 13, fontWeight: '500' }}>Good Morning,</Text>
                <Text style={{ color: DARK_TEXT, fontSize: 18, fontWeight: '700' }}>{greeting}</Text>
              </View>
            </View>

            {/* Notification Icon */}
            <TouchableOpacity
              onPress={() => router.push('/notifications')}
              style={{ width: 44, height: 44, backgroundColor: '#FFFFFF', borderRadius: 22, alignItems: 'center', justifyContent: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 2 }}
              activeOpacity={0.7}
            >
              <Ionicons name="notifications-outline" size={22} color={DARK_TEXT} />
              <UnreadBadge />
            </TouchableOpacity>
          </View>

          {/* Search Bar */}
          <TouchableOpacity
            style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFFFFF', borderRadius: 24, paddingHorizontal: 20, height: 52, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.03, shadowRadius: 8, elevation: 2 }}
            activeOpacity={1}
            onPress={() => router.push('/(tabs)/search')}
          >
            <Ionicons name="search" size={20} color={LIGHT_TEXT} />
            <Text style={{ marginLeft: 12, color: LIGHT_TEXT, fontSize: 15 }}>Find products...</Text>
          </TouchableOpacity>
        </View>

        {/* ─── CATEGORIES PILLS ───────────────────────────── */}
        <View style={{ marginTop: 24, paddingLeft: 24 }}>
          <Text style={{ fontSize: 18, fontWeight: '700', color: DARK_TEXT, marginBottom: 16 }}>
            Explore Categories
          </Text>
          {catLoading ? (
            <ActivityIndicator size="small" color={PURPLE} style={{ alignSelf: 'flex-start' }} />
          ) : (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ paddingRight: 24, gap: 12 }}
            >
              <TouchableOpacity
                onPress={() => setSelectedSlug(undefined)}
                activeOpacity={0.8}
                style={{
                  paddingHorizontal: 20, paddingVertical: 12,
                  borderRadius: 20,
                  backgroundColor: !selectedSlug ? PURPLE : '#FFFFFF',
                  borderWidth: 1,
                  borderColor: !selectedSlug ? PURPLE : '#F3F4F6',
                }}
              >
                <Text style={{ fontSize: 14, fontWeight: '600', color: !selectedSlug ? '#FFFFFF' : DARK_TEXT }}>
                  All
                </Text>
              </TouchableOpacity>
              {categories?.map((c) => {
                const isActive = selectedSlug === c.slug;
                return (
                  <TouchableOpacity
                    key={c._id}
                    onPress={() => setSelectedSlug(c.slug)}
                    activeOpacity={0.8}
                    style={{
                      paddingHorizontal: 20, paddingVertical: 12,
                      borderRadius: 20,
                      backgroundColor: isActive ? PURPLE : '#FFFFFF',
                      borderWidth: 1,
                      borderColor: isActive ? PURPLE : '#F3F4F6',
                    }}
                  >
                    <Text style={{ fontSize: 14, fontWeight: '600', color: isActive ? '#FFFFFF' : DARK_TEXT }}>
                      {c.name}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          )}
        </View>

        {/* ─── HERO BANNER ────────────────────────────────── */}
        <View style={{ marginTop: 32, paddingHorizontal: 24 }}>
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
                  padding: 24,
                  justifyContent: 'center',
                }}
              >
                <Text style={{ color: slide.accent, fontSize: 24, fontWeight: '800', marginBottom: 8 }}>{slide.title}</Text>
                <Text style={{ color: slide.accent, fontSize: 15, opacity: 0.8, marginBottom: 16 }}>
                  {slide.subtitle}
                </Text>
                <TouchableOpacity style={{ backgroundColor: '#FFFFFF', alignSelf: 'flex-start', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20 }}>
                  <Text style={{ color: slide.accent, fontWeight: '700', fontSize: 13 }}>Shop Now</Text>
                </TouchableOpacity>
              </View>
            ))}
          </ScrollView>

          {/* Dots */}
          <View style={{ flexDirection: 'row', justifyContent: 'center', gap: 6, marginTop: 12 }}>
            {HERO_SLIDES.map((_, i) => (
              <View
                key={i}
                style={{
                  width: i === heroIndex ? 20 : 6,
                  height: 6,
                  borderRadius: 3,
                  backgroundColor: i === heroIndex ? PURPLE : '#D8B4FE',
                }}
              />
            ))}
          </View>
        </View>

        {/* ─── POPULAR COLLECTION & GRID ──────────────────── */}
        <View style={{ marginTop: 32, paddingHorizontal: 24 }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <Text style={{ fontSize: 18, fontWeight: '700', color: DARK_TEXT }}>
              Popular Collection
            </Text>
            <TouchableOpacity onPress={() => router.push('/(tabs)/search')}>
              <Text style={{ color: PURPLE, fontSize: 14, fontWeight: '600' }}>See all</Text>
            </TouchableOpacity>
          </View>

          {isLoading ? (
            <ActivityIndicator size="large" color={PURPLE} style={{ marginTop: 20 }} />
          ) : isError ? (
            <Text style={{ textAlign: 'center', marginTop: 20, color: '#EF4444' }}>
              Failed to load products.
            </Text>
          ) : (
            <ProductsGrid products={products ?? []} />
          )}
        </View>
      </ScrollView>
    </SafeScreen>
  );
};

export default ShopScreen;
