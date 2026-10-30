import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Modal,
  TextInput,
  Alert,
} from 'react-native';
import {
  ArrowLeft,
  Shield,
  FileText,
  RotateCcw,
  CreditCard,
  Clock,
  Trash2,
  Star,
  Headphones,
  Globe,
  LogOut,
  ChevronRight,
  UserCheck,
  IndianRupee,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  X,
} from 'lucide-react-native';
import { THEME } from '../theme';

interface AccountScreenProps {
  onBackPress: () => void;
  onTransactionsPress: () => void;
  onCallHistoryPress?: () => void;
  onPrivacyPress?: () => void;
  onTermsPress?: () => void;
  onRefundPress?: () => void;
  onHelpPress: () => void;
  onBecomeListenerPress: () => void;
  onEarningsPress?: () => void;
  isListenerVerified?: boolean;
  userName?: string;
  userRole?: 'talker' | 'listener';
  onLogout?: () => void;
  onOpenHostPortal?: () => void;
}

export const AccountScreen: React.FC<AccountScreenProps> = ({
  onBackPress,
  onTransactionsPress,
  onCallHistoryPress,
  onPrivacyPress,
  onTermsPress,
  onRefundPress,
  onHelpPress,
  onBecomeListenerPress,
  onEarningsPress,
  isListenerVerified = false,
  userName = 'Amit',
  userRole = 'talker',
  onLogout,
  onOpenHostPortal,
}) => {
  const [selectedLanguage, setSelectedLanguage] = useState('Hindi & English');
  const [showLanguageModal, setShowLanguageModal] = useState(false);
  const [showRatingModal, setShowRatingModal] = useState(false);
  const [ratingStars, setRatingStars] = useState(5);
  const [ratingFeedback, setRatingFeedback] = useState('');
  const [showRatingSuccess, setShowRatingSuccess] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const availableLanguages = [
    { label: 'Hindi & English (Default)', val: 'Hindi & English' },
    { label: 'Hindi (हिंदी)', val: 'Hindi' },
    { label: 'English (UK / US)', val: 'English' },
    { label: 'Hinglish (Casual)', val: 'Hinglish' },
    { label: 'Marathi (मराठी)', val: 'Marathi' },
    { label: 'Punjabi (ਪੰਜਾਬੀ)', val: 'Punjabi' },
    { label: 'Gujarati (ગુજરાતી)', val: 'Gujarati' },
    { label: 'Bengali (বাংলা)', val: 'Bengali' },
    { label: 'Tamil (தமிழ்)', val: 'Tamil' },
    { label: 'Telugu (తెలుగు)', val: 'Telugu' },
  ];

  const handleRatingSubmit = () => {
    setShowRatingSuccess(true);
    setTimeout(() => {
      setShowRatingSuccess(false);
      setShowRatingModal(false);
      setRatingFeedback('');
    }, 1500);
  };

  const handleDeleteAccount = () => {
    setShowDeleteModal(false);
    if (onLogout) onLogout();
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={onBackPress} style={styles.backBtn}>
          <ArrowLeft size={22} color={THEME.colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Account</Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        {/* User Info Card */}
        <View style={styles.userCard}>
          <Image
            source={{ uri: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80' }}
            style={styles.avatar}
          />
          <View style={styles.userInfo}>
            <Text style={styles.userName}>Hello, {userName}</Text>
            <Text style={styles.userPhone}>Role: {userRole === 'listener' ? 'Host (Listener)' : 'Caller (Talker)'}</Text>
          </View>
          {onLogout && (
            <TouchableOpacity style={styles.editBtn} onPress={onLogout} activeOpacity={0.8}>
              <Text style={styles.editBtnText}>Log Out</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Host Earnings Card (Only rendered if host logged in) */}
        {userRole === 'listener' && onEarningsPress && (
          <TouchableOpacity
            style={styles.earningsCard}
            onPress={onEarningsPress}
            activeOpacity={0.85}
          >
            <View style={styles.earningsIconCircle}>
              <IndianRupee size={18} color="#D97706" />
            </View>
            <View style={{ flex: 1 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                <Text style={styles.earningsTitle}>Host Earnings & Settlements</Text>
                <View style={styles.planBadge}><Text style={styles.planBadgeText}>₹4.50 / ₹16.00 min</Text></View>
              </View>
              <Text style={styles.earningsSub}>View creator revenue share & request 1-click UPI payouts</Text>
            </View>
            <ChevronRight size={18} color="#D97706" />
          </TouchableOpacity>
        )}

        {/* Menu Options Card */}
        <View style={styles.menuCard}>
          {[
            { label: 'Transactions', icon: CreditCard, action: onTransactionsPress },
            { label: 'Call History', icon: Clock, action: onCallHistoryPress },
            { label: 'Privacy Policy', icon: Shield, action: onPrivacyPress },
            { label: 'Terms and Conditions', icon: FileText, action: onTermsPress },
            { label: 'Return & Refund Policy', icon: RotateCcw, action: onRefundPress },
            { label: 'Work as a Host Partner (/host)', icon: Sparkles, color: '#4F46E5', action: onOpenHostPortal || onBecomeListenerPress },
            { label: 'Help & Support', icon: Headphones, action: onHelpPress },
            { label: `Language: ${selectedLanguage}`, icon: Globe, action: () => setShowLanguageModal(true) },
            { label: 'Rate Us on Play Store', icon: Star, action: () => setShowRatingModal(true) },
            { label: 'Delete Account', icon: Trash2, color: THEME.colors.red, action: () => setShowDeleteModal(true) },
          ].map((item, idx) => {
            const Icon = item.icon;
            return (
              <TouchableOpacity
                key={idx}
                style={styles.menuItem}
                onPress={item.action}
                activeOpacity={0.8}
              >
                <View style={styles.menuItemLeft}>
                  <Icon size={18} color={item.color || THEME.colors.textSecondary} />
                  <Text style={[styles.menuItemLabel, item.color && { color: item.color }]}>
                    {item.label}
                  </Text>
                </View>
                <ChevronRight size={16} color={THEME.colors.textMuted} />
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Sign Out & Version Info */}
        <View style={styles.footerSection}>
          <TouchableOpacity
            style={styles.signOutBtn}
            onPress={onLogout}
            activeOpacity={0.8}
          >
            <LogOut size={16} color={THEME.colors.primary} />
            <Text style={styles.signOutText}>Change Account / Sign Out</Text>
          </TouchableOpacity>

          <Text style={styles.versionText}>Version 1.0.179</Text>
          <Text style={styles.companyText}>Chatzie Technologies Pvt. Ltd.</Text>
        </View>
      </ScrollView>

      {/* 1. Language Selection Modal */}
      <Modal visible={showLanguageModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Choose App Language</Text>
              <TouchableOpacity onPress={() => setShowLanguageModal(false)}>
                <X size={20} color="#64748B" />
              </TouchableOpacity>
            </View>
            <ScrollView style={{ maxHeight: 320 }}>
              {availableLanguages.map((lang, idx) => (
                <TouchableOpacity
                  key={idx}
                  style={[styles.langItem, selectedLanguage === lang.val && styles.langItemActive]}
                  onPress={() => {
                    setSelectedLanguage(lang.val);
                    setShowLanguageModal(false);
                  }}
                >
                  <Text style={[styles.langText, selectedLanguage === lang.val && styles.langTextActive]}>
                    {lang.label}
                  </Text>
                  {selectedLanguage === lang.val && <CheckCircle2 size={16} color="#2563EB" />}
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* 2. Rate Us Modal */}
      <Modal visible={showRatingModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Rate Your Experience</Text>
              <TouchableOpacity onPress={() => setShowRatingModal(false)}>
                <X size={20} color="#64748B" />
              </TouchableOpacity>
            </View>

            {showRatingSuccess ? (
              <View style={{ alignItems: 'center', paddingVertical: 20 }}>
                <CheckCircle2 size={44} color="#10B981" />
                <Text style={{ fontSize: 16, fontWeight: '800', color: '#0F172A', marginTop: 10 }}>Thank You!</Text>
                <Text style={{ fontSize: 13, color: '#64748B', marginTop: 4 }}>Your 5-star feedback has been recorded.</Text>
              </View>
            ) : (
              <View>
                <Text style={{ fontSize: 13, color: '#64748B', textAlign: 'center', marginVertical: 8 }}>
                  How do you feel about connecting on Chatzie?
                </Text>

                {/* Star Row */}
                <View style={{ flexDirection: 'row', justifyContent: 'center', gap: 10, marginVertical: 14 }}>
                  {[1, 2, 3, 4, 5].map((star) => (
                    <TouchableOpacity key={star} onPress={() => setRatingStars(star)}>
                      <Star
                        size={32}
                        color="#F59E0B"
                        fill={star <= ratingStars ? '#F59E0B' : 'transparent'}
                      />
                    </TouchableOpacity>
                  ))}
                </View>

                <TextInput
                  style={styles.feedbackInput}
                  placeholder="Tell us what you liked or how we can improve..."
                  placeholderTextColor="#94A3B8"
                  value={ratingFeedback}
                  onChangeText={setRatingFeedback}
                  multiline
                />

                <TouchableOpacity style={styles.submitRatingBtn} onPress={handleRatingSubmit} activeOpacity={0.85}>
                  <Text style={styles.submitRatingText}>Submit Review</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </View>
      </Modal>

      {/* 3. Delete Account Confirmation Modal */}
      <Modal visible={showDeleteModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={{ alignItems: 'center', marginBottom: 12 }}>
              <View style={{ width: 56, height: 56, borderRadius: 28, backgroundColor: '#FEE2E2', justifyContent: 'center', alignItems: 'center', marginBottom: 12 }}>
                <AlertTriangle size={28} color="#DC2626" />
              </View>
              <Text style={{ fontSize: 18, fontWeight: '800', color: '#0F172A' }}>Delete Chatzie Account?</Text>
            </View>
            <Text style={{ fontSize: 13, color: '#64748B', textAlign: 'center', lineHeight: 18, marginBottom: 20 }}>
              This will permanently purge your account data, coin balance, call logs, and private chats. This action is irreversible.
            </Text>
            <View style={{ gap: 8 }}>
              <TouchableOpacity style={styles.confirmDeleteBtn} onPress={handleDeleteAccount} activeOpacity={0.85}>
                <Text style={styles.confirmDeleteText}>Confirm Delete & Erase Data</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.cancelDeleteBtn} onPress={() => setShowDeleteModal(false)} activeOpacity={0.85}>
                <Text style={styles.cancelDeleteText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
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
    paddingHorizontal: 16,
    backgroundColor: THEME.colors.white,
    borderBottomWidth: 1,
    borderBottomColor: THEME.colors.borderLight,
    gap: 12,
  },
  backBtn: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: THEME.colors.textPrimary,
  },
  content: {
    padding: 16,
    paddingBottom: 40,
  },
  userCard: {
    backgroundColor: THEME.colors.white,
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: THEME.colors.border,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 4,
    elevation: 1,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    borderWidth: 2,
    borderColor: THEME.colors.primary,
  },
  userInfo: {
    flex: 1,
    marginLeft: 14,
  },
  userName: {
    fontSize: 16,
    fontWeight: '800',
    color: THEME.colors.textPrimary,
  },
  userPhone: {
    fontSize: 12,
    color: THEME.colors.textSecondary,
    marginTop: 2,
  },
  editBtn: {
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 8,
    backgroundColor: THEME.colors.borderLight,
  },
  editBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: THEME.colors.textSecondary,
  },
  modeCard: {
    backgroundColor: THEME.colors.primaryBg,
    borderRadius: 16,
    padding: 14,
    marginTop: 14,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(30,64,175,0.2)',
    gap: 12,
  },
  modeIcon: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: THEME.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modeTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: THEME.colors.primary,
  },
  modeSub: {
    fontSize: 11,
    color: THEME.colors.textSecondary,
    marginTop: 1,
  },
  earningsCard: {
    backgroundColor: '#FFFBEB',
    borderRadius: 16,
    padding: 14,
    marginTop: 12,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#FDE68A',
    gap: 12,
  },
  earningsIconCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#FEF3C7',
    borderWidth: 1,
    borderColor: '#FDE68A',
    alignItems: 'center',
    justifyContent: 'center',
  },
  earningsTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#92400E',
  },
  planBadge: {
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  planBadgeText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#B45309',
  },
  earningsSub: {
    fontSize: 11,
    color: '#78350F',
    marginTop: 2,
  },
  menuCard: {
    backgroundColor: THEME.colors.white,
    borderRadius: 16,
    marginTop: 16,
    borderWidth: 1,
    borderColor: THEME.colors.border,
    overflow: 'hidden',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: THEME.colors.borderLight,
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  menuItemLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: THEME.colors.textPrimary,
  },
  footerSection: {
    alignItems: 'center',
    marginTop: 28,
  },
  signOutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  signOutText: {
    fontSize: 14,
    fontWeight: '800',
    color: THEME.colors.primary,
  },
  versionText: {
    fontSize: 11,
    color: THEME.colors.textMuted,
    marginTop: 8,
  },
  companyText: {
    fontSize: 11,
    color: THEME.colors.textMuted,
    marginTop: 2,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.75)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 20,
    width: '100%',
    maxWidth: 400,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 8,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  modalTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: '#0F172A',
  },
  langItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 10,
    marginBottom: 4,
  },
  langItemActive: {
    backgroundColor: '#EFF6FF',
  },
  langText: {
    fontSize: 14,
    color: '#334155',
    fontWeight: '500',
  },
  langTextActive: {
    color: '#2563EB',
    fontWeight: '700',
  },
  feedbackInput: {
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    padding: 12,
    fontSize: 13,
    color: '#0F172A',
    minHeight: 70,
    marginBottom: 16,
    textAlignVertical: 'top',
  },
  submitRatingBtn: {
    backgroundColor: '#2563EB',
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  submitRatingText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
  confirmDeleteBtn: {
    backgroundColor: '#DC2626',
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  confirmDeleteText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
  cancelDeleteBtn: {
    paddingVertical: 10,
    alignItems: 'center',
  },
  cancelDeleteText: {
    color: '#64748B',
    fontSize: 13,
    fontWeight: '600',
  },
});
