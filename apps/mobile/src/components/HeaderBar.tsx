import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { IndianRupee } from 'lucide-react-native';
import { THEME } from '../theme';

interface HeaderBarProps {
  userName?: string;
  avatarUrl?: string;
  balanceINR: number;
  onBalancePress: () => void;
  onAvatarPress?: () => void;
  title?: string;
}

export const HeaderBar: React.FC<HeaderBarProps> = ({
  userName = 'Amit',
  avatarUrl = 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80',
  balanceINR,
  onBalancePress,
  onAvatarPress,
  title
}) => {
  return (
    <View style={styles.container}>
      {title ? (
        <Text style={styles.title}>{title}</Text>
      ) : (
        <TouchableOpacity style={styles.userSection} onPress={onAvatarPress} activeOpacity={0.8}>
          <Image source={{ uri: avatarUrl }} style={styles.avatar} />
          <View>
            <Text style={styles.greetingText}>Hello, {userName}!</Text>
            <Text style={styles.subGreetingText}>Happy to have you here!</Text>
          </View>
        </TouchableOpacity>
      )}

      {/* Balance Pill Button */}
      <TouchableOpacity
        style={styles.balancePill}
        onPress={onBalancePress}
        activeOpacity={0.85}
      >
        <Text style={styles.currencySymbol}>₹</Text>
        <Text style={styles.balanceText}>{balanceINR.toFixed(2)}</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    height: 64,
    backgroundColor: THEME.colors.white,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: THEME.colors.borderLight,
  },
  userSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: THEME.colors.primary,
  },
  greetingText: {
    fontSize: THEME.typography.sizes.base,
    fontWeight: '700',
    color: THEME.colors.textPrimary,
  },
  subGreetingText: {
    fontSize: THEME.typography.sizes.xs,
    color: THEME.colors.textSecondary,
  },
  title: {
    fontSize: THEME.typography.sizes.xl,
    fontWeight: '800',
    color: THEME.colors.primary,
    letterSpacing: -0.5,
  },
  balancePill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: THEME.colors.primary,
    backgroundColor: THEME.colors.primaryBg,
  },
  currencySymbol: {
    fontSize: 14,
    fontWeight: '700',
    color: THEME.colors.primary,
    marginRight: 2,
  },
  balanceText: {
    fontSize: 14,
    fontWeight: '800',
    color: THEME.colors.primary,
  }
});
