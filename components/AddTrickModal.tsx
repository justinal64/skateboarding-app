import { COLORS } from '@/constants/AppTheme';
import { TrickCategory, TrickDifficulty, TrickMeta } from '@/types';
import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import {
    ActivityIndicator,
    Modal,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';

type AddTrickModalProps = {
  visible: boolean;
  onClose: () => void;
  onAddTrick: (trick: Omit<TrickMeta, 'id'>) => Promise<void>;
};

const DIFFICULTIES: TrickDifficulty[] = ['Easy', 'Intermediate', 'Advanced'];
const CATEGORIES: TrickCategory[] = ['Basics', 'Flip', 'Grind', 'Slide', 'Transition'];

export default function AddTrickModal({ visible, onClose, onAddTrick }: AddTrickModalProps) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [difficulty, setDifficulty] = useState<TrickDifficulty>('Easy');
  const [category, setCategory] = useState<TrickCategory>('Basics');
  const [points, setPoints] = useState('10');
  const [videoUrl, setVideoUrl] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const resetForm = () => {
    setName('');
    setDescription('');
    setDifficulty('Easy');
    setCategory('Basics');
    setPoints('10');
    setVideoUrl('');
    setImageUrl(''); // Optional
    setError('');
  };

  const handleSubmit = async () => {
    if (!name || !description) {
        setError('Name and description are required.');
        return;
    }

    setSubmitting(true);
    setError('');

    try {
        await onAddTrick({
            name,
            description,
            difficulty,
            category,
            points: parseInt(points, 10) || 10,
            video_url: videoUrl,
            imageUrl: imageUrl || 'https://via.placeholder.com/300', // Default or user input
            prerequisites: [], // Not implementing PREREQ UI for now as per plan
        });
        resetForm();
        onClose();
    } catch (e) {
        setError('Failed to add trick. Please try again.');
        console.error(e);
    } finally {
        setSubmitting(false);
    }
  };

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
            <View style={styles.header}>
                <Text style={styles.modalTitle}>New Trick</Text>
                <TouchableOpacity onPress={onClose}>
                    <Ionicons name="close" size={24} color={COLORS.textDim} />
                </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={styles.formScroll}>
                {error ? <Text style={styles.errorText}>{error}</Text> : null}

                <Text style={styles.label}>Trick Name</Text>
                <TextInput
                    style={styles.input}
                    placeholder="e.g. Kickflip"
                    placeholderTextColor={COLORS.textDim}
                    value={name}
                    onChangeText={setName}
                />

                <Text style={styles.label}>Description</Text>
                <TextInput
                    style={[styles.input, styles.textArea]}
                    placeholder="How do you do it?"
                    placeholderTextColor={COLORS.textDim}
                    value={description}
                    onChangeText={setDescription}
                    multiline
                />

                <Text style={styles.label}>Difficulty</Text>
                <View style={styles.chipsContainer}>
                    {DIFFICULTIES.map(diff => (
                        <TouchableOpacity
                            key={diff}
                            style={[
                                styles.chip,
                                difficulty === diff && styles.chipActive
                            ]}
                            onPress={() => setDifficulty(diff)}
                        >
                            <Text style={[
                                styles.chipText,
                                difficulty === diff && styles.chipTextActive
                            ]}>{diff}</Text>
                        </TouchableOpacity>
                    ))}
                </View>

                <Text style={styles.label}>Category</Text>
                 <View style={styles.chipsContainer}>
                    {CATEGORIES.map(cat => (
                        <TouchableOpacity
                            key={cat}
                            style={[
                                styles.chip,
                                category === cat && styles.chipActive
                            ]}
                             onPress={() => setCategory(cat)}
                        >
                            <Text style={[
                                styles.chipText,
                                category === cat && styles.chipTextActive
                            ]}>{cat}</Text>
                        </TouchableOpacity>
                    ))}
                </View>

                 <Text style={styles.label}>Points</Text>
                <TextInput
                    style={styles.input}
                    placeholder="10"
                    placeholderTextColor={COLORS.textDim}
                    value={points}
                    onChangeText={setPoints}
                    keyboardType="numeric"
                />

                <Text style={styles.label}>Video URL (Optional)</Text>
                 <TextInput
                    style={styles.input}
                    placeholder="https://..."
                    placeholderTextColor={COLORS.textDim}
                    value={videoUrl}
                    onChangeText={setVideoUrl}
                    autoCapitalize="none"
                />

            </ScrollView>

            <View style={styles.footer}>
                <TouchableOpacity style={styles.cancelButton} onPress={onClose}>
                    <Text style={styles.cancelButtonText}>Cancel</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={[styles.submitButton, submitting && styles.submitButtonDisabled]}
                    onPress={handleSubmit}
                    disabled={submitting}
                >
                    {submitting ? (
                        <ActivityIndicator color={COLORS.background} />
                    ) : (
                        <Text style={styles.submitButtonText}>Add Trick</Text>
                    )}
                </TouchableOpacity>
            </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#1E1E1E',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    height: '90%',
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: COLORS.secondary,
  },
  header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 20,
  },
  modalTitle: {
      fontSize: 24,
      fontWeight: 'bold',
      color: COLORS.text,
  },
  formScroll: {
      paddingBottom: 20,
  },
  label: {
      color: COLORS.textDim,
      fontSize: 14,
      fontWeight: '600',
      marginBottom: 8,
      marginTop: 12,
  },
  input: {
      backgroundColor: 'rgba(255,255,255,0.05)',
      borderRadius: 12,
      borderWidth: 1,
      borderColor: 'rgba(255,255,255,0.1)',
      padding: 12,
      color: COLORS.text,
      fontSize: 16,
  },
  textArea: {
      height: 100,
      textAlignVertical: 'top',
  },
  chipsContainer: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 8,
  },
  chip: {
      paddingHorizontal: 16,
      paddingVertical: 8,
      borderRadius: 20,
      backgroundColor: 'rgba(255,255,255,0.05)',
      borderWidth: 1,
      borderColor: 'rgba(255,255,255,0.1)',
  },
  chipActive: {
      backgroundColor: 'rgba(0, 255, 255, 0.15)',
      borderColor: COLORS.secondary,
  },
  chipText: {
      color: COLORS.textDim,
      fontSize: 14,
      fontWeight: '500',
  },
  chipTextActive: {
      color: COLORS.secondary,
      fontWeight: 'bold',
  },
  errorText: {
      color: '#FF4444',
      marginBottom: 10,
      fontSize: 14,
  },
  footer: {
      flexDirection: 'row',
      gap: 12,
      paddingTop: 16,
      borderTopWidth: 1,
      borderTopColor: 'rgba(255,255,255,0.1)',
  },
  cancelButton: {
      flex: 1,
      paddingVertical: 14,
      borderRadius: 12,
      backgroundColor: 'rgba(255,255,255,0.05)',
      alignItems: 'center',
  },
  cancelButtonText: {
      color: COLORS.textDim,
      fontWeight: 'bold',
      fontSize: 16,
  },
  submitButton: {
      flex: 2,
      paddingVertical: 14,
      borderRadius: 12,
      backgroundColor: COLORS.secondary,
      alignItems: 'center',
      shadowColor: COLORS.secondary,
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: 0.5,
      shadowRadius: 10,
  },
  submitButtonDisabled: {
      opacity: 0.7,
  },
  submitButtonText: {
      color: COLORS.background, // Dark text on bright button
      fontWeight: 'bold',
      fontSize: 16,
  },
});
