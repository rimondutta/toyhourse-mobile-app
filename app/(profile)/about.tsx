import SafeScreen from "@/components/SafeScreen";
import { View, Text, ScrollView, TouchableOpacity, Linking } from "react-native";
import { Image } from "expo-image";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";

export default function AboutScreen() {
  const openLink = (url: string) => {
    Linking.openURL(url).catch(() => {});
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
        <Text className="text-text-primary text-2xl font-bold">About Us</Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 60 }}>
        <View className="px-6 py-4">
          <View className="items-center mb-8">
            <View className="w-24 h-24 bg-primary/20 rounded-3xl items-center justify-center mb-4 transform rotate-3">
              <Ionicons name="game-controller" size={48} color="#00D9FF" />
            </View>
            <Text className="text-text-primary text-3xl font-bold text-center">Toy Hourse</Text>
            <Text className="text-text-secondary text-base text-center mt-1">
              Your Ultimate Destination for Joy and Play
            </Text>
          </View>

          <View className="bg-surface rounded-3xl p-6 mb-6">
            <Text className="text-primary font-bold text-lg mb-3">Our Mission</Text>
            <Text className="text-text-secondary text-base leading-relaxed">
              At Toy Hourse, we believe that play is the highest form of research. Our mission is to provide children and families in Bangladesh with the highest quality, educational, and fun toys that spark imagination and creativity.
            </Text>
          </View>

          <View className="bg-surface rounded-3xl p-6 mb-8">
            <Text className="text-text-primary font-bold text-lg mb-4">Connect With Us</Text>
            
            <TouchableOpacity 
              className="flex-row items-center mb-4"
              onPress={() => openLink("mailto:hello@toyhourse.com")}
            >
              <View className="w-10 h-10 bg-primary/10 rounded-full items-center justify-center mr-4">
                <Ionicons name="mail" size={18} color="#00D9FF" />
              </View>
              <Text className="text-text-secondary text-base font-medium">hello@toyhourse.com</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              className="flex-row items-center mb-4"
              onPress={() => openLink("tel:+8801616921965")}
            >
              <View className="w-10 h-10 bg-primary/10 rounded-full items-center justify-center mr-4">
                <Ionicons name="call" size={18} color="#00D9FF" />
              </View>
              <Text className="text-text-secondary text-base font-medium">+880 1616-921965</Text>
            </TouchableOpacity>

            <View className="flex-row items-center">
              <View className="w-10 h-10 bg-primary/10 rounded-full items-center justify-center mr-4">
                <Ionicons name="location" size={18} color="#00D9FF" />
              </View>
              <Text className="text-text-secondary text-base font-medium flex-1">Dhaka, Bangladesh</Text>
            </View>
          </View>
          
          <View className="items-center mb-8">
            <View className="bg-surface rounded-full py-2 px-4 flex-row items-center shadow-sm border border-background-lighter">
              <Image 
                source={require('@/assets/developer/rimon-dutta.jpeg')} 
                style={{ width: 32, height: 32, borderRadius: 16, marginRight: 12 }} 
                contentFit="cover"
              />
              <Text className="text-text-primary font-bold text-sm">
                Developed with <Ionicons name="heart" size={14} color="#EF4444" /> by Rimon Dutta
              </Text>
            </View>
          </View>
          
          <Text className="text-text-secondary text-center text-xs opacity-50">
            Version 1.0.0{'\n'}
            © {new Date().getFullYear()} Toy Hourse. All rights reserved.
          </Text>
        </View>
      </ScrollView>
    </SafeScreen>
  );
}
