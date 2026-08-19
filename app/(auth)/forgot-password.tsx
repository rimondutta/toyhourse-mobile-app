import { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { forgotPassword } from '@/lib/api';

const PURPLE = '#8B5CF6';
const LIGHT_PURPLE = '#F9F5FF';
const DARK_TEXT = '#1F2937';
const LIGHT_TEXT = '#9CA3AF';

export default function ForgotPasswordScreen() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [retryAfter, setRetryAfter] = useState(0);

  const handleSend = async () => {
    const trimmed = email.trim().toLowerCase();
    if (!trimmed || !trimmed.includes('@')) {
      setError('Please enter a valid email address.');
      return;
    }

    setError('');
    setLoading(true);

    try {
      await forgotPassword(trimmed);
      // Always navigate to OTP screen regardless of whether email exists
      // (server returns generic success either way)
      router.push({ pathname: '/(auth)/verify-otp', params: { email: trimmed } });
    } catch (err: any) {
      const msg = err?.response?.data?.error ?? err?.message ?? 'Failed to send code.';
      const retry = err?.response?.data?.retryAfterSeconds;
      if (retry) {
        setRetryAfter(retry);
        setError(`Please wait ${retry} seconds before requesting a new code.`);
      } else {
        setError(msg);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: LIGHT_PURPLE }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', paddingHorizontal: 24, paddingVertical: 40 }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Back button */}
        <TouchableOpacity
          onPress={() => router.back()}
          style={{ position: 'absolute', top: 52, left: 24, width: 42, height: 42, borderRadius: 21, backgroundColor: '#FFF', alignItems: 'center', justifyContent: 'center', shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 8, elevation: 2 }}
        >
          <Ionicons name="arrow-back" size={22} color={DARK_TEXT} />
        </TouchableOpacity>

        {/* Header */}
        <View style={{ alignItems: 'center', marginBottom: 36, marginTop: 40 }}>
          <View style={{ width: 100, height: 100, borderRadius: 50, backgroundColor: '#E9D5FF', alignItems: 'center', justifyContent: 'center', marginBottom: 24 }}>
            <Ionicons name="mail-outline" size={48} color={PURPLE} />
          </View>
          <Text style={{ color: DARK_TEXT, fontSize: 28, fontWeight: '800', letterSpacing: -0.5, marginBottom: 8 }}>
            Forgot Password?
          </Text>
          <Text style={{ color: LIGHT_TEXT, fontSize: 15, textAlign: 'center', lineHeight: 22 }}>
            Enter your email address and we'll send you a 6-digit code to reset your password.
          </Text>
        </View>

        {/* Error */}
        {error ? (
          <View style={{ backgroundColor: '#FEF2F2', borderWidth: 1, borderColor: '#FECACA', borderRadius: 16, padding: 12, marginBottom: 20, flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <Ionicons name="alert-circle" size={20} color="#EF4444" />
            <Text style={{ color: '#EF4444', fontSize: 14, fontWeight: '600', flex: 1 }}>{error}</Text>
          </View>
        ) : null}

        {/* Email input */}
        <View style={{ backgroundColor: '#FFFFFF', flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, borderRadius: 20, borderWidth: 1, borderColor: '#E5E7EB', height: 60, marginBottom: 24 }}>
          <Ionicons name="mail-outline" size={22} color={LIGHT_TEXT} />
          <TextInput
            style={{ flex: 1, marginLeft: 12, color: DARK_TEXT, fontSize: 16 }}
            placeholder="Email address"
            placeholderTextColor={LIGHT_TEXT}
            value={email}
            onChangeText={(t) => { setEmail(t); setError(''); }}
            autoCapitalize="none"
            keyboardType="email-address"
            autoCorrect={false}
            returnKeyType="send"
            onSubmitEditing={handleSend}
          />
        </View>

        {/* Send button */}
        <TouchableOpacity
          style={{ backgroundColor: PURPLE, borderRadius: 24, height: 60, alignItems: 'center', justifyContent: 'center', opacity: loading ? 0.8 : 1 }}
          activeOpacity={0.8}
          onPress={handleSend}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#FFFFFF" size="small" />
          ) : (
            <Text style={{ color: '#FFFFFF', fontWeight: '700', fontSize: 18 }}>Send Code</Text>
          )}
        </TouchableOpacity>

        {/* Back to login */}
        <TouchableOpacity
          style={{ alignItems: 'center', marginTop: 28 }}
          onPress={() => router.back()}
        >
          <Text style={{ color: LIGHT_TEXT, fontSize: 15 }}>
            Remember it? <Text style={{ color: PURPLE, fontWeight: '700' }}>Log In</Text>
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
