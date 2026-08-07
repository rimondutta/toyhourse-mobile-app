import SafeScreen from '@/components/SafeScreen';
import useCart from '@/hooks/useCart';
import { useProduct } from '@/hooks/useProduct';
import useWishlist from '@/hooks/useWishlist';
import type { Product, ProductVariant, VariationType } from '@/types/product';
import {
  getEffectiveImages,
  getEffectivePrice,
  getEffectiveStock,
} from '@/types/product';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { router, useLocalSearchParams } from 'expo-router';
import { useState, useMemo } from 'react';
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

// The brand accent color
const LIME_ACCENT = '#C9F31D';
const WHATSAPP_NUMBER = '8801616921965';

// ─────────────────────────────────────────────────────────────
// Variation picker helpers
// ─────────────────────────────────────────────────────────────

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

// ─────────────────────────────────────────────────────────────
// Main screen
// ─────────────────────────────────────────────────────────────

const ProductDetailScreen = () => {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { data: product, isError, isLoading } = useProduct(id);
  const { addToCart, isAddingToCart } = useCart();
  const insets = useSafeAreaInsets();

  const { isInWishlist, toggleWishlist, isAddingToWishlist, isRemovingFromWishlist } =
    useWishlist();

  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [selections, setSelections] = useState<Record<string, string>>({});
  const [activeTab, setActiveTab] = useState<'description' | 'reviews'>('description');

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
    addToCart({
      productId: product._id,
      product,
      quantity,
    });
    Alert.alert('Success', `${product.title} added to cart!`);
  };

  const handleBuyNow = () => {
    if (!product) return;
    if (product.hasVariations && !selectedVariant) {
      Alert.alert('Select options', 'Please select all product options before proceeding.');
      return;
    }
    addToCart({
      productId: product._id,
      product,
      quantity,
    });
    router.push('/(tabs)/cart');
  };

  const openWhatsApp = () => {
    if (!product) return;
    const msg = `Hi! I'm interested in the ${product.title}. Is it available?`;
    Linking.openURL(`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(msg)}`).catch(() => {
      Alert.alert('Error', 'WhatsApp could not be opened.');
    });
  };

  if (isLoading) return <LoadingUI />;
  if (isError || !product) return <ErrorUI />;

  const comparePrice = selectedVariant?.comparePrice ?? product.compareAtPrice;
  const hasDiscount = comparePrice && comparePrice > displayPrice;
  const categoryName = typeof product.category === 'object' ? product.category?.name : product.category;
  
  // Format reviews array correctly
  const reviewsList = product.reviews ? [...product.reviews].reverse() : [];

  return (
    <View style={{ flex: 1, backgroundColor: '#FFFFFF' }}>
      {/* ── HEADER (Floating over content) ── */}
      <View
        style={{
          position: 'absolute',
          top: insets.top > 0 ? insets.top : 20,
          left: 0,
          right: 0,
          zIndex: 10,
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          paddingHorizontal: 24,
        }}
      >
        <TouchableOpacity
          style={styles.iconButton}
          onPress={() => toggleWishlist(product)}
          disabled={isAddingToWishlist || isRemovingFromWishlist}
          activeOpacity={0.7}
        >
          {isAddingToWishlist || isRemovingFromWishlist ? (
            <ActivityIndicator size="small" color="#121212" />
          ) : (
            <Ionicons
              name={isInWishlist(product._id) ? 'heart' : 'heart-outline'}
              size={22}
              color={isInWishlist(product._id) ? '#EF4444' : '#64748B'}
            />
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.iconButton, { backgroundColor: '#121212' }]}
          onPress={() => router.back()}
          activeOpacity={0.7}
        >
          <Ionicons name="close" size={24} color="#FFFFFF" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.iconButton} activeOpacity={0.7}>
          <Ionicons name="share-outline" size={22} color="#64748B" />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={{ flex: 1 }}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 160 }} // Extra padding for double buttons
      >
        {/* ── IMAGE GALLERY ── */}
        <View style={{ width, height: 450, backgroundColor: '#F8FAFC', overflow: 'hidden' }}>
          <ScrollView
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onScroll={(e) => {
              const index = Math.round(e.nativeEvent.contentOffset.x / width);
              setSelectedImageIndex(index);
            }}
            scrollEventThrottle={16}
          >
            {displayImages.length > 0 ? (
              displayImages.map((imageUrl, index) => (
                <View key={index} style={{ width, height: 450 }}>
                  <Image
                    source={imageUrl}
                    style={{ width: '100%', height: '100%' }}
                    contentFit="cover"
                  />
                </View>
              ))
            ) : (
              <View style={{ width, height: 450, alignItems: 'center', justifyContent: 'center' }}>
                <Ionicons name="image-outline" size={64} color="#CBD5E1" />
              </View>
            )}
          </ScrollView>

          {displayImages.length > 1 && (
            <View style={{ position: 'absolute', bottom: 24, left: 0, right: 0, flexDirection: 'row', justifyContent: 'center', gap: 6 }}>
              {displayImages.map((_, index) => (
                <View
                  key={index}
                  style={{
                    height: 6,
                    width: 6,
                    borderRadius: 3,
                    backgroundColor: index === selectedImageIndex ? '#121212' : '#CBD5E1',
                  }}
                />
              ))}
            </View>
          )}
        </View>

        {/* ── PRODUCT INFO ── */}
        <View style={{ paddingHorizontal: 24, paddingTop: 32 }}>
          {/* Badge & Category */}
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 16 }}>
            <View style={{ backgroundColor: LIME_ACCENT, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 }}>
              <Text style={{ fontSize: 10, fontWeight: '800', color: '#121212', letterSpacing: 0.5 }}>NEW</Text>
            </View>
            {categoryName && (
              <Text style={{ color: '#64748B', fontSize: 12, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 1 }}>
                {categoryName}
              </Text>
            )}
          </View>

          {/* Title */}
          <Text style={{ fontSize: 26, fontWeight: '700', color: '#0F172A', marginBottom: 8, letterSpacing: -0.5 }}>
            {product.title}
          </Text>

          {/* Rating */}
          {product.reviewCount > 0 && (
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 24 }}>
              <View style={{ flexDirection: 'row', gap: 2 }}>
                {[1, 2, 3, 4, 5].map((star) => (
                  <Ionicons
                    key={star}
                    name="star"
                    size={16}
                    color={star <= (product.rating ?? 0) ? '#EF4444' : '#E2E8F0'}
                  />
                ))}
              </View>
              <Text style={{ color: '#64748B', fontSize: 14, marginLeft: 8, fontWeight: '500' }}>
                ({product.reviewCount} reviews)
              </Text>
            </View>
          )}

          {/* Price */}
          <View style={{ flexDirection: 'row', alignItems: 'flex-end', gap: 10, marginBottom: 24 }}>
            <Text style={{ fontSize: 32, fontWeight: '800', color: '#0F172A', letterSpacing: -1 }}>
              ৳{displayPrice.toLocaleString()}
            </Text>
            {hasDiscount && (
              <Text style={{ fontSize: 18, color: '#94A3B8', textDecorationLine: 'line-through', marginBottom: 4 }}>
                ৳{comparePrice!.toLocaleString()}
              </Text>
            )}
          </View>
          
          {/* WhatsApp Button */}
          <TouchableOpacity
            onPress={openWhatsApp}
            activeOpacity={0.8}
            style={{
              backgroundColor: '#25D366',
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'center',
              paddingVertical: 14,
              borderRadius: 16,
              marginBottom: 32,
              gap: 8,
            }}
          >
            <Ionicons name="logo-whatsapp" size={20} color="#FFFFFF" />
            <Text style={{ color: '#FFFFFF', fontWeight: '700', fontSize: 15 }}>Chat on WhatsApp</Text>
          </TouchableOpacity>

          {/* ── DYNAMIC VARIATION PICKERS ── */}
          {product.hasVariations && product.variationTypes.length > 0 && (
            <VariationPickers
              product={product}
              selections={selections}
              onSelect={(typeId, valueId) =>
                setSelections((prev) => ({ ...prev, [typeId]: valueId }))
              }
            />
          )}
          
          {/* Quantity Selection */}
          <View style={{ marginBottom: 32 }}>
            <Text style={{ fontSize: 14, fontWeight: '600', color: '#0F172A', marginBottom: 12 }}>Quantity</Text>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <TouchableOpacity
                style={styles.qtyButton}
                onPress={() => setQuantity(Math.max(1, quantity - 1))}
                disabled={!inStock}
              >
                <Ionicons name="remove" size={20} color="#121212" />
              </TouchableOpacity>
              <Text style={{ width: 40, textAlign: 'center', fontSize: 16, fontWeight: '700', color: '#121212' }}>
                {quantity}
              </Text>
              <TouchableOpacity
                style={styles.qtyButton}
                onPress={() => setQuantity(Math.min(displayStock, quantity + 1))}
                disabled={!inStock || quantity >= displayStock}
              >
                <Ionicons name="add" size={20} color="#121212" />
              </TouchableOpacity>
            </View>
          </View>

          {/* Metadata Block */}
          <View style={{ backgroundColor: '#F8FAFC', borderRadius: 16, padding: 16, marginBottom: 32 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 }}>
              <Text style={{ color: '#64748B', fontSize: 13, fontWeight: '600' }}>SKU</Text>
              <Text style={{ color: '#0F172A', fontSize: 13, fontWeight: '700' }}>{(product._id || '').slice(-6).toUpperCase()}</Text>
            </View>
            {categoryName && (
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 }}>
                <Text style={{ color: '#64748B', fontSize: 13, fontWeight: '600' }}>Category</Text>
                <Text style={{ color: '#0F172A', fontSize: 13, fontWeight: '700' }}>{categoryName}</Text>
              </View>
            )}
            {product.ageRange && (
              <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                <Text style={{ color: '#64748B', fontSize: 13, fontWeight: '600' }}>Ages</Text>
                <Text style={{ color: '#0F172A', fontSize: 13, fontWeight: '700' }}>{product.ageRange}</Text>
              </View>
            )}
          </View>

          {/* ── TABS (Description & Reviews) ── */}
          <View style={{ borderTopWidth: 1, borderTopColor: '#F1F5F9', paddingTop: 24 }}>
            <View style={{ flexDirection: 'row', gap: 24, marginBottom: 24 }}>
              <TouchableOpacity onPress={() => setActiveTab('description')} activeOpacity={0.7}>
                <Text style={{ fontSize: 16, fontWeight: activeTab === 'description' ? '800' : '600', color: activeTab === 'description' ? '#0F172A' : '#94A3B8' }}>
                  Description
                </Text>
                {activeTab === 'description' && <View style={styles.tabIndicator} />}
              </TouchableOpacity>
              
              <TouchableOpacity onPress={() => setActiveTab('reviews')} activeOpacity={0.7}>
                <Text style={{ fontSize: 16, fontWeight: activeTab === 'reviews' ? '800' : '600', color: activeTab === 'reviews' ? '#0F172A' : '#94A3B8' }}>
                  Reviews {product.reviewCount ? `(${product.reviewCount})` : ''}
                </Text>
                {activeTab === 'reviews' && <View style={styles.tabIndicator} />}
              </TouchableOpacity>
            </View>

            {/* Description Content */}
            {activeTab === 'description' && (
              <View style={{ gap: 24 }}>
                <Text style={{ color: '#475569', fontSize: 15, lineHeight: 24 }}>
                  {product.description}
                </Text>

                <View>
                  <Text style={{ fontSize: 14, fontWeight: '700', color: '#0F172A', marginBottom: 12 }}>Why This Product?</Text>
                  {["Non-toxic, child-safe materials", "Open-ended, creative play", "Sustainably sourced & eco-friendly"].map((feat, i) => (
                    <View key={i} style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
                      <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: LIME_ACCENT, marginRight: 8 }} />
                      <Text style={{ color: '#475569', fontSize: 14 }}>{feat}</Text>
                    </View>
                  ))}
                </View>

                <View style={{ backgroundColor: '#F8FAFC', borderRadius: 16, padding: 16 }}>
                  <Text style={{ fontSize: 14, fontWeight: '700', color: '#0F172A', marginBottom: 16 }}>Shipping & Returns</Text>
                  
                  <View style={{ flexDirection: 'row', gap: 12, marginBottom: 16 }}>
                    <Ionicons name="cube-outline" size={20} color="#0F172A" />
                    <View style={{ flex: 1 }}>
                      <Text style={{ fontWeight: '600', color: '#0F172A', fontSize: 14, marginBottom: 2 }}>Free Shipping</Text>
                      <Text style={{ color: '#64748B', fontSize: 13 }}>Free standard shipping on orders over ৳1,500.</Text>
                    </View>
                  </View>

                  <View style={{ flexDirection: 'row', gap: 12 }}>
                    <Ionicons name="refresh-outline" size={20} color="#0F172A" />
                    <View style={{ flex: 1 }}>
                      <Text style={{ fontWeight: '600', color: '#0F172A', fontSize: 14, marginBottom: 2 }}>Easy Returns</Text>
                      <Text style={{ color: '#64748B', fontSize: 13 }}>Return within 30 days of receiving your order.</Text>
                    </View>
                  </View>
                </View>
              </View>
            )}

            {/* Reviews Content */}
            {activeTab === 'reviews' && (
              <View>
                {product.reviewCount > 0 ? (
                  <View style={{ alignItems: 'center', backgroundColor: '#F8FAFC', padding: 24, borderRadius: 16, marginBottom: 24 }}>
                    <Text style={{ fontSize: 48, fontWeight: '800', color: '#0F172A', letterSpacing: -2 }}>
                      {product.rating?.toFixed(1) || '0.0'}
                    </Text>
                    <View style={{ flexDirection: 'row', gap: 4, marginVertical: 8 }}>
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Ionicons key={star} name="star" size={20} color={star <= (product.rating ?? 0) ? '#EF4444' : '#E2E8F0'} />
                      ))}
                    </View>
                    <Text style={{ color: '#64748B', fontSize: 14, fontWeight: '600' }}>Based on {product.reviewCount} reviews</Text>
                  </View>
                ) : (
                  <View style={{ alignItems: 'center', backgroundColor: '#F8FAFC', padding: 32, borderRadius: 16, marginBottom: 24 }}>
                    <Ionicons name="chatbubbles-outline" size={40} color="#94A3B8" />
                    <Text style={{ color: '#64748B', marginTop: 12, fontWeight: '600' }}>No reviews yet. Be the first!</Text>
                  </View>
                )}

                {/* Review List */}
                {reviewsList.map((review: any, i: number) => (
                  <View key={i} style={{ borderBottomWidth: 1, borderBottomColor: '#F1F5F9', paddingBottom: 24, marginBottom: 24 }}>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                        <View style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: '#0F172A', alignItems: 'center', justifyContent: 'center' }}>
                          <Text style={{ color: '#FFFFFF', fontWeight: '700', fontSize: 14 }}>{review.name?.[0]?.toUpperCase() || "A"}</Text>
                        </View>
                        <View>
                          <Text style={{ fontWeight: '700', color: '#0F172A', fontSize: 14 }}>{review.name}</Text>
                          <View style={{ flexDirection: 'row', gap: 2, marginTop: 2 }}>
                            {[1, 2, 3, 4, 5].map((star) => (
                              <Ionicons key={star} name="star" size={12} color={star <= review.rating ? '#EF4444' : '#E2E8F0'} />
                            ))}
                          </View>
                        </View>
                      </View>
                      <Text style={{ color: '#94A3B8', fontSize: 12 }}>{new Date(review.date).toLocaleDateString()}</Text>
                    </View>
                    {review.title && <Text style={{ fontWeight: '700', color: '#0F172A', fontSize: 14, marginBottom: 4 }}>{review.title}</Text>}
                    <Text style={{ color: '#475569', fontSize: 14, lineHeight: 22 }}>"{review.text}"</Text>
                  </View>
                ))}
                
                {/* Note: In-app review submission form can be added here later. Redirecting to website for now if needed, or we just rely on API parity. */}
              </View>
            )}
          </View>
        </View>
      </ScrollView>

      {/* ── BOTTOM ACTION BAR ── */}
      <View
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          backgroundColor: '#FFFFFF',
          paddingHorizontal: 24,
          paddingTop: 16,
          paddingBottom: insets.bottom > 0 ? insets.bottom : 24,
          borderTopWidth: 1,
          borderTopColor: '#F8FAFC',
          flexDirection: 'row',
          alignItems: 'center',
          gap: 12,
        }}
      >
        <TouchableOpacity
          style={{
            flex: 1,
            backgroundColor: !inStock ? '#F1F5F9' : '#0F172A', // Dark for add to cart
            paddingVertical: 18,
            borderRadius: 16,
            alignItems: 'center',
            justifyContent: 'center',
          }}
          activeOpacity={0.8}
          onPress={handleAddToCart}
          disabled={!inStock || isAddingToCart}
        >
          {isAddingToCart ? (
            <ActivityIndicator size="small" color="#FFFFFF" />
          ) : (
            <Text style={{ color: !inStock ? '#94A3B8' : '#FFFFFF', fontSize: 15, fontWeight: '700' }}>
              Add to Cart
            </Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={{
            flex: 1,
            backgroundColor: !inStock ? '#F1F5F9' : LIME_ACCENT, // Lime for Buy Now
            paddingVertical: 18,
            borderRadius: 16,
            alignItems: 'center',
            justifyContent: 'center',
          }}
          activeOpacity={0.8}
          onPress={handleBuyNow}
          disabled={!inStock}
        >
          <Text style={{ color: !inStock ? '#94A3B8' : '#000000', fontSize: 15, fontWeight: '700' }}>
            Buy Now
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default ProductDetailScreen;

// ─────────────────────────────────────────────────────────────
// Dynamic Variation Pickers Component
// ─────────────────────────────────────────────────────────────

interface VariationPickersProps {
  product: Product;
  selections: Record<string, string>;
  onSelect: (variationTypeId: string, variationValueId: string) => void;
}

function VariationPickers({ product, selections, onSelect }: VariationPickersProps) {
  const valuesByType = useMemo(() => {
    const map = new Map<string, { typeName: string, displayType: string, values: any[] }>();

    for (const variant of product.variants) {
      if (!variant.isActive) continue;
      for (const slot of variant.combination) {
        const typeId = slot.variationType._id;
        if (!map.has(typeId)) {
          map.set(typeId, {
            typeName: slot.variationType.name,
            displayType: slot.variationType.displayType || 'button',
            values: [],
          });
        }
        const typeData = map.get(typeId)!;
        if (!typeData.values.find(v => v._id === slot.variationValue._id)) {
          typeData.values.push({
            _id: slot.variationValue._id,
            value: slot.variationValue.value,
            colorHex: slot.variationValue.colorHex,
          });
        }
      }
    }
    return map;
  }, [product.variants]);

  const isRowLayout = product.variationTypes.length === 2;

  return (
    <View style={{ flexDirection: isRowLayout ? 'row' : 'column', justifyContent: 'space-between', gap: 24, marginBottom: 24 }}>
      {product.variationTypes.map((varType) => {
        const typeData = valuesByType.get(varType._id);
        const values = typeData?.values ?? [];
        if (values.length === 0) return null;

        const selectedValueId = selections[varType._id];
        const displayType = typeData?.displayType || varType.displayType;
        const isColor = displayType === 'swatch';

        return (
          <View key={varType._id} style={{ flex: isRowLayout ? 1 : undefined, alignItems: isColor ? 'flex-end' : 'flex-start' }}>
            <Text style={{ fontSize: 14, fontWeight: '600', color: '#0F172A', marginBottom: 12 }}>
              {varType.name}
            </Text>

            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10, justifyContent: isColor ? 'flex-end' : 'flex-start' }}>
              {values.map((val) => {
                const isSelected = selectedValueId === val._id;

                if (isColor && val.colorHex) {
                  return (
                    <TouchableOpacity
                      key={val._id}
                      onPress={() => onSelect(varType._id, val._id)}
                      activeOpacity={0.8}
                      style={{
                        width: 36,
                        height: 36,
                        borderRadius: 18,
                        backgroundColor: val.colorHex,
                        alignItems: 'center',
                        justifyContent: 'center',
                        borderWidth: 2,
                        borderColor: isSelected ? '#000000' : '#E2E8F0', // High contrast border for color selection
                        shadowColor: '#000',
                        shadowOffset: { width: 0, height: 2 },
                        shadowOpacity: 0.1,
                        shadowRadius: 4,
                      }}
                    >
                      {isSelected && (
                        <Ionicons name="checkmark" size={18} color={['#FFFFFF', '#fff'].includes(val.colorHex.toLowerCase()) ? '#000' : '#FFF'} />
                      )}
                    </TouchableOpacity>
                  );
                }

                // Default pill or button (Size, etc.)
                return (
                  <TouchableOpacity
                    key={val._id}
                    onPress={() => onSelect(varType._id, val._id)}
                    activeOpacity={0.8}
                    style={{
                      paddingHorizontal: 16,
                      height: 44,
                      minWidth: 44,
                      borderRadius: 14,
                      backgroundColor: isSelected ? '#0F172A' : '#FFFFFF',
                      borderWidth: 1,
                      borderColor: isSelected ? '#0F172A' : '#E2E8F0',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <Text
                      style={{
                        fontSize: 14,
                        fontWeight: '600',
                        color: isSelected ? '#FFFFFF' : '#0F172A',
                      }}
                    >
                      {val.value}
                    </Text>
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
// Loading / Error states
// ─────────────────────────────────────────────────────────────

function ErrorUI() {
  return (
    <View style={{ flex: 1, backgroundColor: '#FFFFFF', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
      <Ionicons name="alert-circle-outline" size={64} color="#EF4444" />
      <Text style={{ fontSize: 20, fontWeight: '700', color: '#0F172A', marginTop: 16 }}>Product not found</Text>
      <Text style={{ color: '#64748B', textAlign: 'center', marginTop: 8 }}>
        This product may have been removed or doesn't exist
      </Text>
      <TouchableOpacity
        style={{ backgroundColor: '#0F172A', borderRadius: 16, paddingHorizontal: 24, paddingVertical: 14, marginTop: 24 }}
        onPress={() => router.back()}
      >
        <Text style={{ color: '#FFFFFF', fontWeight: '700' }}>Go Back</Text>
      </TouchableOpacity>
    </View>
  );
}

function LoadingUI() {
  return (
    <View style={{ flex: 1, backgroundColor: '#FFFFFF', alignItems: 'center', justifyContent: 'center' }}>
      <ActivityIndicator size="large" color={LIME_ACCENT} />
      <Text style={{ color: '#64748B', marginTop: 16 }}>Loading product...</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  iconButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  qtyButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabIndicator: {
    height: 3,
    backgroundColor: '#0F172A',
    borderRadius: 1.5,
    marginTop: 6,
    width: '100%',
  }
});
