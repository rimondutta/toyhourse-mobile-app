import { useState } from "react";
import { Ionicons } from "@expo/vector-icons";
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  TouchableWithoutFeedback,
  TextInput,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from "react-native";

const PURPLE = "#8B5CF6";

interface WriteReviewModalProps {
  visible: boolean;
  onClose: () => void;
  onSubmit: (data: { rating: number; title: string; text: string; name: string }) => Promise<void>;
  defaultName?: string;
}

const WriteReviewModal = ({
  visible,
  onClose,
  onSubmit,
  defaultName = "",
}: WriteReviewModalProps) => {
  const [rating, setRating] = useState(0);
  const [title, setTitle] = useState("");
  const [text, setText] = useState("");
  const [name, setName] = useState(defaultName);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const reset = () => {
    setRating(0);
    setTitle("");
    setText("");
    setName(defaultName);
    setError("");
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  const handleSubmit = async () => {
    if (rating === 0) return setError("Please select a star rating.");
    if (!title.trim()) return setError("Please enter a review title.");
    if (!text.trim()) return setError("Please write your review.");
    if (!name.trim()) return setError("Please enter your name.");

    setError("");
    setIsSubmitting(true);
    try {
      await onSubmit({ rating, title: title.trim(), text: text.trim(), name: name.trim() });
      reset();
      onClose();
    } catch (e: any) {
      setError(e?.message ?? "Failed to submit review. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={handleClose}>
      <TouchableWithoutFeedback onPress={handleClose}>
        <View style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "flex-end" }}>
          <TouchableWithoutFeedback>
            <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"}>
              <View style={{ backgroundColor: "#fff", borderTopLeftRadius: 28, borderTopRightRadius: 28, padding: 24, paddingBottom: 40 }}>
                {/* Header */}
                <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
                  <Text style={{ fontSize: 20, fontWeight: "800", color: "#1F2937" }}>Write a Review</Text>
                  <TouchableOpacity onPress={handleClose} style={{ padding: 4 }}>
                    <Ionicons name="close-circle" size={28} color="#9CA3AF" />
                  </TouchableOpacity>
                </View>

                <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
                  {/* Star Rating */}
                  <Text style={{ fontSize: 14, fontWeight: "600", color: "#374151", marginBottom: 8 }}>
                    Your Rating <Text style={{ color: "#EF4444" }}>*</Text>
                  </Text>
                  <View style={{ flexDirection: "row", marginBottom: 20 }}>
                    {[1, 2, 3, 4, 5].map((star) => (
                      <TouchableOpacity
                        key={star}
                        onPress={() => { setRating(star); setError(""); }}
                        activeOpacity={0.7}
                        style={{ marginRight: 8 }}
                      >
                        <Ionicons
                          name={star <= rating ? "star" : "star-outline"}
                          size={36}
                          color={star <= rating ? "#F59E0B" : "#D1D5DB"}
                        />
                      </TouchableOpacity>
                    ))}
                  </View>

                  {/* Name */}
                  <Text style={{ fontSize: 14, fontWeight: "600", color: "#374151", marginBottom: 6 }}>
                    Your Name <Text style={{ color: "#EF4444" }}>*</Text>
                  </Text>
                  <TextInput
                    style={{ backgroundColor: "#F9FAFB", borderWidth: 1, borderColor: "#E5E7EB", borderRadius: 14, paddingHorizontal: 16, paddingVertical: 12, fontSize: 15, color: "#1F2937", marginBottom: 16 }}
                    placeholder="Enter your name"
                    placeholderTextColor="#9CA3AF"
                    value={name}
                    onChangeText={(t) => { setName(t); setError(""); }}
                    returnKeyType="next"
                  />

                  {/* Title */}
                  <Text style={{ fontSize: 14, fontWeight: "600", color: "#374151", marginBottom: 6 }}>
                    Review Title <Text style={{ color: "#EF4444" }}>*</Text>
                  </Text>
                  <TextInput
                    style={{ backgroundColor: "#F9FAFB", borderWidth: 1, borderColor: "#E5E7EB", borderRadius: 14, paddingHorizontal: 16, paddingVertical: 12, fontSize: 15, color: "#1F2937", marginBottom: 16 }}
                    placeholder="e.g. Great quality toy!"
                    placeholderTextColor="#9CA3AF"
                    value={title}
                    onChangeText={(t) => { setTitle(t); setError(""); }}
                    returnKeyType="next"
                  />

                  {/* Review Text */}
                  <Text style={{ fontSize: 14, fontWeight: "600", color: "#374151", marginBottom: 6 }}>
                    Your Review <Text style={{ color: "#EF4444" }}>*</Text>
                  </Text>
                  <TextInput
                    style={{ backgroundColor: "#F9FAFB", borderWidth: 1, borderColor: "#E5E7EB", borderRadius: 14, paddingHorizontal: 16, paddingVertical: 12, fontSize: 15, color: "#1F2937", minHeight: 100, marginBottom: 20, textAlignVertical: "top" }}
                    placeholder="Share your experience with this product..."
                    placeholderTextColor="#9CA3AF"
                    value={text}
                    onChangeText={(t) => { setText(t); setError(""); }}
                    multiline
                    returnKeyType="done"
                  />

                  {/* Error */}
                  {error ? (
                    <View style={{ backgroundColor: "#FEF2F2", borderRadius: 12, padding: 12, marginBottom: 16, flexDirection: "row", alignItems: "center", gap: 8 }}>
                      <Ionicons name="alert-circle" size={18} color="#EF4444" />
                      <Text style={{ color: "#EF4444", fontSize: 13, fontWeight: "600", flex: 1 }}>{error}</Text>
                    </View>
                  ) : null}

                  {/* Submit */}
                  <TouchableOpacity
                    style={{ backgroundColor: PURPLE, borderRadius: 18, paddingVertical: 16, alignItems: "center", opacity: isSubmitting ? 0.7 : 1 }}
                    onPress={handleSubmit}
                    activeOpacity={0.85}
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <ActivityIndicator size="small" color="#fff" />
                    ) : (
                      <Text style={{ color: "#fff", fontWeight: "800", fontSize: 16 }}>Submit Review</Text>
                    )}
                  </TouchableOpacity>
                </ScrollView>
              </View>
            </KeyboardAvoidingView>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

export default WriteReviewModal;
