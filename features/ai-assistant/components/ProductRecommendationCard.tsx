import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import * as Haptics from 'expo-haptics';
import LiquidGlassSurface from './LiquidGlassSurface';
import type { RecommendedProduct } from '../types';

interface ProductRecommendationCardProps {
  product: RecommendedProduct;
}

export default function ProductRecommendationCard({ product }: ProductRecommendationCardProps) {
  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push(`/product/${product.slug}`);
  };

  return (
    <TouchableOpacity activeOpacity={0.8} onPress={handlePress} style={styles.container}>
      <LiquidGlassSurface intensity={40} tint="light" borderRadius={16} style={styles.card}>
        <View style={styles.imagePlaceholder}>
          <Ionicons name="cube-outline" size={32} color="#94A3B8" />
        </View>
        <View style={styles.info}>
          <Text style={styles.title} numberOfLines={2}>
            {product.name}
          </Text>
          <View style={styles.bottomRow}>
            <Text style={styles.price}>৳{product.price.toFixed(2)}</Text>
            {product.badge && (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{product.badge}</Text>
              </View>
            )}
            {!product.inStock && (
              <View style={[styles.badge, styles.outOfStockBadge]}>
                <Text style={styles.outOfStockText}>Out of stock</Text>
              </View>
            )}
          </View>
          <View style={styles.viewButton}>
            <Text style={styles.viewButtonText}>View Details</Text>
            <Ionicons name="arrow-forward" size={14} color="#FFF" />
          </View>
        </View>
      </LiquidGlassSurface>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    width: 220,
    marginRight: 12,
  },
  card: {
    padding: 12,
    backgroundColor: 'rgba(255,255,255,0.4)',
  },
  imagePlaceholder: {
    height: 120,
    backgroundColor: 'rgba(241, 245, 249, 0.5)',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  info: {
    flex: 1,
  },
  title: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1E293B',
    marginBottom: 8,
  },
  bottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
    flexWrap: 'wrap',
    gap: 4,
  },
  price: {
    fontSize: 16,
    fontWeight: '700',
    color: '#4F46E5',
  },
  badge: {
    backgroundColor: '#E0E7FF',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#4F46E5',
    textTransform: 'uppercase',
  },
  outOfStockBadge: {
    backgroundColor: '#FEE2E2',
  },
  outOfStockText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#EF4444',
    textTransform: 'uppercase',
  },
  viewButton: {
    backgroundColor: '#4F46E5',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    borderRadius: 8,
    gap: 4,
  },
  viewButtonText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: '600',
  },
});
