import { COLORS, SHADOWS } from '@/constants/AppTheme';
import { Trick } from '@/types';
import { getTrickImage } from '@/utils/mockImages';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { Linking, Modal, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

type TrickDetailModalProps = {
  visible: boolean;
  onClose: () => void;
  trick: Trick | null;
  onAddToInProgress: (trick: Trick) => void;
  onPrerequisitePress?: (trickName: string) => void;
};

export default function TrickDetailModal({ visible, onClose, trick, onAddToInProgress, onPrerequisitePress }: TrickDetailModalProps) {
  if (!trick) return null;

  const imageUrl = getTrickImage(trick.id);

  // If trick is already in progress/completed, we might want to change the button
  // But user specifically asked for "add to my tricks in process list" logic.
  const isActionable = trick.status === 'NOT_STARTED';

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <View style={styles.centeredView}>
        {/* Backdrop - tap to close */}
        <TouchableOpacity style={styles.backdrop} activeOpacity={1} onPress={onClose} />

        <View style={styles.modalView}>
          <ScrollView contentContainerStyle={styles.scrollContent}>
            {/* Header Image */}
            <View style={styles.imageContainer}>
                <Image
                    source={{ uri: imageUrl }}
                    style={styles.image}
                    contentFit="cover"
                    transition={500}
                />
                <LinearGradient
                    colors={['transparent', '#0D0D25']}
                    style={styles.gradient}
                />
                <TouchableOpacity style={styles.closeButton} onPress={onClose}>
                    <Ionicons name="close-circle" size={32} color={COLORS.text} />
                </TouchableOpacity>
            </View>

            {/* Content */}
            <View style={styles.content}>
                <Text style={styles.title}>{trick.name}</Text>

                <View style={styles.badgeContainer}>
                    <View style={[
                        styles.badge,
                        trick.status === 'IN_PROGRESS' && styles.IN_PROGRESS,
                        trick.status === 'COMPLETED' && styles.COMPLETED,
                        trick.status === 'NOT_STARTED' && styles.NOT_STARTED
                    ]}>
                         <Text style={styles.badgeText}>{trick.status.replace('_', ' ')}</Text>
                    </View>
                    <View style={[styles.badge, styles.metaBadge]}>
                        <Text style={styles.badgeText}>{trick.difficulty}</Text>
                    </View>
                    <View style={[styles.badge, styles.metaBadge]}>
                        <Text style={styles.badgeText}>{trick.points} PTS</Text>
                    </View>
                </View>

                {/* Content */}
                {trick.prerequisites.length > 0 && (
                    <View style={styles.prereqContainer}>
                        <Text style={styles.prereqTitle}>Prerequisites:</Text>
                        <View style={styles.prereqList}>
                            {trick.prerequisites.map((p, i) => (
                                <TouchableOpacity
                                    key={i}
                                    style={styles.prereqBadge}
                                    onPress={() => onPrerequisitePress && onPrerequisitePress(p)}
                                >
                                    <Text style={styles.prereqText}>{p}</Text>
                                    <Ionicons name="link" size={12} color={COLORS.primary} style={{marginLeft: 4}}/>
                                </TouchableOpacity>
                            ))}
                        </View>
                    </View>
                )}

                <Text style={styles.description}>{trick.description}</Text>

                 {/* Video Link */}
                 {trick.video_url && (
                    <TouchableOpacity
                        style={styles.videoButton}
                        onPress={() => Linking.openURL(trick.video_url)}
                    >
                        <Ionicons name="logo-youtube" size={20} color="#FF0000" />
                        <Text style={styles.videoButtonText}>Watch Tutorial</Text>
                    </TouchableOpacity>
                )}

                {/* Action Button */}
                {isActionable ? (
                    <TouchableOpacity
                        style={styles.actionButton}
                        onPress={() => {
                            onAddToInProgress(trick);
                            onClose();
                        }}
                    >
                        <LinearGradient
                            colors={[COLORS.primary, COLORS.secondary]}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 0 }}
                            style={styles.actionButtonGradient}
                        >
                            <Text style={styles.actionButtonText}>Start Learning</Text>
                            <Ionicons name="arrow-forward" size={20} color="#fff" />
                        </LinearGradient>
                    </TouchableOpacity>
                ) : (
                    <View style={styles.statusMessage}>
                        <Ionicons
                            name={trick.status === 'COMPLETED' ? "checkmark-circle" : "time"}
                            size={24}
                            color={trick.status === 'COMPLETED' ? COLORS.success : COLORS.primary}
                        />
                        <Text style={styles.statusMessageText}>
                            {trick.status === 'COMPLETED' ? "You've mastered this trick!" : "Currently in progress"}
                        </Text>
                    </View>
                )}
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  centeredView: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.7)',
  },
  backdrop: {
      ...StyleSheet.absoluteFillObject,
  },
  modalView: {
    backgroundColor: '#0D0D25',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    width: '100%',
    height: '85%', // Bottom sheet style
    overflow: 'hidden',
    shadowColor: COLORS.secondary,
    shadowOffset: {
      width: 0,
      height: -4,
    },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 24,
    borderWidth: 1,
    borderColor: 'rgba(0, 255, 255, 0.2)',
  },
  scrollContent: {
      paddingBottom: 40,
  },
  imageContainer: {
      height: 300,
      width: '100%',
      position: 'relative',
  },
  image: {
      width: '100%',
      height: '100%',
  },
  gradient: {
      position: 'absolute',
      bottom: 0,
      left: 0,
      right: 0,
      height: 150,
  },
  closeButton: {
      position: 'absolute',
      top: 20,
      right: 20,
      backgroundColor: 'rgba(0,0,0,0.5)',
      borderRadius: 20,
      padding: 4,
  },
  content: {
      padding: 24,
      marginTop: -40, // overlap gradient
  },
  title: {
      fontSize: 32,
      fontWeight: '900',
      color: COLORS.text,
      marginBottom: 12,
      textShadowColor: COLORS.secondary,
      textShadowOffset: { width: 0, height: 0 },
      textShadowRadius: 10,
  },
  badgeContainer: {
      flexDirection: 'row',
      marginBottom: 24,
  },
  badge: {
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 8,
      backgroundColor: '#333',
  },
  NOT_STARTED: { backgroundColor: '#333' },
  IN_PROGRESS: { backgroundColor: 'rgba(255, 0, 255, 0.2)', borderWidth: 1, borderColor: COLORS.primary },
  COMPLETED: { backgroundColor: 'rgba(0, 255, 127, 0.2)', borderWidth: 1, borderColor: COLORS.success },
  badgeText: {
      color: COLORS.text,
      fontWeight: 'bold',
      fontSize: 12,
  },
  metaBadge: {
      backgroundColor: '#444',
      marginLeft: 8,
  },
  description: {
      fontSize: 16,
      color: COLORS.textDim,
      lineHeight: 24,
      marginBottom: 32,
  },
  actionButton: {
      width: '100%',
      ...SHADOWS.medium,
  },
  actionButtonGradient: {
      padding: 18,
      borderRadius: 16,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 10,
  },
  actionButtonText: {
      color: '#fff',
      fontSize: 18,
      fontWeight: 'bold',
      textTransform: 'uppercase',
  },
  statusMessage: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 10,
      padding: 16,
      backgroundColor: 'rgba(255,255,255,0.05)',
      borderRadius: 16,
      borderWidth: 1,
      borderColor: 'rgba(255,255,255,0.1)',
  },
  statusMessageText: {
      color: COLORS.text,
      fontSize: 16,
      fontWeight: '600',
  },
  prereqContainer: {
      marginBottom: 16,
  },
  prereqTitle: {
      color: COLORS.textDim,
      fontSize: 14,
      marginBottom: 8,
      textTransform: 'uppercase',
      fontWeight: 'bold',
  },
  prereqList: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 8,
  },
  prereqBadge: {
      backgroundColor: 'rgba(0, 255, 255, 0.1)',
      paddingHorizontal: 10,
      paddingVertical: 6,
      borderRadius: 20,
      borderWidth: 1,
      borderColor: COLORS.primary,
      flexDirection: 'row',
      alignItems: 'center',
  },
  prereqText: {
      color: COLORS.primary,
      fontWeight: 'bold',
      fontSize: 12,
  },
  videoButton: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      backgroundColor: 'rgba(255, 0, 0, 0.1)',
      alignSelf: 'flex-start',
      paddingHorizontal: 16,
      paddingVertical: 10,
      borderRadius: 20,
      marginBottom: 24,
      borderWidth: 1,
      borderColor: 'rgba(255, 0, 0, 0.3)',
  },
  videoButtonText: {
      color: '#FF9999',
      fontWeight: 'bold',
      fontSize: 14,
  },
});
