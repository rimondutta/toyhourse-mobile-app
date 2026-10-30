import { useState, useEffect } from 'react';
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
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { forgotPassword } from '@/lib/api';

const PURPLE = '#8B5CF6';
const LIGHT_PURPLE = '#F9F5FF';
const DARK_TEXT = '#1F2937';
const LIGHT_TEXT = '#9CA3AF';

export default function ForgotPasswordScreen() {
  const insets = useSafeAreaInsets();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [retryAfter, setRetryAfter] = useState(0);

  // Active countdown timer when rate-limited
  useEffect(() => {
    if (retryAfter <= 0) return;
    const interval = setInterval(() => {
      setRetryAfter((prev) => {
        if (prev <= 1) {
          setError('');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [retryAfter]);

  const handleSend = async () => {
    const trimmed = email.trim().toLowerCase();
    if (!trimmed || !trimmed.includes('@') || !trimmed.includes('.')) {
      setError('Please enter a valid email address.');
      return;
    }

    if (retryAfter > 0) {
      setError(`Please wait ${retryAfter} seconds before requesting a new code.`);
      return;
    }

    setError('');
    setLoading(true);

    try {
      const res = await forgotPassword(trimmed);
      if (res && (res as any).success === false) {
        throw new Error((res as any).error || 'Failed to send verification code.');
      }
      // Navigate to OTP screen with clean trimmed email
      router.push({ pathname: '/(auth)/verify-otp', params: { email: trimmed } });
    } catch (err: any) {
      const msg =
        err?.response?.data?.error ||
        err?.response?.data?.message ||
        err?.message ||
        'Failed to send code.';
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

  const isNoAccountError = error.toLowerCase().includes('no account found');
  const isEmailDeliveryError = error.toLowerCase().includes('failed to send email');

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: LIGHT_PURPLE }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{
          flexGrow: 1,
          justifyContent: 'center',
          paddingHorizontal: 24,
          paddingTop: Math.max(insets.top + 60, 80),
          paddingBottom: Math.max(insets.bottom + 20, 40),
        }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Back button */}
        <TouchableOpacity
          onPress={() => router.back()}
          style={{
            position: 'absolute',
            top: Math.max(insets.top + 10, 24),
            left: 24,
            width: 42,
            height: 42,
            borderRadius: 21,
            backgroundColor: '#FFF',
            alignItems: 'center',
            justifyContent: 'center',
            shadowColor: '#000',
            shadowOpacity: 0.06,
            shadowRadius: 8,
            elevation: 2,
            zIndex: 10,
          }}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Ionicons name="arrow-back" size={22} color={DARK_TEXT} />
        </TouchableOpacity>

        {/* Header */}
        <View style={{ alignItems: 'center', marginBottom: 36 }}>
          <View
            style={{
              width: 100,
              height: 100,
              borderRadius: 50,
              backgroundColor: '#E9D5FF',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: 24,
            }}
          >
            <Ionicons name="mail-outline" size={48} color={PURPLE} />
          </View>
          <Text
            style={{
              color: DARK_TEXT,
              fontSize: 28,
              fontWeight: '800',
              letterSpacing: -0.5,
              marginBottom: 8,
            }}
          >
            Forgot Password?
          </Text>
          <Text
            style={{
              color: LIGHT_TEXT,
              fontSize: 15,
              textAlign: 'center',
              lineHeight: 22,
            }}
          >
            Enter your email address and {"we'll"} send you a 6-digit code to reset your password.
          </Text>
        </View>

        {/* Error notification */}
        {error ? (
          <View
            style={{
              backgroundColor: '#FEF2F2',
              borderWidth: 1,
              borderColor: '#FECACA',
              borderRadius: 16,
              padding: 14,
              marginBottom: 20,
            }}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <Ionicons name="alert-circle" size={20} color="#EF4444" />
              <Text style={{ color: '#EF4444', fontSize: 14, fontWeight: '600', flex: 1 }}>
                {error}
              </Text>
            </View>
            {isNoAccountError && (
              <TouchableOpacity
                onPress={() => router.push('/(auth)/register')}
                style={{ marginTop: 8, alignSelf: 'flex-start', paddingLeft: 28 }}
              >
                <Text style={{ color: PURPLE, fontWeight: '700', fontSize: 13 }}>
                  {"Don't have an account? Sign Up →"}
                </Text>
              </TouchableOpacity>
            )}
            {isEmailDeliveryError && (
              <View style={{ marginTop: 8, paddingLeft: 28 }}>
                <Text style={{ color: '#B91C1C', fontSize: 12, lineHeight: 18 }}>
                  Our email delivery service is currently encountering an issue. Please try again shortly or contact support.
                </Text>
              </View>
            )}
          </View>
        ) : null}

        {/* Email input */}
        <View
          style={{
            backgroundColor: '#FFFFFF',
            flexDirection: 'row',
            alignItems: 'center',
            paddingHorizontal: 16,
            borderRadius: 20,
            borderWidth: 1,
            borderColor: error ? '#FCA5A5' : '#E5E7EB',
            height: 60,
            marginBottom: 24,
          }}
        >
          <Ionicons name="mail-outline" size={22} color={LIGHT_TEXT} />
          <TextInput
            style={{ flex: 1, marginLeft: 12, color: DARK_TEXT, fontSize: 16 }}
            placeholder="Email address"
            placeholderTextColor={LIGHT_TEXT}
            value={email}
            onChangeText={(t) => {
              setEmail(t);
              setError('');
            }}
            autoCapitalize="none"
            keyboardType="email-address"
            autoCorrect={false}
            returnKeyType="send"
            onSubmitEditing={handleSend}
            editable={!loading && retryAfter === 0}
          />
        </View>

        {/* Send button */}
        <TouchableOpacity
          style={{
            backgroundColor: PURPLE,
            borderRadius: 24,
            height: 60,
            alignItems: 'center',
            justifyContent: 'center',
            opacity: loading || retryAfter > 0 ? 0.7 : 1,
          }}
          activeOpacity={0.8}
          onPress={handleSend}
          disabled={loading || retryAfter > 0}
        >
          {loading ? (
            <ActivityIndicator color="#FFFFFF" size="small" />
          ) : (
            <Text style={{ color: '#FFFFFF', fontWeight: '700', fontSize: 18 }}>
              {retryAfter > 0 ? `Wait ${retryAfter}s` : 'Send Code'}
            </Text>
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
