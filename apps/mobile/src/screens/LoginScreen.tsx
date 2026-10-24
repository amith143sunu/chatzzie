import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  ScrollView,
  Platform,
  Image,
} from 'react-native';
import {
  Phone,
  User,
  ShieldCheck,
  ArrowRight,
  Headphones,
  CheckCircle2,
  Sparkles,
  Heart,
  KeyRound,
  RefreshCw,
  Zap,
  ShieldAlert,
} from 'lucide-react-native';
import { THEME } from '../theme';
import { getApiBaseUrl } from '../services/apiConfig';

interface LoginScreenProps {
  onLoginSuccess: (user: {
    id: string;
    name: string;
    username: string;
    phone: string;
    role: 'talker' | 'listener';
    walletBalanceINR: number;
    avatarUrl: string;
  }) => void;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({ onLoginSuccess }) => {
  const [role, setRole] = useState<'talker' | 'listener'>('talker');
  const [phone, setPhone] = useState('');
  const [name, setName] = useState('');
  const [step, setStep] = useState<'phone' | 'otp'>('phone');
  const [otp, setOtp] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Step 1: Request OTP
  const handleRequestOtp = () => {
    const cleanPhone = phone.trim().replace(/\D/g, '');
    const cleanName = name.trim();

    if (!cleanName) {
      setErrorMsg('Please enter your name or display handle.');
      return;
    }
    if (cleanPhone.length < 10) {
      setErrorMsg('Please enter a valid 10-digit mobile number.');
      return;
    }

    setErrorMsg('');
    setIsLoading(true);

    setTimeout(() => {
      setIsLoading(false);
      setStep('otp');
      setOtp('1234'); // Pre-fill test OTP for instantaneous seamless testing
    }, 400);
  };

  // Step 2: Verify OTP & Sign In
  const handleVerifyOtp = async () => {
    if (!otp.trim()) {
      setErrorMsg('Please enter the 4-digit OTP.');
      return;
    }
    setErrorMsg('');
    setIsLoading(true);

    const cleanPhone = phone.trim().replace(/\D/g, '');
    const cleanName = name.trim();

    try {
      const baseUrl = getApiBaseUrl();
      const res = await fetch(`${baseUrl}/api/auth/quick-signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: cleanName,
          phone: `+91 ${cleanPhone}`,
          role,
        }),
      });

      const data = await res.json();
      if (data.success && data.user) {
        if (typeof window !== 'undefined' && window.localStorage) {
          window.localStorage.setItem('chatzie_auth_session', JSON.stringify(data.user));
          window.localStorage.setItem('chatzie_user_profile', JSON.stringify(data.user));
          window.localStorage.setItem('chatzie_current_user', JSON.stringify(data.user));
        }
        onLoginSuccess(data.user);
      } else {
        const localUser = {
          id: `u_${Date.now()}`,
          name: cleanName,
          phone: `+91 ${cleanPhone}`,
          username: cleanName.toLowerCase().replace(/[^a-z0-9]/g, '_') + '_' + Math.floor(100 + Math.random() * 900),
          role,
          walletBalanceINR: role === 'talker' ? 60 : 0,
          avatarUrl: `https://images.unsplash.com/photo-${role === 'listener' ? '1544005313-94ddf0286df2' : '1535713875002-d1d0cf377fde'}?auto=format&fit=crop&w=300&q=80`,
        };
        if (typeof window !== 'undefined' && window.localStorage) {
          window.localStorage.setItem('chatzie_auth_session', JSON.stringify(localUser));
          window.localStorage.setItem('chatzie_user_profile', JSON.stringify(localUser));
          window.localStorage.setItem('chatzie_current_user', JSON.stringify(localUser));
        }
        onLoginSuccess(localUser);
      }
    } catch (e) {
      const localUser = {
        id: `u_${Date.now()}`,
        name: cleanName,
        phone: `+91 ${cleanPhone}`,
        username: cleanName.toLowerCase().replace(/[^a-z0-9]/g, '_') + '_' + Math.floor(100 + Math.random() * 900),
        role,
        walletBalanceINR: role === 'talker' ? 60 : 0,
        avatarUrl: `https://images.unsplash.com/photo-${role === 'listener' ? '1544005313-94ddf0286df2' : '1535713875002-d1d0cf377fde'}?auto=format&fit=crop&w=300&q=80`,
      };
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.setItem('chatzie_auth_session', JSON.stringify(localUser));
        window.localStorage.setItem('chatzie_user_profile', JSON.stringify(localUser));
        window.localStorage.setItem('chatzie_current_user', JSON.stringify(localUser));
      }
      onLoginSuccess(localUser);
    } finally {
      setIsLoading(false);
    }
  };

  // Quick 1-tap fill for instant test convenience
  const handleQuickFill = (testRole: 'talker' | 'listener') => {
    setRole(testRole);
    if (testRole === 'listener') {
      setName('Priya Sharma (Host)');
      setPhone('9876500001');
    } else {
      setName('Amit (Caller)');
      setPhone('9876500002');
    }
    setErrorMsg('');
  };

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.authCard}>
          {/* Brand Header */}
          <View style={styles.brandHeader}>
            <View style={styles.brandIconBox}>
              <Heart size={26} color="#FFFFFF" fill="#FFFFFF" />
            </View>
            <Text style={styles.brandTitle}>Chatzie</Text>
            <Text style={styles.brandSubtitle}>
              1:1 Anonymous Voice & Video Wellness Calling
            </Text>
          </View>

          {/* Quick Demo Pre-fill Pills */}
          <View style={styles.quickFillRow}>
            <Text style={styles.quickFillLabel}>Quick Test Login:</Text>
            <TouchableOpacity
              style={[styles.quickPill, role === 'talker' && styles.quickPillActive]}
              onPress={() => handleQuickFill('talker')}
              activeOpacity={0.8}
            >
              <Text style={styles.quickPillText}>Phone Caller (₹60 Bonus)</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.quickPill, role === 'listener' && styles.quickPillActiveListener]}
              onPress={() => handleQuickFill('listener')}
              activeOpacity={0.8}
            >
              <Text style={styles.quickPillText}>Laptop Host (Earn)</Text>
            </TouchableOpacity>
          </View>

          {/* Role Tabs */}
          <View style={styles.roleTabsContainer}>
            <TouchableOpacity
              style={[styles.roleTab, role === 'talker' && styles.roleTabActive]}
              onPress={() => {
                setRole('talker');
                setErrorMsg('');
              }}
              activeOpacity={0.85}
            >
              <Phone size={16} color={role === 'talker' ? '#2563EB' : '#64748B'} />
              <Text style={[styles.roleTabText, role === 'talker' && styles.roleTabTextActive]}>
                Caller (Talk & Connect)
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.roleTab, role === 'listener' && styles.roleTabActiveListener]}
              onPress={() => {
                setRole('listener');
                setErrorMsg('');
              }}
              activeOpacity={0.85}
            >
              <Headphones size={16} color={role === 'listener' ? '#059669' : '#64748B'} />
              <Text style={[styles.roleTabText, role === 'listener' && styles.roleTabTextActiveListener]}>
                Host (Listen & Earn)
              </Text>
            </TouchableOpacity>
          </View>

          {/* Role Benefit Highlight Pill */}
          <View style={[styles.benefitBanner, role === 'listener' ? styles.benefitBannerHost : styles.benefitBannerCaller]}>
            <Sparkles size={14} color={role === 'listener' ? '#059669' : '#2563EB'} />
            <Text style={[styles.benefitBannerText, { color: role === 'listener' ? '#065F46' : '#1E40AF' }]}>
              {role === 'listener'
                ? 'Earn ₹4.50/min for Voice • ₹16.00/min for Video'
                : 'Free ₹60.00 Starter Balance credited upon login'}
            </Text>
          </View>

          {/* Form Step 1: Phone & Name Input */}
          {step === 'phone' ? (
            <View style={styles.formContainer}>
              {/* Name Field */}
              <View style={styles.fieldGroup}>
                <Text style={styles.inputLabel}>
                  {role === 'listener' ? 'Host Display Name' : 'Your Name / Nickname'}
                </Text>
                <View style={styles.inputBox}>
                  <User size={18} color="#64748B" style={{ marginRight: 8 }} />
                  <TextInput
                    style={styles.textInput}
                    placeholder={role === 'listener' ? 'e.g. Priya Host' : 'e.g. Amit Kumar'}
                    placeholderTextColor="#94A3B8"
                    value={name}
                    onChangeText={(t) => {
                      setName(t);
                      if (errorMsg) setErrorMsg('');
                    }}
                  />
                </View>
              </View>

              {/* Mobile Number Field */}
              <View style={styles.fieldGroup}>
                <Text style={styles.inputLabel}>Mobile Number (Test / Bogus Details)</Text>
                <View style={styles.inputBox}>
                  <View style={styles.countryCodeBadge}>
                    <Text style={styles.countryCodeText}>🇮🇳 +91</Text>
                  </View>
                  <TextInput
                    style={styles.textInput}
                    placeholder="9876543210"
                    placeholderTextColor="#94A3B8"
                    value={phone}
                    keyboardType="phone-pad"
                    maxLength={10}
                    onChangeText={(t) => {
                      setPhone(t);
                      if (errorMsg) setErrorMsg('');
                    }}
                  />
                </View>
              </View>

              {errorMsg ? <Text style={styles.errorText}>{errorMsg}</Text> : null}

              {/* Submit CTA */}
              <TouchableOpacity
                style={[styles.primaryBtn, role === 'listener' ? styles.primaryBtnListener : styles.primaryBtnCaller]}
                onPress={handleRequestOtp}
                disabled={isLoading}
                activeOpacity={0.85}
              >
                {isLoading ? (
                  <ActivityIndicator color="#FFFFFF" size="small" />
                ) : (
                  <>
                    <Text style={styles.primaryBtnText}>
                      {role === 'listener' ? 'Continue as Host' : 'Continue as Caller'}
                    </Text>
                    <ArrowRight size={18} color="#FFFFFF" style={{ marginLeft: 6 }} />
                  </>
                )}
              </TouchableOpacity>
            </View>
          ) : (
            /* Form Step 2: Realistic OTP Screen */
            <View style={styles.formContainer}>
              <View style={styles.otpHeader}>
                <Text style={styles.otpHeading}>Verify Mobile Number</Text>
                <Text style={styles.otpSub}>
                  Enter the 4-digit verification code sent to{' '}
                  <Text style={{ fontWeight: '700', color: '#0F172A' }}>+91 {phone}</Text>
                </Text>
                <TouchableOpacity onPress={() => setStep('phone')} style={{ marginTop: 4 }}>
                  <Text style={styles.changePhoneText}>Wrong number? Change</Text>
                </TouchableOpacity>
              </View>

              {/* Test OTP Notice Banner */}
              <View style={styles.testOtpHint}>
                <Zap size={14} color="#D97706" />
                <Text style={styles.testOtpHintText}>
                  Sandbox Mode: Test OTP is <Text style={{ fontWeight: '800', color: '#B45309' }}>1234</Text> (Auto-filled)
                </Text>
              </View>

              {/* OTP Input Box */}
              <View style={styles.otpInputBox}>
                <KeyRound size={18} color="#64748B" style={{ marginRight: 10 }} />
                <TextInput
                  style={styles.otpTextInput}
                  placeholder="1234"
                  placeholderTextColor="#94A3B8"
                  value={otp}
                  onChangeText={(t) => {
                    setOtp(t);
                    if (errorMsg) setErrorMsg('');
                  }}
                  keyboardType="number-pad"
                  maxLength={6}
                  autoFocus
                />
              </View>

              {errorMsg ? <Text style={styles.errorText}>{errorMsg}</Text> : null}

              {/* Verify & Enter Button */}
              <TouchableOpacity
                style={[styles.primaryBtn, role === 'listener' ? styles.primaryBtnListener : styles.primaryBtnCaller]}
                onPress={handleVerifyOtp}
                disabled={isLoading}
                activeOpacity={0.85}
              >
                {isLoading ? (
                  <ActivityIndicator color="#FFFFFF" size="small" />
                ) : (
                  <>
                    <Text style={styles.primaryBtnText}>Verify & Login to Chatzie</Text>
                    <CheckCircle2 size={18} color="#FFFFFF" style={{ marginLeft: 6 }} />
                  </>
                )}
              </TouchableOpacity>
            </View>
          )}

          {/* Privacy & Trust Footer */}
          <View style={styles.trustFooter}>
            <ShieldCheck size={14} color="#10B981" />
            <Text style={styles.trustFooterText}>
              100% Anonymous & Encrypted • Zero Spam • Sandbox Test Mode
            </Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F172A', // Dark Slate background
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
    paddingVertical: 32,
  },
  authCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    paddingVertical: 24,
    paddingHorizontal: 20,
    width: '100%',
    maxWidth: 460,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.15,
    shadowRadius: 25,
    elevation: 8,
  },
  brandHeader: {
    alignItems: 'center',
    marginBottom: 20,
  },
  brandIconBox: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#2563EB',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
    shadowColor: '#2563EB',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
  },
  brandTitle: {
    fontSize: 26,
    fontWeight: '900',
    color: '#0F172A',
    letterSpacing: -0.5,
  },
  brandSubtitle: {
    fontSize: 13,
    color: '#64748B',
    marginTop: 4,
    textAlign: 'center',
  },
  quickFillRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 8,
    borderRadius: 12,
    marginBottom: 16,
  },
  quickFillLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#64748B',
    marginRight: 2,
  },
  quickPill: {
    backgroundColor: '#EFF6FF',
    borderWidth: 1,
    borderColor: '#BFDBFE',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  quickPillActive: {
    backgroundColor: '#DBEAFE',
    borderColor: '#2563EB',
  },
  quickPillActiveListener: {
    backgroundColor: '#D1FAE5',
    borderColor: '#059669',
  },
  quickPillText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#1E40AF',
  },
  roleTabsContainer: {
    flexDirection: 'row',
    backgroundColor: '#F1F5F9',
    borderRadius: 14,
    padding: 4,
    marginBottom: 14,
  },
  roleTab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 10,
    gap: 6,
  },
  roleTabActive: {
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  roleTabActiveListener: {
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  roleTabText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#64748B',
  },
  roleTabTextActive: {
    color: '#2563EB',
  },
  roleTabTextActiveListener: {
    color: '#059669',
  },
  benefitBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    marginBottom: 18,
  },
  benefitBannerCaller: {
    backgroundColor: '#EFF6FF',
    borderWidth: 1,
    borderColor: '#BFDBFE',
  },
  benefitBannerHost: {
    backgroundColor: '#ECFDF5',
    borderWidth: 1,
    borderColor: '#A7F3D0',
  },
  benefitBannerText: {
    fontSize: 12,
    fontWeight: '700',
    flex: 1,
  },
  formContainer: {
    width: '100%',
  },
  fieldGroup: {
    marginBottom: 14,
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#334155',
    marginBottom: 6,
  },
  inputBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderWidth: 1.5,
    borderColor: '#CBD5E1',
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 48,
  },
  countryCodeBadge: {
    paddingRight: 8,
    marginRight: 8,
    borderRightWidth: 1,
    borderRightColor: '#CBD5E1',
  },
  countryCodeText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#334155',
  },
  textInput: {
    flex: 1,
    fontSize: 14,
    color: '#0F172A',
    fontWeight: '600',
  },
  primaryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 48,
    borderRadius: 12,
    marginTop: 8,
  },
  primaryBtnCaller: {
    backgroundColor: '#2563EB',
  },
  primaryBtnListener: {
    backgroundColor: '#059669',
  },
  primaryBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
  },
  errorText: {
    color: '#DC2626',
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 10,
    marginTop: -4,
  },
  otpHeader: {
    marginBottom: 14,
  },
  otpHeading: {
    fontSize: 17,
    fontWeight: '800',
    color: '#0F172A',
  },
  otpSub: {
    fontSize: 13,
    color: '#64748B',
    marginTop: 4,
    lineHeight: 18,
  },
  changePhoneText: {
    fontSize: 12,
    color: '#2563EB',
    fontWeight: '700',
  },
  testOtpHint: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#FEF3C7',
    borderWidth: 1,
    borderColor: '#FDE68A',
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 8,
    marginBottom: 14,
  },
  testOtpHintText: {
    fontSize: 12,
    color: '#92400E',
    fontWeight: '600',
  },
  otpInputBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderWidth: 1.5,
    borderColor: '#CBD5E1',
    borderRadius: 12,
    paddingHorizontal: 14,
    height: 52,
    marginBottom: 14,
  },
  otpTextInput: {
    flex: 1,
    fontSize: 20,
    fontWeight: '800',
    letterSpacing: 8,
    color: '#0F172A',
  },
  trustFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    marginTop: 20,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  trustFooterText: {
    fontSize: 11,
    color: '#64748B',
    fontWeight: '600',
  },
  adminPortalLink: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 12,
    gap: 6,
  },
  adminPortalLinkText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#94A3B8',
    textDecorationLine: 'underline',
  },
});
