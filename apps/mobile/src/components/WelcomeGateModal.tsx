import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Image,
} from 'react-native';
import {
  User,
  Headphones,
  PhoneCall,
  Sparkles,
  CheckCircle2,
  ShieldCheck,
  ArrowRight,
  Heart,
  Coins,
  IndianRupee
} from 'lucide-react-native';
import { THEME } from '../theme';
import { getApiBaseUrl } from '../services/apiConfig';

interface WelcomeGateModalProps {
  visible: boolean;
  onComplete: (user: {
    id: string;
    name: string;
    username: string;
    role: 'talker' | 'listener';
    walletBalanceINR: number;
    avatarUrl: string;
  }) => void;
}

export const WelcomeGateModal: React.FC<WelcomeGateModalProps> = ({
  visible,
  onComplete,
}) => {
  const [role, setRole] = useState<'talker' | 'listener'>('talker');
  const [name, setName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleStart = async () => {
    const cleanName = name.trim();
    if (!cleanName) {
      setErrorMsg('Please enter your name to proceed.');
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
        }),
      });

      const data = await res.json();
      if (data.success && data.user) {
        if (typeof window !== 'undefined' && window.localStorage) {
          window.localStorage.setItem('chatzie_user_profile', JSON.stringify(data.user));
        }
        onComplete(data.user);
      } else {
        const localUser = {
          id: `u_${Date.now()}`,
          name: cleanName,
          username: cleanName.toLowerCase().replace(/[^a-z0-9]/g, '_') + '_' + Math.floor(100 + Math.random() * 900),
          role,
          walletBalanceINR: role === 'talker' ? 60 : 0,
          avatarUrl: `https://images.unsplash.com/photo-${role === 'listener' ? '1544005313-94ddf0286df2' : '1535713875002-d1d0cf377fde'}?auto=format&fit=crop&w=300&q=80`,
        };
        if (typeof window !== 'undefined' && window.localStorage) {
          window.localStorage.setItem('chatzie_user_profile', JSON.stringify(localUser));
        }
        onComplete(localUser);
      }
    } catch (e) {
      const localUser = {
        id: `u_${Date.now()}`,
        name: cleanName,
        username: cleanName.toLowerCase().replace(/[^a-z0-9]/g, '_') + '_' + Math.floor(100 + Math.random() * 900),
        role,
        walletBalanceINR: role === 'talker' ? 60 : 0,
        avatarUrl: `https://images.unsplash.com/photo-${role === 'listener' ? '1544005313-94ddf0286df2' : '1535713875002-d1d0cf377fde'}?auto=format&fit=crop&w=300&q=80`,
      };
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.setItem('chatzie_user_profile', JSON.stringify(localUser));
      }
      onComplete(localUser);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.overlay}>
        <View style={styles.card}>
          {/* Brand Header */}
          <View style={styles.header}>
            <View style={styles.brandIconBox}>
              <Heart size={28} color="#FFFFFF" fill="#FFFFFF" />
            </View>
            <Text style={styles.brandName}>Welcome to Chatzie</Text>
            <Text style={styles.brandSub}>
              Anonymous 1:1 Voice & Video Wellness Calling Platform
            </Text>
          </View>

          {/* Section Heading */}
          <Text style={styles.sectionTitle}>Select how you want to join:</Text>

          {/* Two Distinct Role Cards */}
          <View style={styles.roleGrid}>
            {/* User / Caller Card */}
            <TouchableOpacity
              style={[styles.roleCard, role === 'talker' && styles.roleCardActive]}
              onPress={() => setRole('talker')}
              activeOpacity={0.88}
            >
              <View style={[styles.roleHeaderRow]}>
                <View style={[styles.roleIconCircle, role === 'talker' && styles.roleIconCircleActive]}>
                  <PhoneCall size={20} color={role === 'talker' ? '#FFFFFF' : '#2563EB'} />
                </View>
                {role === 'talker' && (
                  <View style={styles.activeCheck}>
                    <CheckCircle2 size={18} color="#2563EB" />
                  </View>
                )}
              </View>

              <Text style={[styles.roleTitle, role === 'talker' && styles.roleTitleActive]}>
                I want to Call & Talk
              </Text>
              <Text style={styles.roleSub}>Caller (User)</Text>

              <View style={styles.roleBulletList}>
                <Text style={styles.bulletText}>• Browse friendly verified listeners</Text>
                <Text style={styles.bulletText}>• Voice @ ₹9/min • Video @ ₹30/min</Text>
                <Text style={styles.bulletHighlight}>• ₹60 Free Welcome Balance</Text>
              </View>
            </TouchableOpacity>

            {/* Listener / Host Card */}
            <TouchableOpacity
              style={[styles.roleCard, role === 'listener' && styles.roleCardActiveListener]}
              onPress={() => setRole('listener')}
              activeOpacity={0.88}
            >
              <View style={styles.roleHeaderRow}>
                <View style={[styles.roleIconCircle, role === 'listener' && styles.roleIconCircleActiveListener]}>
                  <Headphones size={20} color={role === 'listener' ? '#FFFFFF' : '#059669'} />
                </View>
                {role === 'listener' && (
                  <View style={styles.activeCheck}>
                    <CheckCircle2 size={18} color="#059669" />
                  </View>
                )}
              </View>

              <Text style={[styles.roleTitle, role === 'listener' && styles.roleTitleActiveListener]}>
                I want to Listen & Earn
              </Text>
              <Text style={styles.roleSub}>Host (Listener)</Text>

              <View style={styles.roleBulletList}>
                <Text style={styles.bulletText}>• Go Live & receive 1:1 calls</Text>
                <Text style={styles.bulletHighlight}>• Earn ₹4.50/min (Voice), ₹16/min (Video)</Text>
                <Text style={styles.bulletText}>• Instant withdrawal to any UPI ID</Text>
              </View>
            </TouchableOpacity>
          </View>

          {/* Name Input */}
          <View style={styles.nameSection}>
            <Text style={styles.inputLabel}>
              Enter your Name {role === 'listener' ? '(Host Display Name)' : '(Caller Name)'}
            </Text>
            <View style={styles.inputContainer}>
              <User size={18} color="#64748B" style={{ marginRight: 8 }} />
              <TextInput
                style={styles.textInput}
                placeholder={role === 'listener' ? 'e.g. Priya Sharma, Sonika' : 'e.g. Rahul, Amit, Rohit'}
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

          {/* Action CTA */}
          <TouchableOpacity
            style={[
              styles.startBtn,
              role === 'listener' ? styles.startBtnListener : styles.startBtnCaller,
              !name.trim() && styles.startBtnDisabled,
            ]}
            onPress={handleStart}
            disabled={isLoading || !name.trim()}
            activeOpacity={0.85}
          >
            {isLoading ? (
              <ActivityIndicator color="#FFFFFF" size="small" />
            ) : (
              <>
                <Text style={styles.startBtnText}>
                  {role === 'listener' ? 'Start as Live Host (Receive Calls)' : 'Start as Caller (Get ₹60 Bonus)'}
                </Text>
                <ArrowRight size={18} color="#FFFFFF" style={{ marginLeft: 8 }} />
              </>
            )}
          </TouchableOpacity>

          <View style={styles.footerNote}>
            <ShieldCheck size={14} color="#10B981" />
            <Text style={styles.footerNoteText}>
              100% Anonymous • Zero OTP required • Instant Activation
            </Text>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.85)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  card: {
    width: '100%',
    maxWidth: 480,
    backgroundColor: '#FFFFFF',
    borderRadius: 28,
    padding: 26,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 16 },
    shadowOpacity: 0.2,
    shadowRadius: 32,
    elevation: 10,
  },
  header: {
    alignItems: 'center',
    marginBottom: 20,
  },
  brandIconBox: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#7C3AED',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
    shadowColor: '#7C3AED',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  brandName: {
    fontSize: 22,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 4,
  },
  brandSub: {
    fontSize: 13,
    color: '#64748B',
    textAlign: 'center',
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#334155',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 10,
  },
  roleGrid: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  roleCard: {
    flex: 1,
    borderWidth: 2,
    borderColor: '#E2E8F0',
    borderRadius: 18,
    padding: 14,
    backgroundColor: '#F8FAFC',
  },
  roleCardActive: {
    borderColor: '#2563EB',
    backgroundColor: '#EFF6FF',
  },
  roleCardActiveListener: {
    borderColor: '#059669',
    backgroundColor: '#ECFDF5',
  },
  roleHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  roleIconCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#E2E8F0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  roleIconCircleActive: {
    backgroundColor: '#2563EB',
  },
  roleIconCircleActiveListener: {
    backgroundColor: '#059669',
  },
  activeCheck: {},
  roleTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#1E293B',
    marginBottom: 2,
  },
  roleTitleActive: {
    color: '#1E40AF',
  },
  roleTitleActiveListener: {
    color: '#065F46',
  },
  roleSub: {
    fontSize: 12,
    fontWeight: '700',
    color: '#64748B',
    marginBottom: 8,
  },
  roleBulletList: {
    gap: 3,
  },
  bulletText: {
    fontSize: 11,
    color: '#475569',
    lineHeight: 15,
  },
  bulletHighlight: {
    fontSize: 11,
    fontWeight: '700',
    color: '#059669',
    lineHeight: 15,
  },
  nameSection: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 8,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#CBD5E1',
    borderRadius: 14,
    paddingHorizontal: 14,
    backgroundColor: '#F8FAFC',
    height: 50,
  },
  textInput: {
    flex: 1,
    fontSize: 15,
    fontWeight: '600',
    color: '#0F172A',
  },
  errorText: {
    fontSize: 12,
    color: '#EF4444',
    fontWeight: '600',
    marginTop: 6,
  },
  startBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 52,
    borderRadius: 16,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 3,
  },
  startBtnCaller: {
    backgroundColor: '#2563EB',
    shadowColor: '#2563EB',
  },
  startBtnListener: {
    backgroundColor: '#059669',
    shadowColor: '#059669',
  },
  startBtnDisabled: {
    opacity: 0.45,
  },
  startBtnText: {
    fontSize: 15,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  footerNote: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    marginTop: 14,
  },
  footerNoteText: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '500',
  },
});
