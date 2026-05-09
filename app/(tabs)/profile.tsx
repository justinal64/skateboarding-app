import { useEffect, useState } from 'react';
import { Alert, Pressable, Text, TextInput, TouchableOpacity, View } from 'react-native';

import { Ionicons } from '@expo/vector-icons';
import { updateProfile, verifyBeforeUpdateEmail } from 'firebase/auth';
import { collection, doc, getDoc, getDocs, setDoc, writeBatch } from 'firebase/firestore';

import ScoreBadge from '@/components/ScoreBadge';
import { COLORS, neonGlow } from '@/constants/AppTheme';
import { FULL_TRICK_LIBRARY } from '@/constants/FullTrickLibrary';
import { useAuth } from '@/context/AuthContext';
import { db } from '@/lib/firebase';
import { getErrorMessage } from '@/utils/errors';

const AVATAR_COLORS = ['#00FFFF', '#FF00FF', '#00FF66', '#FFD700', '#FF0055', '#7B61FF'];

export default function ProfileScreen() {
  const { user, signOut } = useAuth();
  const [seeding, setSeeding] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState('');
  const [isEditingEmail, setIsEditingEmail] = useState(false);
  const [editEmail, setEditEmail] = useState('');
  const [avatarColor, setAvatarColor] = useState('#00FFFF');

  useEffect(() => {
    if (!user) return;
    getDoc(doc(db, 'user_profiles', user.uid))
      .then((snap) => {
        if (snap.exists()) setAvatarColor(snap.data().avatarColor ?? '#00FFFF');
      })
      .catch(() => {});
  }, [user]);

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

  const handleSaveEmail = async () => {
    if (!user || !editEmail.trim()) return;
    try {
      await verifyBeforeUpdateEmail(user, editEmail.trim());
      setIsEditingEmail(false);
      Alert.alert(
        'Verification Sent',
        `A confirmation link has been sent to ${editEmail.trim()}. Your email will update once you click it.`,
      );
    } catch (err: unknown) {
      const code = (err as { code?: string }).code;
      if (code === 'auth/requires-recent-login') {
        Alert.alert('Sign in again', 'Please sign out and sign back in before changing your email.');
      } else if (code === 'auth/email-already-in-use') {
        Alert.alert('Error', 'That email is already in use.');
      } else {
        Alert.alert('Error', 'Failed to update email.');
      }
    }
  };

  const handleSaveAvatarColor = async (color: string) => {
    setAvatarColor(color);
    if (!user) return;
    try {
      await setDoc(doc(db, 'user_profiles', user.uid), { avatarColor: color }, { merge: true });
    } catch {
      // non-critical, ignore
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
        {/* Avatar */}
        <View
          className="w-[120px] h-[120px] rounded-full items-center justify-center border-2 mb-3"
          style={[{ backgroundColor: `${avatarColor}22`, borderColor: avatarColor }, neonGlow(`${avatarColor}80`, 20)]}
        >
          <Ionicons name="person" size={64} color={avatarColor} />
        </View>

        {/* Color Swatches */}
        <View className="flex-row gap-3 mb-5">
          {AVATAR_COLORS.map((color) => (
            <TouchableOpacity
              key={color}
              onPress={() => handleSaveAvatarColor(color)}
              className="w-6 h-6 rounded-full border-2"
              style={{ backgroundColor: color, borderColor: avatarColor === color ? '#FFF' : 'transparent' }}
            />
          ))}
        </View>

        {/* Display Name */}
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

        {/* Email */}
        {isEditingEmail ? (
          <View className="items-center mb-3">
            <TextInput
              value={editEmail}
              onChangeText={setEditEmail}
              className="text-base text-white text-center border-b border-primary pb-1 mb-3 min-w-[220px]"
              autoFocus
              keyboardType="email-address"
              autoCapitalize="none"
              returnKeyType="done"
              onSubmitEditing={handleSaveEmail}
            />
            <View className="flex-row gap-6">
              <TouchableOpacity onPress={() => setIsEditingEmail(false)}>
                <Text className="text-textDim text-sm font-bold uppercase tracking-wider">Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={handleSaveEmail}>
                <Text className="text-primary text-sm font-bold uppercase tracking-wider">Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          <View className="flex-row items-center gap-2 mb-3">
            <Text className="text-base text-textDim text-center">{user?.email}</Text>
            <TouchableOpacity onPress={() => { setEditEmail(user?.email ?? ''); setIsEditingEmail(true); }}>
              <Ionicons name="pencil" size={14} color={COLORS.textDim} />
            </TouchableOpacity>
          </View>
        )}

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
