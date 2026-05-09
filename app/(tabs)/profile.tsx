import { useState } from 'react';
import { Alert, Pressable, Text, TextInput, TouchableOpacity, View } from 'react-native';

import { Ionicons } from '@expo/vector-icons';
import { updateProfile } from 'firebase/auth';
import { collection, doc, getDocs, writeBatch } from 'firebase/firestore';

import ScoreBadge from '@/components/ScoreBadge';
import { COLORS, neonGlow } from '@/constants/AppTheme';
import { FULL_TRICK_LIBRARY } from '@/constants/FullTrickLibrary';
import { useAuth } from '@/context/AuthContext';
import { db } from '@/lib/firebase';
import { getErrorMessage } from '@/utils/errors';

export default function ProfileScreen() {
  const { user, signOut } = useAuth();
  const [seeding, setSeeding] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState('');

  const handleEditName = () => {
    setEditName(user?.displayName || '');
    setIsEditing(true);
  };

  const handleSaveName = async () => {
    if (!user || !editName.trim()) return;
    try {
      await updateProfile(user, { displayName: editName.trim() });
      setIsEditing(false);
    } catch {
      Alert.alert('Error', 'Failed to update display name.');
    }
  };

  const seedDatabase = async () => {
    setSeeding(true);
    try {
      const batch = writeBatch(db);
      const tricksRef = collection(db, 'tricks');

      // Delete all existing tricks to avoid duplicates
      const existingSnapshot = await getDocs(tricksRef);
      existingSnapshot.forEach((document) => {
        batch.delete(document.ref);
      });

      // Add new tricks
      FULL_TRICK_LIBRARY.forEach((trick) => {
        const docRef = doc(tricksRef);
        batch.set(docRef, {
          ...trick,
          created_at: new Date(),
        });
      });

      await batch.commit();
      Alert.alert('Success', 'Database restored with enriched trick data.');
    } catch (error: unknown) {
      console.error('Seed database error:', error);
      Alert.alert('Error', getErrorMessage(error));
    } finally {
      setSeeding(false);
    }
  };

  return (
    <View className="flex-1 bg-background p-6">
      <View className="items-center mt-10 mb-10">
        <View
          className="w-[120px] h-[120px] rounded-full bg-primary/10 items-center justify-center border-2 border-primary mb-4"
          style={neonGlow('rgba(255, 0, 255, 0.5)', 20)}
        >
          <Ionicons name="person" size={64} color={COLORS.primary} />
        </View>
        {isEditing ? (
          <View className="items-center mb-2">
            <TextInput
              value={editName}
              onChangeText={setEditName}
              className="text-2xl font-bold text-white text-center border-b border-primary pb-1 mb-3 min-w-[200px]"
              autoFocus
              returnKeyType="done"
              onSubmitEditing={handleSaveName}
            />
            <View className="flex-row gap-6">
              <TouchableOpacity onPress={() => setIsEditing(false)}>
                <Text className="text-textDim text-sm font-bold uppercase tracking-wider">Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={handleSaveName}>
                <Text className="text-primary text-sm font-bold uppercase tracking-wider">Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          <View className="flex-row items-center gap-2 mb-2">
            <Text className="text-3xl font-bold text-white text-center">
              {user?.displayName || 'Skater'}
            </Text>
            <TouchableOpacity onPress={handleEditName}>
              <Ionicons name="pencil" size={16} color={COLORS.textDim} />
            </TouchableOpacity>
          </View>
        )}
        <Text className="text-base text-textDim text-center mb-3">{user?.email}</Text>
        <ScoreBadge />
      </View>

      <View className="flex-1 justify-between pb-10">
        <View className="bg-card rounded-2xl p-6 items-center border border-secondary/30">
          <Ionicons
            name="trophy"
            size={32}
            color={COLORS.secondary}
            style={{ marginBottom: 16 }}
          />
          <Text className="text-lg font-bold text-secondary mb-2">
            Keep Skating!
          </Text>
          <Text className="text-sm text-textDim text-center">
            Track your progress in the other tabs.
          </Text>
        </View>

        <View className="gap-4">
          <Pressable
            className="bg-green-500/10 border border-secondary p-4 rounded-3xl items-center justify-center"
            onPress={seedDatabase}
            disabled={seeding}
          >
            <Text className="text-secondary text-base font-bold tracking-widest">
              {seeding ? 'RESTORING...' : 'RESTORE DEFAULT TRICKS'}
            </Text>
          </Pressable>

          <Pressable
            className="flex-row bg-red-500/20 border border-red-500/80 p-4 rounded-3xl items-center justify-center"
            onPress={signOut}
          >
            <Text className="text-white text-lg font-bold tracking-widest">
              SIGN OUT
            </Text>
            <Ionicons
              name="log-out-outline"
              size={24}
              color="#FFF"
              style={{ marginLeft: 8 }}
            />
          </Pressable>
        </View>
      </View>
    </View>
  );
}
