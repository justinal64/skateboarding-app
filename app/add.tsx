import { router } from 'expo-router';
import { useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

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
    <View style={styles.container}>
      <View style={styles.formGroup}>
        <Text style={styles.label}>TRICK NAME</Text>
        <TextInput
          style={styles.input}
          placeholder="e.g. Kickflip"
          placeholderTextColor={COLORS.textDim}
          value={name}
          onChangeText={setName}
        />

        <Text style={styles.label}>DESCRIPTION</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          placeholder="How do you do it?"
          placeholderTextColor={COLORS.textDim}
          multiline
          numberOfLines={4}
          value={description}
          onChangeText={setDescription}
        />

        <Pressable style={styles.button} onPress={handleSubmit}>
          <Text style={styles.buttonText}>SAVE TRICK</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    backgroundColor: COLORS.background,
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
  textArea: {
    height: 120,
    textAlignVertical: 'top',
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
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
});
