import { Ionicons } from '@expo/vector-icons';
import { sendEmailVerification } from 'firebase/auth';
import { useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';

import { COLORS } from '@/constants/AppTheme';
import { useAuth } from '@/context/AuthContext';

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
          // The Layout Guard will automatically handle the redirect when `user` changes
        } else {
            Alert.alert('Not Verified Yet', 'Please check your email and click the link.');
        }
      }
    } catch (e: any) {
        Alert.alert('Error checking status', e.message);
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
      } catch (e: any) {
         Alert.alert('Error', e.message);
      } finally {
          setLoading(false);
      }
  };

  return (
    <View style={styles.container}>
      <Ionicons name="mail-unread-outline" size={80} color={COLORS.secondary} style={styles.icon} />
      <Text style={styles.title}>Check Your Inbox</Text>
      <Text style={styles.text}>
        We sent a verification link to:
      </Text>
      <Text style={styles.email}>
        {user?.email}
      </Text>
      <Text style={styles.subtext}>
        You must verify your email before accessing the app.
      </Text>

      <Pressable style={styles.primaryButton} onPress={checkVerification} disabled={loading}>
          <Text style={styles.primaryButtonText}>{loading ? 'CHECKING...' : "I'VE VERIFIED IT"}</Text>
      </Pressable>

      <Pressable style={styles.secondaryButton} onPress={resendEmail} disabled={loading}>
          <Text style={styles.secondaryButtonText}>RESEND EMAIL</Text>
      </Pressable>

      <Pressable style={styles.textButton} onPress={signOut}>
          <Text style={styles.textButtonText}>Sign Out</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  icon: {
      marginBottom: 24,
  },
  title: {
      fontSize: 28,
      fontWeight: 'bold',
      color: '#FFF',
      marginBottom: 16,
      textAlign: 'center',
  },
  text: {
      fontSize: 16,
      color: COLORS.textDim,
      textAlign: 'center',
      marginBottom: 8,
  },
  email: {
      fontSize: 18,
      fontWeight: 'bold',
      color: COLORS.primary,
      marginBottom: 24,
      textAlign: 'center',
  },
  subtext: {
      fontSize: 14,
      color: COLORS.textDim,
      textAlign: 'center',
      marginBottom: 48,
  },
  primaryButton: {
      backgroundColor: COLORS.primary,
      width: '100%',
      padding: 16,
      borderRadius: 12,
      alignItems: 'center',
      marginBottom: 16,
  },
  primaryButtonText: {
      color: '#FFF',
      fontSize: 16,
      fontWeight: 'bold',
      letterSpacing: 1,
  },
  secondaryButton: {
      backgroundColor: 'transparent',
      width: '100%',
      padding: 16,
      borderRadius: 12,
      alignItems: 'center',
      marginBottom: 24,
      borderWidth: 1,
      borderColor: COLORS.secondary,
  },
  secondaryButtonText: {
      color: COLORS.secondary,
      fontSize: 16,
      fontWeight: 'bold',
      letterSpacing: 1,
  },
  textButton: {
      padding: 12,
  },
  textButtonText: {
      color: COLORS.textDim,
      fontSize: 14,
      textDecorationLine: 'underline',
  },
});
