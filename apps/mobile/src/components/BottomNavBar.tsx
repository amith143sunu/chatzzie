import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import { Home, Phone, MessageSquare, Wallet } from 'lucide-react-native';
import { THEME } from '../theme';

export type NavTab = 'home' | 'calls' | 'chat' | 'wallet';

interface BottomNavBarProps {
  activeTab: NavTab;
  onTabChange: (tab: NavTab) => void;
  unreadChatCount?: number;
}

export const BottomNavBar: React.FC<BottomNavBarProps> = ({
  activeTab,
  onTabChange,
  unreadChatCount = 1
}) => {
  return (
    <View style={styles.container}>
      {/* 1. Home Tab */}
      <TouchableOpacity
        style={styles.tabButton}
        onPress={() => onTabChange('home')}
        activeOpacity={0.8}
      >
        <Home
          size={22}
          color={activeTab === 'home' ? THEME.colors.primary : THEME.colors.textMuted}
          strokeWidth={activeTab === 'home' ? 2.5 : 2}
        />
        <Text style={[styles.tabLabel, activeTab === 'home' && styles.tabLabelActive]}>
          Home
        </Text>
      </TouchableOpacity>

      {/* 2. Calls Tab */}
      <TouchableOpacity
        style={styles.tabButton}
        onPress={() => onTabChange('calls')}
        activeOpacity={0.8}
      >
        <Phone
          size={22}
          color={activeTab === 'calls' ? THEME.colors.primary : THEME.colors.textMuted}
          strokeWidth={activeTab === 'calls' ? 2.5 : 2}
        />
        <Text style={[styles.tabLabel, activeTab === 'calls' && styles.tabLabelActive]}>
          Calls
        </Text>
      </TouchableOpacity>

      {/* 3. Chat Tab */}
      <TouchableOpacity
        style={styles.tabButton}
        onPress={() => onTabChange('chat')}
        activeOpacity={0.8}
      >
        <View style={styles.iconWrapper}>
          <MessageSquare
            size={22}
            color={activeTab === 'chat' ? THEME.colors.primary : THEME.colors.textMuted}
            strokeWidth={activeTab === 'chat' ? 2.5 : 2}
          />
          {unreadChatCount > 0 && (
            <View style={styles.badgeDot} />
          )}
        </View>
        <Text style={[styles.tabLabel, activeTab === 'chat' && styles.tabLabelActive]}>
          Chat
        </Text>
      </TouchableOpacity>

      {/* 4. Wallet Tab */}
      <TouchableOpacity
        style={styles.tabButton}
        onPress={() => onTabChange('wallet')}
        activeOpacity={0.8}
      >
        <Wallet
          size={22}
          color={activeTab === 'wallet' ? THEME.colors.primary : THEME.colors.textMuted}
          strokeWidth={activeTab === 'wallet' ? 2.5 : 2}
        />
        <Text style={[styles.tabLabel, activeTab === 'wallet' && styles.tabLabelActive]}>
          Wallet
        </Text>
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
    justifyContent: 'space-around',
    borderTopWidth: 1,
    borderTopColor: THEME.colors.border,
    paddingBottom: Platform.OS === 'web' ? 6 : 4,
  },
  tabButton: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    paddingVertical: 8,
    minHeight: 48,
  },
  iconWrapper: {
    position: 'relative',
  },
  badgeDot: {
    position: 'absolute',
    top: -2,
    right: -3,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: THEME.colors.redBadge,
  },
  tabLabel: {
    fontSize: 10,
    fontWeight: '600',
    color: THEME.colors.textMuted,
    marginTop: 4,
  },
  tabLabelActive: {
    color: THEME.colors.primary,
    fontWeight: '700',
  }
});
