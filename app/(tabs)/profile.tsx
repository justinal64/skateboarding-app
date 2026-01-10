import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';

import { COLORS } from '@/constants/AppTheme';
import { useAuth } from '@/context/AuthContext';

import { INITIAL_TRICKS } from '@/constants/TrickData';
import { db } from '@/lib/firebase';
import { collection, doc, getDocs, writeBatch } from 'firebase/firestore';

export default function ProfileScreen() {
  const { user, signOut } = useAuth();
  const [seeding, setSeeding] = useState(false);

  const seedDatabase = async () => {
    setSeeding(true);
    try {
      const batch = writeBatch(db);
      const tricksRef = collection(db, 'tricks');

      // 1. Delete all existing tricks to avoid duplicates/schema mismatch
      const existingSnapshot = await getDocs(tricksRef);
      existingSnapshot.forEach((doc) => {
        batch.delete(doc.ref);
      });

      // 2. Add new tricks
      INITIAL_TRICKS.forEach((trick) => {
        const docRef = doc(tricksRef);
        batch.set(docRef, {
          ...trick,
          created_at: new Date(),
        });
      });

      await batch.commit();
      Alert.alert('Success', 'Database restored with enriched trick data.');
    } catch (error: any) {
      console.error(error);
      Alert.alert('Error', error.message);
    } finally {
      setSeeding(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.avatarContainer}>
          <Ionicons name="person" size={64} color={COLORS.primary} />
        </View>
        <Text style={styles.name}>{user?.displayName || 'Skater'}</Text>
        <Text style={styles.email}>{user?.email}</Text>
      </View>

      <View style={styles.content}>
        <View style={styles.statsCard}>
            <Ionicons name="trophy" size={32} color={COLORS.secondary} style={styles.statIcon} />
            <Text style={styles.statTitle}>Keep Skating!</Text>
            <Text style={styles.statDesc}>Track your progress in the other tabs.</Text>
        </View>

        <View style={{ gap: 16 }}>
          <Pressable style={styles.seedButton} onPress={seedDatabase} disabled={seeding}>
             <Text style={styles.seedText}>{seeding ? 'RESTORING...' : 'RESTORE DEFAULT TRICKS'}</Text>
          </Pressable>

          <Pressable style={styles.signOutButton} onPress={signOut}>
              <Text style={styles.signOutText}>SIGN OUT</Text>
              <Ionicons name="log-out-outline" size={24} color="#FFF" style={{ marginLeft: 8 }} />
          </Pressable>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    padding: 24,
  },
  header: {
    alignItems: 'center',
    marginTop: 40,
    marginBottom: 40,
  },
  avatarContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(255, 0, 255, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: COLORS.primary,
    marginBottom: 16,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
  },
  name: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFF',
    marginBottom: 8,
    textAlign: 'center',
  },
  email: {
    fontSize: 16,
    color: COLORS.textDim,
    textAlign: 'center',
  },
  content: {
    flex: 1,
    justifyContent: 'space-between',
    paddingBottom: 40,
  },
  statsCard: {
      backgroundColor: COLORS.card,
      borderRadius: 20,
      padding: 24,
      alignItems: 'center',
      borderWidth: 1,
      borderColor: 'rgba(0, 255, 255, 0.3)',
  },
  statIcon: {
      marginBottom: 16,
  },
  statTitle: {
      fontSize: 18,
      fontWeight: 'bold',
      color: COLORS.secondary,
      marginBottom: 8,
  },
  statDesc: {
      fontSize: 14,
      color: COLORS.textDim,
      textAlign: 'center',
  },
  seedButton: {
    backgroundColor: 'rgba(0, 255, 0, 0.1)',
    borderWidth: 1,
    borderColor: COLORS.secondary,
    padding: 18,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
  seedText: {
    color: COLORS.secondary,
    fontSize: 16,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  signOutButton: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255, 0, 50, 0.2)', // Red-ish tint
    borderWidth: 1,
    borderColor: 'rgba(255, 0, 50, 0.8)',
    padding: 18,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
  signOutText: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
});
