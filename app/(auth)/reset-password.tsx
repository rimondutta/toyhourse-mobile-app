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
import { resetPassword } from '@/lib/api';

const PURPLE = '#8B5CF6';
const LIGHT_PURPLE = '#F9F5FF';
const DARK_TEXT = '#1F2937';
const LIGHT_TEXT = '#9CA3AF';

export default function ResetPasswordScreen() {
  const { resetToken } = useLocalSearchParams<{ resetToken: string }>();
  
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [showConfirmPass, setShowConfirmPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Basic strength indicator
  const getStrength = (pass: string) => {
    if (!pass) return { score: 0, label: '', color: '#E5E7EB' };
    let score = 0;
    if (pass.length >= 8) score += 1;
    if (/[A-Z]/.test(pass)) score += 1;
    if (/[0-9]/.test(pass)) score += 1;
    if (/[^A-Za-z0-9]/.test(pass)) score += 1;
    
    if (score < 2) return { score, label: 'Weak', color: '#EF4444' };
    if (score === 2 || score === 3) return { score, label: 'Good', color: '#F59E0B' };
    return { score, label: 'Strong', color: '#10B981' };
  };

  const strength = getStrength(password);

  const handleReset = async () => {
    if (!resetToken) {
      setError('Missing reset token. Please restart the process.');
      return;
    }

    if (password.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setError('');
    setLoading(true);

    try {
      await resetPassword(resetToken, password);
      // Success!
      Alert.alert(
        'Password Updated',
        'Your password has been successfully reset. You can now log in with your new password.',
        [
          { text: 'Log In', onPress: () => router.dismissAll() }
        ]
      );
    } catch (err: any) {
      const msg = err?.response?.data?.error ?? err?.message ?? 'Failed to reset password.';
      setError(msg);
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
        {/* Header */}
        <View style={{ alignItems: 'center', marginBottom: 36, marginTop: 20 }}>
          <View style={{ width: 100, height: 100, borderRadius: 50, backgroundColor: '#E9D5FF', alignItems: 'center', justifyContent: 'center', marginBottom: 24 }}>
            <Ionicons name="lock-closed-outline" size={48} color={PURPLE} />
          </View>
          <Text style={{ color: DARK_TEXT, fontSize: 28, fontWeight: '800', letterSpacing: -0.5, marginBottom: 8, textAlign: 'center' }}>
            New Password
          </Text>
          <Text style={{ color: LIGHT_TEXT, fontSize: 15, textAlign: 'center', lineHeight: 22 }}>
            Your new password must be at least 8 characters long.
          </Text>
        </View>

        {/* Error */}
        {error ? (
          <View style={{ backgroundColor: '#FEF2F2', borderWidth: 1, borderColor: '#FECACA', borderRadius: 16, padding: 12, marginBottom: 20, flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <Ionicons name="alert-circle" size={20} color="#EF4444" />
            <Text style={{ color: '#EF4444', fontSize: 14, fontWeight: '600', flex: 1 }}>{error}</Text>
          </View>
        ) : null}

        {/* Password Inputs */}
        <View style={{ gap: 20, marginBottom: 12 }}>
          {/* New Password */}
          <View>
            <View style={{ backgroundColor: '#FFFFFF', flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, borderRadius: 20, borderWidth: 1, borderColor: password ? (strength.score > 0 ? strength.color : '#E5E7EB') : '#E5E7EB', height: 60 }}>
              <Ionicons name="lock-closed-outline" size={22} color={LIGHT_TEXT} />
              <TextInput
                style={{ flex: 1, marginLeft: 12, color: DARK_TEXT, fontSize: 16 }}
                placeholder="New Password"
                placeholderTextColor={LIGHT_TEXT}
                value={password}
                onChangeText={(t) => { setPassword(t); setError(''); }}
                secureTextEntry={!showPass}
                returnKeyType="next"
              />
              <TouchableOpacity onPress={() => setShowPass(!showPass)} activeOpacity={0.7} style={{ padding: 4 }}>
                <Ionicons name={showPass ? 'eye-off-outline' : 'eye-outline'} size={22} color={LIGHT_TEXT} />
              </TouchableOpacity>
            </View>
            
            {/* Strength Indicator */}
            {password.length > 0 && (
              <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 8, paddingHorizontal: 4, gap: 8 }}>
                <View style={{ flex: 1, height: 4, borderRadius: 2, backgroundColor: strength.score >= 1 ? strength.color : '#E5E7EB' }} />
                <View style={{ flex: 1, height: 4, borderRadius: 2, backgroundColor: strength.score >= 2 ? strength.color : '#E5E7EB' }} />
                <View style={{ flex: 1, height: 4, borderRadius: 2, backgroundColor: strength.score >= 3 ? strength.color : '#E5E7EB' }} />
                <View style={{ flex: 1, height: 4, borderRadius: 2, backgroundColor: strength.score >= 4 ? strength.color : '#E5E7EB' }} />
                <Text style={{ fontSize: 12, fontWeight: '600', color: strength.color, marginLeft: 4, width: 45 }}>
                  {strength.label}
                </Text>
              </View>
            )}
          </View>

          {/* Confirm Password */}
          <View>
            <View style={{ backgroundColor: '#FFFFFF', flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, borderRadius: 20, borderWidth: 1, borderColor: (confirmPassword && password !== confirmPassword) ? '#EF4444' : '#E5E7EB', height: 60 }}>
              <Ionicons name="checkmark-circle-outline" size={22} color={LIGHT_TEXT} />
              <TextInput
                style={{ flex: 1, marginLeft: 12, color: DARK_TEXT, fontSize: 16 }}
                placeholder="Confirm Password"
                placeholderTextColor={LIGHT_TEXT}
                value={confirmPassword}
                onChangeText={(t) => { setConfirmPassword(t); setError(''); }}
                secureTextEntry={!showConfirmPass}
                returnKeyType="done"
                onSubmitEditing={handleReset}
              />
              <TouchableOpacity onPress={() => setShowConfirmPass(!showConfirmPass)} activeOpacity={0.7} style={{ padding: 4 }}>
                <Ionicons name={showConfirmPass ? 'eye-off-outline' : 'eye-outline'} size={22} color={LIGHT_TEXT} />
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Reset button */}
        <TouchableOpacity
          style={{ backgroundColor: PURPLE, borderRadius: 24, height: 60, alignItems: 'center', justifyContent: 'center', opacity: loading ? 0.8 : 1, marginTop: 12 }}
          activeOpacity={0.8}
          onPress={handleReset}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#FFFFFF" size="small" />
          ) : (
            <Text style={{ color: '#FFFFFF', fontWeight: '700', fontSize: 18 }}>Reset Password</Text>
          )}
        </TouchableOpacity>

      </ScrollView>
    </KeyboardAvoidingView>
  );
}
