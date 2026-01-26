import { router } from 'expo-router';
import { useState } from 'react';
import { Alert, Pressable, Text, TextInput, View } from 'react-native';

import { COLORS } from '@/constants/AppTheme';

export default function AddTrickScreen() {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');

  const handleSubmit = () => {
    if (name && description) {
      // addTrick({ name, description }); // Disabled for curated list
      Alert.alert("Coming Soon", "We are currently using a curated list of tricks. Custom tricks will be available in a future update!");
      router.back();
    }
  };

  return (
    <View className="flex-1 p-6 bg-background">
      <View className="mb-6">
        <Text className="text-sm mb-2 font-bold text-textDim tracking-widest">TRICK NAME</Text>
        <TextInput
          className="border border-border bg-card rounded-xl p-4 text-base text-text"
          placeholder="e.g. Kickflip"
          placeholderTextColor={COLORS.textDim}
          value={name}
          onChangeText={setName}
        />

        <Text className="text-sm mb-2 font-bold text-textDim tracking-widest mt-6">DESCRIPTION</Text>
        <TextInput
          className="border border-border bg-card rounded-xl p-4 text-base text-text h-[120px] align-top"
          placeholder="How do you do it?"
          placeholderTextColor={COLORS.textDim}
          multiline
          numberOfLines={4}
          value={description}
          onChangeText={setDescription}
        />

        <Pressable
            className="bg-primary p-[18px] rounded-[30px] items-center mt-6 border border-white shadow-lg elevation-6"
            // @ts-ignore
            style={{ boxShadow: `0px 0px 10px rgba(255, 0, 255, 0.5)` }}
            onPress={handleSubmit}
        >
          <Text className="text-white text-lg font-bold tracking-widest">SAVE TRICK</Text>
        </Pressable>
      </View>
    </View>
  );
}
