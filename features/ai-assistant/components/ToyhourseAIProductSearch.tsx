import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { Image } from 'expo-image';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import * as Haptics from 'expo-haptics';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';
import { getProducts } from '@/lib/api';
import useCart from '@/hooks/useCart';
import type { Product } from '@/types/product';

interface ToyhourseAIProductSearchProps {
  onClose: () => void;
  onAskAI: (prompt: string) => void;
  onToast: (msg: string) => void;
}

const SMART_FILTERS = [
  { id: 'all', label: 'All Toys', icon: 'grid-outline' },
  { id: 'under-1000', label: 'Under ৳1,000', maxPrice: 1000, icon: 'pricetag-outline' },
  { id: 'under-2500', label: 'Under ৳2,500', maxPrice: 2500, icon: 'cash-outline' },
  { id: 'stem', label: 'STEM & Robotics', search: 'STEM', icon: 'school-outline' },
  { id: 'educational', label: 'Educational', search: 'Educational', icon: 'bulb-outline' },
  { id: 'puzzle', label: 'Puzzles', search: 'Puzzle', icon: 'extension-puzzle-outline' },
  { id: 'car', label: 'Cars & RC', search: 'Car', icon: 'car-sport-outline' },
];

const AI_SEARCH_IDEAS = [
  'Best birthday gift for a 6 year old child',
  'Educational puzzles and building blocks',
  'Remote control speed cars under ৳2,500',
  'STEM science learning kits for school',
];

export default function ToyhourseAIProductSearch({
  onClose,
  onAskAI,
  onToast,
}: ToyhourseAIProductSearchProps) {
  const { addToCart } = useCart();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [addedMap, setAddedMap] = useState<Record<string, boolean>>({});

  const fetchProducts = useCallback(async (query: string, maxPrice?: number) => {
    setLoading(true);
    try {
      const params: any = { limit: 20 };
      if (query.trim()) {
        params.search = query.trim();
      }
      if (maxPrice) {
        params.maxPrice = maxPrice;
      }
      const res = await getProducts(params);
      if (res?.success && Array.isArray(res.data)) {
        setProducts(res.data);
      } else {
        setProducts([]);
      }
    } catch {
      setProducts([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProducts('');
  }, [fetchProducts]);

  useEffect(() => {
    const activeFilterObj = SMART_FILTERS.find(f => f.id === selectedFilter);
    const combinedQuery = activeFilterObj?.search
      ? `${searchQuery} ${activeFilterObj.search}`.trim()
      : searchQuery;
    const maxPrice = activeFilterObj?.maxPrice;

    const timer = setTimeout(() => {
      fetchProducts(combinedQuery, maxPrice);
    }, 350);

    return () => clearTimeout(timer);
  }, [searchQuery, selectedFilter, fetchProducts]);

  const handleFilterSelect = (filterId: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelectedFilter(filterId);
  };

  const handleAddToCart = (item: Product) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    addToCart({
      productId: item._id,
      product: item,
      quantity: 1,
    });
    setAddedMap(prev => ({ ...prev, [item._id]: true }));
    onToast(`Added "${item.title}" to cart`);
    setTimeout(() => {
      setAddedMap(prev => ({ ...prev, [item._id]: false }));
    }, 2000);
  };

  const handleAskAboutProduct = (item: Product) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onClose();
    onAskAI(`Tell me more about "${item.title}". Is it durable, safe, and suitable for children?`);
  };

  const handleAIQueryPrompt = (prompt: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onClose();
    onAskAI(prompt);
  };

  const renderProductItem = ({ item }: { item: Product }) => {
    const imgUrl = item.images?.[0]?.url;
    const isAdded = !!addedMap[item._id];
    const hasDiscount = item.compareAtPrice && item.compareAtPrice > item.price;

    return (
      <TouchableOpacity
        activeOpacity={0.88}
        onPress={() => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          router.push(`/product/${item.slug || item._id}`);
        }}
        style={styles.productCardWrapper}
      >
        <View style={styles.productCard}>
          {/* Image Box */}
          <View style={styles.imageBox}>
            {imgUrl ? (
              <Image
                source={{ uri: imgUrl }}
                style={styles.cardImage}
                contentFit="contain"
                transition={200}
              />
            ) : (
              <Ionicons name="cube-outline" size={36} color="#000000" />
            )}
            {item.badge && (
              <View style={styles.badgePill}>
                <Text style={styles.badgePillText}>{item.badge}</Text>
              </View>
            )}
            {item.rating > 0 && (
              <View style={styles.ratingBox}>
                <Ionicons name="star" size={10} color="#FBBF24" />
                <Text style={styles.ratingText}>{item.rating.toFixed(1)}</Text>
              </View>
            )}
          </View>

          {/* Info */}
          <Text style={styles.productTitle} numberOfLines={2}>
            {item.title}
          </Text>

          {/* Price */}
          <View style={styles.priceRow}>
            <Text style={styles.priceText}>৳{item.price.toLocaleString()}</Text>
            {hasDiscount && (
              <Text style={styles.comparePriceText}>৳{item.compareAtPrice?.toLocaleString()}</Text>
            )}
          </View>

          {/* Action Buttons */}
          <View style={styles.cardActions}>
            <TouchableOpacity
              onPress={() => handleAddToCart(item)}
              style={[styles.addBtn, isAdded && styles.addBtnSuccess]}
              activeOpacity={0.8}
            >
              <Ionicons name={isAdded ? 'checkmark' : 'cart-outline'} size={13} color="#FFFFFF" />
              <Text style={styles.addBtnText}>{isAdded ? 'Added' : 'Add'}</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => handleAskAboutProduct(item)}
              style={styles.askAiBtn}
              activeOpacity={0.8}
            >
              <Ionicons name="sparkles" size={11} color="#000000" />
              <Text style={styles.askAiBtnText}>Ask AI</Text>
            </TouchableOpacity>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <Animated.View entering={FadeIn.duration(200)} exiting={FadeOut.duration(200)} style={styles.overlayContainer}>
      <View style={styles.panel}>
        {/* Panel Header */}
        <View style={styles.header}>
          <View style={styles.headerTitleRow}>
            <View style={styles.sparkleIcon}>
              <MaterialCommunityIcons name="star-four-points" size={16} color="#000000" />
            </View>
            <View>
              <Text style={styles.headerTitle}>AI Product Search</Text>
              <Text style={styles.headerSubtitle}>Instant smart catalogue search</Text>
            </View>
          </View>

          <TouchableOpacity
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              onClose();
            }}
            style={styles.closeBtn}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Ionicons name="close" size={20} color="#000000" />
          </TouchableOpacity>
        </View>

        {/* Clean White Search Input */}
        <View style={styles.searchBarContainer}>
          <View style={styles.searchInputRow}>
            <Ionicons name="search" size={18} color="#000000" />
            <TextInput
              style={styles.searchInput}
              placeholder="Search toys by name, age, category..."
              placeholderTextColor="#9CA3AF"
              value={searchQuery}
              onChangeText={setSearchQuery}
              autoFocus
              returnKeyType="search"
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity
                onPress={() => setSearchQuery('')}
                hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
              >
                <Ionicons name="close-circle" size={18} color="#9CA3AF" />
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Quick Filter Pills */}
        <View style={styles.filtersWrapper}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.filtersScroll}
          >
            {SMART_FILTERS.map(f => {
              const active = selectedFilter === f.id;
              return (
                <TouchableOpacity
                  key={f.id}
                  onPress={() => handleFilterSelect(f.id)}
                  style={[styles.filterPill, active && styles.filterPillActive]}
                  activeOpacity={0.8}
                >
                  <Ionicons
                    name={f.icon as any}
                    size={13}
                    color={active ? '#FFFFFF' : '#000000'}
                  />
                  <Text style={[styles.filterPillText, active && styles.filterPillTextActive]}>
                    {f.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        {/* AI Query Suggestions */}
        {searchQuery.length === 0 && selectedFilter === 'all' && (
          <View style={styles.aiPromptsSection}>
            <View style={styles.aiPromptsHeader}>
              <Ionicons name="sparkles" size={13} color="#000000" />
              <Text style={styles.aiPromptsTitle}>AI QUESTION SUGGESTIONS</Text>
            </View>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.aiPromptsScroll}>
              {AI_SEARCH_IDEAS.map((idea, idx) => (
                <TouchableOpacity
                  key={idx}
                  onPress={() => handleAIQueryPrompt(idea)}
                  style={styles.aiPromptChip}
                  activeOpacity={0.8}
                >
                  <Text style={styles.aiPromptChipText}>{`"${idea}"`}</Text>
                  <Ionicons name="arrow-forward" size={12} color="#000000" />
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}

        {/* Products Results Grid */}
        <View style={styles.resultsArea}>
          {loading ? (
            <View style={styles.centerContainer}>
              <ActivityIndicator size="large" color="#000000" />
              <Text style={styles.loadingText}>Searching toy catalogue with AI...</Text>
            </View>
          ) : products.length === 0 ? (
            <View style={styles.centerContainer}>
              <Ionicons name="cube-outline" size={44} color="#9CA3AF" />
              <Text style={styles.emptyTitle}>No toys found</Text>
              <Text style={styles.emptySubtitle}>
                Try adjusting your search query or ask Toyhourse AI directly!
              </Text>
              {searchQuery.length > 0 && (
                <TouchableOpacity
                  onPress={() => handleAIQueryPrompt(`Help me find toys for: "${searchQuery}"`)}
                  style={styles.askAiFallbackBtn}
                  activeOpacity={0.85}
                >
                  <Ionicons name="sparkles" size={15} color="#FFFFFF" />
                  <Text style={styles.askAiFallbackText}>Ask Toyhourse AI to Find It</Text>
                </TouchableOpacity>
              )}
            </View>
          ) : (
            <FlatList
              data={products}
              keyExtractor={item => item._id}
              renderItem={renderProductItem}
              numColumns={2}
              columnWrapperStyle={styles.columnWrapper}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.productsListContent}
            />
          )}
        </View>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  overlayContainer: {
    position: 'absolute',
    top: 64,
    bottom: 74,
    left: 12,
    right: 12,
    zIndex: 100,
  },
  panel: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    overflow: 'hidden',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 16,
    elevation: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  headerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  sparkleIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#000000',
    letterSpacing: -0.2,
  },
  headerSubtitle: {
    fontSize: 11,
    color: '#6B7280',
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  searchBarContainer: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 6,
  },
  searchInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    backgroundColor: '#F3F4F6',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  searchInput: {
    flex: 1,
    color: '#000000',
    fontSize: 14,
    padding: 0,
  },
  filtersWrapper: {
    paddingVertical: 6,
  },
  filtersScroll: {
    paddingHorizontal: 16,
    gap: 8,
  },
  filterPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  filterPillActive: {
    backgroundColor: '#000000',
    borderColor: '#000000',
  },
  filterPillText: {
    color: '#000000',
    fontSize: 12,
    fontWeight: '600',
  },
  filterPillTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  aiPromptsSection: {
    paddingHorizontal: 16,
    paddingTop: 4,
    paddingBottom: 6,
  },
  aiPromptsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 6,
  },
  aiPromptsTitle: {
    fontSize: 10,
    fontWeight: '700',
    color: '#000000',
    letterSpacing: 0.8,
  },
  aiPromptsScroll: {
    gap: 8,
  },
  aiPromptChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  aiPromptChipText: {
    color: '#000000',
    fontSize: 11,
    fontWeight: '500',
  },
  resultsArea: {
    flex: 1,
    paddingHorizontal: 12,
    paddingTop: 6,
  },
  productsListContent: {
    paddingBottom: 16,
  },
  columnWrapper: {
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  productCardWrapper: {
    width: '48.5%',
  },
  productCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 10,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  imageBox: {
    height: 90,
    backgroundColor: '#F9FAFB',
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
    position: 'relative',
    overflow: 'hidden',
  },
  cardImage: {
    width: '100%',
    height: '100%',
  },
  badgePill: {
    position: 'absolute',
    top: 5,
    left: 5,
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  badgePillText: {
    color: '#000000',
    fontSize: 8,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  ratingBox: {
    position: 'absolute',
    bottom: 5,
    right: 5,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  ratingText: {
    color: '#000000',
    fontSize: 9,
    fontWeight: '700',
  },
  productTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: '#000000',
    lineHeight: 16,
    marginBottom: 4,
    height: 32,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 4,
    marginBottom: 8,
  },
  priceText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#000000',
  },
  comparePriceText: {
    fontSize: 10,
    color: '#9CA3AF',
    textDecorationLine: 'line-through',
  },
  cardActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  addBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 3,
    backgroundColor: '#000000',
    paddingVertical: 6,
    borderRadius: 8,
  },
  addBtnSuccess: {
    backgroundColor: '#374151',
  },
  addBtnText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
  },
  askAiBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    backgroundColor: '#F3F4F6',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    paddingHorizontal: 6,
    paddingVertical: 6,
    borderRadius: 8,
  },
  askAiBtnText: {
    color: '#000000',
    fontSize: 10,
    fontWeight: '600',
  },
  centerContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingVertical: 36,
  },
  loadingText: {
    color: '#6B7280',
    fontSize: 13,
    marginTop: 10,
  },
  emptyTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#000000',
    marginTop: 10,
  },
  emptySubtitle: {
    fontSize: 12,
    color: '#6B7280',
    textAlign: 'center',
    marginTop: 4,
    lineHeight: 18,
  },
  askAiFallbackBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#000000',
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 14,
    marginTop: 14,
  },
  askAiFallbackText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
});
