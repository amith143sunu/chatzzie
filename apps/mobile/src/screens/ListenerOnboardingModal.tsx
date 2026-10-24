import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  TextInput,
  ScrollView,
} from 'react-native';
import {
  X,
  Mic,
  Square,
  Play,
  FileCheck,
  CheckCircle2,
  Headphones,
  ShieldCheck
} from 'lucide-react-native';
import { THEME } from '../theme';
import { getApiBaseUrl } from '../services/apiConfig';

interface ListenerOnboardingModalProps {
  visible: boolean;
  onClose: () => void;
  onSubmitSuccess: () => void;
}

export const ListenerOnboardingModal: React.FC<ListenerOnboardingModalProps> = ({
  visible,
  onClose,
  onSubmitSuccess,
}) => {
  const [step, setStep] = useState(1);
  const [isRecording, setIsRecording] = useState(false);
  const [recordedAudio, setRecordedAudio] = useState<boolean>(false);
  const [bio, setBio] = useState('');
  const [panNumber, setPanNumber] = useState('');
  const [upiId, setUpiId] = useState('');

  const handleRecordToggle = () => {
    if (isRecording) {
      setIsRecording(false);
      setRecordedAudio(true);
    } else {
      setIsRecording(true);
    }
  };

  const handleSubmit = async () => {
    try {
      const baseUrl = getApiBaseUrl();
      await fetch(`${baseUrl}/api/listeners/kyc`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: 'Amit Kumar',
          username: 'amit_connect',
          phone: '8700788942',
          languages: ['Hindi', 'English'],
          bio: bio || 'Compassionate listener eager to connect and support.',
          panNumber: panNumber || 'ABCDE1234F',
          upiId: upiId || 'amit@okaxis',
          isVideoEnabled: true,
        }),
      });
    } catch (e) {}

    onSubmitSuccess();
    onClose();
  };

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <Headphones size={20} color={THEME.colors.primary} />
            <Text style={styles.headerTitle}>Become a Verified Listener</Text>
          </View>
          <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
            <X size={20} color={THEME.colors.textSecondary} />
          </TouchableOpacity>
        </View>

        <ScrollView contentContainerStyle={styles.content}>
          {/* Step 1: Voice Intro Recording */}
          <View style={styles.stepCard}>
            <View style={styles.stepHeader}>
              <View style={styles.stepNumberBadge}><Text style={styles.stepNumberText}>1</Text></View>
              <Text style={styles.stepTitle}>Record Voice Introduction</Text>
            </View>
            <Text style={styles.stepDesc}>
              Callers listen to your voice sample before initiating a call. Record 15–30 seconds introducing yourself in a calm, welcoming tone.
            </Text>

            <View style={styles.recordingArea}>
              <TouchableOpacity
                style={[styles.recordBtn, isRecording && styles.recordBtnActive]}
                onPress={handleRecordToggle}
                activeOpacity={0.85}
              >
                {isRecording ? (
                  <Square size={24} color={THEME.colors.white} />
                ) : (
                  <Mic size={24} color={THEME.colors.white} />
                )}
              </TouchableOpacity>
              <Text style={styles.recordStatusText}>
                {isRecording ? 'Recording... Tap to Stop' : recordedAudio ? 'Voice Intro Captured (22s)' : 'Tap to Start Recording'}
              </Text>
            </View>
          </View>

          {/* Step 2: Bio & Profile */}
          <View style={styles.stepCard}>
            <View style={styles.stepHeader}>
              <View style={styles.stepNumberBadge}><Text style={styles.stepNumberText}>2</Text></View>
              <Text style={styles.stepTitle}>Bio & Specializations</Text>
            </View>
            <TextInput
              style={styles.textArea}
              placeholder="e.g. Empathetic listener passionate about psychology, active listening, and helping people overcome loneliness."
              placeholderTextColor={THEME.colors.textMuted}
              multiline
              numberOfLines={3}
              value={bio}
              onChangeText={setBio}
            />
          </View>

          {/* Step 3: Government KYC (PAN) */}
          <View style={styles.stepCard}>
            <View style={styles.stepHeader}>
              <View style={styles.stepNumberBadge}><Text style={styles.stepNumberText}>3</Text></View>
              <Text style={styles.stepTitle}>Government KYC & Payout Details</Text>
            </View>
            <Text style={styles.stepDesc}>
              Required by Indian financial compliance for RazorpayX earnings payouts.
            </Text>

            <TextInput
              style={styles.inputField}
              placeholder="Permanent Account Number (PAN) e.g. ABCDE1234F"
              placeholderTextColor={THEME.colors.textMuted}
              autoCapitalize="characters"
              maxLength={10}
              value={panNumber}
              onChangeText={setPanNumber}
            />

            <TextInput
              style={[styles.inputField, { marginTop: 10 }]}
              placeholder="Payout UPI ID e.g. yourname@oksbi"
              placeholderTextColor={THEME.colors.textMuted}
              autoCapitalize="none"
              value={upiId}
              onChangeText={setUpiId}
            />
          </View>

          {/* Submit Application */}
          <TouchableOpacity
            style={styles.submitBtn}
            onPress={handleSubmit}
            activeOpacity={0.85}
          >
            <FileCheck size={18} color={THEME.colors.white} />
            <Text style={styles.submitBtnText}>Submit KYC for Admin Approval</Text>
          </TouchableOpacity>
        </ScrollView>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: THEME.colors.background,
  },
  header: {
    height: 60,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    backgroundColor: THEME.colors.white,
    borderBottomWidth: 1,
    borderBottomColor: THEME.colors.borderLight,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: THEME.colors.textPrimary,
  },
  closeBtn: {
    padding: 4,
  },
  content: {
    padding: 16,
    paddingBottom: 40,
  },
  stepCard: {
    backgroundColor: THEME.colors.white,
    borderRadius: 16,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: THEME.colors.border,
  },
  stepHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 6,
  },
  stepNumberBadge: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: THEME.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepNumberText: {
    color: THEME.colors.white,
    fontSize: 11,
    fontWeight: '800',
  },
  stepTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: THEME.colors.textPrimary,
  },
  stepDesc: {
    fontSize: 12,
    color: THEME.colors.textSecondary,
    lineHeight: 18,
    marginBottom: 12,
  },
  recordingArea: {
    alignItems: 'center',
    paddingVertical: 14,
    backgroundColor: THEME.colors.primaryBg,
    borderRadius: 12,
  },
  recordBtn: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: THEME.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  recordBtnActive: {
    backgroundColor: THEME.colors.red,
  },
  recordStatusText: {
    fontSize: 12,
    fontWeight: '700',
    color: THEME.colors.textPrimary,
    marginTop: 10,
  },
  textArea: {
    borderWidth: 1.5,
    borderColor: THEME.colors.border,
    borderRadius: 10,
    padding: 12,
    fontSize: 13,
    color: THEME.colors.textPrimary,
    textAlignVertical: 'top',
  },
  inputField: {
    borderWidth: 1.5,
    borderColor: THEME.colors.border,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 13,
    color: THEME.colors.textPrimary,
  },
  submitBtn: {
    height: 50,
    backgroundColor: THEME.colors.primary,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 10,
  },
  submitBtnText: {
    color: THEME.colors.white,
    fontSize: 15,
    fontWeight: '800',
  }
});
