import { Redirect, Tabs } from "expo-router";
import { useAuth } from "@/context/AuthContext";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { View, StyleSheet, TouchableOpacity, Animated } from "react-native";
import { BottomTabBarProps } from "@react-navigation/bottom-tabs";
import { useRef, useEffect } from "react";
import * as Haptics from "expo-haptics";
import { Ionicons } from "@expo/vector-icons";

// ─── Icon config per route ────────────────────────────────────────────────────
const TAB_ICONS: Record<string, { active: any; inactive: any }> = {
  index:    { active: "home",        inactive: "home-outline" },
  search:   { active: "search",      inactive: "search-outline" },
  cart:     { active: "bag",         inactive: "bag-outline" },
  wishlist: { active: "heart",       inactive: "heart-outline" },
  profile:  { active: "person",      inactive: "person-outline" },
};

const PURPLE = "#7C3AED";
const INACTIVE = "#A0AEC0";

// ─── Single Tab Item ──────────────────────────────────────────────────────────
const TabBarItem = ({ route, options, isFocused, onPress, onLongPress }: any) => {
  const scaleAnim = useRef(new Animated.Value(isFocused ? 1.15 : 1)).current;

  useEffect(() => {
    Animated.spring(scaleAnim, {
      toValue: isFocused ? 1.2 : 1,
      useNativeDriver: true,
      tension: 160,
      friction: 7,
    }).start();
  }, [isFocused]);

  const icons = TAB_ICONS[route.name] ?? { active: "home", inactive: "home-outline" };
  const iconName = isFocused ? icons.active : icons.inactive;

  return (
    <TouchableOpacity
      accessibilityRole="button"
      accessibilityState={isFocused ? { selected: true } : {}}
      accessibilityLabel={options.tabBarAccessibilityLabel}
      testID={options.tabBarButtonTestID}
      onPress={onPress}
      onLongPress={onLongPress}
      activeOpacity={0.7}
      style={styles.tabButton}
    >
      <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
        <Ionicons
          name={iconName}
          size={26}
          color={isFocused ? PURPLE : INACTIVE}
        />
      </Animated.View>
    </TouchableOpacity>
  );
};

// ─── Custom Tab Bar ───────────────────────────────────────────────────────────
function CustomTabBar({ state, descriptors, navigation }: BottomTabBarProps) {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.tabBarContainer, { paddingBottom: insets.bottom || 8 }]}>
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
  tabBarContainer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: "row",
    backgroundColor: "#FFFFFF",
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: "#E2E8F0",
    paddingTop: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 12,
  },
  tabButton: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    height: 48,
  },
});

export default TabsLayout;
