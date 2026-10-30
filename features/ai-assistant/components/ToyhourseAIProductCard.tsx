import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import * as Haptics from 'expo-haptics';
import useCart from '@/hooks/useCart';
import type { RecommendedProduct } from '../types';

interface ToyhourseAIProductCardProps {
  product: RecommendedProduct;
  onToast?: (msg: string) => void;
  onAskAI?: (prompt: string) => void;
}

export default function ToyhourseAIProductCard({
  product,
  onToast,
  onAskAI,
}: ToyhourseAIProductCardProps) {
  const { addToCart } = useCart();
  const [imageError, setImageError] = useState(false);
  const [isAdded, setIsAdded] = useState(false);

  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push(`/product/${product.slug || product.id}`);
  };

  const handleAddToCart = (e: any) => {
    e.stopPropagation?.();
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    addToCart({
      productId: product.id || product.slug,
      product: {
        _id: product.id || product.slug,
        title: product.name,
        slug: product.slug,
        price: product.price,
        images: product.image ? [{ url: product.image }] : [],
        inventory: product.inStock ? 10 : 0,
      },
      quantity: 1,
    });
    setIsAdded(true);
    onToast?.(`Added "${product.name}" to cart`);
    setTimeout(() => setIsAdded(false), 2000);
  };

  const handleAskAboutToy = (e: any) => {
    e.stopPropagation?.();
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onAskAI?.(`Tell me more about the "${product.name}". Is it suitable and recommended for kids?`);
  };

  const hasComparePrice =
    product.compareAtPrice && product.compareAtPrice > product.price;

  return (
    <TouchableOpacity
      activeOpacity={0.88}
      onPress={handlePress}
      style={styles.cardContainer}
    >
      <View style={styles.card}>
        {/* Product Image */}
        <View style={styles.imageWrapper}>
          {product.image && !imageError ? (
            <Image
              source={{ uri: product.image }}
              style={styles.productImage}
              contentFit="contain"
              transition={200}
              onError={() => setImageError(true)}
            />
          ) : (
            <View style={styles.fallbackIcon}>
              <Ionicons name="cube-outline" size={34} color="#000000" />
            </View>
          )}

          {/* Badges */}
          <View style={styles.badgesRow}>
            {product.badge ? (
              <View style={styles.badgePill}>
                <Text style={styles.badgeText}>{product.badge}</Text>
              </View>
            ) : null}
            {product.rating ? (
              <View style={styles.ratingPill}>
                <Ionicons name="star" size={10} color="#FBBF24" />
                <Text style={styles.ratingText}>{product.rating.toFixed(1)}</Text>
              </View>
            ) : null}
          </View>
        </View>

        {/* Info */}
        <View style={styles.info}>
          <Text style={styles.title} numberOfLines={2}>
            {product.name}
          </Text>

          {/* Price */}
          <View style={styles.priceRow}>
            <View style={styles.priceGroup}>
              <Text style={styles.price}>
                {product.price > 0 ? `৳${product.price.toLocaleString()}` : 'Price on tap'}
              </Text>
              {hasComparePrice && (
                <Text style={styles.comparePrice}>
                  ৳{product.compareAtPrice?.toLocaleString()}
                </Text>
              )}
            </View>
            {!product.inStock && (
              <View style={styles.outOfStockBadge}>
                <Text style={styles.outOfStockText}>Out of stock</Text>
              </View>
            )}
          </View>

          {/* Action Buttons */}
          <View style={styles.actionsRow}>
            <TouchableOpacity
              onPress={handleAddToCart}
              style={[styles.cartButton, isAdded && styles.cartButtonAdded]}
              activeOpacity={0.8}
            >
              <Ionicons
                name={isAdded ? 'checkmark' : 'cart-outline'}
                size={14}
                color="#FFFFFF"
              />
              <Text style={styles.cartButtonText}>
                {isAdded ? 'Added' : 'Add'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={handleAskAboutToy}
              style={styles.askButton}
              activeOpacity={0.8}
            >
              <Ionicons name="sparkles" size={12} color="#000000" />
              <Text style={styles.askButtonText}>Ask AI</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  cardContainer: {
    width: 220,
    marginRight: 12,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  imageWrapper: {
    height: 110,
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
    overflow: 'hidden',
    position: 'relative',
  },
  productImage: {
    width: '100%',
    height: '100%',
  },
  fallbackIcon: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgesRow: {
    position: 'absolute',
    top: 6,
    left: 6,
    right: 6,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  badgePill: {
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  badgeText: {
    fontSize: 9,
    fontWeight: '700',
    color: '#000000',
    textTransform: 'uppercase',
  },
  ratingPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    paddingHorizontal: 5,
    paddingVertical: 2,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  ratingText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#000000',
  },
  info: {
    flex: 1,
  },
  title: {
    fontSize: 13,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 6,
    lineHeight: 18,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  priceGroup: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 4,
  },
  price: {
    fontSize: 15,
    fontWeight: '700',
    color: '#000000',
  },
  comparePrice: {
    fontSize: 11,
    color: '#9CA3AF',
    textDecorationLine: 'line-through',
  },
  outOfStockBadge: {
    backgroundColor: '#FEE2E2',
    paddingHorizontal: 5,
    paddingVertical: 2,
    borderRadius: 6,
  },
  outOfStockText: {
    fontSize: 9,
    fontWeight: '600',
    color: '#DC2626',
  },
  actionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  cartButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    backgroundColor: '#000000',
    paddingVertical: 7,
    borderRadius: 8,
  },
  cartButtonAdded: {
    backgroundColor: '#374151',
  },
  cartButtonText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
  },
  askButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: '#F3F4F6',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    paddingHorizontal: 8,
    paddingVertical: 7,
    borderRadius: 8,
  },
  askButtonText: {
    color: '#000000',
    fontSize: 11,
    fontWeight: '600',
  },
});
