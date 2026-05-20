import React, { useEffect, useState } from 'react';
import { Modal, Text, TouchableOpacity, View } from 'react-native';

import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { doc, getDoc } from 'firebase/firestore';

import { COLORS, neonGlow, textGlow } from '@/constants/AppTheme';
import { useAuth } from '@/context/AuthContext';
import { useUserScore } from '@/hooks/useUserScore';
import { db } from '@/lib/firebase';
import { useTrickStore } from '@/store/trickStore';

export default function ProfileDropdown() {
  const { user } = useAuth();
  const totalScore = useUserScore();
  const tricks = useTrickStore((state) => state.tricks);
  const router = useRouter();
  const [expanded, setExpanded] = useState(false);
  const [streak, setStreak] = useState(0);
  const [avatarColor, setAvatarColor] = useState('#00FFFF');

  useEffect(() => {
    if (!user) return;
    getDoc(doc(db, 'user_profiles', user.uid))
      .then((snap) => {
        if (snap.exists()) {
          setStreak(snap.data().streakCount ?? 0);
          setAvatarColor(snap.data().avatarColor ?? '#00FFFF');
        }
      })
      .catch(() => {});
  }, [user]);

  if (!user) return null;

  const displayName =
    user.displayName || (user.email ? user.email.split('@')[0].toUpperCase() : 'SKATER');
  const tricksCount = tricks.filter((t) => t.status === 'COMPLETED').length;

  // The small points badge used in both collapsed and expanded views
  const PointsBadge = () => (
    <View className="flex-row items-center bg-[#1A1A3A] px-1.5 py-px rounded border border-primary/40">
      <Ionicons name="star" size={8} color={COLORS.primary} className="mr-0.5" />
      <Text
        className="text-primary text-[9px] font-bold tracking-wider ml-0.5 mt-[1px]"
        style={textGlow(COLORS.primary, 5)}
      >
        {totalScore} PTS
      </Text>
    </View>
  );

  const firstLetter = displayName.charAt(0).toUpperCase();

  return (
    <>
      {/* Collapsed Button Stack */}
      <View className="items-center">
        <TouchableOpacity
          className="relative mb-1.5 rounded-full"
          onPress={() => router.push('/(tabs)/profile')}
          style={neonGlow(`${avatarColor}66`, 8)}
        >
          {/* Circular Avatar */}
          <LinearGradient
            colors={[avatarColor, '#FF00FF']}
            className="w-12 h-12 rounded-full items-center justify-center p-[2px]"
          >
            <View className="w-full h-full bg-[#111122] rounded-full items-center justify-center">
              <Text
                className="font-black tracking-widest text-lg"
                style={[{ color: avatarColor }, textGlow(avatarColor, 8)]}
              >
                {firstLetter}
              </Text>
            </View>
          </LinearGradient>

          {/* Online Dot */}
          <View
            className="absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full bg-[#00FF00] border-2 border-background"
            style={neonGlow('#00FF00', 5)}
          />
        </TouchableOpacity>

        {/* Points Badge (Below Avatar) */}
        <View
          className="flex-row items-center bg-[#1A1A3A] px-2 py-0.5 rounded-full border border-[#FFD700]/40"
          style={neonGlow('rgba(255, 215, 0, 0.2)', 5)}
        >
          <Ionicons name="star" size={8} color="#FFD700" className="mr-1" />
          <Text
            className="text-[#FFD700] text-[9px] font-bold tracking-wider ml-0.5"
            style={textGlow('#FFD700', 5)}
          >
            {totalScore} PTS
          </Text>
        </View>
      </View>

      {/* Expanded Modal */}
      <Modal visible={expanded} transparent animationType="fade">
        <View className="flex-1 bg-black/60 relative">
          <TouchableOpacity
            className="absolute inset-0"
            activeOpacity={1}
            onPress={() => setExpanded(false)}
          />

          <View
            className="absolute top-[60px] right-4 w-[320px] bg-[#111122] rounded-2xl border border-secondary/30 overflow-hidden"
            style={neonGlow('rgba(0, 255, 255, 0.2)', 15)}
          >
            {/* Top Stats Section */}
            <View className="p-5">
              <View className="flex-row items-center mb-4">
                <LinearGradient
                  colors={[avatarColor, '#FF00FF']}
                  className="w-[60px] h-[60px] rounded-full items-center justify-center mr-4 p-[3px]"
                >
                  <View className="w-full h-full bg-[#111122] rounded-full items-center justify-center">
                    <Ionicons name="person" size={28} color={avatarColor} />
                  </View>
                </LinearGradient>

                <View>
                  <Text
                    className="text-lg font-black tracking-widest mb-1"
                    style={[{ color: avatarColor }, textGlow(avatarColor, 8)]}
                  >
                    {displayName}
                  </Text>

                  <View className="flex-row items-center mt-0.5">
                    <PointsBadge />
                  </View>
                </View>
              </View>

              {/* Progress Bar Mock */}
              <View className="mb-6">
                <View className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
                  <View className="h-full w-[68%] bg-[#00FFFF]" />
                </View>
                <Text className="text-right text-textDim text-[10px] tracking-wider mt-1.5">
                  68% → NEXT LEVEL
                </Text>
              </View>

              {/* Stat Cards */}
              <View className="flex-row justify-between mb-4">
                <View className="bg-[#1A1A3A] border border-[#00FFFF]/30 rounded-xl py-3 px-2 flex-1 items-center mr-2">
                  <Text
                    className="text-[#00FFFF] text-lg font-black mb-1"
                    style={textGlow('#00FFFF', 8)}
                  >
                    {tricksCount}
                  </Text>
                  <Text className="text-textDim text-[9px] font-bold tracking-widest">TRICKS</Text>
                </View>

                <View className="bg-[#1A1A3A] border border-[#FF00FF]/30 rounded-xl py-3 px-2 flex-1 items-center mr-2">
                  <Text
                    className="text-[#FF00FF] text-lg font-black mb-1"
                    style={textGlow('#FF00FF', 8)}
                  >
                    {streak}d
                  </Text>
                  <Text className="text-textDim text-[9px] font-bold tracking-widest">STREAK</Text>
                </View>

                <View className="bg-[#1A1A3A] border border-[#FFD700]/30 rounded-xl py-3 px-2 flex-1 items-center">
                  <Text
                    className="text-[#FFD700] text-lg font-black mb-1"
                    style={textGlow('#FFD700', 8)}
                  >
                    {totalScore}
                  </Text>
                  <Text className="text-textDim text-[9px] font-bold tracking-widest">XP</Text>
                </View>
              </View>
            </View>

            {/* Bottom Section */}
            <View className="border-t border-white/5 p-4 flex-row items-center justify-between bg-black/20">
              <Text className="text-textDim text-[10px] tracking-wider">SKATEAPP v2.1.0</Text>

              <TouchableOpacity
                className="flex-row items-center border border-[#FF0055]/30 rounded-full px-3 py-1.5"
                onPress={() => setExpanded(false)}
              >
                <Text className="text-[#FF0055] text-[10px] font-bold tracking-widest mr-1">
                  CLOSE
                </Text>
                <Ionicons name="close" size={12} color="#FF0055" />
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
}
