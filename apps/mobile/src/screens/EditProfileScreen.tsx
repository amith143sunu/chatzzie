import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Image,
} from 'react-native';
import {
  ArrowLeft,
  Camera,
  Check,
  User,
  MapPin,
  Heart,
  Globe,
  Save
} from 'lucide-react-native';
import { TOP_LANGUAGES } from '@chatzie/shared';
import { THEME } from '../theme';

interface EditProfileScreenProps {
  initialName?: string;
  initialPhone?: string;
  onBackPress: () => void;
  onSaveSuccess: (updatedData: any) => void;
}

const AVATAR_PRESETS = [
  'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80',
  'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&w=200&q=80',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80',
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
];

const MOODS = [
  { id: 'sleep', label: 'Cannot Sleep / Midnight Thoughts' },
  { id: 'stress', label: 'Exam / Work Stress' },
  { id: 'heartbreak', label: 'Heartbreak & Healing' },
  { id: 'chill', label: 'Just Vibing & Casual Talk' },
];

export const EditProfileScreen: React.FC<EditProfileScreenProps> = ({
  initialName = 'Amit',
  initialPhone = '8700788942',
  onBackPress,
  onSaveSuccess,
}) => {
  const [name, setName] = useState(initialName);
  const [city, setCity] = useState('New Delhi');
  const [selectedAvatar, setSelectedAvatar] = useState(AVATAR_PRESETS[0]);
  const [selectedMood, setSelectedMood] = useState('chill');
  const [selectedLangs, setSelectedLangs] = useState<string[]>(['Hindi', 'English']);

  const toggleLang = (lang: string) => {
    if (selectedLangs.includes(lang)) {
      setSelectedLangs(selectedLangs.filter(l => l !== lang));
    } else {
      setSelectedLangs([...selectedLangs, lang]);
    }
  };

  const handleSave = () => {
    onSaveSuccess({
      name,
      city,
      avatarUrl: selectedAvatar,
      mood: selectedMood,
      languages: selectedLangs,
    });
    onBackPress();
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={onBackPress} style={styles.backBtn}>
          <ArrowLeft size={22} color={THEME.colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Edit Profile</Text>
        <TouchableOpacity onPress={handleSave} style={styles.saveHeaderBtn}>
          <Text style={styles.saveHeaderText}>Save</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Avatar Selector */}
        <View style={styles.avatarSection}>
          <View style={styles.mainAvatarWrapper}>
            <Image source={{ uri: selectedAvatar }} style={styles.mainAvatar} />
            <View style={styles.cameraIconBadge}>
              <Camera size={14} color={THEME.colors.white} />
            </View>
          </View>
          <Text style={styles.avatarSub}>Choose Profile Avatar</Text>

          <View style={styles.presetRow}>
            {AVATAR_PRESETS.map((av, idx) => (
              <TouchableOpacity
                key={idx}
                onPress={() => setSelectedAvatar(av)}
                style={[
                  styles.presetThumb,
                  selectedAvatar === av && styles.presetThumbSelected
                ]}
              >
                <Image source={{ uri: av }} style={styles.presetImg} />
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Form Fields */}
        <View style={styles.formGroup}>
          <Text style={styles.label}>Full Name</Text>
          <View style={styles.inputBox}>
            <User size={18} color={THEME.colors.textMuted} />
            <TextInput
              style={styles.textInput}
              value={name}
              onChangeText={setName}
              placeholder="Your full name"
            />
          </View>
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>City / Location</Text>
          <View style={styles.inputBox}>
            <MapPin size={18} color={THEME.colors.textMuted} />
            <TextInput
              style={styles.textInput}
              value={city}
              onChangeText={setCity}
              placeholder="e.g. Mumbai, Delhi, Bangalore"
            />
          </View>
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Mobile Number (OTP Verified)</Text>
          <View style={[styles.inputBox, styles.inputDisabled]}>
            <Text style={styles.disabledText}>+91 {initialPhone}</Text>
          </View>
        </View>

        {/* Current Mood Section */}
        <View style={styles.formGroup}>
          <Text style={styles.label}>Current Mood</Text>
          <View style={styles.moodGrid}>
            {MOODS.map((m) => (
              <TouchableOpacity
                key={m.id}
                style={[styles.moodChip, selectedMood === m.id && styles.moodChipActive]}
                onPress={() => setSelectedMood(m.id)}
                activeOpacity={0.8}
              >
                <Text style={[styles.moodChipText, selectedMood === m.id && styles.moodChipTextActive]}>
                  {m.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Languages Selection */}
        <View style={styles.formGroup}>
          <Text style={styles.label}>Languages Spoken</Text>
          <View style={styles.langGrid}>
            {TOP_LANGUAGES.map((lang) => {
              const isSelected = selectedLangs.includes(lang);
              return (
                <TouchableOpacity
                  key={lang}
                  style={[styles.langTag, isSelected && styles.langTagActive]}
                  onPress={() => toggleLang(lang)}
                  activeOpacity={0.8}
                >
                  <Text style={[styles.langTagText, isSelected && styles.langTagTextActive]}>
                    {lang}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Save Button */}
        <TouchableOpacity style={styles.saveBtn} onPress={handleSave} activeOpacity={0.85}>
          <Save size={18} color={THEME.colors.white} />
          <Text style={styles.saveBtnText}>Save Profile Changes</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: THEME.colors.white,
  },
  header: {
    height: 60,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: THEME.colors.borderLight,
  },
  backBtn: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: THEME.colors.textPrimary,
  },
  saveHeaderBtn: {
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  saveHeaderText: {
    fontSize: 14,
    fontWeight: '800',
    color: THEME.colors.primary,
  },
  content: {
    padding: 20,
    paddingBottom: 40,
  },
  avatarSection: {
    alignItems: 'center',
    marginBottom: 24,
  },
  mainAvatarWrapper: {
    position: 'relative',
    marginBottom: 10,
  },
  mainAvatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 2.5,
    borderColor: THEME.colors.primary,
  },
  cameraIconBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: THEME.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: THEME.colors.white,
  },
  avatarSub: {
    fontSize: 12,
    color: THEME.colors.textSecondary,
    fontWeight: '600',
    marginBottom: 10,
  },
  presetRow: {
    flexDirection: 'row',
    gap: 12,
  },
  presetThumb: {
    padding: 2,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  presetThumbSelected: {
    borderColor: THEME.colors.primary,
  },
  presetImg: {
    width: 36,
    height: 36,
    borderRadius: 18,
  },
  formGroup: {
    marginBottom: 18,
  },
  label: {
    fontSize: 12,
    fontWeight: '700',
    color: THEME.colors.textSecondary,
    marginBottom: 6,
    textTransform: 'uppercase',
  },
  inputBox: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: THEME.colors.border,
    borderRadius: 12,
    paddingHorizontal: 14,
    height: 48,
    gap: 10,
    backgroundColor: THEME.colors.white,
  },
  inputDisabled: {
    backgroundColor: THEME.colors.borderLight,
    borderColor: THEME.colors.borderLight,
  },
  textInput: {
    flex: 1,
    fontSize: 14,
    color: THEME.colors.textPrimary,
    fontWeight: '600',
  },
  disabledText: {
    fontSize: 14,
    color: THEME.colors.textMuted,
    fontWeight: '600',
  },
  moodGrid: {
    gap: 8,
  },
  moodChip: {
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: THEME.colors.border,
    backgroundColor: THEME.colors.background,
  },
  moodChipActive: {
    borderColor: THEME.colors.primary,
    backgroundColor: THEME.colors.primaryBg,
  },
  moodChipText: {
    fontSize: 13,
    fontWeight: '600',
    color: THEME.colors.textPrimary,
  },
  moodChipTextActive: {
    color: THEME.colors.primary,
    fontWeight: '800',
  },
  langGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  langTag: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 8,
    backgroundColor: THEME.colors.borderLight,
  },
  langTagActive: {
    backgroundColor: THEME.colors.primary,
  },
  langTagText: {
    fontSize: 12,
    fontWeight: '600',
    color: THEME.colors.textSecondary,
  },
  langTagTextActive: {
    color: THEME.colors.white,
    fontWeight: '700',
  },
  saveBtn: {
    height: 50,
    backgroundColor: THEME.colors.primary,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 10,
  },
  saveBtnText: {
    color: THEME.colors.white,
    fontSize: 15,
    fontWeight: '800',
  }
});
