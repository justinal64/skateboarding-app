import { Ionicons } from '@expo/vector-icons';
import { sendEmailVerification } from 'firebase/auth';
import { useState } from 'react';
import { Alert, Pressable, Text, View } from 'react-native';

import { COLORS } from '@/constants/AppTheme';
import { useAuth } from '@/context/AuthContext';
import { getUserFriendlyError } from '@/utils/errors';

export default function VerifyEmailScreen() {
  const { user, signOut } = useAuth();
  const [loading, setLoading] = useState(false);

  const checkVerification = async () => {
    setLoading(true);
    try {
      if (user) {
        await user.reload();
        if (user.emailVerified) {
          Alert.alert('Success!', 'Your email is verified. Redirecting...');
        } else {
          Alert.alert('Not Verified Yet', 'Please check your email and click the link.');
        }
      }
    } catch (error: unknown) {
      Alert.alert('Error checking status', getUserFriendlyError(error));
    } finally {
      setLoading(false);
    }
  };

  const resendEmail = async () => {
    setLoading(true);
    try {
      if (user) {
        await sendEmailVerification(user);
        Alert.alert('Email Sent', 'Check your inbox (and spam folder).');
      }
    } catch (error: unknown) {
      Alert.alert('Error', getUserFriendlyError(error));
    } finally {
      setLoading(false);
    }
  };

  return (
    <View className="flex-1 bg-background p-6 items-center justify-center">
      <Ionicons
        name="mail-unread-outline"
        size={80}
        color={COLORS.secondary}
        style={{ marginBottom: 24 }}
      />

      <Text className="text-[28px] font-bold text-white mb-4 text-center">
        Check Your Inbox
      </Text>
      <Text className="text-base text-textDim text-center mb-2">
        We sent a verification link to:
      </Text>
      <Text className="text-lg font-bold text-primary mb-6 text-center">
        {user?.email}
      </Text>
      <Text className="text-sm text-textDim text-center mb-12">
        You must verify your email before accessing the app.
      </Text>

      <Pressable
        className="bg-primary w-full p-4 rounded-xl items-center mb-4"
        onPress={checkVerification}
        disabled={loading}
      >
        <Text className="text-white text-base font-bold tracking-wider">
          {loading ? 'CHECKING...' : "I'VE VERIFIED IT"}
        </Text>
      </Pressable>

      <Pressable
        className="w-full p-4 rounded-xl items-center mb-6 border border-secondary"
        onPress={resendEmail}
        disabled={loading}
      >
        <Text className="text-secondary text-base font-bold tracking-wider">
          RESEND EMAIL
        </Text>
      </Pressable>

      <Pressable className="p-3" onPress={signOut}>
        <Text className="text-textDim text-sm underline">Sign Out</Text>
      </Pressable>
    </View>
  );
}
