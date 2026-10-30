import { useState, useRef, useEffect } from 'react';
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
import { router, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { verifyResetOtp, forgotPassword } from '@/lib/api';

const PURPLE = '#8B5CF6';
const LIGHT_PURPLE = '#F9F5FF';
const DARK_TEXT = '#1F2937';
const LIGHT_TEXT = '#9CA3AF';
const OTP_LENGTH = 6;

export default function VerifyOtpScreen() {
  const insets = useSafeAreaInsets();
  const { email } = useLocalSearchParams<{ email: string }>();
  const [otp, setOtp] = useState<string[]>(Array(OTP_LENGTH).fill(''));
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [countdown, setCountdown] = useState(60);

  const inputs = useRef<(TextInput | null)[]>([]);

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout> | undefined;
    if (countdown > 0) {
      timer = setTimeout(() => setCountdown(countdown - 1), 1000);
    }
    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [countdown]);

  const handleOtpChange = (text: string, index: number) => {
    const clean = text.replace(/[^0-9]/g, '');

    // Handle full paste (e.g. copied from email/SMS)
    if (clean.length > 1) {
      const newOtp = [...otp];
      for (let i = 0; i < OTP_LENGTH && i < clean.length; i++) {
        newOtp[i] = clean[i];
      }
      setOtp(newOtp);

      const nextFocus = Math.min(clean.length - 1, OTP_LENGTH - 1);
      inputs.current[nextFocus]?.focus();

      if (clean.length >= OTP_LENGTH) {
        handleVerify(newOtp.slice(0, OTP_LENGTH).join(''));
      }
      return;
    }

    // Single character typing
    const newOtp = [...otp];
    newOtp[index] = clean;
    setOtp(newOtp);

    // Auto-advance
    if (clean !== '' && index < OTP_LENGTH - 1) {
      inputs.current[index + 1]?.focus();
    }

    // Auto-submit when last digit is filled
    if (clean !== '' && index === OTP_LENGTH - 1) {
      const fullCode = newOtp.join('');
      if (fullCode.length === OTP_LENGTH) {
        handleVerify(fullCode);
      }
    }
  };

  const handleBackspace = (_text: string, index: number) => {
    if (index > 0) {
      const newOtp = [...otp];
      if (newOtp[index]) {
        newOtp[index] = '';
        setOtp(newOtp);
      } else {
        newOtp[index - 1] = '';
        setOtp(newOtp);
        inputs.current[index - 1]?.focus();
      }
    } else {
      const newOtp = [...otp];
      newOtp[0] = '';
      setOtp(newOtp);
    }
  };

  const handleVerify = async (codeStr: string) => {
    const cleanEmail = email?.trim().toLowerCase();
    if (!cleanEmail) {
      setError('Missing email address. Please go back and restart the process.');
      return;
    }

    if (codeStr.length !== OTP_LENGTH) {
      setError('Please enter the full 6-digit code.');
      return;
    }

    setError('');
    setSuccessMessage('');
    setLoading(true);

    try {
      const res = await verifyResetOtp(cleanEmail, codeStr);
      if (res && (res as any).success === false) {
        throw new Error((res as any).error || 'Invalid or expired code.');
      }

      // Extract resetToken from data envelope or root
      const token =
        (res as any)?.data?.resetToken ??
        (res as any)?.resetToken ??
        (res as any)?.data?.token ??
        (res as any)?.token;

      if (!token) {
        throw new Error('Verification succeeded but reset token was not received. Please try again.');
      }

      // Navigate to reset password with valid token
      router.push({
        pathname: '/(auth)/reset-password',
        params: { resetToken: token, email: cleanEmail },
      });
    } catch (err: any) {
      const msg =
        err?.response?.data?.error ||
        err?.response?.data?.message ||
        err?.message ||
        'Failed to verify code.';
      setError(msg);
      // Clear OTP on error so user can re-enter cleanly
      setOtp(Array(OTP_LENGTH).fill(''));
      inputs.current[0]?.focus();
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (countdown > 0 || resending) return;

    const cleanEmail = email?.trim().toLowerCase();
    if (!cleanEmail) {
      setError('Missing email address. Please return to the previous screen.');
      return;
    }

    setError('');
    setSuccessMessage('');
    setResending(true);

    try {
      const res = await forgotPassword(cleanEmail);
      if (res && (res as any).success === false) {
        throw new Error((res as any).error || 'Failed to resend code.');
      }
      setCountdown(60);
      setSuccessMessage('A new 6-digit code has been sent to your email.');
      setOtp(Array(OTP_LENGTH).fill(''));
      inputs.current[0]?.focus();
    } catch (err: any) {
      const msg =
        err?.response?.data?.error ||
        err?.response?.data?.message ||
        err?.message ||
        'Failed to resend code.';
      setError(msg);
    } finally {
      setResending(false);
    }
  };

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
            <Ionicons name="keypad-outline" size={48} color={PURPLE} />
          </View>
          <Text
            style={{
              color: DARK_TEXT,
              fontSize: 28,
              fontWeight: '800',
              letterSpacing: -0.5,
              marginBottom: 8,
              textAlign: 'center',
            }}
          >
            Enter Code
          </Text>
          <Text style={{ color: LIGHT_TEXT, fontSize: 15, textAlign: 'center', lineHeight: 22 }}>
            {"We've sent a 6-digit verification code to"}
          </Text>
          <Text
            style={{
              color: DARK_TEXT,
              fontSize: 15,
              textAlign: 'center',
              fontWeight: '700',
              marginTop: 4,
            }}
          >
            {email || 'your email address'}
          </Text>
        </View>

        {/* Success message */}
        {successMessage ? (
          <View
            style={{
              backgroundColor: '#ECFDF5',
              borderWidth: 1,
              borderColor: '#A7F3D0',
              borderRadius: 16,
              padding: 12,
              marginBottom: 20,
              flexDirection: 'row',
              alignItems: 'center',
              gap: 8,
            }}
          >
            <Ionicons name="checkmark-circle" size={20} color="#10B981" />
            <Text style={{ color: '#065F46', fontSize: 14, fontWeight: '600', flex: 1 }}>
              {successMessage}
            </Text>
          </View>
        ) : null}

        {/* Error message */}
        {error ? (
          <View
            style={{
              backgroundColor: '#FEF2F2',
              borderWidth: 1,
              borderColor: '#FECACA',
              borderRadius: 16,
              padding: 12,
              marginBottom: 20,
              flexDirection: 'row',
              alignItems: 'center',
              gap: 8,
            }}
          >
            <Ionicons name="alert-circle" size={20} color="#EF4444" />
            <Text style={{ color: '#EF4444', fontSize: 14, fontWeight: '600', flex: 1 }}>
              {error}
            </Text>
          </View>
        ) : null}

        {/* OTP Inputs */}
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 32 }}>
          {otp.map((digit, index) => (
            <TextInput
              key={index}
              ref={(ref) => {
                inputs.current[index] = ref;
              }}
              style={{
                width: 48,
                height: 58,
                backgroundColor: '#FFF',
                borderWidth: 2,
                borderColor: digit ? PURPLE : '#E5E7EB',
                borderRadius: 12,
                fontSize: 22,
                fontWeight: '700',
                color: DARK_TEXT,
                textAlign: 'center',
                shadowColor: digit ? PURPLE : '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: digit ? 0.2 : 0.05,
                shadowRadius: 4,
                elevation: digit ? 4 : 1,
              }}
              value={digit}
              onChangeText={(text) => handleOtpChange(text, index)}
              onKeyPress={({ nativeEvent }) => {
                if (nativeEvent.key === 'Backspace') {
                  handleBackspace(digit, index);
                }
              }}
              keyboardType="number-pad"
              maxLength={OTP_LENGTH}
              selectTextOnFocus
              editable={!loading}
            />
          ))}
        </View>

        {/* Verify button */}
        <TouchableOpacity
          style={{
            backgroundColor: PURPLE,
            borderRadius: 24,
            height: 60,
            alignItems: 'center',
            justifyContent: 'center',
            opacity: loading ? 0.8 : 1,
            marginBottom: 24,
          }}
          activeOpacity={0.8}
          onPress={() => handleVerify(otp.join(''))}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#FFFFFF" size="small" />
          ) : (
            <Text style={{ color: '#FFFFFF', fontWeight: '700', fontSize: 18 }}>Verify Code</Text>
          )}
        </TouchableOpacity>

        {/* Resend button */}
        <View style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center' }}>
          <Text style={{ color: LIGHT_TEXT, fontSize: 15 }}>{"Didn't receive the code? "}</Text>
          <TouchableOpacity
            onPress={handleResend}
            disabled={countdown > 0 || resending}
            activeOpacity={0.7}
          >
            {resending ? (
              <ActivityIndicator size="small" color={PURPLE} style={{ marginLeft: 4 }} />
            ) : (
              <Text
                style={{
                  color: countdown > 0 ? LIGHT_TEXT : PURPLE,
                  fontWeight: '700',
                  fontSize: 15,
                }}
              >
                {countdown > 0 ? `Resend in ${countdown}s` : 'Resend Code'}
              </Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
