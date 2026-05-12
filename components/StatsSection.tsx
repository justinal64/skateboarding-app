import React, { useEffect, useState } from 'react';
import { Text, View } from 'react-native';

import { Ionicons } from '@expo/vector-icons';
import { collection, getDocs, query, where } from 'firebase/firestore';

import { COLORS, textGlow } from '@/constants/AppTheme';
import { useAuth } from '@/context/AuthContext';
import { useUserScore } from '@/hooks/useUserScore';
import { db } from '@/lib/firebase';
import { useTrickStore } from '@/store/trickStore';
import { TrickCategory } from '@/types';

const CATEGORIES: TrickCategory[] = ['Basics', 'Flip', 'Grind', 'Slide', 'Transition'];

const CATEGORY_COLOR: Record<TrickCategory, string> = {
  Basics: COLORS.success,
  Flip: COLORS.primary,
  Grind: COLORS.secondary,
  Slide: '#FFD700',
  Transition: '#FF6B00',
};

type Props = { streak: number };

export default function StatsSection({ streak }: Props) {
  const { user } = useAuth();
  const tricks = useTrickStore((state) => state.tricks);
  const score = useUserScore();

  const [totalSessions, setTotalSessions] = useState<number | null>(null);
  const [totalAttempts, setTotalAttempts] = useState<number | null>(null);

  useEffect(() => {
    if (!user) return;
    getDocs(query(collection(db, 'sessions'), where('userId', '==', user.uid)))
      .then((snap) => {
        setTotalSessions(snap.size);
        setTotalAttempts(snap.docs.reduce((sum, d) => sum + (d.data().attempts ?? 0), 0));
      })
      .catch(() => {
        setTotalSessions(0);
        setTotalAttempts(0);
      });
  }, [user]);

  const completed = tricks.filter((t) => t.status === 'COMPLETED').length;
  const total = tricks.length;

  return (
    <View className="gap-5">
      {/* ── Quick stats ── */}
      <View className="flex-row gap-3">
        <StatCard label="Total XP" value={score.toLocaleString()} icon="flash" color={COLORS.secondary} />
        <StatCard label="Streak" value={`${streak}d`} icon="flame" color="#FFD700" />
        <StatCard
          label="Mastered"
          value={total > 0 ? `${completed}/${total}` : '—'}
          icon="checkmark-circle"
          color={COLORS.success}
        />
      </View>

      {/* ── Progress by category ── */}
      <View className="bg-card rounded-2xl border border-white/10 p-4 gap-4">
        <Text className="text-textDim text-[10px] font-black uppercase tracking-widest">
          Progress by Category
        </Text>
        {CATEGORIES.map((cat) => {
          const catTricks = tricks.filter((t) => t.category === cat);
          const done = catTricks.filter((t) => t.status === 'COMPLETED').length;
          const catTotal = catTricks.length;
          const pct = catTotal > 0 ? done / catTotal : 0;
          const color = CATEGORY_COLOR[cat];
          return (
            <View key={cat}>
              <View className="flex-row justify-between mb-1.5">
                <Text className="text-white text-xs font-bold">{cat}</Text>
                <Text className="text-textDim text-xs">{done}/{catTotal}</Text>
              </View>
              <View className="h-2 rounded-full overflow-hidden bg-white/10">
                <View
                  className="h-full rounded-full"
                  style={{ width: `${pct * 100}%`, backgroundColor: color }}
                />
              </View>
            </View>
          );
        })}
      </View>

      {/* ── Session stats ── */}
      <View className="flex-row gap-3">
        <StatCard
          label="Sessions"
          value={totalSessions === null ? '—' : totalSessions.toLocaleString()}
          icon="time"
          color={COLORS.primary}
        />
        <StatCard
          label="Attempts"
          value={totalAttempts === null ? '—' : totalAttempts.toLocaleString()}
          icon="repeat"
          color={COLORS.secondary}
        />
      </View>
    </View>
  );
}

function StatCard({
  label,
  value,
  icon,
  color,
}: {
  label: string;
  value: string;
  icon: React.ComponentProps<typeof Ionicons>['name'];
  color: string;
}) {
  return (
    <View className="flex-1 bg-card rounded-2xl border border-white/10 p-4 items-center gap-1.5">
      <Ionicons name={icon} size={20} color={color} />
      <Text className="text-white font-black text-xl" style={textGlow(color, 4)}>
        {value}
      </Text>
      <Text className="text-textDim text-[10px] font-black uppercase tracking-widest text-center">
        {label}
      </Text>
    </View>
  );
}
