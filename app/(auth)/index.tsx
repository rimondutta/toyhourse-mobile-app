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

const PURPLE = "#8B5CF6";
const LIGHT_PURPLE = "#F9F5FF";
const DARK_TEXT = "#1F2937";
const LIGHT_TEXT = "#9CA3AF";

const LoginScreen = () => {
  const { signIn, continueAsGuest } = useAuth();

  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState("");

  const handleLogin = async () => {
    if (!email.trim() || !password) {
      setError("Please enter your email and password.");
      return;
    }

    setError("");
    setLoading(true);
    try {
      await signIn(email.trim().toLowerCase(), password);
      // Force navigation in case the layout redirect doesn't fire
      router.replace("/(tabs)");
    } catch (err: any) {
      const msg = err?.message ?? "Invalid email or password.";
      setError(msg);
      Alert.alert("Login failed", msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: LIGHT_PURPLE }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ flexGrow: 1, justifyContent: "center", paddingHorizontal: 24, paddingVertical: 40 }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* BRAND HEADER */}
        <View style={{ alignItems: "center", marginBottom: 32 }}>
          {/* Placeholder for the illustration from the mockup */}
          <View style={{ width: 120, height: 120, borderRadius: 60, backgroundColor: "#E9D5FF", alignItems: "center", justifyContent: "center", marginBottom: 24 }}>
            <Ionicons name="sparkles" size={56} color={PURPLE} />
          </View>
          <Text style={{ color: DARK_TEXT, fontSize: 32, fontWeight: "800", letterSpacing: -0.5, marginBottom: 8 }}>
            Welcome Back
          </Text>
          <Text style={{ color: LIGHT_TEXT, fontSize: 16, textAlign: "center" }}>
            Sign in to continue your beauty journey
          </Text>
        </View>

        {/* ERROR BANNER */}
        {error ? (
          <View style={{ backgroundColor: "#FEF2F2", borderWidth: 1, borderColor: "#FECACA", borderRadius: 16, padding: 12, marginBottom: 24, flexDirection: "row", alignItems: "center", gap: 8 }}>
            <Ionicons name="alert-circle" size={20} color="#EF4444" />
            <Text style={{ color: "#EF4444", fontSize: 14, fontWeight: "600", flex: 1 }}>{error}</Text>
          </View>
        ) : null}

        {/* FORM */}
        <View style={{ gap: 20 }}>
          {/* Email */}
          <View>
            <View style={{ backgroundColor: "#FFFFFF", flexDirection: "row", alignItems: "center", paddingHorizontal: 16, borderRadius: 20, borderWidth: 1, borderColor: "#E5E7EB", height: 60 }}>
              <Ionicons name="person-outline" size={22} color={LIGHT_TEXT} />
              <TextInput
                style={{ flex: 1, marginLeft: 12, color: DARK_TEXT, fontSize: 16 }}
                placeholder="Email address"
                placeholderTextColor={LIGHT_TEXT}
                value={email}
                onChangeText={(t) => { setEmail(t); setError(""); }}
                autoCapitalize="none"
                keyboardType="email-address"
                autoCorrect={false}
                returnKeyType="next"
              />
            </View>
          </View>

          {/* Password */}
          <View>
            <View style={{ backgroundColor: "#FFFFFF", flexDirection: "row", alignItems: "center", paddingHorizontal: 16, borderRadius: 20, borderWidth: 1, borderColor: "#E5E7EB", height: 60 }}>
              <Ionicons name="lock-closed-outline" size={22} color={LIGHT_TEXT} />
              <TextInput
                style={{ flex: 1, marginLeft: 12, color: DARK_TEXT, fontSize: 16 }}
                placeholder="Password"
                placeholderTextColor={LIGHT_TEXT}
                value={password}
                onChangeText={(t) => { setPassword(t); setError(""); }}
                secureTextEntry={!showPass}
                returnKeyType="done"
                onSubmitEditing={handleLogin}
              />
              <TouchableOpacity onPress={() => setShowPass(!showPass)} activeOpacity={0.7} style={{ padding: 4 }}>
                <Ionicons
                  name={showPass ? "eye-off-outline" : "eye-outline"}
                  size={22}
                  color={LIGHT_TEXT}
                />
              </TouchableOpacity>
            </View>
          </View>

          <TouchableOpacity style={{ alignSelf: 'flex-end', marginTop: -8 }}>
            <Text style={{ color: PURPLE, fontSize: 14, fontWeight: "600" }}>Forgot password?</Text>
          </TouchableOpacity>

          {/* Sign In Button */}
          <TouchableOpacity
            style={{
              backgroundColor: PURPLE,
              borderRadius: 24,
              height: 60,
              alignItems: "center",
              justifyContent: 'center',
              marginTop: 8,
              opacity: loading ? 0.8 : 1,
            }}
            activeOpacity={0.8}
            onPress={handleLogin}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#FFFFFF" size="small" />
            ) : (
              <Text style={{ color: "#FFFFFF", fontWeight: "700", fontSize: 18 }}>Log In</Text>
            )}
          </TouchableOpacity>
        </View>

        {/* OR DIVIDER */}
        <View style={{ flexDirection: "row", alignItems: "center", marginVertical: 32 }}>
          <View style={{ flex: 1, height: 1, backgroundColor: "#E5E7EB" }} />
          <Text style={{ marginHorizontal: 16, color: LIGHT_TEXT, fontSize: 14, fontWeight: "500" }}>Or continue with</Text>
          <View style={{ flex: 1, height: 1, backgroundColor: "#E5E7EB" }} />
        </View>

        {/* SOCIAL LOGIN */}
        <View style={{ flexDirection: "row", justifyContent: "center", gap: 16, marginBottom: 40 }}>
          <TouchableOpacity style={{ width: 60, height: 60, borderRadius: 20, backgroundColor: "#FFFFFF", alignItems: "center", justifyContent: "center", borderWidth: 1, borderColor: "#E5E7EB" }}>
            <Ionicons name="logo-google" size={24} color="#DB4437" />
          </TouchableOpacity>
          <TouchableOpacity style={{ width: 60, height: 60, borderRadius: 20, backgroundColor: "#FFFFFF", alignItems: "center", justifyContent: "center", borderWidth: 1, borderColor: "#E5E7EB" }}>
            <Ionicons name="logo-apple" size={24} color="#000000" />
          </TouchableOpacity>
          <TouchableOpacity style={{ width: 60, height: 60, borderRadius: 20, backgroundColor: "#FFFFFF", alignItems: "center", justifyContent: "center", borderWidth: 1, borderColor: "#E5E7EB" }}>
            <Ionicons name="logo-facebook" size={24} color="#4267B2" />
          </TouchableOpacity>
        </View>

        {/* BOTTOM LINKS */}
        <View style={{ flexDirection: "row", justifyContent: "center", gap: 4, marginTop: "auto" }}>
          <Text style={{ color: LIGHT_TEXT, fontSize: 15 }}>Don't have an account?</Text>
          <TouchableOpacity onPress={() => router.push("/(auth)/register")} activeOpacity={0.7}>
            <Text style={{ color: PURPLE, fontWeight: "700", fontSize: 15 }}>Sign Up</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity 
          style={{ alignItems: 'center', marginTop: 24, paddingBottom: 20 }}
          onPress={continueAsGuest}
        >
          <Text style={{ color: LIGHT_TEXT, fontSize: 14, textDecorationLine: 'underline' }}>
            Continue as guest
          </Text>
        </TouchableOpacity>

      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default LoginScreen;
