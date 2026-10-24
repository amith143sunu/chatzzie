import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
} from 'react-native';
import {
  User,
  Headphones,
  PhoneCall,
  Sparkles,
  CheckCircle2,
  X,
  ShieldCheck,
  ArrowRight
} from 'lucide-react-native';
import { THEME } from '../theme';
import { getApiBaseUrl } from '../services/apiConfig';

interface QuickAuthModalProps {
  visible: boolean;
  onClose: () => void;
  onLoginSuccess: (user: {
    id: string;
    name: string;
    role: 'talker' | 'listener';
    walletBalanceINR: number;
    avatarUrl: string;
    listenerProfile?: any;
  }) => void;
  currentRole?: 'talker' | 'listener';
  currentName?: string;
}

export const QuickAuthModal: React.FC<QuickAuthModalProps> = ({
  visible,
  onClose,
  onLoginSuccess,
  currentRole = 'talker',
  currentName = '',
}) => {
  const [name, setName] = useState(currentName || '');
  const [role, setRole] = useState<'talker' | 'listener'>(currentRole);
  const [phone, setPhone] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleContinue = async () => {
    const cleanName = name.trim();
    if (!cleanName) {
      setErrorMsg('Please enter your name to continue.');
      return;
    }
    setErrorMsg('');
    setIsLoading(true);

    try {
      const baseUrl = getApiBaseUrl();
      const res = await fetch(`${baseUrl}/api/auth/quick-signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: cleanName,
          role,
          phone: phone.trim() || undefined,
        }),
      });

      const data = await res.json();
      if (data.success && data.user) {
        if (typeof window !== 'undefined' && window.localStorage) {
          window.localStorage.setItem('chatzie_current_user', JSON.stringify(data.user));
        }
        onLoginSuccess(data.user);
        onClose();
      } else {
        // Fallback local user creation
        const localUser = {
          id: `u_${Date.now()}`,
          name: cleanName,
          role,
          walletBalanceINR: role === 'talker' ? 60 : 0,
          avatarUrl: `https://images.unsplash.com/photo-${role === 'listener' ? '1544005313-94ddf0286df2' : '1535713875002-d1d0cf377fde'}?auto=format&fit=crop&w=300&q=80`,
        };
        if (typeof window !== 'undefined' && window.localStorage) {
          window.localStorage.setItem('chatzie_current_user', JSON.stringify(localUser));
        }
        onLoginSuccess(localUser);
        onClose();
      }
    } catch (e) {
      const localUser = {
        id: `u_${Date.now()}`,
        name: cleanName,
        role,
        walletBalanceINR: role === 'talker' ? 60 : 0,
        avatarUrl: `https://images.unsplash.com/photo-${role === 'listener' ? '1544005313-94ddf0286df2' : '1535713875002-d1d0cf377fde'}?auto=format&fit=crop&w=300&q=80`,
      };
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.setItem('chatzie_current_user', JSON.stringify(localUser));
      }
      onLoginSuccess(localUser);
      onClose();
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.dialog}>
          {/* Close button */}
          <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
            <X size={20} color={THEME.colors.textSecondary} />
          </TouchableOpacity>

          {/* Header */}
          <View style={styles.header}>
            <View style={styles.iconCircle}>
              <Sparkles size={24} color={THEME.colors.primary} />
            </View>
            <Text style={styles.title}>Quick Sign-Up</Text>
            <Text style={styles.subtitle}>
              No OTP required. Enter your name and choose your role to test.
            </Text>
          </View>

          {/* Role selector */}
          <View style={styles.roleContainer}>
            <TouchableOpacity
              style={[styles.roleCard, role === 'talker' && styles.roleCardActive]}
              onPress={() => setRole('talker')}
              activeOpacity={0.85}
            >
              <View style={[styles.roleIconCircle, role === 'talker' && styles.roleIconCircleActive]}>
                <PhoneCall size={20} color={role === 'talker' ? THEME.colors.white : THEME.colors.primary} />
              </View>
              <Text style={[styles.roleTitle, role === 'talker' && styles.roleTitleActive]}>
                Caller (Talker)
              </Text>
              <Text style={styles.roleDesc}>
                Browse listeners, make voice/video calls, gets ₹60 starter wallet balance.
              </Text>
              {role === 'talker' && (
                <View style={styles.checkBadge}>
                  <CheckCircle2 size={16} color={THEME.colors.primary} />
                </View>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.roleCard, role === 'listener' && styles.roleCardActive]}
              onPress={() => setRole('listener')}
              activeOpacity={0.85}
            >
              <View style={[styles.roleIconCircle, role === 'listener' && styles.roleIconCircleActive]}>
                <Headphones size={20} color={role === 'listener' ? THEME.colors.white : THEME.colors.primary} />
              </View>
              <Text style={[styles.roleTitle, role === 'listener' && styles.roleTitleActive]}>
                Listener (Host)
              </Text>
              <Text style={styles.roleDesc}>
                Appear Online immediately, accept calls, earn ₹4.50/min voice, ₹16/min video.
              </Text>
              {role === 'listener' && (
                <View style={styles.checkBadge}>
                  <CheckCircle2 size={16} color={THEME.colors.primary} />
                </View>
              )}
            </TouchableOpacity>
          </View>

          {/* Name Input */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Your Name / Display Name</Text>
            <View style={styles.inputWrapper}>
              <User size={18} color={THEME.colors.textSecondary} style={{ marginRight: 8 }} />
              <TextInput
                style={styles.input}
                placeholder="e.g. Rahul, Priya, Amit, Sunita"
                placeholderTextColor="#94A3B8"
                value={name}
                onChangeText={(t) => {
                  setName(t);
                  if (errorMsg) setErrorMsg('');
                }}
                autoFocus
              />
            </View>
            {errorMsg ? <Text style={styles.errorText}>{errorMsg}</Text> : null}
          </View>

          {/* Action button */}
          <TouchableOpacity
            style={[styles.continueBtn, !name.trim() && styles.continueBtnDisabled]}
            onPress={handleContinue}
            disabled={isLoading || !name.trim()}
            activeOpacity={0.85}
          >
            {isLoading ? (
              <ActivityIndicator color={THEME.colors.white} size="small" />
            ) : (
              <>
                <Text style={styles.continueBtnText}>
                  {role === 'listener' ? 'Start as Live Listener' : 'Start as Caller (Get ₹60 Bonus)'}
                </Text>
                <ArrowRight size={18} color={THEME.colors.white} style={{ marginLeft: 6 }} />
              </>
            )}
          </TouchableOpacity>

          <View style={styles.securityFooter}>
            <ShieldCheck size={14} color="#10B981" />
            <Text style={styles.securityText}>Instant activation • Zero OTP required</Text>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.75)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  dialog: {
    width: '100%',
    maxWidth: 440,
    backgroundColor: THEME.colors.white,
    borderRadius: 24,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.15,
    shadowRadius: 24,
    elevation: 8,
  },
  closeBtn: {
    position: 'absolute',
    top: 18,
    right: 18,
    padding: 6,
    borderRadius: 20,
    backgroundColor: '#F1F5F9',
    zIndex: 10,
  },
  header: {
    alignItems: 'center',
    marginBottom: 20,
    marginTop: 4,
  },
  iconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#F3E8FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  title: {
    fontSize: 20,
    fontWeight: '800',
    color: THEME.colors.textPrimary,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 13,
    color: THEME.colors.textSecondary,
    textAlign: 'center',
    lineHeight: 18,
    paddingHorizontal: 12,
  },
  roleContainer: {
    gap: 10,
    marginBottom: 18,
  },
  roleCard: {
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    borderRadius: 16,
    padding: 14,
    backgroundColor: '#F8FAFC',
    position: 'relative',
  },
  roleCardActive: {
    borderColor: THEME.colors.primary,
    backgroundColor: '#FAF5FF',
  },
  roleIconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#EDE9FE',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  roleIconCircleActive: {
    backgroundColor: THEME.colors.primary,
  },
  roleTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: THEME.colors.textPrimary,
    marginBottom: 2,
  },
  roleTitleActive: {
    color: THEME.colors.primary,
  },
  roleDesc: {
    fontSize: 12,
    color: THEME.colors.textSecondary,
    lineHeight: 16,
  },
  checkBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
  },
  inputGroup: {
    marginBottom: 18,
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: THEME.colors.textPrimary,
    marginBottom: 6,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    paddingHorizontal: 14,
    backgroundColor: '#F8FAFC',
    height: 48,
  },
  input: {
    flex: 1,
    fontSize: 15,
    color: THEME.colors.textPrimary,
    fontWeight: '600',
  },
  errorText: {
    color: '#EF4444',
    fontSize: 12,
    marginTop: 4,
    fontWeight: '600',
  },
  continueBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: THEME.colors.primary,
    borderRadius: 14,
    height: 48,
    shadowColor: THEME.colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 3,
  },
  continueBtnDisabled: {
    opacity: 0.5,
  },
  continueBtnText: {
    color: THEME.colors.white,
    fontSize: 15,
    fontWeight: '700',
  },
  securityFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    marginTop: 12,
  },
  securityText: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '500',
  },
});
