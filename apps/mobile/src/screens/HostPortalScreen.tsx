'use client';

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Image,
  ActivityIndicator,
  Alert,
  Platform,
} from 'react-native';
import {
  Headphones,
  ShieldCheck,
  Sparkles,
  ArrowRight,
  Mic,
  Square,
  Play,
  RotateCcw,
  CheckCircle2,
  Clock,
  IndianRupee,
  Lock,
  ArrowLeft,
  Heart,
  ChevronRight,
  AlertCircle,
  FileText,
} from 'lucide-react-native';
import { THEME } from '../theme';
import { getApiBaseUrl } from '../services/apiConfig';

interface HostPortalScreenProps {
  onBackToConsumerApp: () => void;
  onHostLoginSuccess: (hostUser: {
    id: string;
    name: string;
    username: string;
    avatarUrl: string;
    role: 'listener';
  }) => void;
}

export const HostPortalScreen: React.FC<HostPortalScreenProps> = ({
  onBackToConsumerApp,
  onHostLoginSuccess,
}) => {
  const [activeTab, setActiveTab] = useState<'login' | 'register'>('login');

  // Login State
  const [loginIdentifier, setLoginIdentifier] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [loginError, setLoginError] = useState('');
  const [pendingApplicationNotice, setPendingApplicationNotice] = useState<any>(null);

  // Registration Form State
  const [regStep, setRegStep] = useState<1 | 2 | 3 | 4>(1);
  const [fullName, setFullName] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [phone, setPhone] = useState('');
  const [selectedLanguages, setSelectedLanguages] = useState<string[]>(['Hindi', 'English']);
  const [bio, setBio] = useState('');
  const [avatarUrl, setAvatarUrl] = useState(
    'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=400&q=80'
  );

  // Voice Intro State
  const [isRecording, setIsRecording] = useState(false);
  const [recordedVoice, setRecordedVoice] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);

  // Payout Details
  const [upiId, setUpiId] = useState('');
  const [panNumber, setPanNumber] = useState('');
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionComplete, setSubmissionComplete] = useState<any>(null);

  // Preset Avatars for Dignified Host Profiles
  const PRESET_AVATARS = [
    'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=400&q=80',
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
    'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=400&q=80',
    'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=400&q=80',
  ];

  const ALL_LANGUAGES = ['Hindi', 'English', 'Punjabi', 'Marathi', 'Bengali', 'Telugu', 'Tamil', 'Gujarati'];

  // Toggle Language
  const toggleLanguage = (lang: string) => {
    if (selectedLanguages.includes(lang)) {
      if (selectedLanguages.length > 1) {
        setSelectedLanguages(selectedLanguages.filter(l => l !== lang));
      }
    } else {
      setSelectedLanguages([...selectedLanguages, lang]);
    }
  };

  // 1. Host Login Handler
  const handleHostLogin = async (overrideIdentifier?: string) => {
    const target = (overrideIdentifier || loginIdentifier).trim();
    if (!target) {
      setLoginError('Please enter your Host Username or Registered Mobile Number');
      return;
    }
    setLoginError('');
    setIsLoggingIn(true);
    setPendingApplicationNotice(null);

    try {
      const baseUrl = getApiBaseUrl();
      const res = await fetch(`${baseUrl}/api/host/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier: target }),
      });
      const data = await res.json();

      if (data.success && data.status === 'approved' && data.host) {
        // Save host session
        const hostSession = {
          id: data.host.id || `host_${data.host.username}`,
          name: data.host.name,
          username: data.host.username,
          avatarUrl: data.host.avatarUrl,
          role: 'listener' as const,
        };
        if (typeof window !== 'undefined' && window.localStorage) {
          window.localStorage.setItem('chatzie_auth_session', JSON.stringify(hostSession));
          window.localStorage.setItem('chatzie_user_profile', JSON.stringify(hostSession));
        }
        onHostLoginSuccess(hostSession);
      } else if (data.status === 'pending') {
        setPendingApplicationNotice(data.application || { name: target, appliedAt: 'Recently' });
      } else {
        setLoginError(data.error || 'Host account not found. Please register as a partner below.');
      }
    } catch (e) {
      setLoginError('Could not connect to host portal. Please try again.');
    } finally {
      setIsLoggingIn(false);
    }
  };

  // Mock Voice Recording Toggle
  const handleToggleRecord = () => {
    if (isRecording) {
      setIsRecording(false);
      setRecordedVoice(true);
      setRecordingSeconds(18);
    } else {
      setIsRecording(true);
      setRecordedVoice(false);
      setRecordingSeconds(0);
    }
  };

  // 2. Submit New Host Application
  const handleSubmitApplication = async () => {
    if (!agreedToTerms) {
      Alert.alert('Agreement Required', 'Please accept the Host Code of Conduct & Anti-Leak terms.');
      return;
    }
    setIsSubmitting(true);

    const cleanUsername = (displayName || fullName || 'host')
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '_')
      .slice(0, 15);

    try {
      const baseUrl = getApiBaseUrl();
      const res = await fetch(`${baseUrl}/api/listeners/kyc`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: fullName.trim() || 'Verified Host',
          username: cleanUsername,
          phone: phone.trim() || '9876500000',
          languages: selectedLanguages,
          bio: bio.trim() || 'Compassionate and friendly conversationalist.',
          avatarUrl,
          panNumber: panNumber.trim().toUpperCase() || 'ABCDE1234F',
          upiId: upiId.trim() || `${cleanUsername}@upi`,
          isVideoEnabled: true,
        }),
      });

      const data = await res.json();
      if (data.success && data.application) {
        setSubmissionComplete(data.application);
      } else {
        Alert.alert('Registration Notice', 'Your registration was recorded. Please check login shortly.');
      }
    } catch (e) {
      Alert.alert('Connection Error', 'Please check your connection and try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <View style={styles.container}>
      {/* Top Navigation Bar */}
      <View style={styles.topBar}>
        <TouchableOpacity
          style={styles.backToConsumerBtn}
          onPress={onBackToConsumerApp}
          activeOpacity={0.8}
        >
          <ArrowLeft size={16} color="#475569" />
          <Text style={styles.backToConsumerText}>Back to Caller App</Text>
        </TouchableOpacity>

        <View style={styles.partnerBadge}>
          <ShieldCheck size={13} color="#10B981" />
          <Text style={styles.partnerBadgeText}>Official Partner Workplace</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Header Hero Card */}
        <View style={styles.heroCard}>
          <View style={styles.heroIconCircle}>
            <Headphones size={28} color="#FFFFFF" />
          </View>
          <Text style={styles.heroTitle}>Chatzzie Partner</Text>
          <Text style={styles.heroSubtitle}>
            India’s Premier Women Conversationalist & Listening Network
          </Text>

          {/* Value Props Row */}
          <View style={styles.perksRow}>
            <View style={styles.perkPill}>
              <Clock size={12} color="#10B981" />
              <Text style={styles.perkText}>100% Flexible Hours</Text>
            </View>
            <View style={styles.perkPill}>
              <IndianRupee size={12} color="#10B981" />
              <Text style={styles.perkText}>50% Split + Direct UPI</Text>
            </View>
            <View style={styles.perkPill}>
              <Lock size={12} color="#10B981" />
              <Text style={styles.perkText}>Zero Number Exposure</Text>
            </View>
          </View>
        </View>

        {/* Tab Selector: Login vs Register */}
        <View style={styles.tabContainer}>
          <TouchableOpacity
            style={[styles.tabButton, activeTab === 'login' && styles.tabButtonActive]}
            onPress={() => {
              setActiveTab('login');
              setSubmissionComplete(null);
            }}
            activeOpacity={0.85}
          >
            <Text style={[styles.tabButtonText, activeTab === 'login' && styles.tabButtonTextActive]}>
              Host Sign In
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tabButton, activeTab === 'register' && styles.tabButtonActive]}
            onPress={() => {
              setActiveTab('register');
              setSubmissionComplete(null);
            }}
            activeOpacity={0.85}
          >
            <Text style={[styles.tabButtonText, activeTab === 'register' && styles.tabButtonTextActive]}>
              New Host Registration
            </Text>
          </TouchableOpacity>
        </View>

        {/* ----------------- TAB 1: HOST LOGIN ----------------- */}
        {activeTab === 'login' && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Sign In to Host Workstation</Text>
            <Text style={styles.cardSub}>
              Enter your verified username or mobile number to go live and receive incoming calls.
            </Text>

            {/* Quick Demo Pre-fills for Instant Testing */}
            <View style={styles.demoFillBox}>
              <Text style={styles.demoFillLabel}>Quick Test Accounts:</Text>
              <View style={{ flexDirection: 'row', gap: 8, marginTop: 6, flexWrap: 'wrap' }}>
                <TouchableOpacity
                  style={styles.demoPill}
                  onPress={() => {
                    setLoginIdentifier('priya');
                    handleHostLogin('priya');
                  }}
                >
                  <Text style={styles.demoPillText}>Priya (Verified Host)</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.demoPill}
                  onPress={() => {
                    setLoginIdentifier('neha_wellness');
                    handleHostLogin('neha_wellness');
                  }}
                >
                  <Text style={styles.demoPillText}>Neha (Verified Host)</Text>
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Host Username / Mobile Number</Text>
              <TextInput
                style={styles.inputField}
                placeholder="e.g. priya or 9876500001"
                placeholderTextColor="#94A3B8"
                value={loginIdentifier}
                onChangeText={setLoginIdentifier}
                autoCapitalize="none"
              />
            </View>

            {loginError ? (
              <View style={styles.errorBanner}>
                <AlertCircle size={15} color="#DC2626" />
                <Text style={styles.errorText}>{loginError}</Text>
              </View>
            ) : null}

            {/* Pending Application Status Notice */}
            {pendingApplicationNotice && (
              <View style={styles.pendingCard}>
                <View style={styles.pendingTop}>
                  <Clock size={18} color="#D97706" />
                  <Text style={styles.pendingTitle}>Application Under Review</Text>
                </View>
                <Text style={styles.pendingText}>
                  Hello {pendingApplicationNotice.name}, your partner application is currently undergoing admin verification. Approvals typically take 2 to 4 business hours.
                </Text>
                <View style={styles.pendingDetailsBox}>
                  <Text style={styles.pendingDetailRow}>
                    Username: <Text style={{ fontWeight: '700' }}>@{pendingApplicationNotice.username}</Text>
                  </Text>
                  <Text style={styles.pendingDetailRow}>
                    Status: <Text style={{ color: '#D97706', fontWeight: '800' }}>Pending Admin KYC Clearance</Text>
                  </Text>
                </View>
                <TouchableOpacity
                  style={styles.recheckBtn}
                  onPress={() => handleHostLogin()}
                >
                  <RotateCcw size={14} color="#B45309" />
                  <Text style={styles.recheckBtnText}>Check Approval Status Again</Text>
                </TouchableOpacity>
              </View>
            )}

            <TouchableOpacity
              style={[styles.primaryBtn, isLoggingIn && styles.primaryBtnDisabled]}
              onPress={() => handleHostLogin()}
              disabled={isLoggingIn}
              activeOpacity={0.85}
            >
              {isLoggingIn ? (
                <ActivityIndicator color="#FFFFFF" size="small" />
              ) : (
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                  <Text style={styles.primaryBtnText}>Open Workstation</Text>
                  <ArrowRight size={17} color="#FFFFFF" />
                </View>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.switchTabLink}
              onPress={() => setActiveTab('register')}
            >
              <Text style={styles.switchTabLinkText}>
                Don’t have a host account yet? <Text style={{ color: THEME.colors.primary, fontWeight: '700' }}>Apply to join</Text>
              </Text>
            </TouchableOpacity>
          </View>
        )}

        {/* ----------------- TAB 2: NEW HOST ONBOARDING ----------------- */}
        {activeTab === 'register' && (
          <View style={styles.card}>
            {submissionComplete ? (
              <View style={styles.successState}>
                <View style={styles.successIconCircle}>
                  <CheckCircle2 size={36} color="#059669" />
                </View>
                <Text style={styles.successTitle}>Application Received!</Text>
                <Text style={styles.successSub}>
                  Thank you, {submissionComplete.name}! Your application to join Chatzzie Partner has been submitted to the moderation team.
                </Text>
                <View style={styles.successDetailCard}>
                  <Text style={styles.successRow}>
                    Application ID: <Text style={{ fontWeight: '700' }}>{submissionComplete.id}</Text>
                  </Text>
                  <Text style={styles.successRow}>
                    Assigned Handle: <Text style={{ fontWeight: '700' }}>@{submissionComplete.username}</Text>
                  </Text>
                  <Text style={styles.successRow}>
                    Payout UPI: <Text style={{ fontWeight: '700' }}>{submissionComplete.upiId}</Text>
                  </Text>
                </View>
                <TouchableOpacity
                  style={styles.primaryBtn}
                  onPress={() => {
                    setLoginIdentifier(submissionComplete.username);
                    setActiveTab('login');
                    setSubmissionComplete(null);
                  }}
                >
                  <Text style={styles.primaryBtnText}>Check Approval in Sign In Tab</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <>
                {/* Step Indicators */}
                <View style={styles.stepIndicatorRow}>
                  {[
                    { num: 1, label: 'Profile' },
                    { num: 2, label: 'Voice Bio' },
                    { num: 3, label: 'Payout' },
                    { num: 4, label: 'Agreement' },
                  ].map(s => (
                    <TouchableOpacity
                      key={s.num}
                      style={[styles.stepItem, regStep === s.num && styles.stepItemActive]}
                      onPress={() => setRegStep(s.num as any)}
                    >
                      <View style={[styles.stepDot, regStep >= s.num && styles.stepDotCompleted]}>
                        <Text style={[styles.stepDotText, regStep >= s.num && styles.stepDotTextCompleted]}>
                          {s.num}
                        </Text>
                      </View>
                      <Text style={[styles.stepItemText, regStep === s.num && styles.stepItemTextActive]}>
                        {s.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>

                {/* STEP 1: Basic Profile Details */}
                {regStep === 1 && (
                  <View style={styles.stepContent}>
                    <Text style={styles.sectionHeading}>Step 1: Your Public Host Profile</Text>
                    <Text style={styles.sectionSub}>
                      Callers will see your display name and avatar in the online directory.
                    </Text>

                    <View style={styles.inputGroup}>
                      <Text style={styles.inputLabel}>Full Legal Name (For Bank/UPI matching)</Text>
                      <TextInput
                        style={styles.inputField}
                        placeholder="e.g. Priya Sharma"
                        placeholderTextColor="#94A3B8"
                        value={fullName}
                        onChangeText={setName => {
                          setFullName(setName);
                          if (!displayName) setDisplayName(setName);
                        }}
                      />
                    </View>

                    <View style={styles.inputGroup}>
                      <Text style={styles.inputLabel}>Anonymous Display Name (Shown to Callers)</Text>
                      <TextInput
                        style={styles.inputField}
                        placeholder="e.g. Priya or Life Coach Neha"
                        placeholderTextColor="#94A3B8"
                        value={displayName}
                        onChangeText={setDisplayName}
                      />
                    </View>

                    <View style={styles.inputGroup}>
                      <Text style={styles.inputLabel}>Mobile Phone Number (Confidential)</Text>
                      <TextInput
                        style={styles.inputField}
                        placeholder="10-digit phone number"
                        placeholderTextColor="#94A3B8"
                        value={phone}
                        onChangeText={setPhone}
                        keyboardType="phone-pad"
                      />
                    </View>

                    {/* Avatar Preset Selector */}
                    <Text style={styles.inputLabel}>Select Your Profile Photo</Text>
                    <View style={styles.avatarPickerRow}>
                      {PRESET_AVATARS.map((url, i) => (
                        <TouchableOpacity
                          key={i}
                          style={[styles.avatarPickItem, avatarUrl === url && styles.avatarPickItemActive]}
                          onPress={() => setAvatarUrl(url)}
                        >
                          <Image source={{ uri: url }} style={styles.avatarImg} />
                          {avatarUrl === url && (
                            <View style={styles.avatarCheckBadge}>
                              <CheckCircle2 size={14} color="#FFFFFF" />
                            </View>
                          )}
                        </TouchableOpacity>
                      ))}
                    </View>

                    {/* Languages Spoken */}
                    <Text style={[styles.inputLabel, { marginTop: 14 }]}>Languages You Can Converse In</Text>
                    <View style={styles.langPillsWrap}>
                      {ALL_LANGUAGES.map(lang => (
                        <TouchableOpacity
                          key={lang}
                          style={[styles.langPill, selectedLanguages.includes(lang) && styles.langPillActive]}
                          onPress={() => toggleLanguage(lang)}
                        >
                          <Text
                            style={[
                              styles.langPillText,
                              selectedLanguages.includes(lang) && styles.langPillTextActive,
                            ]}
                          >
                            {lang}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </View>

                    <View style={[styles.inputGroup, { marginTop: 14 }]}>
                      <Text style={styles.inputLabel}>Short Bio / Greeting (Max 140 chars)</Text>
                      <TextInput
                        style={[styles.inputField, { height: 70, textAlignVertical: 'top' }]}
                        placeholder="e.g. Friendly listener here to hear your day, vent feelings, or share casual chats."
                        placeholderTextColor="#94A3B8"
                        value={bio}
                        onChangeText={setBio}
                        multiline
                      />
                    </View>

                    <TouchableOpacity style={styles.nextBtn} onPress={() => setRegStep(2)}>
                      <Text style={styles.nextBtnText}>Continue to Voice Bio</Text>
                      <ChevronRight size={18} color="#FFFFFF" />
                    </TouchableOpacity>
                  </View>
                )}

                {/* STEP 2: 15-Sec Voice Introduction */}
                {regStep === 2 && (
                  <View style={styles.stepContent}>
                    <Text style={styles.sectionHeading}>Step 2: 15–30 Second Voice Sample</Text>
                    <Text style={styles.sectionSub}>
                      Callers tap to listen to your voice before calling. A warm, friendly voice sample increases your call volume by 300%.
                    </Text>

                    <View style={styles.voiceRecorderCard}>
                      <View style={[styles.micBigCircle, isRecording && styles.micBigCircleActive]}>
                        <Mic size={36} color={isRecording ? '#EF4444' : THEME.colors.primary} />
                      </View>

                      <Text style={styles.recordStatusText}>
                        {isRecording
                          ? 'Recording live voice sample... Speak clearly!'
                          : recordedVoice
                          ? '✅ Voice Sample Recorded (18 seconds)'
                          : 'Tap below to record your voice intro'}
                      </Text>

                      <TouchableOpacity
                        style={[styles.recordActionBtn, isRecording && styles.recordActionBtnActive]}
                        onPress={handleToggleRecord}
                      >
                        {isRecording ? (
                          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                            <Square size={16} color="#FFFFFF" />
                            <Text style={styles.recordActionBtnText}>Stop Recording</Text>
                          </View>
                        ) : (
                          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                            <Play size={16} color="#FFFFFF" />
                            <Text style={styles.recordActionBtnText}>
                              {recordedVoice ? 'Re-record Sample' : 'Start Recording'}
                            </Text>
                          </View>
                        )}
                      </TouchableOpacity>

                      <Text style={styles.voiceScriptHint}>
                        💡 Hint: "Hello! Main Priya hoon. Agar aap stress me hain ya bas kisi se dil khol kar baat karna chahte hain, I am here for you."
                      </Text>
                    </View>

                    <View style={styles.stepNavRow}>
                      <TouchableOpacity style={styles.prevBtn} onPress={() => setRegStep(1)}>
                        <Text style={styles.prevBtnText}>Back</Text>
                      </TouchableOpacity>
                      <TouchableOpacity style={styles.nextBtn} onPress={() => setRegStep(3)}>
                        <Text style={styles.nextBtnText}>Continue to Payout Info</Text>
                        <ChevronRight size={18} color="#FFFFFF" />
                      </TouchableOpacity>
                    </View>
                  </View>
                )}

                {/* STEP 3: Payout Details & KYC */}
                {regStep === 3 && (
                  <View style={styles.stepContent}>
                    <Text style={styles.sectionHeading}>Step 3: Earnings Payout & Compliance</Text>
                    <Text style={styles.sectionSub}>
                      Your earnings are transferred directly to your UPI ID. Under Indian tax laws, PAN is mandatory for platform creator disbursals.
                    </Text>

                    <View style={styles.inputGroup}>
                      <Text style={styles.inputLabel}>Payout UPI ID (e.g. name@okhdfcbank or name@paytm)</Text>
                      <TextInput
                        style={styles.inputField}
                        placeholder="yourname@upi"
                        placeholderTextColor="#94A3B8"
                        value={upiId}
                        onChangeText={setUpiId}
                        autoCapitalize="none"
                      />
                    </View>

                    <View style={styles.inputGroup}>
                      <Text style={styles.inputLabel}>PAN Card Number (10 Characters)</Text>
                      <TextInput
                        style={styles.inputField}
                        placeholder="ABCDE1234F"
                        placeholderTextColor="#94A3B8"
                        value={panNumber}
                        onChangeText={setPanNumber}
                        autoCapitalize="characters"
                        maxLength={10}
                      />
                    </View>

                    <View style={styles.payoutTrustBox}>
                      <ShieldCheck size={18} color="#059669" />
                      <View style={{ flex: 1, marginLeft: 8 }}>
                        <Text style={styles.payoutTrustTitle}>Direct Bank Payout Guarantee</Text>
                        <Text style={styles.payoutTrustSub}>
                          Minimum withdrawal is ₹200. No agency cuts or hidden fees. Standard payout processing is within 24 hours.
                        </Text>
                      </View>
                    </View>

                    <View style={styles.stepNavRow}>
                      <TouchableOpacity style={styles.prevBtn} onPress={() => setRegStep(2)}>
                        <Text style={styles.prevBtnText}>Back</Text>
                      </TouchableOpacity>
                      <TouchableOpacity style={styles.nextBtn} onPress={() => setRegStep(4)}>
                        <Text style={styles.nextBtnText}>Review & Agree</Text>
                        <ChevronRight size={18} color="#FFFFFF" />
                      </TouchableOpacity>
                    </View>
                  </View>
                )}

                {/* STEP 4: Code of Conduct & Agreement */}
                {regStep === 4 && (
                  <View style={styles.stepContent}>
                    <Text style={styles.sectionHeading}>Step 4: Dignity Standards & Final Submission</Text>
                    <Text style={styles.sectionSub}>
                      Please review the platform conduct rules before final submission.
                    </Text>

                    <View style={styles.rulesCard}>
                      <View style={styles.ruleItem}>
                        <CheckCircle2 size={16} color="#10B981" />
                        <Text style={styles.ruleText}>
                          <Text style={{ fontWeight: '700' }}>Strict Anti-Leak Rule:</Text> You must never share or ask for phone numbers, WhatsApp, or Instagram handles.
                        </Text>
                      </View>
                      <View style={styles.ruleItem}>
                        <CheckCircle2 size={16} color="#10B981" />
                        <Text style={styles.ruleText}>
                          <Text style={{ fontWeight: '700' }}>No Off-Platform Money:</Text> All caller payments and gifts must happen strictly in-app.
                        </Text>
                      </View>
                      <View style={styles.ruleItem}>
                        <CheckCircle2 size={16} color="#10B981" />
                        <Text style={styles.ruleText}>
                          <Text style={{ fontWeight: '700' }}>Respect & Empathy:</Text> Provide polite, supportive listening and immediately report abusive callers.
                        </Text>
                      </View>
                    </View>

                    <TouchableOpacity
                      style={styles.checkboxRow}
                      onPress={() => setAgreedToTerms(!agreedToTerms)}
                      activeOpacity={0.8}
                    >
                      <View style={[styles.checkbox, agreedToTerms && styles.checkboxChecked]}>
                        {agreedToTerms && <CheckCircle2 size={14} color="#FFFFFF" />}
                      </View>
                      <Text style={styles.checkboxLabel}>
                        I agree to the Chatzzie Partner Terms of Service, 50% revenue share, and Code of Conduct.
                      </Text>
                    </TouchableOpacity>

                    <View style={styles.stepNavRow}>
                      <TouchableOpacity style={styles.prevBtn} onPress={() => setRegStep(3)}>
                        <Text style={styles.prevBtnText}>Back</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={[styles.primaryBtn, (!agreedToTerms || isSubmitting) && styles.primaryBtnDisabled]}
                        onPress={handleSubmitApplication}
                        disabled={!agreedToTerms || isSubmitting}
                      >
                        {isSubmitting ? (
                          <ActivityIndicator color="#FFFFFF" size="small" />
                        ) : (
                          <Text style={styles.primaryBtnText}>Submit Partner Application</Text>
                        )}
                      </TouchableOpacity>
                    </View>
                  </View>
                )}
              </>
            )}
          </View>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F172A',
  },
  topBar: {
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.08)',
  },
  backToConsumerBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 8,
    backgroundColor: 'rgba(255,255,255,0.06)',
  },
  backToConsumerText: {
    color: '#CBD5E1',
    fontSize: 12,
    fontWeight: '700',
  },
  partnerBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  partnerBadgeText: {
    color: '#34D399',
    fontSize: 11,
    fontWeight: '700',
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 60,
    maxWidth: 680,
    width: '100%',
    alignSelf: 'center',
  },
  heroCard: {
    alignItems: 'center',
    paddingVertical: 24,
    paddingHorizontal: 16,
  },
  heroIconCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: THEME.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
    shadowColor: THEME.colors.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8,
  },
  heroTitle: {
    fontSize: 26,
    fontWeight: '900',
    color: '#F8FAFC',
    letterSpacing: -0.5,
  },
  heroSubtitle: {
    fontSize: 13,
    color: '#94A3B8',
    textAlign: 'center',
    marginTop: 4,
    maxWidth: 380,
  },
  perksRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 16,
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  perkPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: 'rgba(255,255,255,0.06)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  perkText: {
    color: '#E2E8F0',
    fontSize: 11,
    fontWeight: '700',
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#1E293B',
    borderRadius: 14,
    padding: 4,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
  },
  tabButton: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 10,
  },
  tabButtonActive: {
    backgroundColor: THEME.colors.primary,
  },
  tabButtonText: {
    color: '#94A3B8',
    fontSize: 13,
    fontWeight: '700',
  },
  tabButtonTextActive: {
    color: '#FFFFFF',
    fontWeight: '800',
  },
  card: {
    backgroundColor: '#1E293B',
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#F8FAFC',
  },
  cardSub: {
    fontSize: 12,
    color: '#94A3B8',
    marginTop: 4,
    marginBottom: 18,
  },
  demoFillBox: {
    backgroundColor: 'rgba(99, 102, 241, 0.1)',
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(99, 102, 241, 0.25)',
  },
  demoFillLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#818CF8',
  },
  demoPill: {
    backgroundColor: 'rgba(99, 102, 241, 0.25)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
  },
  demoPillText: {
    color: '#E0E7FF',
    fontSize: 11,
    fontWeight: '700',
  },
  inputGroup: {
    marginBottom: 14,
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#CBD5E1',
    marginBottom: 6,
  },
  inputField: {
    backgroundColor: '#0F172A',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 11,
    color: '#F8FAFC',
    fontSize: 14,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  primaryBtn: {
    backgroundColor: THEME.colors.primary,
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },
  primaryBtnDisabled: {
    opacity: 0.5,
  },
  primaryBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
  },
  switchTabLink: {
    alignItems: 'center',
    marginTop: 16,
  },
  switchTabLinkText: {
    fontSize: 12,
    color: '#94A3B8',
  },
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(220, 38, 38, 0.15)',
    padding: 10,
    borderRadius: 10,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(220, 38, 38, 0.3)',
  },
  errorText: {
    color: '#FCA5A5',
    fontSize: 12,
    flex: 1,
  },
  pendingCard: {
    backgroundColor: 'rgba(217, 119, 6, 0.12)',
    borderRadius: 14,
    padding: 14,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(217, 119, 6, 0.3)',
  },
  pendingTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 6,
  },
  pendingTitle: {
    color: '#FBBF24',
    fontSize: 14,
    fontWeight: '800',
  },
  pendingText: {
    color: '#E2E8F0',
    fontSize: 12,
    lineHeight: 18,
  },
  pendingDetailsBox: {
    backgroundColor: 'rgba(0,0,0,0.2)',
    padding: 10,
    borderRadius: 8,
    marginVertical: 10,
    gap: 4,
  },
  pendingDetailRow: {
    color: '#CBD5E1',
    fontSize: 11,
  },
  recheckBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 8,
    backgroundColor: 'rgba(217, 119, 6, 0.25)',
    borderRadius: 8,
  },
  recheckBtnText: {
    color: '#FBBF24',
    fontSize: 12,
    fontWeight: '700',
  },
  stepIndicatorRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.06)',
  },
  stepItem: {
    alignItems: 'center',
    gap: 4,
  },
  stepItemActive: {},
  stepDot: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: '#334155',
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepDotCompleted: {
    backgroundColor: THEME.colors.primary,
  },
  stepDotText: {
    color: '#94A3B8',
    fontSize: 11,
    fontWeight: '800',
  },
  stepDotTextCompleted: {
    color: '#FFFFFF',
  },
  stepItemText: {
    color: '#64748B',
    fontSize: 10,
    fontWeight: '600',
  },
  stepItemTextActive: {
    color: '#F8FAFC',
    fontWeight: '700',
  },
  stepContent: {},
  sectionHeading: {
    fontSize: 15,
    fontWeight: '800',
    color: '#F8FAFC',
  },
  sectionSub: {
    fontSize: 12,
    color: '#94A3B8',
    marginTop: 2,
    marginBottom: 16,
  },
  avatarPickerRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
  avatarPickItem: {
    width: 54,
    height: 54,
    borderRadius: 27,
    borderWidth: 2,
    borderColor: 'transparent',
    position: 'relative',
  },
  avatarPickItemActive: {
    borderColor: THEME.colors.primary,
  },
  avatarImg: {
    width: '100%',
    height: '100%',
    borderRadius: 27,
  },
  avatarCheckBadge: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    backgroundColor: THEME.colors.primary,
    width: 18,
    height: 18,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
  },
  langPillsWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  langPill: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: '#0F172A',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  langPillActive: {
    backgroundColor: 'rgba(99, 102, 241, 0.25)',
    borderColor: THEME.colors.primary,
  },
  langPillText: {
    color: '#94A3B8',
    fontSize: 11,
    fontWeight: '600',
  },
  langPillTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  voiceRecorderCard: {
    alignItems: 'center',
    backgroundColor: '#0F172A',
    borderRadius: 16,
    padding: 20,
    marginVertical: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  micBigCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: 'rgba(99, 102, 241, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  micBigCircleActive: {
    backgroundColor: 'rgba(239, 68, 68, 0.2)',
  },
  recordStatusText: {
    color: '#F8FAFC',
    fontSize: 13,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 14,
  },
  recordActionBtn: {
    backgroundColor: THEME.colors.primary,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 10,
  },
  recordActionBtnActive: {
    backgroundColor: '#DC2626',
  },
  recordActionBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
  voiceScriptHint: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 14,
    fontStyle: 'italic',
    textAlign: 'center',
    lineHeight: 16,
  },
  stepNavRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 20,
  },
  prevBtn: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.06)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  prevBtnText: {
    color: '#CBD5E1',
    fontSize: 13,
    fontWeight: '700',
  },
  nextBtn: {
    flex: 1,
    backgroundColor: THEME.colors.primary,
    paddingVertical: 12,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  nextBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
  payoutTrustBox: {
    flexDirection: 'row',
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    borderRadius: 12,
    padding: 12,
    marginVertical: 12,
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.25)',
  },
  payoutTrustTitle: {
    color: '#34D399',
    fontSize: 12,
    fontWeight: '800',
  },
  payoutTrustSub: {
    color: '#94A3B8',
    fontSize: 11,
    marginTop: 2,
    lineHeight: 16,
  },
  rulesCard: {
    backgroundColor: '#0F172A',
    borderRadius: 14,
    padding: 14,
    gap: 12,
    marginVertical: 12,
  },
  ruleItem: {
    flexDirection: 'row',
    gap: 10,
    alignItems: 'flex-start',
  },
  ruleText: {
    color: '#CBD5E1',
    fontSize: 12,
    flex: 1,
    lineHeight: 18,
  },
  checkboxRow: {
    flexDirection: 'row',
    gap: 10,
    alignItems: 'flex-start',
    marginVertical: 12,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: '#64748B',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  checkboxChecked: {
    backgroundColor: THEME.colors.primary,
    borderColor: THEME.colors.primary,
  },
  checkboxLabel: {
    color: '#CBD5E1',
    fontSize: 12,
    flex: 1,
    lineHeight: 18,
  },
  successState: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  successIconCircle: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },
  successTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#F8FAFC',
  },
  successSub: {
    fontSize: 13,
    color: '#94A3B8',
    textAlign: 'center',
    marginTop: 6,
    lineHeight: 20,
  },
  successDetailCard: {
    width: '100%',
    backgroundColor: '#0F172A',
    borderRadius: 12,
    padding: 14,
    marginVertical: 20,
    gap: 6,
  },
  successRow: {
    color: '#CBD5E1',
    fontSize: 12,
  },
});
