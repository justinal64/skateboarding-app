import { Link } from 'expo-router';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';

import { COLORS } from '@/constants/AppTheme';
import { useTricks } from '@/context/TrickContext';

export default function HomeScreen() {
  const { tricks } = useTricks();

  return (
    <View style={styles.container}>
      <FlatList
        data={tricks}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.item}>
            <View style={styles.itemHeader}>
               <View style={styles.glowDot} />
               <Text style={styles.itemTitle}>{item.name}</Text>
            </View>
            <Text style={styles.itemDesc}>{item.description}</Text>
            <View style={styles.checkIcon}>
               <Text style={styles.checkText}>✓</Text>
            </View>
          </View>
        )}
        style={styles.list}
      />

      <Link href="/add" asChild>
        <Pressable style={styles.fab}>
          <Text style={styles.fabText}>+</Text>
        </Pressable>
      </Link>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  list: {
    padding: 16,
  },
  item: {
    backgroundColor: COLORS.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: COLORS.secondary,
    shadowColor: COLORS.secondary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 8,
    elevation: 4,
  },
  itemHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  glowDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.secondary,
    marginRight: 8,
    shadowColor: COLORS.secondary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 4,
  },
  itemTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.text,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  itemDesc: {
    color: COLORS.textDim,
    fontSize: 14,
  },
  checkIcon: {
    position: 'absolute',
    right: 16,
    top: 16,
    width: 24,
    height: 24,
    borderWidth: 2,
    borderColor: COLORS.success,
    borderRadius: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkText: {
    color: COLORS.success,
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: -2,
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
