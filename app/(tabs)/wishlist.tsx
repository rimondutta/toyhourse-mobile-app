import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";

export default function WishlistScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Wishlist</Text>
      </View>
      <View style={styles.empty}>
        <Ionicons name="heart-outline" size={64} color="#C4B5FD" />
        <Text style={styles.emptyTitle}>Your wishlist is empty</Text>
        <Text style={styles.emptyDesc}>Save items you love and find them here.</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#FAFAFF" },
  header: {
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#F0EDFF",
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    color: "#1A1A2E",
    letterSpacing: -0.5,
  },
  empty: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 40,
    gap: 12,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1A1A2E",
    textAlign: "center",
  },
  emptyDesc: {
    fontSize: 14,
    color: "#94A3B8",
    textAlign: "center",
    lineHeight: 20,
  },
});
