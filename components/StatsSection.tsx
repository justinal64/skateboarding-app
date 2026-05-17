import React, { useEffect, useState } from 'react';
import { Text, View } from 'react-native';

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
  const showSessions = totalSessions !== null && (totalSessions > 0 || totalAttempts! > 0);

  const streakDays = Math.min(streak, 7);

  return (
    <View className="gap-5">
      {/* ── Quick stats ── */}
      <View className="flex-row gap-3">
        <StatCard label="Total XP" value={score.toLocaleString()} color={COLORS.secondary} />
        <StatCard label="Streak" value={`${streak}d`} color="#FFD700" />
        <StatCard
          label="Mastered"
          value={total > 0 ? `${completed}/${total}` : '—'}
          color={COLORS.success}
        />
      </View>

      {/* ── Streak visualization ── */}
      <View className="bg-card rounded-2xl border border-white/10 p-4">
        <Text className="text-textDim text-[10px] font-black uppercase tracking-widest mb-3">
          7-Day Streak
        </Text>
        <View className="flex-row justify-between">
          {Array.from({ length: 7 }, (_, i) => {
            const dayIndex = 7 - i;
            const filled = dayIndex <= streakDays;
            return (
              <View key={i} className="items-center gap-1.5">
                <View
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: 16,
                    backgroundColor: filled ? '#FFD700' : 'rgba(255,255,255,0.06)',
                    borderWidth: 1,
                    borderColor: filled ? '#FFD70066' : 'rgba(255,255,255,0.1)',
                    shadowColor: filled ? '#FFD700' : 'transparent',
                    shadowOpacity: filled ? 0.6 : 0,
                    shadowRadius: filled ? 6 : 0,
                    shadowOffset: { width: 0, height: 0 },
                  }}
                />
                <Text className="text-textDim text-[9px]" style={{ opacity: 0.5 }}>
                  {['S', 'M', 'T', 'W', 'T', 'F', 'S'][i]}
                </Text>
              </View>
            );
          })}
        </View>
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
                <Text className="text-xs font-bold" style={{ color }}>
                  {done} of {catTotal}
                </Text>
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

      {/* ── Session stats — hidden until data exists ── */}
      {showSessions && (
        <View className="flex-row gap-3">
          <StatCard
            label="Sessions"
            value={totalSessions!.toLocaleString()}
            color={COLORS.primary}
          />
          <StatCard
            label="Attempts"
            value={totalAttempts!.toLocaleString()}
            color={COLORS.secondary}
          />
        </View>
      )}
    </View>
  );
}

function StatCard({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <View className="flex-1 bg-card rounded-2xl border border-white/10 p-4 items-center gap-1">
      <Text className="text-white font-black text-xl" style={textGlow(color, 4)}>
        {value}
      </Text>
      <Text className="text-textDim text-[10px] font-black uppercase tracking-widest text-center">
        {label}
      </Text>
    </View>
  );
}
