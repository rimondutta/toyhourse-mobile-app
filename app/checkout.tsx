import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import SafeScreen from "@/components/SafeScreen";
import { useAuth } from "@/context/AuthContext";
import useCart from "@/hooks/useCart";
import { useAddresses } from "@/hooks/useAddressess";
import apiClient from "@/lib/api";
import * as Sentry from "@sentry/react-native";

export default function CheckoutScreen() {
  const { user } = useAuth();
  const {
    cart,
    cartTotal,
    cartItemCount,
    clearCart,
  } = useCart();
  const { addresses } = useAddresses();
  const api = apiClient;

  const [paymentLoading, setPaymentLoading] = useState(false);
  const [form, setForm] = useState({
    name: user?.name || "",
    email: user?.email || "",
    phone: "",
    address: "",
    city: "",
    zip: "",
    shippingZone: "inside_dhaka", // 'inside_dhaka' or 'outside_dhaka'
    paymentMethod: "cod", // 'cod', 'bkash', 'card'
    notes: "",
  });

  // Pre-fill form if addresses exist
  useEffect(() => {
    if (addresses && addresses.length > 0 && !form.address) {
      const defaultAddr = addresses.find((a) => a.isDefault) || addresses[0];
      setForm((prev) => ({
        ...prev,
        name: defaultAddr.fullName || prev.name,
        phone: defaultAddr.phoneNumber || prev.phone,
        address: defaultAddr.streetAddress || prev.address,
        city: defaultAddr.city || prev.city,
        zip: defaultAddr.zipCode || prev.zip,
      }));
    }
  }, [addresses]);

  const updateField = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const cartItems = cart?.items || [];
  const subtotal = cartTotal;
  const tax = subtotal * 0.08;
  const shippingCost = form.shippingZone === "outside_dhaka" ? 150 : 120;
  // TODO: discount logic could be added here if needed, keeping it simple as per web for now
  const total = subtotal + tax + shippingCost;

  const handleCheckout = async () => {
    if (!form.name || !form.phone || !form.address || !form.city) {
      Alert.alert("Missing Fields", "Please fill in all required shipping fields.");
      return;
    }

    try {
      setPaymentLoading(true);

      const orderItems = cartItems.map((item) => ({
        product: item.product._id,
        productId: item.product._id,
        quantity: item.quantity,
        price: item.product.price,
        title: item.product.title,
      }));

      const { data } = await api.post("/store/orders", {
        customerName: form.name,
        customerEmail: form.email || "guest@example.com",
        items: orderItems,
        totalAmount: total,
        shippingCost: shippingCost,
        shippingZone: form.shippingZone,
        paymentMethod: form.paymentMethod,
        notes: form.notes,
        shippingAddress: {
          addressLine1: form.address,
          city: form.city,
          postcode: form.zip,
          phone: form.phone,
          country: "Bangladesh",
        },
      });

      if (data.success) {
        Sentry.logger.info("Order successful", {
          total: total.toFixed(2),
          itemCount: cartItems.length,
          paymentMethod: form.paymentMethod,
        });

        Alert.alert(
          "Order Placed!",
          "Your order has been placed successfully.",
          [{ text: "OK", onPress: () => { clearCart(); router.replace("/(tabs)"); } }]
        );
      } else {
        throw new Error(data.error || "Failed to create order");
      }
    } catch (error: any) {
      Sentry.logger.error("Order failed", {
        error: error instanceof Error ? error.message : "Unknown error",
        cartTotal: total,
      });
      Alert.alert("Error", error?.response?.data?.error || "Failed to process order");
    } finally {
      setPaymentLoading(false);
    }
  };

  if (cartItems.length === 0) {
    return (
      <SafeScreen>
        <View className="flex-1 items-center justify-center px-6">
          <Ionicons name="cart-outline" size={80} color="#64748B" />
          <Text className="text-text-primary font-semibold text-xl mt-4">Your cart is empty</Text>
          <TouchableOpacity
            className="mt-6 bg-primary px-6 py-3 rounded-xl"
            onPress={() => router.back()}
          >
            <Text className="text-background font-bold text-base">Go Back</Text>
          </TouchableOpacity>
        </View>
      </SafeScreen>
    );
  }

  return (
    <SafeScreen>
      <KeyboardAvoidingView 
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1"
      >
        <View className="flex-row items-center px-6 pb-4">
          <TouchableOpacity onPress={() => router.back()} className="mr-4 p-2 -ml-2">
            <Ionicons name="arrow-back" size={24} color="#0F172A" />
          </TouchableOpacity>
          <Text className="text-text-primary text-2xl font-bold tracking-tight">Checkout</Text>
        </View>

        <ScrollView className="flex-1 px-6" showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>
          
          {/* Shipping Details */}
          <View className="bg-surface p-5 rounded-2xl mb-5 border-2 border-background-lighter">
            <Text className="text-lg font-bold text-text-primary mb-4 flex-row items-center">
              <Ionicons name="location-outline" size={20} color="#00D9FF" /> Shipping Details
            </Text>
            
            <View className="space-y-4">
              <TextInput
                className="bg-background-lighter text-text-primary px-4 py-4 rounded-xl text-base mb-3"
                placeholder="Full Name *"
                placeholderTextColor="#94A3B8"
                value={form.name}
                onChangeText={(v) => updateField("name", v)}
              />
              <TextInput
                className="bg-background-lighter text-text-primary px-4 py-4 rounded-xl text-base mb-3"
                placeholder="Email (optional)"
                placeholderTextColor="#94A3B8"
                value={form.email}
                onChangeText={(v) => updateField("email", v)}
                keyboardType="email-address"
                autoCapitalize="none"
              />
              <TextInput
                className="bg-background-lighter text-text-primary px-4 py-4 rounded-xl text-base mb-3"
                placeholder="Phone Number *"
                placeholderTextColor="#94A3B8"
                value={form.phone}
                onChangeText={(v) => updateField("phone", v)}
                keyboardType="phone-pad"
              />
              <TextInput
                className="bg-background-lighter text-text-primary px-4 py-4 rounded-xl text-base mb-3"
                placeholder="Street Address *"
                placeholderTextColor="#94A3B8"
                value={form.address}
                onChangeText={(v) => updateField("address", v)}
              />
              <View className="flex-row gap-3 mb-3">
                <TextInput
                  className="flex-1 bg-background-lighter text-text-primary px-4 py-4 rounded-xl text-base"
                  placeholder="City *"
                  placeholderTextColor="#94A3B8"
                  value={form.city}
                  onChangeText={(v) => updateField("city", v)}
                />
                <TextInput
                  className="flex-1 bg-background-lighter text-text-primary px-4 py-4 rounded-xl text-base"
                  placeholder="ZIP / Postal Code"
                  placeholderTextColor="#94A3B8"
                  value={form.zip}
                  onChangeText={(v) => updateField("zip", v)}
                  keyboardType="number-pad"
                />
              </View>
            </View>
          </View>

          {/* Shipping Zone */}
          <View className="bg-surface p-5 rounded-2xl mb-5 border-2 border-background-lighter">
            <Text className="text-lg font-bold text-text-primary mb-4 flex-row items-center">
              <Ionicons name="bus-outline" size={20} color="#FFC93C" /> Delivery Area
            </Text>
            
            <View className="flex-row gap-3">
              {[
                { id: "inside_dhaka", label: "Inside Dhaka", price: 120 },
                { id: "outside_dhaka", label: "Outside Dhaka", price: 150 },
              ].map((zone) => (
                <TouchableOpacity
                  key={zone.id}
                  className={`flex-1 p-4 rounded-xl border-2 ${
                    form.shippingZone === zone.id ? "border-primary bg-primary/10" : "border-background-lighter bg-background-lighter"
                  }`}
                  onPress={() => updateField("shippingZone", zone.id)}
                >
                  <Text className={`font-bold text-center ${form.shippingZone === zone.id ? "text-primary" : "text-text-primary"}`}>
                    {zone.label}
                  </Text>
                  <Text className={`text-center mt-1 ${form.shippingZone === zone.id ? "text-primary font-semibold" : "text-text-secondary"}`}>
                    ৳{zone.price}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Payment Method */}
          <View className="bg-surface p-5 rounded-2xl mb-5 border-2 border-background-lighter">
            <Text className="text-lg font-bold text-text-primary mb-4 flex-row items-center">
              <Ionicons name="card-outline" size={20} color="#4F46E5" /> Payment Method
            </Text>

            <View className="space-y-3 gap-3">
              {[
                { id: "cod", label: "Cash on Delivery", icon: "cash-outline", color: "#10B981" },
                { id: "bkash", label: "bKash", icon: "phone-portrait-outline", color: "#EC4899" },
                { id: "card", label: "Credit / Debit Card", icon: "card-outline", color: "#6366F1" },
              ].map((method) => (
                <TouchableOpacity
                  key={method.id}
                  className={`flex-row items-center p-4 rounded-xl border-2 ${
                    form.paymentMethod === method.id ? "border-primary bg-primary/10" : "border-background-lighter bg-background-lighter"
                  }`}
                  onPress={() => updateField("paymentMethod", method.id)}
                >
                  <Ionicons name={method.icon as any} size={24} color={method.color} className="mr-3" />
                  <Text className={`flex-1 font-bold ml-3 ${form.paymentMethod === method.id ? "text-primary" : "text-text-primary"}`}>
                    {method.label}
                  </Text>
                  {form.paymentMethod === method.id && (
                    <Ionicons name="checkmark-circle" size={24} color="#00D9FF" />
                  )}
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Order Notes */}
          <View className="bg-surface p-5 rounded-2xl mb-5 border-2 border-background-lighter">
            <Text className="text-lg font-bold text-text-primary mb-4">
              Order Notes (Optional)
            </Text>
            <TextInput
              className="bg-background-lighter text-text-primary px-4 py-4 rounded-xl text-base min-h-[100px]"
              placeholder="Any special instructions for delivery..."
              placeholderTextColor="#94A3B8"
              value={form.notes}
              onChangeText={(v) => updateField("notes", v)}
              multiline
              textAlignVertical="top"
            />
          </View>

          {/* Order Summary */}
          <View className="bg-surface p-5 rounded-2xl mb-6 border-2 border-background-lighter">
            <Text className="text-lg font-bold text-text-primary mb-4">Order Summary</Text>
            <View className="flex-row justify-between mb-2">
              <Text className="text-text-secondary">Subtotal ({cartItemCount} items)</Text>
              <Text className="text-text-primary font-bold">৳{subtotal.toFixed(2)}</Text>
            </View>
            <View className="flex-row justify-between mb-2">
              <Text className="text-text-secondary">Tax (8%)</Text>
              <Text className="text-text-primary font-bold">৳{tax.toFixed(2)}</Text>
            </View>
            <View className="flex-row justify-between mb-4">
              <Text className="text-text-secondary">Shipping</Text>
              <Text className="text-text-primary font-bold">৳{shippingCost.toFixed(2)}</Text>
            </View>
            <View className="h-[1px] bg-background-lighter mb-4" />
            <View className="flex-row justify-between">
              <Text className="text-lg font-bold text-text-primary">Total</Text>
              <Text className="text-lg font-bold text-primary">৳{total.toFixed(2)}</Text>
            </View>
          </View>
        </ScrollView>

        {/* Bottom CTA */}
        <View className="absolute bottom-0 left-0 right-0 bg-background/95 backdrop-blur-xl border-t border-surface pt-4 pb-8 px-6">
          <TouchableOpacity
            className="bg-primary rounded-2xl overflow-hidden py-4 flex-row items-center justify-center shadow-sm"
            activeOpacity={0.9}
            onPress={handleCheckout}
            disabled={paymentLoading}
          >
            {paymentLoading ? (
              <ActivityIndicator size="small" color="#0F172A" />
            ) : (
              <>
                <Text className="text-background font-bold text-lg mr-2">Place Order • ৳{total.toFixed(2)}</Text>
                <Ionicons name="checkmark-done" size={20} color="#0F172A" />
              </>
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeScreen>
  );
}
