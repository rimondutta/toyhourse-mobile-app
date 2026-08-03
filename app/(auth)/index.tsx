import { useAuth } from "@/context/AuthContext";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from "react-native";

const LoginScreen = () => {
  const { signIn, continueAsGuest } = useAuth();

  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading]   = useState(false);

  const handleLogin = async () => {
    if (!email.trim() || !password) {
      Alert.alert("Missing fields", "Please enter your email and password.");
      return;
    }

    setLoading(true);
    try {
      await signIn(email.trim().toLowerCase(), password);
      // Navigation is handled by the (auth) layout — it redirects to /(tabs) on sign-in
    } catch (err: any) {
      Alert.alert("Login failed", err.message ?? "Invalid email or password.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      className="flex-1 bg-background"
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ flexGrow: 1, justifyContent: "center", paddingHorizontal: 24, paddingVertical: 40 }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* BRAND HEADER */}
        <View className="items-center mb-10">
          <View className="w-20 h-20 bg-primary rounded-3xl items-center justify-center mb-4">
            <Ionicons name="storefront" size={40} color="#121212" />
          </View>
          <Text className="text-text-primary text-3xl font-bold tracking-tight">
            Welcome back
          </Text>
          <Text className="text-text-secondary text-base mt-2 text-center">
            Sign in to your Toyhourse account
          </Text>
        </View>

        {/* FORM */}
        <View className="gap-4">
          {/* Email */}
          <View>
            <Text className="text-text-secondary text-sm font-medium mb-2 ml-1">
              Email address
            </Text>
            <View className="bg-surface flex-row items-center px-4 rounded-2xl border border-surface">
              <Ionicons name="mail-outline" size={20} color="#666" />
              <TextInput
                className="flex-1 ml-3 py-4 text-text-primary text-base"
                placeholder="you@example.com"
                placeholderTextColor="#666"
                value={email}
                onChangeText={setEmail}
                autoCapitalize="none"
                keyboardType="email-address"
                autoCorrect={false}
                returnKeyType="next"
              />
            </View>
          </View>

          {/* Password */}
          <View>
            <Text className="text-text-secondary text-sm font-medium mb-2 ml-1">
              Password
            </Text>
            <View className="bg-surface flex-row items-center px-4 rounded-2xl border border-surface">
              <Ionicons name="lock-closed-outline" size={20} color="#666" />
              <TextInput
                className="flex-1 ml-3 py-4 text-text-primary text-base"
                placeholder="Your password"
                placeholderTextColor="#666"
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPass}
                returnKeyType="done"
                onSubmitEditing={handleLogin}
              />
              <TouchableOpacity onPress={() => setShowPass(!showPass)} activeOpacity={0.7}>
                <Ionicons
                  name={showPass ? "eye-off-outline" : "eye-outline"}
                  size={20}
                  color="#666"
                />
              </TouchableOpacity>
            </View>
          </View>

          {/* Sign In Button */}
          <TouchableOpacity
            className="bg-primary rounded-2xl py-4 items-center mt-2"
            activeOpacity={0.8}
            onPress={handleLogin}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#121212" />
            ) : (
              <Text className="text-background font-bold text-base">Sign In</Text>
            )}
          </TouchableOpacity>
        </View>

        {/* DIVIDER */}
        <View className="flex-row items-center my-6">
          <View className="flex-1 h-px bg-surface" />
          <Text className="text-text-secondary text-sm mx-4">Don&apos;t have an account?</Text>
          <View className="flex-1 h-px bg-surface" />
        </View>

        {/* REGISTER LINK */}
        <TouchableOpacity
          className="border border-primary rounded-2xl py-4 items-center"
          activeOpacity={0.8}
          onPress={() => router.push("/register" as any)}
        >
          <Text className="text-primary font-bold text-base">Create Account</Text>
        </TouchableOpacity>

        {/* CONTINUE AS GUEST */}
        <TouchableOpacity
          className="py-4 items-center mt-2"
          activeOpacity={0.7}
          onPress={continueAsGuest}
        >
          <Text className="text-text-secondary text-sm">
            Continue as{" "}
            <Text className="text-text-primary font-semibold">Guest</Text>
          </Text>
        </TouchableOpacity>

        <Text className="text-center text-text-secondary text-xs leading-5 mt-4 px-4">
          By signing in, you agree to our{" "}
          <Text className="text-primary">Terms of Service</Text>
          {" and "}
          <Text className="text-primary">Privacy Policy</Text>
        </Text>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default LoginScreen;
