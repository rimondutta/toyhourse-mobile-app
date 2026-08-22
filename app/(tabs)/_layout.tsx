import { Redirect, Tabs } from "expo-router";
import { useAuth } from "@/context/AuthContext";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { View, StyleSheet, TouchableOpacity, Animated } from "react-native";
import { BottomTabBarProps } from "@react-navigation/bottom-tabs";
import { useRef, useEffect } from "react";
import * as Haptics from "expo-haptics";
import { Ionicons } from "@expo/vector-icons";
import { BlurView } from "expo-blur";

// ─── Icon config per route ────────────────────────────────────────────────────
const TAB_ICONS: Record<string, { active: any; inactive: any }> = {
  index:    { active: "home",        inactive: "home-outline" },
  search:   { active: "search",      inactive: "search-outline" },
  cart:     { active: "bag",         inactive: "bag-outline" },
  wishlist: { active: "heart",       inactive: "heart-outline" },
  profile:  { active: "person",      inactive: "person-outline" },
};

const PURPLE = "#7C3AED";
const INACTIVE = "#8E8E93";
const INACTIVE_BG = "transparent";
const ACTIVE_BG = "rgba(124, 58, 237, 0.15)";

// ─── Single Tab Item ──────────────────────────────────────────────────────────
const TabBarItem = ({ route, options, isFocused, onPress, onLongPress }: any) => {
  const scaleAnim = useRef(new Animated.Value(isFocused ? 1 : 0)).current;

  useEffect(() => {
    Animated.spring(scaleAnim, {
      toValue: isFocused ? 1 : 0,
      useNativeDriver: false,
      tension: 100,
      friction: 12,
    }).start();
  }, [isFocused]);

  const icons = TAB_ICONS[route.name] ?? { active: "home", inactive: "home-outline" };
  const iconName = isFocused ? icons.active : icons.inactive;

  const bgInterpolation = scaleAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [INACTIVE_BG, ACTIVE_BG],
  });

  const widthInterpolation = scaleAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [48, 64],
  });

  return (
    <TouchableOpacity
      accessibilityRole="button"
      accessibilityState={isFocused ? { selected: true } : {}}
      accessibilityLabel={options.tabBarAccessibilityLabel}
      testID={options.tabBarButtonTestID}
      onPress={onPress}
      onLongPress={onLongPress}
      activeOpacity={0.7}
      style={[styles.tabButton, { flex: isFocused ? 1.2 : 1 }]}
    >
      <Animated.View
        style={{
          backgroundColor: bgInterpolation,
          width: widthInterpolation,
          height: 48,
          borderRadius: 24,
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Ionicons
          name={iconName}
          size={24}
          color={isFocused ? PURPLE : INACTIVE}
          style={{ transform: [{ translateY: -1 }] }}
        />
      </Animated.View>
    </TouchableOpacity>
  );
};

// ─── Custom Tab Bar ───────────────────────────────────────────────────────────
function CustomTabBar({ state, descriptors, navigation }: BottomTabBarProps) {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.wrapper, { paddingBottom: insets.bottom || 20 }]}>
      <BlurView intensity={90} tint="dark" style={styles.tabBarContainer}>
        <View style={styles.tabBarInner}>
          {state.routes.map((route, index) => {
            const { options } = descriptors[route.key];
            const isFocused = state.index === index;

            const onPress = () => {
              const event = navigation.emit({
                type: "tabPress",
                target: route.key,
                canPreventDefault: true,
              });
              if (!isFocused && !event.defaultPrevented) {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                navigation.navigate(route.name);
              }
            };

            const onLongPress = () => {
              navigation.emit({ type: "tabLongPress", target: route.key });
            };

            return (
              <TabBarItem
                key={route.key}
                route={route}
                options={options}
                isFocused={isFocused}
                onPress={onPress}
                onLongPress={onLongPress}
              />
            );
          })}
        </View>
      </BlurView>
    </View>
  );
}

// ─── Root Layout ──────────────────────────────────────────────────────────────
const TabsLayout = () => {
  const { isSignedIn, isLoaded } = useAuth();

  if (!isLoaded) return null;

  return (
    <Tabs
      tabBar={(props) => <CustomTabBar {...props} />}
      screenOptions={{ headerShown: false }}
    >
      <Tabs.Screen name="index"    options={{ title: "Home" }} />
      <Tabs.Screen name="search"   options={{ title: "Search" }} />
      <Tabs.Screen name="cart"     options={{ title: "Cart" }} />
      <Tabs.Screen name="wishlist" options={{ title: "Wishlist" }} />
      <Tabs.Screen name="profile"  options={{ title: "Profile" }} />
    </Tabs>
  );
};

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  wrapper: {
    position: "absolute",
    bottom: 0,
    left: 20,
    right: 20,
    alignItems: "center",
  },
  tabBarContainer: {
    flexDirection: "row",
    borderRadius: 32,
    overflow: "hidden",
    borderCurve: "continuous",
    borderColor: "rgba(255,255,255,0.08)",
    borderWidth: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 20,
  },
  tabBarInner: {
    flexDirection: "row",
    backgroundColor: "rgba(10, 10, 15, 0.4)", // Slight deep dark tint matching website
    paddingHorizontal: 8,
    paddingVertical: 8,
    justifyContent: "space-between",
    width: "100%",
  },
  tabButton: {
    alignItems: "center",
    justifyContent: "center",
    height: 48,
  },
});

export default TabsLayout;
