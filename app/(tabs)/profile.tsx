import { useEffect, useRef, useState } from 'react';
import { Alert, Pressable, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Ionicons } from '@expo/vector-icons';
import { updateProfile, verifyBeforeUpdateEmail } from 'firebase/auth';
import { collection, doc, getDoc, getDocs, setDoc, writeBatch } from 'firebase/firestore';

import ScoreBadge from '@/components/ScoreBadge';
import StatsSection from '@/components/StatsSection';
import { COLORS, neonGlow } from '@/constants/AppTheme';
import { FULL_TRICK_LIBRARY } from '@/constants/FullTrickLibrary';
import { useAuth } from '@/context/AuthContext';
import { db } from '@/lib/firebase';
import { getErrorMessage } from '@/utils/errors';

const AVATAR_COLORS = ['#00FFFF', '#FF00FF', '#00FF66', '#FFD700', '#FF0055', '#7B61FF'];

export default function ProfileScreen() {
  const { top } = useSafeAreaInsets();
  const { user, signOut, deleteAccount } = useAuth();
  const [seeding, setSeeding] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState('');
  const [isEditingEmail, setIsEditingEmail] = useState(false);
  const [editEmail, setEditEmail] = useState('');
  const [avatarColor, setAvatarColor] = useState('#00FFFF');
  const [streak, setStreak] = useState(0);
  const [deleteStep, setDeleteStep] = useState<'idle' | 'confirm' | 'reauth'>('idle');
  const [deletePassword, setDeletePassword] = useState('');
  const [deleteLoading, setDeleteLoading] = useState(false);
  const deletePasswordRef = useRef<TextInput>(null);

  useEffect(() => {
    if (!user) return;
    getDoc(doc(db, 'user_profiles', user.uid))
      .then((snap) => {
        if (snap.exists()) {
          const data = snap.data();
          setAvatarColor(data.avatarColor ?? '#00FFFF');
          setStreak(data.streakCount ?? 0);
        }
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
      // non-critical
    }
  };

  const handleDeleteAccount = () => {
    setDeletePassword('');
    setDeleteStep('reauth');
    setTimeout(() => deletePasswordRef.current?.focus(), 300);
  };

  const handleConfirmDelete = async () => {
    if (!deletePassword.trim()) return;
    Alert.alert(
      'Delete Account',
      'This will permanently delete your account and all your progress. This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete Forever',
          style: 'destructive',
          onPress: async () => {
            setDeleteLoading(true);
            try {
              await deleteAccount(deletePassword);
            } catch (err: unknown) {
              const code = (err as { code?: string }).code;
              setDeleteLoading(false);
              if (code === 'auth/wrong-password' || code === 'auth/invalid-credential') {
                Alert.alert('Incorrect password', 'Please check your password and try again.');
              } else {
                Alert.alert('Error', 'Failed to delete account. Please try again.');
              }
            }
          },
        },
      ],
    );
  };

  const seedDatabase = async () => {
    setSeeding(true);
    try {
      const batch = writeBatch(db);
      const tricksRef = collection(db, 'tricks');
      const existingSnapshot = await getDocs(tricksRef);
      existingSnapshot.forEach((document) => batch.delete(document.ref));
      FULL_TRICK_LIBRARY.forEach((trick) => {
        batch.set(doc(tricksRef), { ...trick, created_at: new Date() });
      });
      await batch.commit();
      Alert.alert('Success', 'Database restored with enriched trick data.');
    } catch (error: unknown) {
      Alert.alert('Error', getErrorMessage(error));
    } finally {
      setSeeding(false);
    }
  };

  return (
    <ScrollView
      className="flex-1 bg-background"
      contentContainerStyle={{ padding: 24, paddingTop: top + 8, paddingBottom: 60 }}
      showsVerticalScrollIndicator={false}
    >
      {/* ── Avatar ── */}
      <View className="items-center mb-8">
        <View
          className="w-[120px] h-[120px] rounded-full items-center justify-center border-2 mb-3"
          style={[{ backgroundColor: `${avatarColor}22`, borderColor: avatarColor }, neonGlow(`${avatarColor}80`, 20)]}
        >
          <Ionicons name="person" size={64} color={avatarColor} />
        </View>

        {/* Color swatches */}
        <View className="flex-row gap-3 mb-5">
          {AVATAR_COLORS.map((color) => (
            <TouchableOpacity
              key={color}
              onPress={() => handleSaveAvatarColor(color)}
              className="w-6 h-6 rounded-full border-2"
              style={{ backgroundColor: color, borderColor: avatarColor === color ? '#FFF' : 'transparent' }}
              accessibilityLabel={`Set avatar color${avatarColor === color ? ', currently selected' : ''}`}
              accessibilityState={{ selected: avatarColor === color }}
              accessibilityRole="button"
            />
          ))}
        </View>

        {/* Display name */}
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
            <TouchableOpacity onPress={handleEditName} accessibilityLabel="Edit display name" accessibilityRole="button">
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
            <TouchableOpacity
              onPress={() => { setEditEmail(user?.email ?? ''); setIsEditingEmail(true); }}
              accessibilityLabel="Edit email address"
              accessibilityRole="button"
            >
              <Ionicons name="pencil" size={14} color={COLORS.textDim} />
            </TouchableOpacity>
          </View>
        )}

        <ScoreBadge />
      </View>

      {/* ── Stats ── */}
      <StatsSection streak={streak} />

      {/* ── Actions ── */}
      <View className="gap-4 mt-8">
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
          <Text className="text-white text-lg font-bold tracking-widest">SIGN OUT</Text>
          <Ionicons name="log-out-outline" size={24} color="#FFF" style={{ marginLeft: 8 }} />
        </Pressable>

        {/* Delete Account */}
        {deleteStep === 'idle' ? (
          <Pressable
            className="items-center py-3"
            onPress={handleDeleteAccount}
            accessibilityLabel="Delete account"
            accessibilityRole="button"
          >
            <Text className="text-red-500/60 text-sm font-bold uppercase tracking-wider">
              Delete Account
            </Text>
          </Pressable>
        ) : (
          <View className="bg-red-500/10 border border-red-500/30 rounded-2xl p-4 gap-3">
            <Text className="text-red-400 text-sm font-bold text-center uppercase tracking-wider">
              Confirm your password to delete
            </Text>
            <TextInput
              ref={deletePasswordRef}
              value={deletePassword}
              onChangeText={setDeletePassword}
              placeholder="Password"
              placeholderTextColor={COLORS.textDim + '80'}
              secureTextEntry
              autoCapitalize="none"
              returnKeyType="done"
              onSubmitEditing={handleConfirmDelete}
              style={{
                backgroundColor: 'rgba(255,255,255,0.05)',
                borderWidth: 1,
                borderColor: 'rgba(255,80,80,0.3)',
                borderRadius: 10,
                padding: 12,
                color: COLORS.text,
                fontSize: 16,
              }}
            />
            <View className="flex-row gap-3">
              <TouchableOpacity
                className="flex-1 items-center py-3 rounded-xl bg-white/5"
                onPress={() => { setDeleteStep('idle'); setDeletePassword(''); }}
              >
                <Text className="text-textDim text-sm font-bold uppercase tracking-wider">Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                className="flex-1 items-center py-3 rounded-xl bg-red-500/20 border border-red-500/50"
                onPress={handleConfirmDelete}
                disabled={deleteLoading || !deletePassword.trim()}
                style={{ opacity: deleteLoading || !deletePassword.trim() ? 0.5 : 1 }}
              >
                <Text className="text-red-400 text-sm font-bold uppercase tracking-wider">
                  {deleteLoading ? 'Deleting…' : 'Delete Forever'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </View>
    </ScrollView>
  );
}
