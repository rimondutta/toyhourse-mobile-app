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
  Image,
  ActivityIndicator,
  Alert,
} from 'react-native';

interface ProductsGridProps {
  isLoading: boolean;
  isError: boolean;
  products: Product[];
}

const ProductsGrid = ({ products, isLoading, isError }: ProductsGridProps) => {
  const { isInWishlist, toggleWishlist, isAddingToWishlist, isRemovingFromWishlist } =
    useWishlist();

  const { isAddingToCart, addToCart } = useCart();

  const handleAddToCart = (productId: string, productTitle: string) => {
    addToCart(
      { productId, quantity: 1 },
      {
        onSuccess: () => {
          Alert.alert('Success', `${productTitle} added to cart!`);
        },
        onError: (error: any) => {
          Alert.alert('Error', error?.response?.data?.error ?? 'Failed to add to cart');
        },
      }
    );
  };

  const renderProduct = ({ item: product }: { item: Product }) => {
    // Pick the first display image — handles both variation products and plain products
    const images = getEffectiveImages(product);
    const firstImage = images[0];

    // Category name — category is now a populated object
    const categoryName =
      typeof product.category === 'object' ? product.category.name : product.category;

    return (
      <TouchableOpacity
        className="bg-surface rounded-3xl overflow-hidden mb-3"
        style={{ width: '48%' }}
        activeOpacity={0.8}
        onPress={() => router.push(`/product/${product._id}`)}
      >
        <View className="relative">
          {firstImage ? (
            <Image
              source={{ uri: firstImage }}
              className="w-full h-44 bg-background-lighter"
              resizeMode="cover"
            />
          ) : (
            <View className="w-full h-44 bg-surface items-center justify-center">
              <Ionicons name="image-outline" size={36} color="#666" />
            </View>
          )}

          {/* Badge pill */}
          {product.badge && (
            <View className="absolute top-3 left-3 bg-primary px-2 py-1 rounded-full">
              <Text className="text-background text-xs font-bold">{product.badge}</Text>
            </View>
          )}

          <TouchableOpacity
            className="absolute top-3 right-3 bg-black/30 backdrop-blur-xl p-2 rounded-full"
            activeOpacity={0.7}
            onPress={() => toggleWishlist(product)}
            disabled={isAddingToWishlist || isRemovingFromWishlist}
          >
            {isAddingToWishlist || isRemovingFromWishlist ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <Ionicons
                name={isInWishlist(product._id) ? 'heart' : 'heart-outline'}
                size={18}
                color={isInWishlist(product._id) ? '#FF6B6B' : '#FFFFFF'}
              />
            )}
          </TouchableOpacity>
        </View>

        <View className="p-3">
          {/* Category */}
          <Text className="text-text-secondary text-xs mb-1">{categoryName}</Text>

          {/* Title — field is `title`, not `name` */}
          <Text className="text-text-primary font-bold text-sm mb-2" numberOfLines={2}>
            {product.title}
          </Text>

          {/* Rating — field is `rating` / `reviewCount`, not `averageRating` / `totalReviews` */}
          <View className="flex-row items-center mb-2">
            <Ionicons name="star" size={12} color="#FFC107" />
            <Text className="text-text-primary text-xs font-semibold ml-1">
              {(product.rating ?? 0).toFixed(1)}
            </Text>
            <Text className="text-text-secondary text-xs ml-1">
              ({product.reviewCount ?? 0})
            </Text>
          </View>

          <View className="flex-row items-center justify-between">
            {/* Price — base price; varies by variant on detail screen */}
            <View>
              <Text className="text-primary font-bold text-lg">
                ৳{product.price.toFixed(2)}
              </Text>
              {product.compareAtPrice && product.compareAtPrice > product.price && (
                <Text className="text-text-secondary text-xs line-through">
                  ৳{product.compareAtPrice.toFixed(2)}
                </Text>
              )}
            </View>

            <TouchableOpacity
              className="bg-primary rounded-full w-8 h-8 items-center justify-center"
              activeOpacity={0.7}
              onPress={() => handleAddToCart(product._id, product.title)}
              disabled={isAddingToCart}
            >
              {isAddingToCart ? (
                <ActivityIndicator size="small" color="#121212" />
              ) : (
                <Ionicons name="add" size={18} color="#121212" />
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
        <ActivityIndicator size="large" color="#00D9FF" />
        <Text className="text-text-secondary mt-4">Loading products...</Text>
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
      <Ionicons name="search-outline" size={48} color="#666" />
      <Text className="text-text-primary font-semibold mt-4">No products found</Text>
      <Text className="text-text-secondary text-sm mt-2">Try adjusting your filters</Text>
    </View>
  );
}
