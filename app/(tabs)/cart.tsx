import SafeScreen from "@/components/SafeScreen";
import { useAddresses } from "@/hooks/useAddressess";
import useCart from "@/hooks/useCart";
import apiClient from "@/lib/api";
import { ActivityIndicator, Alert, ScrollView, Text, TouchableOpacity, View } from "react-native";

import { useState } from "react";
import { TextInput } from "react-native";
import { Address } from "@/types";
import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { router } from "expo-router";
import OrderSummary from "@/components/OrderSummary";
import { useAuth } from "@/context/AuthContext";

import * as Sentry from "@sentry/react-native";

const CartScreen = () => {
  const { user } = useAuth();
  const { cart, isLoading, isError, addToCart, removeFromCart, updateQuantity, cartTotal, isRemoving, isUpdating, cartItemCount, clearCart } = useCart();
  const { addresses } = useAddresses();
  const api = apiClient;


  const [paymentLoading, setPaymentLoading] = useState(false);

  // Coupon state
  const [couponCode, setCouponCode] = useState("");
  const [discount, setDiscount] = useState<{ amount: number; type: string } | null>(null);
  const [couponLoading, setCouponLoading] = useState(false);
  const [couponError, setCouponError] = useState("");

  const cartItems = cart?.items || [];
  const subtotal = cartTotal;
  const shipping = 10.0; // ৳10 shipping fee
  const tax = subtotal * 0.08; // 8% tax
  
  // Calculate discount amount based on backend response
  let discountAmount = discount?.amount || 0;
  if (discount?.type === "percentage") {
    discountAmount = (subtotal * discount.amount) / 100;
  }

  const total = subtotal + shipping + tax - discountAmount;

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) return;
    setCouponLoading(true);
    setCouponError("");
    try {
      const { data } = await api.post("/store/coupons/validate", {
        code: couponCode,
        orderTotal: subtotal,
      });
      if (data.valid) {
        setDiscount({ amount: data.discountValue, type: data.discountType });
      } else {
        setCouponError(data.message || "Invalid coupon");
      }
    } catch (err: any) {
      setCouponError(err?.response?.data?.message || "Failed to apply coupon");
    } finally {
      setCouponLoading(false);
    }
  };

  const removeCoupon = () => {
    setCouponCode("");
    setDiscount(null);
    setCouponError("");
  };

  const handleQuantityChange = (productId: string, currentQuantity: number, change: number) => {
    const newQuantity = currentQuantity + change;
    if (newQuantity < 1) return;
    updateQuantity({ productId, quantity: newQuantity });
  };

  const handleRemoveItem = (productId: string, productName: string) => {
    Alert.alert("Remove Item", `Remove ${productName} from cart?`, [
      { text: "Cancel", style: "cancel" },
      {
        text: "Remove",
        style: "destructive",
        onPress: () => removeFromCart(productId),
      },
    ]);
  };

  const handleCheckout = () => {
    if (cartItems.length === 0) return;
    router.push("/checkout");
  };

  if (isLoading) return <LoadingUI />;
  if (isError) return <ErrorUI />;
  if (cartItems.length === 0) return <EmptyUI />;

  return (
    <SafeScreen>
      <Text className="px-6 pb-5 text-text-primary text-3xl font-bold tracking-tight">Cart</Text>

      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 240 }}
      >
        <View className="px-6 gap-2">
          {cartItems.map((item, index) => (
            <View key={item._id} className="bg-surface rounded-3xl overflow-hidden ">
              <View className="p-4 flex-row">
                {/* product image */}
                <View className="relative">
                  <Image
                    source={{ uri: item.product.images?.[0]?.url }}
                    className="bg-background-lighter"
                    contentFit="cover"
                    style={{ width: 112, height: 112, borderRadius: 16 }}
                  />
                  <View className="absolute top-2 right-2 bg-primary rounded-full px-2 py-0.5">
                    <Text className="text-background text-xs font-bold">×{item.quantity}</Text>
                  </View>
                </View>

                <View className="flex-1 ml-4 justify-between">
                  <View>
                    <Text
                      className="text-text-primary font-bold text-lg leading-tight"
                      numberOfLines={2}
                    >
                      {item.product.title}
                    </Text>
                    <View className="flex-row items-center mt-2">
                      <Text className="text-primary font-bold text-2xl">
                        ৳{(item.product.price * item.quantity).toFixed(2)}
                      </Text>
                      <Text className="text-text-secondary text-sm ml-2">
                        ৳{item.product.price.toFixed(2)} each
                      </Text>
                    </View>
                  </View>

                  <View className="flex-row items-center mt-3">
                    <TouchableOpacity
                      className="bg-background-lighter rounded-full w-9 h-9 items-center justify-center"
                      activeOpacity={0.7}
                      onPress={() => handleQuantityChange(item.product._id, item.quantity, -1)}
                      disabled={isUpdating}
                    >
                      {isUpdating ? (
                        <ActivityIndicator size="small" color="#0F172A" />
                      ) : (
                        <Ionicons name="remove" size={18} color="#0F172A" />
                      )}
                    </TouchableOpacity>

                    <View className="mx-4 min-w-[32px] items-center">
                      <Text className="text-text-primary font-bold text-lg">{item.quantity}</Text>
                    </View>

                    <TouchableOpacity
                      className="bg-primary rounded-full w-9 h-9 items-center justify-center"
                      activeOpacity={0.7}
                      onPress={() => handleQuantityChange(item.product._id, item.quantity, 1)}
                      disabled={isUpdating}
                    >
                      {isUpdating ? (
                        <ActivityIndicator size="small" color="#0F172A" />
                      ) : (
                        <Ionicons name="add" size={18} color="#0F172A" />
                      )}
                    </TouchableOpacity>

                    <TouchableOpacity
                      className="ml-auto bg-red-500/10 rounded-full w-9 h-9 items-center justify-center"
                      activeOpacity={0.7}
                      onPress={() => handleRemoveItem(item.product._id, item.product.title)}
                      disabled={isRemoving}
                    >
                      <Ionicons name="trash-outline" size={18} color="#EF4444" />
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            </View>
          ))}
        </View>

        {/* Coupon Input */}
        <View className="px-6 mt-6">
          <View className="bg-surface rounded-2xl border border-surface p-4">
            {discount ? (
              <View className="flex-row items-center justify-between">
                <View className="flex-row items-center">
                  <View className="w-10 h-10 bg-primary/20 rounded-full items-center justify-center mr-3">
                    <Ionicons name="pricetag" size={18} color="#4F46E5" />
                  </View>
                  <View>
                    <Text className="text-text-primary font-bold">{couponCode.toUpperCase()}</Text>
                    <Text className="text-primary text-xs font-semibold">
                      {discount.type === "percentage" ? `${discount.amount}% OFF` : `৳${discount.amount} OFF`} applied
                    </Text>
                  </View>
                </View>
                <TouchableOpacity onPress={removeCoupon} activeOpacity={0.7} className="p-2">
                  <Ionicons name="close-circle" size={20} color="#FF6B6B" />
                </TouchableOpacity>
              </View>
            ) : (
              <View>
                <View className="flex-row items-center">
                  <View className="flex-1 bg-background-lighter rounded-xl flex-row items-center px-4 py-3 mr-3">
                    <Ionicons name="pricetag-outline" size={18} color="#64748B" />
                    <TextInput
                      className="flex-1 ml-3 text-text-primary text-base"
                      placeholder="Enter promo code"
                      placeholderTextColor="#94A3B8"
                      value={couponCode}
                      onChangeText={(text) => {
                        setCouponCode(text.toUpperCase());
                        setCouponError("");
                      }}
                      autoCapitalize="characters"
                      autoCorrect={false}
                    />
                  </View>
                  <TouchableOpacity
                    className={`bg-primary rounded-xl px-4 py-4 items-center justify-center ${
                      (!couponCode.trim() || couponLoading) ? "opacity-50" : ""
                    }`}
                    disabled={!couponCode.trim() || couponLoading}
                    onPress={handleApplyCoupon}
                  >
                    {couponLoading ? (
                      <ActivityIndicator size="small" color="#0F172A" />
                    ) : (
                      <Text className="text-background font-bold text-sm">Apply</Text>
                    )}
                  </TouchableOpacity>
                </View>
                {couponError ? (
                  <Text className="text-red-500 text-xs mt-2 ml-1">{couponError}</Text>
                ) : null}
              </View>
            )}
          </View>
        </View>

        <OrderSummary subtotal={subtotal} shipping={shipping} tax={tax} discount={discountAmount} total={total} />
      </ScrollView>

      <View
        className="absolute bottom-0 left-0 right-0 bg-background/95 backdrop-blur-xl border-t
       border-surface pt-4 pb-32 px-6"
      >
        {/* Quick Stats */}
        <View className="flex-row items-center justify-between mb-4">
          <View className="flex-row items-center">
            <Ionicons name="cart" size={20} color="#4F46E5" />
            <Text className="text-text-secondary ml-2">
              {cartItemCount} {cartItemCount === 1 ? "item" : "items"}
            </Text>
          </View>
          <View className="flex-row items-center">
            <Text className="text-text-primary font-bold text-xl">৳{total.toFixed(2)}</Text>
          </View>
        </View>

        {/* Checkout Button */}
        <TouchableOpacity
          className="bg-primary rounded-2xl overflow-hidden"
          activeOpacity={0.9}
          onPress={handleCheckout}
          disabled={paymentLoading}
        >
          <View className="py-5 flex-row items-center justify-center">
            {paymentLoading ? (
              <ActivityIndicator size="small" color="#0F172A" />
            ) : (
              <>
                <Text className="text-background font-bold text-lg mr-2">Checkout</Text>
                <Ionicons name="arrow-forward" size={20} color="#0F172A" />
              </>
            )}
          </View>
        </TouchableOpacity>
      </View>
    </SafeScreen>
  );
};

export default CartScreen;

function LoadingUI() {
  return (
    <View className="flex-1 bg-background items-center justify-center">
      <ActivityIndicator size="large" color="#00D9FF" />
      <Text className="text-text-secondary mt-4">Loading cart...</Text>
    </View>
  );
}

function ErrorUI() {
  return (
    <View className="flex-1 bg-background items-center justify-center px-6">
      <Ionicons name="alert-circle-outline" size={64} color="#FF6B6B" />
      <Text className="text-text-primary font-semibold text-xl mt-4">Failed to load cart</Text>
      <Text className="text-text-secondary text-center mt-2">
        Please check your connection and try again
      </Text>
    </View>
  );
}

function EmptyUI() {
  return (
    <View className="flex-1 bg-background">
      <View className="px-6 pt-16 pb-5">
        <Text className="text-text-primary text-3xl font-bold tracking-tight">Cart</Text>
      </View>
      <View className="flex-1 items-center justify-center px-6">
        <Ionicons name="cart-outline" size={80} color="#64748B" />
        <Text className="text-text-primary font-semibold text-xl mt-4">Your cart is empty</Text>
        <Text className="text-text-secondary text-center mt-2">
          Add some products to get started
        </Text>
      </View>
    </View>
  );
}
