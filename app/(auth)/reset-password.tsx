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
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { resetPassword } from '@/lib/api';

const PURPLE = '#8B5CF6';
const LIGHT_PURPLE = '#F9F5FF';
const DARK_TEXT = '#1F2937';
const LIGHT_TEXT = '#9CA3AF';

export default function ResetPasswordScreen() {
  const insets = useSafeAreaInsets();
  const { resetToken, email } = useLocalSearchParams<{ resetToken: string; email?: string }>();

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [showConfirmPass, setShowConfirmPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Password strength indicator
  const getStrength = (pass: string) => {
    if (!pass) return { score: 0, label: '', color: '#E5E7EB' };
    let score = 0;
    if (pass.length >= 6) score += 1;
    if (pass.length >= 8) score += 1;
    if (/[A-Z]/.test(pass) || /[0-9]/.test(pass)) score += 1;
    if (/[^A-Za-z0-9]/.test(pass)) score += 1;

    if (score <= 1) return { score, label: 'Weak', color: '#EF4444' };
    if (score === 2 || score === 3) return { score, label: 'Good', color: '#F59E0B' };
    return { score, label: 'Strong', color: '#10B981' };
  };

  const strength = getStrength(password);

  const handleReset = async () => {
    if (!resetToken) {
      setError('Reset token is missing or expired. Please restart the process.');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setError('');
    setLoading(true);

    try {
      const res = await resetPassword(resetToken, password);
      if (res && (res as any).success === false) {
        throw new Error((res as any).error || 'Failed to reset password.');
      }

      Alert.alert(
        'Password Updated',
        'Your password has been successfully reset. You can now log in with your new password.',
        [
          {
            text: 'Log In',
            onPress: () => router.replace('/(auth)'),
          },
        ],
        { cancelable: false }
      );
    } catch (err: any) {
      const msg =
        err?.response?.data?.error ||
        err?.response?.data?.message ||
        err?.message ||
        'Failed to reset password.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const hasMissingToken = !resetToken;

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
        <View style={{ alignItems: 'center', marginBottom: 32 }}>
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
            <Ionicons name="lock-closed-outline" size={48} color={PURPLE} />
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
            Set New Password
          </Text>
          <Text style={{ color: LIGHT_TEXT, fontSize: 15, textAlign: 'center', lineHeight: 22 }}>
            Create a strong new password for {email || 'your account'}.
          </Text>
        </View>

        {/* Missing token warning */}
        {hasMissingToken ? (
          <View
            style={{
              backgroundColor: '#FEF2F2',
              borderWidth: 1,
              borderColor: '#FECACA',
              borderRadius: 16,
              padding: 16,
              marginBottom: 24,
              alignItems: 'center',
            }}
          >
            <Ionicons name="warning-outline" size={28} color="#EF4444" style={{ marginBottom: 6 }} />
            <Text style={{ color: '#EF4444', fontSize: 15, fontWeight: '700', textAlign: 'center' }}>
              Reset Session Expired
            </Text>
            <Text
              style={{
                color: '#7F1D1D',
                fontSize: 13,
                textAlign: 'center',
                marginTop: 4,
                marginBottom: 12,
              }}
            >
              Please request a new verification code to reset your password.
            </Text>
            <TouchableOpacity
              onPress={() => router.replace('/(auth)/forgot-password')}
              style={{
                backgroundColor: PURPLE,
                paddingHorizontal: 20,
                paddingVertical: 10,
                borderRadius: 12,
              }}
            >
              <Text style={{ color: '#FFF', fontWeight: '700', fontSize: 14 }}>
                Request New Code
              </Text>
            </TouchableOpacity>
          </View>
        ) : null}

        {/* Error notification */}
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

        {/* Password input */}
        <View style={{ marginBottom: 16 }}>
          <Text style={{ color: DARK_TEXT, fontSize: 14, fontWeight: '600', marginBottom: 8 }}>
            New Password
          </Text>
          <View
            style={{
              backgroundColor: '#FFFFFF',
              flexDirection: 'row',
              alignItems: 'center',
              paddingHorizontal: 16,
              borderRadius: 20,
              borderWidth: 1,
              borderColor: '#E5E7EB',
              height: 60,
            }}
          >
            <Ionicons name="lock-closed-outline" size={22} color={LIGHT_TEXT} />
            <TextInput
              style={{ flex: 1, marginLeft: 12, color: DARK_TEXT, fontSize: 16 }}
              placeholder="Enter new password"
              placeholderTextColor={LIGHT_TEXT}
              value={password}
              onChangeText={(t) => {
                setPassword(t);
                setError('');
              }}
              secureTextEntry={!showPass}
              autoCapitalize="none"
              editable={!hasMissingToken && !loading}
            />
            <TouchableOpacity onPress={() => setShowPass(!showPass)}>
              <Ionicons
                name={showPass ? 'eye-off-outline' : 'eye-outline'}
                size={22}
                color={LIGHT_TEXT}
              />
            </TouchableOpacity>
          </View>

          {/* Strength bar */}
          {password ? (
            <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 8, gap: 6 }}>
              <View
                style={{
                  height: 4,
                  flex: 1,
                  backgroundColor: strength.score >= 1 ? strength.color : '#E5E7EB',
                  borderRadius: 2,
                }}
              />
              <View
                style={{
                  height: 4,
                  flex: 1,
                  backgroundColor: strength.score >= 2 ? strength.color : '#E5E7EB',
                  borderRadius: 2,
                }}
              />
              <View
                style={{
                  height: 4,
                  flex: 1,
                  backgroundColor: strength.score >= 3 ? strength.color : '#E5E7EB',
                  borderRadius: 2,
                }}
              />
              <Text
                style={{
                  color: strength.color,
                  fontSize: 12,
                  fontWeight: '700',
                  marginLeft: 4,
                }}
              >
                {strength.label}
              </Text>
            </View>
          ) : null}
        </View>

        {/* Confirm password input */}
        <View style={{ marginBottom: 24 }}>
          <Text style={{ color: DARK_TEXT, fontSize: 14, fontWeight: '600', marginBottom: 8 }}>
            Confirm Password
          </Text>
          <View
            style={{
              backgroundColor: '#FFFFFF',
              flexDirection: 'row',
              alignItems: 'center',
              paddingHorizontal: 16,
              borderRadius: 20,
              borderWidth: 1,
              borderColor: '#E5E7EB',
              height: 60,
            }}
          >
            <Ionicons name="lock-closed-outline" size={22} color={LIGHT_TEXT} />
            <TextInput
              style={{ flex: 1, marginLeft: 12, color: DARK_TEXT, fontSize: 16 }}
              placeholder="Confirm new password"
              placeholderTextColor={LIGHT_TEXT}
              value={confirmPassword}
              onChangeText={(t) => {
                setConfirmPassword(t);
                setError('');
              }}
              secureTextEntry={!showConfirmPass}
              autoCapitalize="none"
              returnKeyType="done"
              onSubmitEditing={handleReset}
              editable={!hasMissingToken && !loading}
            />
            <TouchableOpacity onPress={() => setShowConfirmPass(!showConfirmPass)}>
              <Ionicons
                name={showConfirmPass ? 'eye-off-outline' : 'eye-outline'}
                size={22}
                color={LIGHT_TEXT}
              />
            </TouchableOpacity>
          </View>
        </View>

        {/* Reset button */}
        <TouchableOpacity
          style={{
            backgroundColor: PURPLE,
            borderRadius: 24,
            height: 60,
            alignItems: 'center',
            justifyContent: 'center',
            opacity: loading || hasMissingToken ? 0.7 : 1,
          }}
          activeOpacity={0.8}
          onPress={handleReset}
          disabled={loading || hasMissingToken}
        >
          {loading ? (
            <ActivityIndicator color="#FFFFFF" size="small" />
          ) : (
            <Text style={{ color: '#FFFFFF', fontWeight: '700', fontSize: 18 }}>
              Update Password
            </Text>
          )}
        </TouchableOpacity>

        {/* Back to login */}
        <TouchableOpacity
          style={{ alignItems: 'center', marginTop: 24 }}
          onPress={() => router.replace('/(auth)')}
        >
          <Text style={{ color: LIGHT_TEXT, fontSize: 15 }}>
            Remembered your password?{' '}
            <Text style={{ color: PURPLE, fontWeight: '700' }}>Log In</Text>
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
