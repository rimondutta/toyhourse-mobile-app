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
import { verifyResetOtp } from '@/lib/api';

const PURPLE = '#8B5CF6';
const LIGHT_PURPLE = '#F9F5FF';
const DARK_TEXT = '#1F2937';
const LIGHT_TEXT = '#9CA3AF';
const OTP_LENGTH = 6;

export default function VerifyOtpScreen() {
  const { email } = useLocalSearchParams<{ email: string }>();
  const [otp, setOtp] = useState(Array(OTP_LENGTH).fill(''));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [countdown, setCountdown] = useState(60);
  
  const inputs = useRef<Array<TextInput | null>>([]);

  useEffect(() => {
    let timer: any;
    if (countdown > 0) {
      timer = setTimeout(() => setCountdown(countdown - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [countdown]);

  const handleOtpChange = (text: string, index: number) => {
    // Only allow numbers
    const clean = text.replace(/[^0-9]/g, '');
    
    // Handle paste
    if (clean.length > 1) {
      const newOtp = [...otp];
      for (let i = 0; i < OTP_LENGTH && i < clean.length; i++) {
        if (index + i < OTP_LENGTH) {
          newOtp[index + i] = clean[i];
        }
      }
      setOtp(newOtp);
      
      // Focus the appropriate input after paste
      const nextIndex = Math.min(index + clean.length, OTP_LENGTH - 1);
      inputs.current[nextIndex]?.focus();
      
      // Auto-submit if all 6 digits are filled
      if (newOtp.every(d => d !== '')) {
        handleVerify(newOtp.join(''));
      }
      return;
    }

    // Normal single-char typing
    const newOtp = [...otp];
    newOtp[index] = clean;
    setOtp(newOtp);

    // Auto-advance
    if (clean !== '' && index < OTP_LENGTH - 1) {
      inputs.current[index + 1]?.focus();
    }
    
    // Auto-submit on 6th digit
    if (index === OTP_LENGTH - 1 && clean !== '' && newOtp.slice(0, 5).every(d => d !== '')) {
      handleVerify(newOtp.join(''));
    }
  };

  const handleBackspace = (text: string, index: number) => {
    if (text === '' && index > 0) {
      inputs.current[index - 1]?.focus();
      const newOtp = [...otp];
      newOtp[index - 1] = '';
      setOtp(newOtp);
    }
  };

  const handleVerify = async (codeStr: string) => {
    if (!email) {
      setError('Missing email address. Please restart the process.');
      return;
    }
    
    if (codeStr.length !== OTP_LENGTH) {
      setError('Please enter the full 6-digit code.');
      return;
    }

    setError('');
    setLoading(true);

    try {
      const res = await verifyResetOtp(email, codeStr);
      // Success! Move to reset-password screen and pass the token
      router.push({ 
        pathname: '/(auth)/reset-password', 
        params: { resetToken: (res as any).resetToken } 
      });
    } catch (err: any) {
      const msg = err?.response?.data?.error ?? err?.message ?? 'Failed to verify code.';
      setError(msg);
      // Clear OTP on error so they can retype
      setOtp(Array(OTP_LENGTH).fill(''));
      inputs.current[0]?.focus();
    } finally {
      setLoading(false);
    }
  };

  const handleResend = () => {
    if (countdown > 0) return;
    // Go back to forgot-password to request a new code
    // The forgot-password screen will trigger the API call again
    router.back();
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
            <Ionicons name="keypad-outline" size={48} color={PURPLE} />
          </View>
          <Text style={{ color: DARK_TEXT, fontSize: 28, fontWeight: '800', letterSpacing: -0.5, marginBottom: 8, textAlign: 'center' }}>
            Enter Code
          </Text>
          <Text style={{ color: LIGHT_TEXT, fontSize: 15, textAlign: 'center', lineHeight: 22 }}>
            We've sent a 6-digit verification code to
          </Text>
          <Text style={{ color: DARK_TEXT, fontSize: 15, textAlign: 'center', fontWeight: '700', marginTop: 4 }}>
            {email || 'your email address'}
          </Text>
        </View>

        {/* Error */}
        {error ? (
          <View style={{ backgroundColor: '#FEF2F2', borderWidth: 1, borderColor: '#FECACA', borderRadius: 16, padding: 12, marginBottom: 20, flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <Ionicons name="alert-circle" size={20} color="#EF4444" />
            <Text style={{ color: '#EF4444', fontSize: 14, fontWeight: '600', flex: 1 }}>{error}</Text>
          </View>
        ) : null}

        {/* OTP Inputs */}
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 32 }}>
          {otp.map((digit, index) => (
            <TextInput
              key={index}
              ref={(ref) => { inputs.current[index] = ref; }}
              style={{
                width: 50,
                height: 60,
                backgroundColor: '#FFF',
                borderWidth: 2,
                borderColor: digit ? PURPLE : '#E5E7EB',
                borderRadius: 12,
                fontSize: 24,
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
              maxLength={6}
              selectTextOnFocus
              contextMenuHidden
            />
          ))}
        </View>

        {/* Verify button */}
        <TouchableOpacity
          style={{ backgroundColor: PURPLE, borderRadius: 24, height: 60, alignItems: 'center', justifyContent: 'center', opacity: loading ? 0.8 : 1, marginBottom: 24 }}
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

        {/* Resend */}
        <View style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center' }}>
          <Text style={{ color: LIGHT_TEXT, fontSize: 15 }}>Didn't receive the code? </Text>
          <TouchableOpacity 
            onPress={handleResend}
            disabled={countdown > 0}
            activeOpacity={0.7}
          >
            <Text style={{ 
              color: countdown > 0 ? LIGHT_TEXT : PURPLE, 
              fontWeight: '700', 
              fontSize: 15 
            }}>
              {countdown > 0 ? `Resend in ${countdown}s` : 'Resend Code'}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
