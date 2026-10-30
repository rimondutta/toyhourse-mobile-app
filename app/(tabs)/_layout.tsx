import { Tabs, router } from "expo-router";
import { useAuth } from "@/context/AuthContext";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TouchableWithoutFeedback,
  Animated,
  Modal,
} from "react-native";
import { BottomTabBarProps } from "@react-navigation/bottom-tabs";
import { useState, useRef, useEffect } from "react";
import * as Haptics from "expo-haptics";
import { Ionicons, Feather } from "@expo/vector-icons";
import { BlurView } from "expo-blur";

// ─── Tab Item Configuration ──────────────────────────────────────────────────
interface TabConfig {
  label: string;
  activeIcon: keyof typeof Ionicons.glyphMap;
  inactiveIcon: keyof typeof Ionicons.glyphMap;
}

const TAB_CONFIG: Record<string, TabConfig> = {
  index: {
    label: "Store",
    activeIcon: "storefront",
    inactiveIcon: "storefront-outline",
  },
  search: {
    label: "Search",
    activeIcon: "search",
    inactiveIcon: "search-outline",
  },
  cart: {
    label: "Cart",
    activeIcon: "basket",
    inactiveIcon: "basket-outline",
  },
  wishlist: {
    label: "Saved",
    activeIcon: "bookmark",
    inactiveIcon: "bookmark-outline",
  },
  profile: {
    label: "Profile",
    activeIcon: "person",
    inactiveIcon: "person-outline",
  },
};

const STATUS_ITEMS = [
  { label: "In Progress", filter: "processing", iconType: "feather" as const, iconName: "sun" },
  { label: "Completed", filter: "delivered", iconType: "feather" as const, iconName: "check-circle" },
  { label: "Failed", filter: "failed", iconType: "feather" as const, iconName: "x" },
  { label: "Cancelled", filter: "cancelled", iconType: "ionicons" as const, iconName: "ban-outline" },
];

// ─── Custom Tab Bar ───────────────────────────────────────────────────────────
function CustomTabBar({ state, descriptors, navigation }: BottomTabBarProps) {
  const insets = useSafeAreaInsets();
  const [showStatusMenu, setShowStatusMenu] = useState(false);
  const menuAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (showStatusMenu) {
      Animated.spring(menuAnim, {
        toValue: 1,
        tension: 80,
        friction: 10,
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(menuAnim, {
        toValue: 0,
        duration: 150,
        useNativeDriver: true,
      }).start();
    }
  }, [showStatusMenu, menuAnim]);

  const toggleStatusMenu = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setShowStatusMenu((prev) => !prev);
  };

  const handleSelectStatus = (statusFilter: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setShowStatusMenu(false);
    router.push({
      pathname: "/(profile)/orders",
      params: { filter: statusFilter },
    });
  };

  return (
    <>
      {/* ── Status Popover Modal Overlay ── */}
      <Modal
        visible={showStatusMenu}
        transparent
        animationType="none"
        onRequestClose={() => setShowStatusMenu(false)}
      >
        <TouchableWithoutFeedback onPress={() => setShowStatusMenu(false)}>
          <View style={styles.modalOverlay}>
            <TouchableWithoutFeedback>
              <Animated.View
                style={[
                  styles.popoverContainer,
                  {
                    bottom: (insets.bottom || 20) + 72,
                    opacity: menuAnim,
                    transform: [
                      {
                        scale: menuAnim.interpolate({
                          inputRange: [0, 1],
                          outputRange: [0.85, 1],
                        }),
                      },
                      {
                        translateY: menuAnim.interpolate({
                          inputRange: [0, 1],
                          outputRange: [15, 0],
                        }),
                      },
                    ],
                  },
                ]}
              >
                <BlurView intensity={95} tint="light" style={styles.popoverBlur}>
                  <View style={styles.popoverContent}>
                    {STATUS_ITEMS.map((item, idx) => (
                      <TouchableOpacity
                        key={idx}
                        activeOpacity={0.7}
                        onPress={() => handleSelectStatus(item.filter)}
                        style={[
                          styles.popoverRow,
                          idx !== STATUS_ITEMS.length - 1 && styles.popoverDivider,
                        ]}
                      >
                        <View style={styles.popoverIconWrap}>
                          {item.iconType === "feather" ? (
                            <Feather name={item.iconName as any} size={20} color="#111111" />
                          ) : (
                            <Ionicons name={item.iconName as any} size={20} color="#111111" />
                          )}
                        </View>
                        <Text style={styles.popoverText}>{item.label}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </BlurView>
              </Animated.View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>

      {/* ── Floating Navigation Bar ── */}
      <View
        style={[
          styles.wrapper,
          {
            paddingBottom: insets.bottom || 18,
          },
        ]}
      >
        <BlurView intensity={95} tint="light" style={styles.tabBarContainer}>
          <View style={styles.tabBarInner}>
            {state.routes.map((route, index) => {
              const { options } = descriptors[route.key];
              const isFocused = state.index === index;
              const config = TAB_CONFIG[route.name] ?? {
                label: options.title ?? route.name,
                activeIcon: "ellipse",
                inactiveIcon: "ellipse-outline",
              };

              const onPress = () => {
                const event = navigation.emit({
                  type: "tabPress",
                  target: route.key,
                  canPreventDefault: true,
                });

                if (route.name === "cart") {
                  if (isFocused) {
                    toggleStatusMenu();
                  } else if (!event.defaultPrevented) {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    navigation.navigate(route.name);
                  }
                } else if (!isFocused && !event.defaultPrevented) {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  navigation.navigate(route.name);
                }
              };

              const onLongPress = () => {
                if (route.name === "cart") {
                  toggleStatusMenu();
                } else {
                  navigation.emit({ type: "tabLongPress", target: route.key });
                }
              };

              // ── Center Button (Cart / Basket) ──
              if (route.name === "cart") {
                return (
                  <TouchableOpacity
                    key={route.key}
                    accessibilityRole="button"
                    accessibilityState={isFocused ? { selected: true } : {}}
                    accessibilityLabel="Cart"
                    testID={options.tabBarButtonTestID}
                    onPress={onPress}
                    onLongPress={onLongPress}
                    activeOpacity={0.85}
                    style={styles.centerButtonSlot}
                  >
                    <View style={styles.blackPill}>
                      <View style={styles.basketIconContainer}>
                        <Ionicons name="basket" size={26} color="#FFFFFF" />
                        {/* Neon Lime Dot Badge */}
                        <View style={styles.limeBadge} />
                      </View>
                    </View>
                  </TouchableOpacity>
                );
              }

              // ── Standard Tab Buttons (Store, Search, Saved, Profile) ──
              return (
                <TouchableOpacity
                  key={route.key}
                  accessibilityRole="button"
                  accessibilityState={isFocused ? { selected: true } : {}}
                  accessibilityLabel={options.tabBarAccessibilityLabel ?? config.label}
                  testID={options.tabBarButtonTestID}
                  onPress={onPress}
                  onLongPress={onLongPress}
                  activeOpacity={0.7}
                  style={styles.standardTabButton}
                >
                  <Ionicons
                    name={isFocused ? config.activeIcon : config.inactiveIcon}
                    size={24}
                    color={isFocused ? "#111111" : "#8E8E93"}
                  />
                  <Text
                    style={[
                      styles.tabLabel,
                      { color: isFocused ? "#111111" : "#8E8E93" },
                    ]}
                  >
                    {config.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </BlurView>
      </View>
    </>
  );
}

// ─── Root Layout ──────────────────────────────────────────────────────────────
const TabsLayout = () => {
  const { isLoaded } = useAuth();

  if (!isLoaded) return null;

  return (
    <Tabs
      tabBar={(props) => <CustomTabBar {...props} />}
      screenOptions={{ headerShown: false }}
    >
      <Tabs.Screen name="index" options={{ title: "Store" }} />
      <Tabs.Screen name="search" options={{ title: "Search" }} />
      <Tabs.Screen name="cart" options={{ title: "Cart" }} />
      <Tabs.Screen name="wishlist" options={{ title: "Saved" }} />
      <Tabs.Screen name="profile" options={{ title: "Profile" }} />
    </Tabs>
  );
};

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  wrapper: {
    position: "absolute",
    bottom: 0,
    left: 16,
    right: 16,
    alignItems: "center",
  },
  tabBarContainer: {
    width: "100%",
    borderRadius: 36,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.85)",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.08,
    shadowRadius: 20,
    elevation: 10,
  },
  tabBarInner: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "rgba(255, 255, 255, 0.88)",
    paddingHorizontal: 8,
    paddingVertical: 8,
  },
  standardTabButton: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 4,
  },
  tabLabel: {
    fontSize: 11,
    fontWeight: "500",
    marginTop: 4,
    letterSpacing: -0.1,
  },
  centerButtonSlot: {
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 6,
  },
  blackPill: {
    backgroundColor: "#000000",
    width: 76,
    height: 48,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 6,
  },
  basketIconContainer: {
    position: "relative",
    alignItems: "center",
    justifyContent: "center",
  },
  limeBadge: {
    position: "absolute",
    top: -2,
    right: -6,
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: "#D4F82C",
    borderWidth: 2,
    borderColor: "#000000",
  },

  // ── Popover Styles ──
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.15)",
    alignItems: "center",
  },
  popoverContainer: {
    position: "absolute",
    width: 190,
    borderRadius: 22,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.16,
    shadowRadius: 24,
    elevation: 20,
  },
  popoverBlur: {
    borderRadius: 22,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.85)",
  },
  popoverContent: {
    backgroundColor: "rgba(255, 255, 255, 0.85)",
    paddingVertical: 6,
    paddingHorizontal: 8,
  },
  popoverRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 11,
    paddingHorizontal: 12,
  },
  popoverDivider: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "rgba(0, 0, 0, 0.06)",
  },
  popoverIconWrap: {
    width: 26,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },
  popoverText: {
    fontSize: 15,
    fontWeight: "500",
    color: "#111111",
    letterSpacing: -0.2,
  },
});

export default TabsLayout;
