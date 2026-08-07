import SafeScreen from "@/components/SafeScreen";
import { View, Text, ScrollView, TouchableOpacity, TextInput, Alert, ActivityIndicator } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useState } from "react";
import { useAuth } from "@/context/AuthContext";

export default function ContactScreen() {
  const { user } = useAuth();
  
  const [name, setName] = useState(user?.name || "");
  const [email, setEmail] = useState(user?.email || "");
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!name.trim() || !email.trim() || !message.trim()) {
      Alert.alert("Missing Fields", "Please fill out all fields before sending.");
      return;
    }

    setIsSubmitting(true);
    // Simulate API call for now (matches website behavior which also fakes it)
    setTimeout(() => {
      setIsSubmitting(false);
      setMessage("");
      Alert.alert("Message Sent", "Thanks for reaching out! We will get back to you shortly.", [
        { text: "OK", onPress: () => router.back() }
      ]);
    }, 1500);
  };

  return (
    <SafeScreen>
      <View className="flex-row items-center px-6 pb-4">
        <TouchableOpacity 
          className="w-10 h-10 bg-surface rounded-full items-center justify-center mr-4"
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={20} color="#0F172A" />
        </TouchableOpacity>
        <Text className="text-text-primary text-2xl font-bold">Contact Us</Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 60 }}>
        <View className="px-6 py-2">
          
          <Text className="text-text-secondary text-base mb-6">
            Have a question about an order or need help finding the perfect toy? Send us a message!
          </Text>

          {/* Form */}
          <View className="space-y-4">
            <View>
              <Text className="text-text-secondary text-sm font-semibold mb-2 ml-1">Your Name</Text>
              <TextInput
                className="bg-surface text-text-primary text-base px-5 py-4 rounded-2xl border border-surface"
                value={name}
                onChangeText={setName}
                placeholder="John Doe"
                placeholderTextColor="#94A3B8"
              />
            </View>

            <View>
              <Text className="text-text-secondary text-sm font-semibold mb-2 ml-1 mt-4">Email Address</Text>
              <TextInput
                className="bg-surface text-text-primary text-base px-5 py-4 rounded-2xl border border-surface"
                value={email}
                onChangeText={setEmail}
                placeholder="john@example.com"
                placeholderTextColor="#94A3B8"
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>

            <View>
              <Text className="text-text-secondary text-sm font-semibold mb-2 ml-1 mt-4">Message</Text>
              <TextInput
                className="bg-surface text-text-primary text-base px-5 py-4 rounded-2xl border border-surface h-32"
                value={message}
                onChangeText={setMessage}
                placeholder="How can we help you?"
                placeholderTextColor="#94A3B8"
                multiline
                textAlignVertical="top"
              />
            </View>
          </View>

          {/* Submit Button */}
          <TouchableOpacity
            className={`bg-primary rounded-2xl py-4 mt-8 flex-row justify-center items-center ${
              isSubmitting || !name.trim() || !email.trim() || !message.trim() ? "opacity-50" : ""
            }`}
            disabled={isSubmitting || !name.trim() || !email.trim() || !message.trim()}
            onPress={handleSubmit}
            activeOpacity={0.8}
          >
            {isSubmitting ? (
              <ActivityIndicator color="#0F172A" />
            ) : (
              <>
                <Ionicons name="send" size={18} color="#0F172A" style={{ marginRight: 8 }} />
                <Text className="text-background font-bold text-lg">Send Message</Text>
              </>
            )}
          </TouchableOpacity>

        </View>
      </ScrollView>
    </SafeScreen>
  );
}
