import { Link } from 'expo-router';
import { createUserWithEmailAndPassword, sendEmailVerification, updateProfile } from 'firebase/auth';
import { useState } from 'react';
import { Alert, Pressable, Text, TextInput, View } from 'react-native';

import NeonButton from '@/components/NeonButton';
import { COLORS, textGlow } from '@/constants/AppTheme';
import { auth } from '@/lib/firebase';
import { getUserFriendlyError } from '@/utils/errors';

export default function RegisterScreen() {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  async function signUp() {
    if (!firstName || !lastName) {
      Alert.alert('Missing Info', 'Please enter your first and last name.');
      return;
    }

    setLoading(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      await updateProfile(userCredential.user, {
        displayName: `${firstName} ${lastName}`,
      });
      await sendEmailVerification(userCredential.user);
    } catch (error: unknown) {
      Alert.alert('Registration Error', getUserFriendlyError(error));
    } finally {
      setLoading(false);
    }
  }

  return (
    <View className="flex-1 p-6 justify-center bg-background">
      <Text
        className="text-3xl font-bold text-primary text-center mb-12 tracking-widest"
        style={textGlow(COLORS.primary, 10)}
      >
        JOIN THE CREW
      </Text>

      <View className="flex-row justify-between">
        <View className="w-[48%] mb-6">
          <Text className="text-sm mb-2 font-bold text-textDim tracking-widest">FIRST NAME</Text>
          <TextInput
            className="border border-border bg-card rounded-xl p-4 text-base text-text"
            onChangeText={setFirstName}
            value={firstName}
            placeholder="Tony"
            placeholderTextColor={COLORS.textDim}
          />
        </View>
        <View className="w-[48%] mb-6">
          <Text className="text-sm mb-2 font-bold text-textDim tracking-widest">LAST NAME</Text>
          <TextInput
            className="border border-border bg-card rounded-xl p-4 text-base text-text"
            onChangeText={setLastName}
            value={lastName}
            placeholder="Hawk"
            placeholderTextColor={COLORS.textDim}
          />
        </View>
      </View>

      <View className="mb-6">
        <Text className="text-sm mb-2 font-bold text-textDim tracking-widest">EMAIL</Text>
        <TextInput
          className="border border-border bg-card rounded-xl p-4 text-base text-text"
          onChangeText={setEmail}
          value={email}
          placeholder="email@address.com"
          placeholderTextColor={COLORS.textDim}
          autoCapitalize="none"
        />
      </View>

      <View className="mb-6">
        <Text className="text-sm mb-2 font-bold text-textDim tracking-widest">PASSWORD</Text>
        <TextInput
          className="border border-border bg-card rounded-xl p-4 text-base text-text"
          onChangeText={setPassword}
          value={password}
          secureTextEntry
          placeholder="Password"
          placeholderTextColor={COLORS.textDim}
          autoCapitalize="none"
        />
      </View>

      <NeonButton
        label={loading ? 'CREATING...' : 'CREATE ACCOUNT'}
        onPress={signUp}
        disabled={loading}
      />

      <Link href="/login" asChild>
        <Pressable className="mt-6 items-center">
          <Text className="text-secondary font-bold text-sm tracking-widest">
            ALREADY HAVE AN ACCOUNT?
          </Text>
        </Pressable>
      </Link>
    </View>
  );
}
