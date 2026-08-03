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
} from 'react-native';

const { width } = Dimensions.get('window');

// ─────────────────────────────────────────────────────────────
// Variation picker helpers
// ─────────────────────────────────────────────────────────────

/**
 * Given current selections (variationTypeId → variationValueId) and a list
 * of variants, find the matching active variant (or null if not yet fully selected).
 */
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

  const { isInWishlist, toggleWishlist, isAddingToWishlist, isRemovingFromWishlist } =
    useWishlist();

  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);

  // selections: { variationTypeId: variationValueId }
  const [selections, setSelections] = useState<Record<string, string>>({});

  // ── Derived state from selections ──
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

  // Reset image index when images change (e.g. variant switch)
  const prevImagesRef = useState(displayImages)[1];

  const handleAddToCart = () => {
    if (!product) return;
    if (product.hasVariations && !selectedVariant) {
      Alert.alert('Select options', 'Please select all product options before adding to cart.');
      return;
    }
    addToCart(
      {
        productId: product._id,
        quantity,
        ...(selectedVariant ? { variantId: selectedVariant._id } : {}),
      },
      {
        onSuccess: () => Alert.alert('Success', `${product.title} added to cart!`),
        onError: (error: any) => {
          Alert.alert('Error', error?.response?.data?.error ?? 'Failed to add to cart');
        },
      }
    );
  };

  if (isLoading) return <LoadingUI />;
  if (isError || !product) return <ErrorUI />;

  const categoryName =
    typeof product.category === 'object' ? product.category.name : product.category;

  const comparePrice = selectedVariant?.comparePrice ?? product.compareAtPrice;
  const hasDiscount = comparePrice && comparePrice > displayPrice;

  return (
    <SafeScreen>
      {/* HEADER */}
      <View className="absolute top-0 left-0 right-0 z-10 px-6 pt-20 pb-4 flex-row items-center justify-between">
        <TouchableOpacity
          className="bg-black/50 backdrop-blur-xl w-12 h-12 rounded-full items-center justify-center"
          onPress={() => router.back()}
          activeOpacity={0.7}
        >
          <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
        </TouchableOpacity>

        <TouchableOpacity
          className={`w-12 h-12 rounded-full items-center justify-center ${
            isInWishlist(product._id) ? 'bg-primary' : 'bg-black/50 backdrop-blur-xl'
          }`}
          onPress={() => toggleWishlist(product)}
          disabled={isAddingToWishlist || isRemovingFromWishlist}
          activeOpacity={0.7}
        >
          {isAddingToWishlist || isRemovingFromWishlist ? (
            <ActivityIndicator size="small" color="#FFFFFF" />
          ) : (
            <Ionicons
              name={isInWishlist(product._id) ? 'heart' : 'heart-outline'}
              size={24}
              color={isInWishlist(product._id) ? '#121212' : '#FFFFFF'}
            />
          )}
        </TouchableOpacity>
      </View>

      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 120 }}
      >
        {/* IMAGE GALLERY */}
        <View className="relative">
          <ScrollView
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onScroll={(e) => {
              const index = Math.round(e.nativeEvent.contentOffset.x / width);
              setSelectedImageIndex(index);
            }}
          >
            {displayImages.length > 0 ? (
              displayImages.map((imageUrl, index) => (
                <View key={index} style={{ width }}>
                  <Image
                    source={imageUrl}
                    style={{ width, height: 400 }}
                    contentFit="cover"
                  />
                </View>
              ))
            ) : (
              <View
                style={{ width, height: 400 }}
                className="items-center justify-center bg-surface"
              >
                <Ionicons name="image-outline" size={64} color="#666" />
              </View>
            )}
          </ScrollView>

          {/* Image indicators */}
          {displayImages.length > 1 && (
            <View className="absolute bottom-4 left-0 right-0 flex-row justify-center gap-2">
              {displayImages.map((_, index) => (
                <View
                  key={index}
                  className={`h-2 rounded-full ${
                    index === selectedImageIndex ? 'bg-primary w-6' : 'bg-white/50 w-2'
                  }`}
                />
              ))}
            </View>
          )}
        </View>

        {/* PRODUCT INFO */}
        <View className="p-6">
          {/* Category + Badge */}
          <View className="flex-row items-center gap-2 mb-3">
            <View className="bg-primary/20 px-3 py-1 rounded-full">
              <Text className="text-primary text-xs font-bold">{categoryName}</Text>
            </View>
            {product.badge && (
              <View className="bg-surface px-3 py-1 rounded-full">
                <Text className="text-text-secondary text-xs font-bold">{product.badge}</Text>
              </View>
            )}
          </View>

          {/* Title — field is `title` not `name` */}
          <Text className="text-text-primary text-3xl font-bold mb-3">{product.title}</Text>

          {/* Rating & stock */}
          <View className="flex-row items-center mb-4">
            <View className="flex-row items-center bg-surface px-3 py-2 rounded-full">
              <Ionicons name="star" size={16} color="#FFC107" />
              <Text className="text-text-primary font-bold ml-1 mr-2">
                {(product.rating ?? 0).toFixed(1)}
              </Text>
              <Text className="text-text-secondary text-sm">
                ({product.reviewCount ?? 0} reviews)
              </Text>
            </View>

            {inStock ? (
              <View className="ml-3 flex-row items-center">
                <View className="w-2 h-2 bg-green-500 rounded-full mr-2" />
                <Text className="text-green-500 font-semibold text-sm">
                  {displayStock} in stock
                </Text>
              </View>
            ) : (
              <View className="ml-3 flex-row items-center">
                <View className="w-2 h-2 bg-red-500 rounded-full mr-2" />
                <Text className="text-red-500 font-semibold text-sm">Out of Stock</Text>
              </View>
            )}
          </View>

          {/* Price */}
          <View className="flex-row items-end gap-3 mb-6">
            <Text className="text-primary text-4xl font-bold">
              ৳{displayPrice.toFixed(2)}
            </Text>
            {hasDiscount && (
              <Text className="text-text-secondary text-xl line-through mb-1">
                ৳{comparePrice!.toFixed(2)}
              </Text>
            )}
          </View>

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

          {/* Quantity */}
          <View className="mb-6">
            <Text className="text-text-primary text-lg font-bold mb-3">Quantity</Text>
            <View className="flex-row items-center">
              <TouchableOpacity
                className="bg-surface rounded-full w-12 h-12 items-center justify-center"
                onPress={() => setQuantity(Math.max(1, quantity - 1))}
                activeOpacity={0.7}
                disabled={!inStock}
              >
                <Ionicons name="remove" size={24} color={inStock ? '#FFFFFF' : '#666'} />
              </TouchableOpacity>

              <Text className="text-text-primary text-xl font-bold mx-6">{quantity}</Text>

              <TouchableOpacity
                className="bg-primary rounded-full w-12 h-12 items-center justify-center"
                onPress={() => setQuantity(Math.min(displayStock, quantity + 1))}
                activeOpacity={0.7}
                disabled={!inStock || quantity >= displayStock}
              >
                <Ionicons
                  name="add"
                  size={24}
                  color={!inStock || quantity >= displayStock ? '#666' : '#121212'}
                />
              </TouchableOpacity>
            </View>
            {quantity >= displayStock && inStock && (
              <Text className="text-orange-500 text-sm mt-2">Maximum stock reached</Text>
            )}
          </View>

          {/* Description */}
          <View className="mb-8">
            <Text className="text-text-primary text-lg font-bold mb-3">Description</Text>
            <Text className="text-text-secondary text-base leading-6">
              {product.description}
            </Text>
          </View>
        </View>
      </ScrollView>

      {/* Bottom Action Bar */}
      <View className="absolute bottom-0 left-0 right-0 bg-background/95 backdrop-blur-xl border-t border-surface px-6 py-4 pb-8">
        <View className="flex-row items-center gap-3">
          <View className="flex-1">
            <Text className="text-text-secondary text-sm mb-1">Total Price</Text>
            <Text className="text-primary text-2xl font-bold">
              ৳{(displayPrice * quantity).toFixed(2)}
            </Text>
          </View>
          <TouchableOpacity
            className={`rounded-2xl px-8 py-4 flex-row items-center ${
              !inStock ? 'bg-surface' : 'bg-primary'
            }`}
            activeOpacity={0.8}
            onPress={handleAddToCart}
            disabled={!inStock || isAddingToCart}
          >
            {isAddingToCart ? (
              <ActivityIndicator size="small" color="#121212" />
            ) : (
              <>
                <Ionicons name="cart" size={24} color={!inStock ? '#666' : '#121212'} />
                <Text
                  className={`font-bold text-lg ml-2 ${
                    !inStock ? 'text-text-secondary' : 'text-background'
                  }`}
                >
                  {!inStock ? 'Out of Stock' : 'Add to Cart'}
                </Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </SafeScreen>
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
  // Collect unique values per variation type from active variants
  const valuesByType = useMemo(() => {
    const map = new Map<string, Map<string, { _id: string; value: string; colorHex: string | null; slug: string }>>();

    for (const variant of product.variants) {
      if (!variant.isActive) continue;
      for (const slot of variant.combination) {
        const typeId = slot.variationType._id;
        if (!map.has(typeId)) map.set(typeId, new Map());
        const typeMap = map.get(typeId)!;
        if (!typeMap.has(slot.variationValue._id)) {
          typeMap.set(slot.variationValue._id, {
            _id: slot.variationValue._id,
            value: slot.variationValue.value,
            colorHex: slot.variationValue.colorHex,
            slug: slot.variationValue.slug,
          });
        }
      }
    }
    return map;
  }, [product.variants]);

  return (
    <View className="mb-6">
      {product.variationTypes.map((varType) => {
        const values = Array.from(valuesByType.get(varType._id)?.values() ?? []);
        if (values.length === 0) return null;

        const selectedValueId = selections[varType._id];

        return (
          <View key={varType._id} className="mb-4">
            <Text className="text-text-primary text-lg font-bold mb-3">
              {varType.name}
              {selectedValueId && (
                <Text className="text-text-secondary font-normal text-base">
                  {' '}— {values.find((v) => v._id === selectedValueId)?.value}
                </Text>
              )}
            </Text>

            <View className="flex-row flex-wrap gap-2">
              {values.map((val) => {
                const isSelected = selectedValueId === val._id;

                // Swatch (color circles) for color-type variations
                if (varType.displayType === 'swatch' && val.colorHex) {
                  return (
                    <TouchableOpacity
                      key={val._id}
                      onPress={() => onSelect(varType._id, val._id)}
                      activeOpacity={0.8}
                      className={`w-10 h-10 rounded-full items-center justify-center ${
                        isSelected ? 'border-2 border-primary' : 'border-2 border-transparent'
                      }`}
                      style={{ backgroundColor: val.colorHex }}
                    >
                      {isSelected && (
                        <Ionicons name="checkmark" size={18} color="#fff" />
                      )}
                    </TouchableOpacity>
                  );
                }

                // Pill buttons for everything else (size, pieces, etc.)
                return (
                  <TouchableOpacity
                    key={val._id}
                    onPress={() => onSelect(varType._id, val._id)}
                    activeOpacity={0.8}
                    className={`px-4 py-2 rounded-full border ${
                      isSelected
                        ? 'bg-primary border-primary'
                        : 'bg-surface border-surface'
                    }`}
                  >
                    <Text
                      className={`font-semibold text-sm ${
                        isSelected ? 'text-background' : 'text-text-primary'
                      }`}
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
    <SafeScreen>
      <View className="flex-1 items-center justify-center px-6">
        <Ionicons name="alert-circle-outline" size={64} color="#FF6B6B" />
        <Text className="text-text-primary font-semibold text-xl mt-4">Product not found</Text>
        <Text className="text-text-secondary text-center mt-2">
          This product may have been removed or doesn&apos;t exist
        </Text>
        <TouchableOpacity
          className="bg-primary rounded-2xl px-6 py-3 mt-6"
          onPress={() => router.back()}
        >
          <Text className="text-background font-bold">Go Back</Text>
        </TouchableOpacity>
      </View>
    </SafeScreen>
  );
}

function LoadingUI() {
  return (
    <SafeScreen>
      <View className="flex-1 items-center justify-center">
        <ActivityIndicator size="large" color="#1DB954" />
        <Text className="text-text-secondary mt-4">Loading product...</Text>
      </View>
    </SafeScreen>
  );
}
