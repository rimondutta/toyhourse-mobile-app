import useCart from '@/hooks/useCart';
import { useProduct } from '@/hooks/useProduct';
import useWishlist from '@/hooks/useWishlist';
import { useAuth } from '@/context/AuthContext';
import WriteReviewModal from '@/components/WriteReviewModal';
import type { Product, ProductVariant, VariationType } from '@/types/product';
import {
  getEffectiveImages,
  getEffectivePrice,
  getEffectiveStock,
} from '@/types/product';
import { optimizeCloudinaryUrl } from '@/lib/utils';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { router, useLocalSearchParams } from 'expo-router';
import { useState, useMemo, useRef } from 'react';
import {
  View,
  Text,
  Alert,
  ActivityIndicator,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  StyleSheet,
  Linking,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const { width } = Dimensions.get('window');
const PURPLE = '#8B5CF6';
const LIGHT_PURPLE = '#F3E8FF';
const DARK_TEXT = '#1F2937';
const LIGHT_TEXT = '#9CA3AF';
const WHATSAPP_NUMBER = '8801616921965';

function findMatchingVariant(
  selections: Record<string, string>,
  variants: ProductVariant[]
): ProductVariant | null {
  const selectionEntries = Object.entries(selections);
  if (selectionEntries.length === 0) return null;
  return (
    variants.find((v) => {
      if (!v.isActive) return false;
      return selectionEntries.every(([typeId, valueId]) =>
        v.combination.some(
          (slot) =>
            slot.variationType._id === typeId &&
            slot.variationValue._id === valueId
        )
      );
    }) ?? null
  );
}

const ProductDetailScreen = () => {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { data: product, isError, isLoading } = useProduct(id);
  const { addToCart, isAddingToCart } = useCart();
  const insets = useSafeAreaInsets();
  const { isInWishlist, toggleWishlist, isAddingToWishlist, isRemovingFromWishlist } = useWishlist();

  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [selections, setSelections] = useState<Record<string, string>>({});
  const [activeTab, setActiveTab] = useState<'description' | 'reviews'>('description');
  const [showReviewModal, setShowReviewModal] = useState(false);
  const scrollRef = useRef<ScrollView>(null);
  const { user } = useAuth();

  const selectedVariant = useMemo(() => {
    if (!product?.hasVariations) return null;
    return findMatchingVariant(selections, product.variants);
  }, [product, selections]);

  const displayImages = useMemo(
    () => (product ? getEffectiveImages(product, selectedVariant) : []),
    [product, selectedVariant]
  );
  const displayPrice = product ? getEffectivePrice(product, selectedVariant) : 0;
  const displayStock = product ? getEffectiveStock(product, selectedVariant) : 0;
  const inStock = displayStock > 0;

  const handleAddToCart = () => {
    if (!product) return;
    if (product.hasVariations && !selectedVariant) {
      Alert.alert('Select options', 'Please select all product options before adding to cart.');
      return;
    }
    addToCart({ productId: product._id, product, quantity });
    Alert.alert('✓ Added to Bag', `${product.title} added successfully!`);
  };

  const handleBuyNow = () => {
    if (!product) return;
    if (product.hasVariations && !selectedVariant) {
      Alert.alert('Select options', 'Please select all product options before proceeding.');
      return;
    }
    addToCart({ productId: product._id, product, quantity });
    router.push('/(tabs)/cart');
  };

  const openWhatsApp = () => {
    if (!product) return;
    const msg = `Hi! I'm interested in the ${product.title}. Is it available?`;
    Linking.openURL(`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(msg)}`).catch(() => {
      Alert.alert('Error', 'WhatsApp could not be opened.');
    });
  };

  const handleSubmitReview = async (data: { rating: number; title: string; text: string; name: string }) => {
    if (!product) return;
    const res = await fetch(
      `${process.env.EXPO_PUBLIC_API_URL ?? 'https://toyhourse.vercel.app/api'}/products/${product._id}/reviews`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      }
    );
    const json = await res.json();
    if (!res.ok || !json.success) throw new Error(json.error ?? 'Failed to submit review');
    Alert.alert('Thank you!', 'Your review has been submitted.');
  };

  if (isLoading) return <LoadingUI />;
  if (isError || !product) return <ErrorUI />;

  const comparePrice = selectedVariant?.comparePrice ?? product.compareAtPrice;
  const hasDiscount = comparePrice && comparePrice > displayPrice;
  const discountPct = hasDiscount
    ? Math.round(((comparePrice! - displayPrice) / comparePrice!) * 100)
    : 0;
  const categoryName = typeof product.category === 'object' ? product.category?.name : product.category;
  const reviewsList = product.reviews ? [...product.reviews].reverse() : [];

  return (
    <View style={{ flex: 1, backgroundColor: '#F9F5FF' }}>

      {/* ── FLOATING HEADER ── */}
      <View style={[styles.floatingHeader, { top: insets.top > 0 ? insets.top + 4 : 16 }]}>
        <TouchableOpacity style={styles.iconBtn} onPress={() => router.back()} activeOpacity={0.8}>
          <Ionicons name="chevron-back" size={24} color={DARK_TEXT} />
        </TouchableOpacity>
        <View style={{ flex: 1 }} />
        <TouchableOpacity
          style={styles.iconBtn}
          onPress={() => toggleWishlist(product)}
          disabled={isAddingToWishlist || isRemovingFromWishlist}
          activeOpacity={0.8}
        >
          {isAddingToWishlist || isRemovingFromWishlist ? (
            <ActivityIndicator size="small" color={DARK_TEXT} />
          ) : (
            <Ionicons
              name={isInWishlist(product._id) ? 'heart' : 'heart-outline'}
              size={24}
              color={isInWishlist(product._id) ? '#EF4444' : DARK_TEXT}
            />
          )}
        </TouchableOpacity>
      </View>

      <ScrollView ref={scrollRef} style={{ flex: 1 }} showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 160 }}>

        {/* ── IMAGE GALLERY ── */}
        <View style={{ width, height: 480, backgroundColor: '#EADCF8', paddingTop: insets.top + 50, flexDirection: 'row' }}>
          {/* Main Image */}
          <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
            {displayImages.length > 0 ? (
              <Image 
                source={{ uri: optimizeCloudinaryUrl(displayImages[selectedImageIndex], 800) }} 
                style={{ width: '90%', height: '90%' }} 
                contentFit="contain" 
                transition={200}
              />
            ) : (
              <Ionicons name="image-outline" size={64} color={LIGHT_PURPLE} />
            )}
          </View>
          
          {/* Thumbnails */}
          {displayImages.length > 1 && (
            <View style={{ width: 80, paddingRight: 20, paddingTop: 20, gap: 12 }}>
              {displayImages.slice(0, 3).map((img, idx) => (
                <TouchableOpacity
                  key={idx}
                  onPress={() => setSelectedImageIndex(idx)}
                  style={{
                    width: 60, height: 60, borderRadius: 12, backgroundColor: '#FFFFFF', overflow: 'hidden',
                    borderWidth: 2, borderColor: selectedImageIndex === idx ? '#FFFFFF' : 'transparent',
                    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 2
                  }}
                  activeOpacity={0.8}
                >
                  <Image 
                    source={{ uri: optimizeCloudinaryUrl(img, 200) }} 
                    style={{ width: '100%', height: '100%' }} 
                    contentFit="cover" 
                    transition={200}
                  />
                </TouchableOpacity>
              ))}
            </View>
          )}

          {/* Out of stock overlay */}
          {!inStock && (
            <View style={{ position: 'absolute', top: insets.top > 0 ? insets.top + 60 : 72, left: 24 }}>
              <View style={{ backgroundColor: '#EF4444', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20 }}>
                <Text style={{ color: '#FFF', fontWeight: '700', fontSize: 12, letterSpacing: 0.5 }}>SOLD OUT</Text>
              </View>
            </View>
          )}

          {/* Discount badge */}
          {hasDiscount && inStock && (
            <View style={{ position: 'absolute', top: insets.top > 0 ? insets.top + 60 : 72, left: 24 }}>
              <View style={{ backgroundColor: LIGHT_PURPLE, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20 }}>
                <Text style={{ color: PURPLE, fontWeight: '700', fontSize: 12, letterSpacing: 0.5 }}>−{discountPct}% OFF</Text>
              </View>
            </View>
          )}
        </View>

        {/* ── INFO CARD ── */}
        <View style={styles.infoCard}>
          {/* Title Row */}
          <Text style={{ fontSize: 22, fontWeight: '800', color: DARK_TEXT, marginBottom: 8, letterSpacing: -0.5 }}>
            {product.title}
          </Text>

          {/* Price & Rating Row */}
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Text style={{ fontSize: 14, color: '#6B7280', marginRight: 4 }}>From:</Text>
              <Text style={{ fontSize: 16, fontWeight: '800', color: DARK_TEXT }}>
                ৳{displayPrice.toLocaleString()}
              </Text>
              {hasDiscount && (
                <Text style={{ fontSize: 12, color: LIGHT_TEXT, textDecorationLine: 'line-through', marginLeft: 8 }}>
                  ৳{comparePrice!.toLocaleString()}
                </Text>
              )}
            </View>
            
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
              <Ionicons name="star" size={14} color="#F59E0B" />
              <Text style={{ fontWeight: '700', fontSize: 12, color: DARK_TEXT }}>
                {(product.rating ?? 0).toFixed(1)}
              </Text>
              <Text style={{ fontSize: 12, color: '#6B7280' }}>
                ({product.reviewCount > 1000 ? '1k+' : product.reviewCount} Review{product.reviewCount !== 1 ? 's' : ''})
              </Text>
            </View>
          </View>

          {/* Short Description */}
          <Text style={{ fontSize: 16, fontWeight: '700', color: DARK_TEXT, marginBottom: 8 }}>Description</Text>
          <Text style={{ color: '#4B5563', fontSize: 14, lineHeight: 22, marginBottom: 24 }}>
            {product.description}
          </Text>

          {/* Dashed Divider */}
          <View style={{ height: 1, width: '100%', marginBottom: 24, overflow: 'hidden' }}>
             <View style={{ height: 2, borderWidth: 1, borderColor: '#D1D5DB', borderStyle: 'dashed', marginTop: -1 }} />
          </View>

          {/* Variation Pickers */}
          {product.hasVariations && product.variationTypes.length > 0 && (
            <View style={{ marginBottom: 24 }}>
              <VariationPickers product={product} selections={selections} onSelect={(typeId, valueId) => setSelections(prev => ({ ...prev, [typeId]: valueId }))} />
            </View>
          )}

          {/* Quantity */}
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
            <Text style={{ fontSize: 16, fontWeight: '700', color: DARK_TEXT }}>Quantity</Text>
            <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: '#F9FAFB', borderRadius: 24, padding: 4 }}>
              <TouchableOpacity
                style={styles.qtyBtn}
                onPress={() => setQuantity(Math.max(1, quantity - 1))}
                disabled={!inStock}
                activeOpacity={0.7}
              >
                <Ionicons name="remove" size={20} color={DARK_TEXT} />
              </TouchableOpacity>
              <Text style={{ fontSize: 16, fontWeight: '700', color: DARK_TEXT, minWidth: 32, textAlign: 'center' }}>
                {quantity}
              </Text>
              <TouchableOpacity
                style={styles.qtyBtn}
                onPress={() => setQuantity(Math.min(displayStock, quantity + 1))}
                disabled={!inStock || quantity >= displayStock}
                activeOpacity={0.7}
              >
                <Ionicons name="add" size={20} color={DARK_TEXT} />
              </TouchableOpacity>
            </View>
          </View>

          {/* Expandable More Details */}
          <TouchableOpacity 
            style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 12, marginBottom: 12 }}
            onPress={() => setActiveTab(activeTab === 'description' ? 'reviews' : 'description')}
            activeOpacity={0.7}
          >
            <Text style={{ fontSize: 15, fontWeight: '700', color: DARK_TEXT }}>Shop now</Text>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
              <Text style={{ fontSize: 14, color: '#4B5563' }}>More Details</Text>
              <Ionicons name={activeTab === 'reviews' ? "chevron-up" : "chevron-down"} size={16} color="#4B5563" />
            </View>
          </TouchableOpacity>

          {/* Long Description & Reviews Content */}
          {activeTab === 'reviews' && (
            <View style={{ backgroundColor: '#F9FAFB', padding: 16, borderRadius: 16, marginBottom: 24 }}>
              {product.longDescription && (
                <View style={{ marginBottom: 20 }}>
                  <Text style={{ fontSize: 14, fontWeight: '700', color: DARK_TEXT, marginBottom: 8 }}>Long Description</Text>
                  <Text style={{ color: '#4B5563', fontSize: 14, lineHeight: 22 }}>
                    {product.longDescription}
                  </Text>
                </View>
              )}
              
              <View>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                  <Text style={{ fontSize: 14, fontWeight: '700', color: DARK_TEXT }}>Reviews ({product.reviewCount})</Text>
                  <TouchableOpacity
                    onPress={() => {
                      if (!user) {
                        Alert.alert('Sign In Required', 'Please sign in to leave a review.');
                        return;
                      }
                      setShowReviewModal(true);
                    }}
                    style={{ backgroundColor: PURPLE, borderRadius: 20, paddingHorizontal: 14, paddingVertical: 6, flexDirection: 'row', alignItems: 'center', gap: 4 }}
                    activeOpacity={0.8}
                  >
                    <Ionicons name="create-outline" size={14} color="#fff" />
                    <Text style={{ color: '#fff', fontSize: 12, fontWeight: '700' }}>Write Review</Text>
                  </TouchableOpacity>
                </View>
                {reviewsList.length > 0 ? (
                  reviewsList.map((review: any, idx: number) => (
                    <View key={idx} style={{ paddingVertical: 8, borderBottomWidth: idx < reviewsList.length - 1 ? 1 : 0, borderBottomColor: '#E5E7EB' }}>
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: 4 }}>
                        <Ionicons name="star" size={12} color="#F59E0B" />
                        <Text style={{ fontWeight: '600', fontSize: 12, color: DARK_TEXT }}>{review.rating}</Text>
                        <Text style={{ fontSize: 12, color: LIGHT_TEXT, marginLeft: 8 }}>{review.name || 'Anonymous'}</Text>
                      </View>
                      {review.title ? (
                        <Text style={{ fontWeight: '600', fontSize: 13, color: DARK_TEXT, marginBottom: 2 }}>{review.title}</Text>
                      ) : null}
                      <Text style={{ color: '#4B5563', fontSize: 13, lineHeight: 20 }}>{review.text}</Text>
                    </View>
                  ))
                ) : (
                  <View style={{ alignItems: 'center', paddingVertical: 24 }}>
                    <Ionicons name="chatbubble-ellipses-outline" size={40} color="#D1D5DB" />
                    <Text style={{ color: LIGHT_TEXT, fontSize: 13, marginTop: 8 }}>No reviews yet. Be the first!</Text>
                  </View>
                )}
              </View>
            </View>
          )}

        </View>
      </ScrollView>

      {/* ── BOTTOM ACTION BAR ── */}
      <View style={[styles.bottomBar, { paddingBottom: insets.bottom > 0 ? insets.bottom : 24 }]}>
        <TouchableOpacity
          style={[styles.addBtn, !inStock && { opacity: 0.5 }]}
          activeOpacity={0.85}
          onPress={handleAddToCart}
          disabled={!inStock || isAddingToCart}
        >
          {isAddingToCart ? (
            <ActivityIndicator size="small" color={PURPLE} />
          ) : (
            <Text style={{ color: DARK_TEXT, fontSize: 15, fontWeight: '700' }}>Add to Cart</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.buyBtn, !inStock && { opacity: 0.5 }]}
          activeOpacity={0.85}
          onPress={handleBuyNow}
          disabled={!inStock}
        >
          <Text style={{ color: '#FFFFFF', fontSize: 15, fontWeight: '700' }}>Buy Now</Text>
        </TouchableOpacity>
      </View>

      <WriteReviewModal
        visible={showReviewModal}
        onClose={() => setShowReviewModal(false)}
        onSubmit={handleSubmitReview}
        defaultName={user?.name ?? ''}
      />
    </View>
  );
};

export default ProductDetailScreen;

// ─────────────────────────────────────────────────────────────
// Variation Pickers
// ─────────────────────────────────────────────────────────────
interface VariationPickersProps {
  product: Product;
  selections: Record<string, string>;
  onSelect: (variationTypeId: string, variationValueId: string) => void;
}

function VariationPickers({ product, selections, onSelect }: VariationPickersProps) {
  const valuesByType = useMemo(() => {
    const map = new Map<string, { typeName: string; displayType: string; values: any[] }>();
    for (const variant of product.variants) {
      if (!variant.isActive) continue;
      for (const slot of variant.combination) {
        const typeId = slot.variationType._id;
        if (!map.has(typeId)) {
          map.set(typeId, { typeName: slot.variationType.name, displayType: slot.variationType.displayType || 'button', values: [] });
        }
        const typeData = map.get(typeId)!;
        if (!typeData.values.find(v => v._id === slot.variationValue._id)) {
          typeData.values.push({ _id: slot.variationValue._id, value: slot.variationValue.value, colorHex: slot.variationValue.colorHex });
        }
      }
    }
    return map;
  }, [product.variants]);

  return (
    <View style={{ gap: 24 }}>
      {product.variationTypes.map((varType) => {
        const typeData = valuesByType.get(varType._id);
        const values = typeData?.values ?? [];
        if (values.length === 0) return null;
        const selectedValueId = selections[varType._id];
        const isColor = (typeData?.displayType || varType.displayType) === 'swatch';

        return (
          <View key={varType._id}>
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
              <Text style={{ fontSize: 16, fontWeight: '600', color: DARK_TEXT }}>{varType.name}</Text>
              {selectedValueId && (
                <Text style={{ fontSize: 14, fontWeight: '500', color: PURPLE }}>
                  {values.find(v => v._id === selectedValueId)?.value}
                </Text>
              )}
            </View>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12 }}>
              {values.map((val) => {
                const isSelected = selectedValueId === val._id;
                if (isColor && val.colorHex) {
                  return (
                    <TouchableOpacity
                      key={val._id}
                      onPress={() => onSelect(varType._id, val._id)}
                      activeOpacity={0.8}
                      style={{
                        width: 44, height: 44, borderRadius: 22,
                        backgroundColor: val.colorHex,
                        borderWidth: isSelected ? 2 : 1,
                        borderColor: isSelected ? PURPLE : '#E5E7EB',
                        alignItems: 'center', justifyContent: 'center',
                        padding: 2,
                      }}
                    >
                      <View style={{ width: '100%', height: '100%', borderRadius: 20, backgroundColor: val.colorHex }} />
                    </TouchableOpacity>
                  );
                }
                return (
                  <TouchableOpacity
                    key={val._id}
                    onPress={() => onSelect(varType._id, val._id)}
                    activeOpacity={0.8}
                    style={{
                      paddingHorizontal: 20, paddingVertical: 12,
                      borderRadius: 16,
                      backgroundColor: isSelected ? PURPLE : '#F9FAFB',
                      borderWidth: 1,
                      borderColor: isSelected ? PURPLE : '#F3F4F6',
                      alignItems: 'center', justifyContent: 'center',
                    }}
                  >
                    <Text style={{ fontSize: 14, fontWeight: '600', color: isSelected ? '#FFFFFF' : DARK_TEXT }}>{val.value}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        );
      })}
    </View>
  );
}

// ─────────────────────────────────────────────────────────────
// Loading / Error
// ─────────────────────────────────────────────────────────────
function ErrorUI() {
  return (
    <View style={{ flex: 1, backgroundColor: '#F9F5FF', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
      <Ionicons name="alert-circle-outline" size={64} color="#EF4444" />
      <Text style={{ fontSize: 20, fontWeight: '700', color: DARK_TEXT, marginTop: 16 }}>Product not found</Text>
      <TouchableOpacity style={{ backgroundColor: PURPLE, borderRadius: 24, paddingHorizontal: 32, paddingVertical: 16, marginTop: 24 }} onPress={() => router.back()}>
        <Text style={{ color: '#FFF', fontWeight: '600', fontSize: 16 }}>Go Back</Text>
      </TouchableOpacity>
    </View>
  );
}

function LoadingUI() {
  return (
    <View style={{ flex: 1, backgroundColor: '#F9F5FF', alignItems: 'center', justifyContent: 'center' }}>
      <ActivityIndicator size="large" color={PURPLE} />
    </View>
  );
}

// ─────────────────────────────────────────────────────────────
// Styles
// ─────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  floatingHeader: {
    position: 'absolute',
    left: 0, right: 0,
    zIndex: 10,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    gap: 8,
  },
  iconBtn: {
    width: 44, height: 44,
    borderRadius: 22,
    backgroundColor: '#FFFFFF',
    alignItems: 'center', justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 4,
  },
  infoCard: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    marginTop: -40,
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 24,
    minHeight: Dimensions.get('window').height * 0.6,
  },
  whatsappBtn: {
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#F3F4F6',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 20,
    gap: 8,
  },
  qtyBtn: {
    width: 40, height: 40,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    alignItems: 'center', justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0, left: 0, right: 0,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 24,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
    flexDirection: 'row',
    gap: 16,
  },
  buyBtn: {
    flex: 1,
    backgroundColor: PURPLE,
    paddingVertical: 18,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addBtn: {
    flex: 1,
    backgroundColor: LIGHT_PURPLE,
    paddingVertical: 18,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
