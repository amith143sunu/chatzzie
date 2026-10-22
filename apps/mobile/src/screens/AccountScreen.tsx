import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
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
  UserCheck
} from 'lucide-react-native';
import { THEME } from '../theme';

interface AccountScreenProps {
  onBackPress: () => void;
  onTransactionsPress: () => void;
  onHelpPress: () => void;
  onBecomeListenerPress: () => void;
  isListenerVerified?: boolean;
}

export const AccountScreen: React.FC<AccountScreenProps> = ({
  onBackPress,
  onTransactionsPress,
  onHelpPress,
  onBecomeListenerPress,
  isListenerVerified = false,
}) => {
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
            <Text style={styles.userName}>Hello, Amit</Text>
            <Text style={styles.userPhone}>Phone: 8700788942</Text>
          </View>
          <TouchableOpacity style={styles.editBtn} activeOpacity={0.8}>
            <Text style={styles.editBtnText}>Edit</Text>
          </TouchableOpacity>
        </View>

        {/* Listener Mode Banner */}
        <TouchableOpacity
          style={styles.modeCard}
          onPress={onBecomeListenerPress}
          activeOpacity={0.85}
        >
          <View style={styles.modeIcon}>
            <Headphones size={20} color={THEME.colors.white} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.modeTitle}>
              {isListenerVerified ? 'Switch to Listener Mode' : 'Become a Verified Listener'}
            </Text>
            <Text style={styles.modeSub}>
              {isListenerVerified ? 'Accept calls and earn per minute' : 'Apply with voice sample and PAN card'}
            </Text>
          </View>
          <ChevronRight size={18} color={THEME.colors.primary} />
        </TouchableOpacity>

        {/* Menu Options Card */}
        <View style={styles.menuCard}>
          {[
            { label: 'Transactions', icon: CreditCard, action: onTransactionsPress },
            { label: 'Call History', icon: Clock },
            { label: 'Privacy Policy', icon: Shield },
            { label: 'Terms and Conditions', icon: FileText },
            { label: 'Return & Refund Policy', icon: RotateCcw },
            { label: 'Help & Support', icon: Headphones, action: onHelpPress },
            { label: 'Change Language', icon: Globe },
            { label: 'Rate Us', icon: Star },
            { label: 'Delete Account', icon: Trash2, color: THEME.colors.red },
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
          <TouchableOpacity style={styles.signOutBtn} activeOpacity={0.8}>
            <LogOut size={16} color={THEME.colors.primary} />
            <Text style={styles.signOutText}>Sign Out</Text>
          </TouchableOpacity>

          <Text style={styles.versionText}>Version 1.0.179</Text>
          <Text style={styles.companyText}>Chatzie Technologies Pvt. Ltd.</Text>
        </View>
      </ScrollView>
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
  }
});
