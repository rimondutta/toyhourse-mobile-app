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
      style={{ flex: 1, backgroundColor: "#F8FAFC" }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ flexGrow: 1, justifyContent: "center", paddingHorizontal: 24, paddingVertical: 40 }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* BRAND HEADER */}
        <View style={{ alignItems: "center", marginBottom: 40 }}>
          <View style={{ width: 80, height: 80, backgroundColor: "#C9F31D", borderRadius: 24, alignItems: "center", justifyContent: "center", marginBottom: 16 }}>
            <Ionicons name="storefront" size={40} color="#000000" />
          </View>
          <Text style={{ color: "#0F172A", fontSize: 28, fontWeight: "bold", letterSpacing: -0.5 }}>
            Welcome back
          </Text>
          <Text style={{ color: "#64748B", fontSize: 15, marginTop: 8, textAlign: "center" }}>
            Sign in to your Toyhourse account
          </Text>
        </View>

        {/* ERROR BANNER */}
        {error ? (
          <View style={{ backgroundColor: "#FEF2F2", borderWidth: 1, borderColor: "#FECACA", borderRadius: 12, padding: 12, marginBottom: 16, flexDirection: "row", alignItems: "center", gap: 8 }}>
            <Ionicons name="alert-circle" size={18} color="#EF4444" />
            <Text style={{ color: "#EF4444", fontSize: 13, fontWeight: "600", flex: 1 }}>{error}</Text>
          </View>
        ) : null}

        {/* FORM */}
        <View style={{ gap: 16 }}>
          {/* Email */}
          <View>
            <Text style={{ color: "#64748B", fontSize: 13, fontWeight: "600", marginBottom: 8, marginLeft: 4 }}>
              Email address
            </Text>
            <View style={{ backgroundColor: "#FFFFFF", flexDirection: "row", alignItems: "center", paddingHorizontal: 16, borderRadius: 16, borderWidth: 1, borderColor: "#E2E8F0" }}>
              <Ionicons name="mail-outline" size={20} color="#64748B" />
              <TextInput
                style={{ flex: 1, marginLeft: 12, paddingVertical: 14, color: "#0F172A", fontSize: 15 }}
                placeholder="you@example.com"
                placeholderTextColor="#94A3B8"
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
            <Text style={{ color: "#64748B", fontSize: 13, fontWeight: "600", marginBottom: 8, marginLeft: 4 }}>
              Password
            </Text>
            <View style={{ backgroundColor: "#FFFFFF", flexDirection: "row", alignItems: "center", paddingHorizontal: 16, borderRadius: 16, borderWidth: 1, borderColor: "#E2E8F0" }}>
              <Ionicons name="lock-closed-outline" size={20} color="#64748B" />
              <TextInput
                style={{ flex: 1, marginLeft: 12, paddingVertical: 14, color: "#0F172A", fontSize: 15 }}
                placeholder="Your password"
                placeholderTextColor="#94A3B8"
                value={password}
                onChangeText={(t) => { setPassword(t); setError(""); }}
                secureTextEntry={!showPass}
                returnKeyType="done"
                onSubmitEditing={handleLogin}
              />
              <TouchableOpacity onPress={() => setShowPass(!showPass)} activeOpacity={0.7}>
                <Ionicons
                  name={showPass ? "eye-off-outline" : "eye-outline"}
                  size={20}
                  color="#64748B"
                />
              </TouchableOpacity>
            </View>
          </View>

          {/* Sign In Button */}
          <TouchableOpacity
            style={{
              backgroundColor: loading ? "#D8F753" : "#C9F31D",
              borderRadius: 16,
              paddingVertical: 16,
              alignItems: "center",
              marginTop: 8,
              opacity: loading ? 0.9 : 1,
            }}
            activeOpacity={0.8}
            onPress={handleLogin}
            disabled={loading}
          >
            {loading ? (
              <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
                <ActivityIndicator color="#000000" size="small" />
                <Text style={{ color: "#000000", fontWeight: "700", fontSize: 15 }}>Signing in...</Text>
              </View>
            ) : (
              <Text style={{ color: "#000000", fontWeight: "700", fontSize: 15 }}>Sign In</Text>
            )}
          </TouchableOpacity>
        </View>

        {/* DIVIDER */}
        <View style={{ flexDirection: "row", alignItems: "center", marginVertical: 24 }}>
          <View style={{ flex: 1, height: 1, backgroundColor: "#E2E8F0" }} />
          <Text style={{ color: "#94A3B8", fontSize: 13, marginHorizontal: 16 }}>Don't have an account?</Text>
          <View style={{ flex: 1, height: 1, backgroundColor: "#E2E8F0" }} />
        </View>

        {/* REGISTER LINK */}
        <TouchableOpacity
          style={{ borderWidth: 1.5, borderColor: "#C9F31D", borderRadius: 16, paddingVertical: 16, alignItems: "center" }}
          activeOpacity={0.8}
          onPress={() => router.push("/register" as any)}
        >
          <Text style={{ color: "#000000", fontWeight: "700", fontSize: 15 }}>Create Account</Text>
        </TouchableOpacity>

        {/* CONTINUE AS GUEST */}
        <TouchableOpacity
          style={{ paddingVertical: 16, alignItems: "center", marginTop: 8 }}
          activeOpacity={0.7}
          onPress={continueAsGuest}
        >
          <Text style={{ color: "#64748B", fontSize: 14 }}>
            Continue as{" "}
            <Text style={{ color: "#0F172A", fontWeight: "600" }}>Guest</Text>
          </Text>
        </TouchableOpacity>

        <Text style={{ textAlign: "center", color: "#94A3B8", fontSize: 12, lineHeight: 20, marginTop: 8, paddingHorizontal: 16 }}>
          By signing in, you agree to our{" "}
          <Text style={{ color: "#000000", fontWeight: "700" }}>Terms of Service</Text>
          {" and "}
          <Text style={{ color: "#000000", fontWeight: "700" }}>Privacy Policy</Text>
        </Text>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default LoginScreen;
