import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useState, useRef } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from "react-native";

const PURPLE = "#8B5CF6";
const LIGHT_PURPLE = "#F9F5FF";
const DARK_TEXT = "#1F2937";
const LIGHT_TEXT = "#9CA3AF";

const VerifyScreen = () => {
  const [code, setCode] = useState(["", "", "", ""]);
  const inputs = useRef<Array<TextInput | null>>([]);

  const handleCodeChange = (text: string, index: number) => {
    const newCode = [...code];
    newCode[index] = text;
    setCode(newCode);

    if (text && index < 3) {
      inputs.current[index + 1]?.focus();
    }
  };

  const handleKeyPress = (e: any, index: number) => {
    if (e.nativeEvent.key === 'Backspace' && !code[index] && index > 0) {
      inputs.current[index - 1]?.focus();
    }
  };

  const handleVerify = () => {
    // Placeholder verification logic
    router.replace("/(tabs)");
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
        {/* HEADER */}
        <View style={{ alignItems: "flex-start", marginBottom: 32 }}>
          <TouchableOpacity onPress={() => router.back()} style={{ width: 44, height: 44, borderRadius: 22, backgroundColor: "#FFFFFF", alignItems: "center", justifyContent: "center", marginBottom: 32, shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 2 }}>
            <Ionicons name="chevron-back" size={24} color={DARK_TEXT} />
          </TouchableOpacity>
          <Text style={{ color: DARK_TEXT, fontSize: 32, fontWeight: "800", letterSpacing: -0.5, marginBottom: 8 }}>
            Verify Your{"\n"}Account
          </Text>
          <Text style={{ color: LIGHT_TEXT, fontSize: 16 }}>
            Please enter the verification code sent to your email.
          </Text>
        </View>

        {/* ILLUSTRATION */}
        <View style={{ alignItems: "center", marginBottom: 40 }}>
          <View style={{ width: 140, height: 140, borderRadius: 32, backgroundColor: "#E9D5FF", alignItems: "center", justifyContent: "center", transform: [{ rotate: '-10deg' }] }}>
            <Ionicons name="mail-open" size={64} color={PURPLE} />
            <View style={{ position: 'absolute', right: -10, top: -10, width: 32, height: 32, borderRadius: 16, backgroundColor: '#10B981', alignItems: 'center', justifyContent: 'center' }}>
              <Ionicons name="checkmark" size={20} color="#FFFFFF" />
            </View>
          </View>
        </View>

        {/* OTP INPUTS */}
        <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 40, paddingHorizontal: 16 }}>
          {[0, 1, 2, 3].map((index) => (
            <TextInput
              key={index}
              ref={(ref) => (inputs.current[index] = ref)}
              style={{
                width: 60,
                height: 60,
                backgroundColor: "#FFFFFF",
                borderRadius: 16,
                borderWidth: 1,
                borderColor: code[index] ? PURPLE : "#E5E7EB",
                color: DARK_TEXT,
                fontSize: 24,
                fontWeight: "700",
                textAlign: "center",
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.05,
                shadowRadius: 4,
                elevation: 2,
              }}
              keyboardType="number-pad"
              maxLength={1}
              value={code[index]}
              onChangeText={(text) => handleCodeChange(text, index)}
              onKeyPress={(e) => handleKeyPress(e, index)}
            />
          ))}
        </View>

        {/* RESEND */}
        <View style={{ flexDirection: "row", justifyContent: "center", gap: 4, marginBottom: 32 }}>
          <Text style={{ color: LIGHT_TEXT, fontSize: 15 }}>Didn't receive the code?</Text>
          <TouchableOpacity activeOpacity={0.7}>
            <Text style={{ color: PURPLE, fontWeight: "700", fontSize: 15 }}>Resend</Text>
          </TouchableOpacity>
        </View>

        {/* VERIFY BUTTON */}
        <TouchableOpacity
          style={{
            backgroundColor: PURPLE,
            borderRadius: 24,
            height: 60,
            alignItems: "center",
            justifyContent: 'center',
            marginTop: "auto",
          }}
          activeOpacity={0.8}
          onPress={handleVerify}
        >
          <Text style={{ color: "#FFFFFF", fontWeight: "700", fontSize: 18 }}>Verify</Text>
        </TouchableOpacity>

      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default VerifyScreen;
