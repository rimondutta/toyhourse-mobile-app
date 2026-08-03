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

const RegisterScreen = () => {
  const { signUp } = useAuth();

  const [name, setName]               = useState("");
  const [email, setEmail]             = useState("");
  const [password, setPassword]       = useState("");
  const [confirmPass, setConfirmPass] = useState("");
  const [showPass, setShowPass]       = useState(false);
  const [loading, setLoading]         = useState(false);

  const handleRegister = async () => {
    if (!name.trim() || !email.trim() || !password) {
      Alert.alert("Missing fields", "Please fill in all fields.");
      return;
    }
    if (password !== confirmPass) {
      Alert.alert("Password mismatch", "Passwords do not match.");
      return;
    }
    if (password.length < 6) {
      Alert.alert("Weak password", "Password must be at least 6 characters.");
      return;
    }

    setLoading(true);
    try {
      await signUp(name.trim(), email.trim().toLowerCase(), password);
      // Auth layout guard automatically navigates to /(tabs) on sign-in
    } catch (err: any) {
      Alert.alert("Registration failed", err.message ?? "Something went wrong. Please try again.");
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
        {/* HEADER */}
        <View className="items-center mb-10">
          <View className="w-20 h-20 bg-primary rounded-3xl items-center justify-center mb-4">
            <Ionicons name="person-add" size={38} color="#121212" />
          </View>
          <Text className="text-text-primary text-3xl font-bold tracking-tight">
            Create account
          </Text>
          <Text className="text-text-secondary text-base mt-2 text-center">
            Join Toyhourse and start shopping
          </Text>
        </View>

        {/* FORM */}
        <View className="gap-4">
          {/* Full Name */}
          <View>
            <Text className="text-text-secondary text-sm font-medium mb-2 ml-1">Full name</Text>
            <View className="bg-surface flex-row items-center px-4 rounded-2xl">
              <Ionicons name="person-outline" size={20} color="#666" />
              <TextInput
                className="flex-1 ml-3 py-4 text-text-primary text-base"
                placeholder="Your full name"
                placeholderTextColor="#666"
                value={name}
                onChangeText={setName}
                autoCapitalize="words"
                returnKeyType="next"
              />
            </View>
          </View>

          {/* Email */}
          <View>
            <Text className="text-text-secondary text-sm font-medium mb-2 ml-1">
              Email address
            </Text>
            <View className="bg-surface flex-row items-center px-4 rounded-2xl">
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
            <Text className="text-text-secondary text-sm font-medium mb-2 ml-1">Password</Text>
            <View className="bg-surface flex-row items-center px-4 rounded-2xl">
              <Ionicons name="lock-closed-outline" size={20} color="#666" />
              <TextInput
                className="flex-1 ml-3 py-4 text-text-primary text-base"
                placeholder="Min. 6 characters"
                placeholderTextColor="#666"
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPass}
                returnKeyType="next"
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

          {/* Confirm Password */}
          <View>
            <Text className="text-text-secondary text-sm font-medium mb-2 ml-1">
              Confirm password
            </Text>
            <View className="bg-surface flex-row items-center px-4 rounded-2xl">
              <Ionicons name="lock-closed-outline" size={20} color="#666" />
              <TextInput
                className="flex-1 ml-3 py-4 text-text-primary text-base"
                placeholder="Repeat your password"
                placeholderTextColor="#666"
                value={confirmPass}
                onChangeText={setConfirmPass}
                secureTextEntry={!showPass}
                returnKeyType="done"
                onSubmitEditing={handleRegister}
              />
            </View>
          </View>

          {/* Register Button */}
          <TouchableOpacity
            className="bg-primary rounded-2xl py-4 items-center mt-2"
            activeOpacity={0.8}
            onPress={handleRegister}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#121212" />
            ) : (
              <Text className="text-background font-bold text-base">Create Account</Text>
            )}
          </TouchableOpacity>
        </View>

        {/* BACK TO LOGIN */}
        <View className="flex-row items-center justify-center mt-6">
          <Text className="text-text-secondary text-sm">Already have an account? </Text>
          <TouchableOpacity activeOpacity={0.7} onPress={() => router.back()}>
            <Text className="text-primary font-bold text-sm">Sign In</Text>
          </TouchableOpacity>
        </View>

        <Text className="text-center text-text-secondary text-xs leading-5 mt-6 px-4">
          By creating an account, you agree to our{" "}
          <Text className="text-primary">Terms of Service</Text>
          {" and "}
          <Text className="text-primary">Privacy Policy</Text>
        </Text>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default RegisterScreen;
