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
  const [error, setError]             = useState("");

  const handleRegister = async () => {
    if (!name.trim() || !email.trim() || !password) {
      setError("Please fill in all fields.");
      return;
    }
    if (password !== confirmPass) {
      setError("Passwords do not match.");
      return;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    setError("");
    setLoading(true);
    try {
      await signUp(name.trim(), email.trim().toLowerCase(), password);
      // Force navigation after successful registration + auto sign-in
      router.replace("/(tabs)");
    } catch (err: any) {
      const msg = err?.message ?? "Something went wrong. Please try again.";
      setError(msg);
      Alert.alert("Registration failed", msg);
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
        {/* HEADER */}
        <View style={{ alignItems: "center", marginBottom: 40 }}>
          <View style={{ width: 80, height: 80, backgroundColor: "#C9F31D", borderRadius: 24, alignItems: "center", justifyContent: "center", marginBottom: 16 }}>
            <Ionicons name="person-add" size={38} color="#000000" />
          </View>
          <Text style={{ color: "#0F172A", fontSize: 28, fontWeight: "bold", letterSpacing: -0.5 }}>
            Create account
          </Text>
          <Text style={{ color: "#64748B", fontSize: 15, marginTop: 8, textAlign: "center" }}>
            Join Toyhourse and start shopping
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
          {/* Full Name */}
          <View>
            <Text style={{ color: "#64748B", fontSize: 13, fontWeight: "600", marginBottom: 8, marginLeft: 4 }}>Full name</Text>
            <View style={{ backgroundColor: "#FFFFFF", flexDirection: "row", alignItems: "center", paddingHorizontal: 16, borderRadius: 16, borderWidth: 1, borderColor: "#E2E8F0" }}>
              <Ionicons name="person-outline" size={20} color="#64748B" />
              <TextInput
                style={{ flex: 1, marginLeft: 12, paddingVertical: 14, color: "#0F172A", fontSize: 15 }}
                placeholder="Your full name"
                placeholderTextColor="#94A3B8"
                value={name}
                onChangeText={(t) => { setName(t); setError(""); }}
                autoCapitalize="words"
                returnKeyType="next"
              />
            </View>
          </View>

          {/* Email */}
          <View>
            <Text style={{ color: "#64748B", fontSize: 13, fontWeight: "600", marginBottom: 8, marginLeft: 4 }}>Email address</Text>
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
            <Text style={{ color: "#64748B", fontSize: 13, fontWeight: "600", marginBottom: 8, marginLeft: 4 }}>Password</Text>
            <View style={{ backgroundColor: "#FFFFFF", flexDirection: "row", alignItems: "center", paddingHorizontal: 16, borderRadius: 16, borderWidth: 1, borderColor: "#E2E8F0" }}>
              <Ionicons name="lock-closed-outline" size={20} color="#64748B" />
              <TextInput
                style={{ flex: 1, marginLeft: 12, paddingVertical: 14, color: "#0F172A", fontSize: 15 }}
                placeholder="Min. 6 characters"
                placeholderTextColor="#94A3B8"
                value={password}
                onChangeText={(t) => { setPassword(t); setError(""); }}
                secureTextEntry={!showPass}
                returnKeyType="next"
              />
              <TouchableOpacity onPress={() => setShowPass(!showPass)} activeOpacity={0.7}>
                <Ionicons name={showPass ? "eye-off-outline" : "eye-outline"} size={20} color="#64748B" />
              </TouchableOpacity>
            </View>
          </View>

          {/* Confirm Password */}
          <View>
            <Text style={{ color: "#64748B", fontSize: 13, fontWeight: "600", marginBottom: 8, marginLeft: 4 }}>Confirm password</Text>
            <View style={{ backgroundColor: "#FFFFFF", flexDirection: "row", alignItems: "center", paddingHorizontal: 16, borderRadius: 16, borderWidth: 1, borderColor: "#E2E8F0" }}>
              <Ionicons name="lock-closed-outline" size={20} color="#64748B" />
              <TextInput
                style={{ flex: 1, marginLeft: 12, paddingVertical: 14, color: "#0F172A", fontSize: 15 }}
                placeholder="Repeat your password"
                placeholderTextColor="#94A3B8"
                value={confirmPass}
                onChangeText={(t) => { setConfirmPass(t); setError(""); }}
                secureTextEntry={!showPass}
                returnKeyType="done"
                onSubmitEditing={handleRegister}
              />
            </View>
          </View>

          {/* Register Button */}
          <TouchableOpacity
            style={{
              backgroundColor: loading ? "#D8F753" : "#C9F31D",
              borderRadius: 16,
              paddingVertical: 16,
              alignItems: "center",
              marginTop: 8,
            }}
            activeOpacity={0.8}
            onPress={handleRegister}
            disabled={loading}
          >
            {loading ? (
              <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
                <ActivityIndicator color="#000000" size="small" />
                <Text style={{ color: "#000000", fontWeight: "700", fontSize: 15 }}>Creating account...</Text>
              </View>
            ) : (
              <Text style={{ color: "#000000", fontWeight: "700", fontSize: 15 }}>Create Account</Text>
            )}
          </TouchableOpacity>
        </View>

        {/* BACK TO LOGIN */}
        <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "center", marginTop: 24 }}>
          <Text style={{ color: "#64748B", fontSize: 14 }}>Already have an account? </Text>
          <TouchableOpacity activeOpacity={0.7} onPress={() => router.back()}>
            <Text style={{ color: "#000000", fontWeight: "700", fontSize: 14 }}>Sign In</Text>
          </TouchableOpacity>
        </View>

        <Text style={{ textAlign: "center", color: "#94A3B8", fontSize: 12, lineHeight: 20, marginTop: 24, paddingHorizontal: 16 }}>
          By creating an account, you agree to our{" "}
          <Text style={{ color: "#000000", fontWeight: "700" }}>Terms of Service</Text>
          {" and "}
          <Text style={{ color: "#000000", fontWeight: "700" }}>Privacy Policy</Text>
        </Text>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default RegisterScreen;
