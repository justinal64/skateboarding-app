import { Link } from 'expo-router';
import { useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import { COLORS } from '@/constants/AppTheme';
import { supabase } from '@/lib/supabase';

export default function RegisterScreen() {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  async function signUp() {
    if (!firstName || !lastName) {
        Alert.alert("Please enter your first and last name.");
        return;
    }

    setLoading(true);
    const {
      data: { session },
      error,
    } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
            first_name: firstName,
            last_name: lastName,
        }
      }
    });

    if (error) Alert.alert(error.message);
    else if (!session) Alert.alert('Please check your inbox for email verification!');

    setLoading(false);
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>JOIN THE CREW</Text>

      <View style={styles.row}>
        <View style={[styles.formGroup, styles.half]}>
            <Text style={styles.label}>FIRST NAME</Text>
            <TextInput
            style={styles.input}
            onChangeText={setFirstName}
            value={firstName}
            placeholder="Tony"
            placeholderTextColor={COLORS.textDim}
            />
        </View>
        <View style={[styles.formGroup, styles.half]}>
            <Text style={styles.label}>LAST NAME</Text>
            <TextInput
            style={styles.input}
            onChangeText={setLastName}
            value={lastName}
            placeholder="Hawk"
            placeholderTextColor={COLORS.textDim}
            />
        </View>
      </View>

      <View style={styles.formGroup}>
        <Text style={styles.label}>EMAIL</Text>
        <TextInput
          style={styles.input}
          onChangeText={setEmail}
          value={email}
          placeholder="email@address.com"
          placeholderTextColor={COLORS.textDim}
          autoCapitalize="none"
        />
      </View>

      <View style={styles.formGroup}>
        <Text style={styles.label}>PASSWORD</Text>
        <TextInput
          style={styles.input}
          onChangeText={setPassword}
          value={password}
          secureTextEntry={true}
          placeholder="Password"
          placeholderTextColor={COLORS.textDim}
          autoCapitalize="none"
        />
      </View>

      <Pressable
        style={[styles.button, loading && styles.buttonDisabled]}
        onPress={signUp}
        disabled={loading}
      >
        <Text style={styles.buttonText}>{loading ? 'CREATING...' : 'CREATE ACCOUNT'}</Text>
      </Pressable>

      <Link href="/login" asChild>
        <Pressable style={styles.linkButton}>
          <Text style={styles.linkText}>ALREADY HAVE AN ACCOUNT?</Text>
        </Pressable>
      </Link>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    justifyContent: 'center',
    backgroundColor: COLORS.background,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: COLORS.primary,
    textAlign: 'center',
    marginBottom: 48,
    textShadowColor: COLORS.primary,
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 10,
    letterSpacing: 2,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  half: {
    width: '48%',
  },
  formGroup: {
    marginBottom: 24,
  },
  label: {
    fontSize: 14,
    marginBottom: 8,
    fontWeight: 'bold',
    color: COLORS.textDim,
    letterSpacing: 1,
  },
  input: {
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.card,
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: COLORS.text,
  },
  button: {
    backgroundColor: COLORS.primary,
    padding: 18,
    borderRadius: 30,
    alignItems: 'center',
    marginTop: 24,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 10,
    elevation: 6,
    borderWidth: 1,
    borderColor: '#FFF',
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  linkButton: {
    marginTop: 24,
    alignItems: 'center',
  },
  linkText: {
    color: COLORS.secondary,
    fontWeight: 'bold',
    fontSize: 14,
    letterSpacing: 1,
  },
});
