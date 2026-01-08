import { Ionicons } from '@expo/vector-icons';
import { ActivityIndicator, FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { COLORS } from '@/constants/AppTheme';
import { useTricks } from '@/context/TrickContext';

export default function HomeScreen() {
  const { tricks, toggleTrickCompletion, loading } = useTricks();
  const insets = useSafeAreaInsets();

  const handleToggle = (trickId: string, completed: boolean) => {
    toggleTrickCompletion(trickId, completed);
  };

  if (loading && tricks.length === 0) {
    return (
      <View style={[styles.container, styles.centered]}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>LOADING TRICKS...</Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <FlatList
        data={tricks}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        renderItem={({ item }) => (
          <Pressable onPress={() => handleToggle(item.id, !!item.completed)}>
            <View style={[styles.card, item.completed && styles.cardCompleted]}>
                <View style={[styles.glowDot, item.completed && styles.glowDotCompleted]} />
                <View style={styles.textContainer}>
                    <Text style={[styles.trickName, item.completed && styles.textCompleted]}>{item.name}</Text>
                    <Text style={[styles.trickDesc, item.completed && styles.textCompleted]}>{item.description}</Text>
                </View>
                {item.completed && (
                    <Ionicons name="checkmark-circle" size={24} color={COLORS.success} />
                )}
            </View>
          </Pressable>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  centered: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: COLORS.primary,
    marginTop: 16,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  listContent: {
    padding: 16,
    paddingBottom: 100,
  },
  card: {
    backgroundColor: COLORS.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: COLORS.secondary,
    shadowColor: COLORS.secondary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 3,
    flexDirection: 'row',
    alignItems: 'center',
  },
  cardCompleted: {
    borderColor: COLORS.success,
    shadowColor: COLORS.success,
    backgroundColor: '#0D250D', // Dark Green tint
  },
  textContainer: {
    flex: 1,
    marginLeft: 12,
  },
  trickName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 4,
    textShadowColor: COLORS.secondary,
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 5,
  },
  trickDesc: {
    fontSize: 14,
    color: COLORS.textDim,
  },
  textCompleted: {
    color: '#88AA88',
    textDecorationLine: 'line-through',
  },
  glowDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.secondary,
    shadowColor: COLORS.secondary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 4,
  },
  glowDotCompleted: {
    backgroundColor: COLORS.success,
    shadowColor: COLORS.success,
  },
  fab: {
    position: 'absolute',
    bottom: 32,
    right: 24,
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 8,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.6,
    shadowRadius: 12,
    borderWidth: 2,
    borderColor: '#FFF',
  },
  fabText: {
    color: '#fff',
    fontSize: 36,
    marginTop: -4,
  },
});
