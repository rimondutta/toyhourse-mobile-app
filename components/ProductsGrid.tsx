import useCart from '@/hooks/useCart';
import useWishlist from '@/hooks/useWishlist';
import type { Product } from '@/types/product';
import { getEffectiveImages } from '@/types/product';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { Image } from 'expo-image';
import { optimizeCloudinaryUrl } from '@/lib/utils';

interface ProductsGridProps {
  isLoading: boolean;
  isError: boolean;
  products: Product[];
}

const ProductsGrid = ({ products, isLoading, isError }: ProductsGridProps) => {
  const { isInWishlist, toggleWishlist, isAddingToWishlist, isRemovingFromWishlist } =
    useWishlist();

  const { isAddingToCart, addToCart } = useCart();

  const handleAddToCart = (product: Product) => {
    addToCart({ productId: product._id, product, quantity: 1 });
    Alert.alert('Success', `${product.title} added to cart!`);
  };

  const renderProduct = ({ item: product }: { item: Product }) => {
    // Pick the first display image — handles both variation products and plain products
    const images = getEffectiveImages(product);
    const firstImage = optimizeCloudinaryUrl(images[0], 400); // 400px width is plenty for a grid item

    // Category name — category is now a populated object
    const categoryName =
      typeof product.category === 'object' ? product.category.name : product.category;

    return (
      <TouchableOpacity
        className="bg-surface rounded-3xl overflow-hidden mb-4 border border-background-lighter shadow-sm shadow-black/5"
        style={{ width: '48%' }}
        activeOpacity={0.8}
        onPress={() => router.push(`/product/${product._id}`)}
      >
        <View className="relative p-1">
          {firstImage ? (
            <Image
              source={{ uri: firstImage }}
              className="w-full h-44 rounded-2xl bg-background-lighter"
              contentFit="cover"
              transition={200}
            />
          ) : (
            <View className="w-full h-44 rounded-2xl bg-background-lighter items-center justify-center">
              <Ionicons name="image-outline" size={36} color="#94A3B8" />
            </View>
          )}

          {/* Badge pill */}
          {product.badge && (
            <View className="absolute top-4 left-4 bg-primary px-3 py-1 rounded-full shadow-sm">
              <Text className="text-white text-[10px] font-bold uppercase tracking-wider">{product.badge}</Text>
            </View>
          )}

          <TouchableOpacity
            className="absolute top-4 right-4 bg-white/80 backdrop-blur-xl p-2 rounded-full shadow-sm"
            activeOpacity={0.7}
            onPress={() => toggleWishlist(product)}
            disabled={isAddingToWishlist || isRemovingFromWishlist}
          >
            {isAddingToWishlist || isRemovingFromWishlist ? (
              <ActivityIndicator size="small" color="#4F46E5" />
            ) : (
              <Ionicons
                name={isInWishlist(product._id) ? 'heart' : 'heart-outline'}
                size={18}
                color={isInWishlist(product._id) ? '#EF4444' : '#64748B'}
              />
            )}
          </TouchableOpacity>
        </View>

        <View className="p-4 pt-3">
          {/* Category */}
          <Text className="text-text-secondary text-xs mb-1 font-medium">{categoryName}</Text>

          {/* Title — field is `title`, not `name` */}
          <Text className="text-text-primary font-bold text-sm mb-2 leading-tight" numberOfLines={2}>
            {product.title}
          </Text>

          {/* Rating — field is `rating` / `reviewCount`, not `averageRating` / `totalReviews` */}
          <View className="flex-row items-center mb-3">
            <Ionicons name="star" size={12} color="#F59E0B" />
            <Text className="text-text-primary text-xs font-semibold ml-1">
              {(product.rating ?? 0).toFixed(1)}
            </Text>
            <Text className="text-text-secondary text-xs ml-1">
              ({product.reviewCount ?? 0})
            </Text>
          </View>

          <View className="flex-row items-center justify-between mt-auto">
            {/* Price — base price; varies by variant on detail screen */}
            <View>
              <Text className="text-primary font-bold text-lg leading-tight">
                ৳{product.price.toFixed(2)}
              </Text>
              {product.compareAtPrice && product.compareAtPrice > product.price && (
                <Text className="text-text-secondary text-xs line-through mt-0.5">
                  ৳{product.compareAtPrice.toFixed(2)}
                </Text>
              )}
            </View>

            <TouchableOpacity
              className="bg-primary/10 rounded-full w-9 h-9 items-center justify-center"
              activeOpacity={0.7}
              onPress={() => handleAddToCart(product)}
              disabled={isAddingToCart}
            >
              {isAddingToCart ? (
                <ActivityIndicator size="small" color="#4F46E5" />
              ) : (
                <Ionicons name="add" size={20} color="#4F46E5" />
              )}
            </TouchableOpacity>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  if (isLoading) {
    return (
      <View className="py-20 items-center justify-center">
        <ActivityIndicator size="large" color="#4F46E5" />
        <Text className="text-text-secondary mt-4 font-medium">Loading products...</Text>
      </View>
    );
  }

  if (isError) {
    return (
      <View className="py-20 items-center justify-center">
        <Ionicons name="alert-circle-outline" size={48} color="#FF6B6B" />
        <Text className="text-text-primary font-semibold mt-4">Failed to load products</Text>
        <Text className="text-text-secondary text-sm mt-2">Please try again later</Text>
      </View>
    );
  }

  return (
    <FlatList
      data={products}
      renderItem={renderProduct}
      keyExtractor={(item) => item._id}
      numColumns={2}
      columnWrapperStyle={{ justifyContent: 'space-between' }}
      showsVerticalScrollIndicator={false}
      scrollEnabled={false}
      ListEmptyComponent={NoProductsFound}
    />
  );
};

export default ProductsGrid;

function NoProductsFound() {
  return (
    <View className="py-20 items-center justify-center">
      <Ionicons name="search-outline" size={48} color="#64748B" />
      <Text className="text-text-primary font-semibold mt-4">No products found</Text>
      <Text className="text-text-secondary text-sm mt-2">Try adjusting your filters</Text>
    </View>
  );
}
