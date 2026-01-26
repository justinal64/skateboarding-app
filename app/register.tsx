import { Link } from 'expo-router';
import { createUserWithEmailAndPassword, sendEmailVerification, updateProfile } from 'firebase/auth';
import { useState } from 'react';
import { Alert, Pressable, Text, TextInput, View } from 'react-native';

import { COLORS } from '@/constants/AppTheme';
import { auth } from '@/lib/firebase';

export default function RegisterScreen() {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  async function signUp() {
    if (!firstName || !lastName) {
      Alert.alert('Please enter your first and last name.');
      return;
    }

    setLoading(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      await updateProfile(userCredential.user, {
        displayName: `${firstName} ${lastName}`,
      });
      await sendEmailVerification(userCredential.user);
    } catch (error: any) {
      console.log('Registration Error:', error);
      console.log('Error Code:', error.code);
      console.log('Error Message:', error.message);
      Alert.alert('Error', error.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <View className="flex-1 p-6 justify-center bg-background">
      {/* @ts-ignore */}
      <Text className="text-3xl font-bold text-primary text-center mb-12 tracking-widest" style={{ textShadow: `0px 0px 10px ${COLORS.primary}` }}>JOIN THE CREW</Text>

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
          secureTextEntry={true}
          placeholder="Password"
          placeholderTextColor={COLORS.textDim}
          autoCapitalize="none"
        />
      </View>

      <Pressable
        className={`bg-primary p-[18px] rounded-[30px] items-center mt-6 border border-white shadow-lg elevation-6 ${loading ? 'opacity-70' : ''}`}
        // @ts-ignore
        style={{ boxShadow: `0px 0px 10px rgba(255, 0, 255, 0.5)` }}
        onPress={signUp}
        disabled={loading}
      >
        <Text className="text-white text-lg font-bold tracking-widest">{loading ? 'CREATING...' : 'CREATE ACCOUNT'}</Text>
      </Pressable>

      <Link href="/login" asChild>
        <Pressable className="mt-6 items-center">
          <Text className="text-secondary font-bold text-sm tracking-widest">ALREADY HAVE AN ACCOUNT?</Text>
        </Pressable>
      </Link>
    </View>
  );
}
