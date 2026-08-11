import { Redirect, Tabs } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "@/context/AuthContext";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { View, StyleSheet, TouchableOpacity, Animated } from "react-native";
import { BottomTabBarProps } from "@react-navigation/bottom-tabs";
import { BlurView } from "expo-blur";
import { useRef, useEffect } from "react";
import * as Haptics from "expo-haptics";

function CustomTabBar({ state, descriptors, navigation }: BottomTabBarProps) {
  const insets = useSafeAreaInsets();
  
  return (
    <View style={[styles.tabBarContainer, { paddingBottom: insets.bottom || 20 }]}>
      <BlurView intensity={80} tint="light" style={styles.blurView}>
        <View style={styles.tabBarInner}>
          {state.routes.map((route, index) => {
            const { options } = descriptors[route.key];
            const isFocused = state.index === index;

            const onPress = () => {
              const event = navigation.emit({
                type: 'tabPress',
                target: route.key,
                canPreventDefault: true,
              });

              if (!isFocused && !event.defaultPrevented) {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                navigation.navigate(route.name);
              }
            };

            // Setup a simple bounce scale animation on selection
            const scaleAnim = useRef(new Animated.Value(isFocused ? 1 : 0)).current;

            useEffect(() => {
              Animated.spring(scaleAnim, {
                toValue: isFocused ? 1 : 0,
                useNativeDriver: true,
                bounciness: 12,
              }).start();
            }, [isFocused]);

            // Determine icon
            let iconName: any = "home-outline";
            if (route.name === "index") iconName = isFocused ? "home" : "home-outline";
            if (route.name === "search") iconName = isFocused ? "search" : "search-outline";
            if (route.name === "cart") iconName = isFocused ? "bag" : "bag-outline";
            if (route.name === "profile") iconName = isFocused ? "person" : "person-outline";

            return (
              <TouchableOpacity
                key={route.key}
                accessibilityRole="button"
                accessibilityState={isFocused ? { selected: true } : {}}
                accessibilityLabel={options.tabBarAccessibilityLabel}
                testID={options.tabBarTestID}
                onPress={onPress}
                activeOpacity={0.8}
                style={styles.tabButton}
              >
                <View style={styles.iconContainer}>
                  <Ionicons
                    name={iconName}
                    size={24}
                    color={isFocused ? "#0F172A" : "#94A3B8"}
                  />
                  {/* Animated dot for active state */}
                  <Animated.View
                    style={[
                      styles.activeDot,
                      {
                        transform: [{ scale: scaleAnim }],
                        opacity: scaleAnim,
                      },
                    ]}
                  />
                </View>
              </TouchableOpacity>
            );
          })}
        </View>
      </BlurView>
    </View>
  );
}

const TabsLayout = () => {
  const { isSignedIn, isLoaded } = useAuth();

  if (!isLoaded) return null;
  if (!isSignedIn) return <Redirect href={"/(auth)"} />;

  return (
    <Tabs
      tabBar={(props) => <CustomTabBar {...props} />}
      screenOptions={{
        headerShown: false,
      }}
    >
      <Tabs.Screen name="index" options={{ title: "Home" }} />
      <Tabs.Screen name="search" options={{ title: "Search" }} />
      <Tabs.Screen name="cart" options={{ title: "Cart" }} />
      <Tabs.Screen name="profile" options={{ title: "Profile" }} />
    </Tabs>
  );
};

const styles = StyleSheet.create({
  tabBarContainer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
  },
  blurView: {
    marginHorizontal: 24,
    borderRadius: 30,
    overflow: "hidden",
    backgroundColor: "rgba(255, 255, 255, 0.7)",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.8)",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 10,
  },
  tabBarInner: {
    flexDirection: "row",
    height: 64,
    paddingHorizontal: 12,
    alignItems: "center",
    justifyContent: "space-between",
  },
  tabButton: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    height: "100%",
  },
  iconContainer: {
    alignItems: "center",
    justifyContent: "center",
    height: 40,
  },
  activeDot: {
    position: "absolute",
    bottom: -6,
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: "#C9F31D", // the accent color
  },
});

export default TabsLayout;
