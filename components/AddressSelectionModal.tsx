import { useAddresses } from "@/hooks/useAddressess";
import { Address } from "@/types";
import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from "react-native";
import { useAuth } from "@/context/AuthContext";

interface AddressSelectionModalProps {
  visible: boolean;
  onClose: () => void;
  onProceed: (address: Address) => void;
  isProcessing: boolean;
}

const AddressSelectionModal = ({
  visible,
  onClose,
  onProceed,
  isProcessing,
}: AddressSelectionModalProps) => {
  const { user } = useAuth();
  const { addresses, isLoading: addressesLoading } = useAddresses();
  const [selectedAddress, setSelectedAddress] = useState<Address | null>(null);

  // Manual Form State (for guests / users with no addresses)
  const [fullName, setFullName] = useState("");
  const [streetAddress, setStreetAddress] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [zipCode, setZipCode] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");

  const isGuestOrNoAddresses = !user || (!addressesLoading && (!addresses || addresses.length === 0));

  const handleProceed = () => {
    if (isGuestOrNoAddresses) {
      // Validate form
      if (!fullName.trim() || !streetAddress.trim() || !city.trim() || !state.trim() || !zipCode.trim() || !phoneNumber.trim()) {
        Alert.alert("Missing Fields", "Please fill out your entire shipping address.");
        return;
      }

      // Create an ephemeral address object
      const ephemeralAddress: Address = {
        _id: "ephemeral_" + Date.now().toString(),
        label: "Guest Shipping",
        fullName: fullName.trim(),
        streetAddress: streetAddress.trim(),
        city: city.trim(),
        state: state.trim(),
        zipCode: zipCode.trim(),
        phoneNumber: phoneNumber.trim(),
        isDefault: true,
      };
      
      onProceed(ephemeralAddress);
    } else {
      // Proceed with selected saved address
      if (selectedAddress) {
        onProceed(selectedAddress);
      }
    }
  };

  const renderSavedAddresses = () => {
    if (addressesLoading) {
      return (
        <View className="py-8">
          <ActivityIndicator size="large" color="#00D9FF" />
        </View>
      );
    }

    return (
      <View className="gap-4">
        {addresses?.map((address: Address) => (
          <TouchableOpacity
            key={address._id}
            className={`bg-surface rounded-3xl p-6 border-2 ${
              selectedAddress?._id === address._id ? "border-primary" : "border-background-lighter"
            }`}
            activeOpacity={0.7}
            onPress={() => setSelectedAddress(address)}
          >
            <View className="flex-row items-start justify-between">
              <View className="flex-1">
                <View className="flex-row items-center mb-3">
                  <Text className="text-primary font-bold text-lg mr-2">{address.label}</Text>
                  {address.isDefault && (
                    <View className="bg-primary/20 rounded-full px-3 py-1">
                      <Text className="text-primary text-sm font-semibold">Default</Text>
                    </View>
                  )}
                </View>
                <Text className="text-text-primary font-semibold text-lg mb-2">
                  {address.fullName}
                </Text>
                <Text className="text-text-secondary text-base leading-6 mb-1">
                  {address.streetAddress}
                </Text>
                <Text className="text-text-secondary text-base mb-2">
                  {address.city}, {address.state} {address.zipCode}
                </Text>
                <Text className="text-text-secondary text-base">{address.phoneNumber}</Text>
              </View>
              {selectedAddress?._id === address._id && (
                <View className="bg-primary rounded-full p-2 ml-3">
                  <Ionicons name="checkmark" size={24} color="#121212" />
                </View>
              )}
            </View>
          </TouchableOpacity>
        ))}
      </View>
    );
  };

  const renderManualForm = () => {
    return (
      <View className="gap-3">
        <Text className="text-text-secondary text-sm mb-2">
          {user ? "Add a shipping address to continue." : "Guest Checkout: Enter shipping address."}
        </Text>
        
        <TextInput
          className="bg-surface text-text-primary px-4 py-4 rounded-2xl border border-surface text-base"
          placeholder="Full Name"
          placeholderTextColor="#666"
          value={fullName}
          onChangeText={setFullName}
        />
        <TextInput
          className="bg-surface text-text-primary px-4 py-4 rounded-2xl border border-surface text-base"
          placeholder="Street Address"
          placeholderTextColor="#666"
          value={streetAddress}
          onChangeText={setStreetAddress}
        />
        <View className="flex-row gap-3">
          <TextInput
            className="flex-1 bg-surface text-text-primary px-4 py-4 rounded-2xl border border-surface text-base"
            placeholder="City"
            placeholderTextColor="#666"
            value={city}
            onChangeText={setCity}
          />
          <TextInput
            className="w-1/3 bg-surface text-text-primary px-4 py-4 rounded-2xl border border-surface text-base"
            placeholder="State"
            placeholderTextColor="#666"
            value={state}
            onChangeText={setState}
          />
        </View>
        <View className="flex-row gap-3">
          <TextInput
            className="w-1/3 bg-surface text-text-primary px-4 py-4 rounded-2xl border border-surface text-base"
            placeholder="ZIP Code"
            placeholderTextColor="#666"
            value={zipCode}
            onChangeText={setZipCode}
            keyboardType="number-pad"
          />
          <TextInput
            className="flex-1 bg-surface text-text-primary px-4 py-4 rounded-2xl border border-surface text-base"
            placeholder="Phone Number"
            placeholderTextColor="#666"
            value={phoneNumber}
            onChangeText={setPhoneNumber}
            keyboardType="phone-pad"
          />
        </View>
      </View>
    );
  };

  return (
    <Modal visible={visible} animationType="slide" transparent={true} onRequestClose={onClose}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === "ios" ? "padding" : "height"} 
        className="flex-1"
      >
        <View className="flex-1 bg-black/70 justify-end">
          <View className="bg-background rounded-t-3xl max-h-[85%] min-h-[50%]">
            {/* Modal Header */}
            <View className="flex-row items-center justify-between p-6 border-b border-surface">
              <Text className="text-text-primary text-2xl font-bold">
                {isGuestOrNoAddresses ? "Shipping Address" : "Select Address"}
              </Text>
              <TouchableOpacity onPress={onClose} className="bg-surface rounded-full p-2">
                <Ionicons name="close" size={24} color="#FFFFFF" />
              </TouchableOpacity>
            </View>

            {/* Content */}
            <ScrollView className="flex-1 p-6" keyboardShouldPersistTaps="handled">
              {isGuestOrNoAddresses ? renderManualForm() : renderSavedAddresses()}
            </ScrollView>

            <View className="p-6 border-t border-surface">
              <TouchableOpacity
                className={`bg-primary rounded-2xl py-5 ${(!isGuestOrNoAddresses && !selectedAddress) ? "opacity-50" : ""}`}
                activeOpacity={0.9}
                onPress={handleProceed}
                disabled={(!isGuestOrNoAddresses && !selectedAddress) || isProcessing}
              >
                <View className="flex-row items-center justify-center">
                  {isProcessing ? (
                    <ActivityIndicator size="small" color="#121212" />
                  ) : (
                    <>
                      <Text className="text-background font-bold text-lg mr-2">
                        Continue to Payment
                      </Text>
                      <Ionicons name="arrow-forward" size={20} color="#121212" />
                    </>
                  )}
                </View>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

export default AddressSelectionModal;
