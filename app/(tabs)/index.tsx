import ProductsGrid from '@/components/ProductsGrid';
import SafeScreen from '@/components/SafeScreen';
import useCategories from '@/hooks/useCategories';
import useProducts from '@/hooks/useProducts';
import type { ProductsQueryParams } from '@/types/product';

import { Ionicons } from '@expo/vector-icons';
import { useMemo, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Image,
  ActivityIndicator,
} from 'react-native';

const ShopScreen = () => {
  const [searchQuery, setSearchQuery]       = useState('');
  const [selectedSlug, setSelectedSlug]     = useState<string | undefined>(undefined);

  // Fetch live categories from the API
  const { data: categories, isLoading: catLoading } = useCategories();

  // Build query params — filtering/search is done server-side via the API
  const queryParams: ProductsQueryParams = useMemo(() => {
    const params: ProductsQueryParams = { sort: 'newest', limit: 40 };
    if (selectedSlug) params.category = selectedSlug;
    if (searchQuery.trim().length > 1) params.search = searchQuery.trim();
    return params;
  }, [selectedSlug, searchQuery]);

  const { data: products, isLoading, isError } = useProducts(queryParams);

  return (
    <SafeScreen>
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
      >
        {/* HEADER */}
        <View className="px-6 pb-4 pt-6">
          <View className="flex-row items-center justify-between mb-6">
            <View>
              <Text className="text-text-primary text-3xl font-bold tracking-tight">Shop</Text>
              <Text className="text-text-secondary text-sm mt-1">Browse all products</Text>
            </View>

            <TouchableOpacity className="bg-surface/50 p-3 rounded-full" activeOpacity={0.7}>
              <Ionicons name="options-outline" size={22} color="#fff" />
            </TouchableOpacity>
          </View>

          {/* SEARCH BAR */}
          <View className="bg-surface flex-row items-center px-5 py-4 rounded-2xl">
            <Ionicons color="#666" size={22} name="search" />
            <TextInput
              placeholder="Search for products"
              placeholderTextColor="#666"
              className="flex-1 ml-3 text-base text-text-primary"
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => setSearchQuery('')} activeOpacity={0.7}>
                <Ionicons name="close-circle" size={20} color="#666" />
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* CATEGORY FILTER — live from API */}
        <View className="mb-6">
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: 20 }}
          >
            {/* "All" chip */}
            <TouchableOpacity
              onPress={() => setSelectedSlug(undefined)}
              className={`mr-3 rounded-2xl size-20 overflow-hidden items-center justify-center ${
                !selectedSlug ? 'bg-primary' : 'bg-surface'
              }`}
            >
              <Ionicons
                name="grid-outline"
                size={36}
                color={!selectedSlug ? '#121212' : '#fff'}
              />
              <Text
                className={`text-xs mt-1 ${
                  !selectedSlug ? 'text-background font-bold' : 'text-text-secondary'
                }`}
              >
                All
              </Text>
            </TouchableOpacity>

            {/* Dynamic category chips */}
            {catLoading ? (
              <View className="size-20 items-center justify-center">
                <ActivityIndicator size="small" color="#00D9FF" />
              </View>
            ) : (
              categories?.map((category) => {
                const isSelected = selectedSlug === category.slug;
                return (
                  <TouchableOpacity
                    key={category._id}
                    onPress={() => setSelectedSlug(isSelected ? undefined : category.slug)}
                    className={`mr-3 rounded-2xl size-20 overflow-hidden items-center justify-center ${
                      isSelected ? 'bg-primary' : 'bg-surface'
                    }`}
                  >
                    {category.image ? (
                      <Image
                        source={{ uri: category.image }}
                        style={{ width: 40, height: 40 }}
                        resizeMode="contain"
                      />
                    ) : (
                      <Ionicons
                        name="pricetag-outline"
                        size={30}
                        color={isSelected ? '#121212' : '#fff'}
                      />
                    )}
                    <Text
                      className={`text-xs mt-1 text-center px-1 ${
                        isSelected ? 'text-background font-bold' : 'text-text-secondary'
                      }`}
                      numberOfLines={1}
                    >
                      {category.name}
                    </Text>
                  </TouchableOpacity>
                );
              })
            )}
          </ScrollView>
        </View>

        <View className="px-6 mb-6">
          <View className="flex-row items-center justify-between mb-4">
            <Text className="text-text-primary text-lg font-bold">Products</Text>
            <Text className="text-text-secondary text-sm">
              {products?.length ?? 0} items
            </Text>
          </View>

          {/* PRODUCTS GRID */}
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
