import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  TextInput,
} from 'react-native';
import { Bell, Search, ChevronRight, CheckCheck } from 'lucide-react-native';
import { HeaderBar } from '../components/HeaderBar';
import { THEME } from '../theme';

interface ChatScreenProps {
  balanceINR: number;
  onBalancePress: () => void;
  onConversationPress: (conversation: any) => void;
  isDesktop?: boolean;
}

export const ChatScreen: React.FC<ChatScreenProps> = ({
  balanceINR,
  onBalancePress,
  onConversationPress,
  isDesktop = false,
}) => {
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const conversations = [
    {
      id: 'c-1',
      name: 'Priya Sharma',
      avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
      lastMessage: 'Thanks for sharing that! Really gave me a fresh perspective.',
      time: '10:14 AM',
      unread: 0,
      online: true,
    },
    {
      id: 'c-2',
      name: 'Kabir Mehra',
      avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80',
      lastMessage: 'Are you free for a quick 10-minute audio call today?',
      time: '9:42 AM',
      unread: 1,
      online: true,
    },
    {
      id: 'c-3',
      name: 'Ananya Roy',
      avatarUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=400&q=80',
      lastMessage: 'Hope your presentation went well this morning!',
      time: '8:15 AM',
      unread: 0,
      online: false,
    },
    {
      id: 'c-4',
      name: 'Dr. Rohan Kapoor',
      avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&q=80',
      lastMessage: 'Remember to take short walking breaks when stressed.',
      time: 'Yesterday',
      unread: 0,
      online: true,
    },
    {
      id: 'c-5',
      name: 'Meera Iyer',
      avatarUrl: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=400&q=80',
      lastMessage: 'I listened to that podcast recommendation, loved it!',
      time: 'Yesterday',
      unread: 0,
      online: false,
    },
    {
      id: 'c-6',
      name: 'Zaid Siddiqui',
      avatarUrl: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&w=400&q=80',
      lastMessage: "Let's connect again over the weekend.",
      time: 'Wednesday',
      unread: 2,
      online: true,
    },
    {
      id: 'c-7',
      name: 'Pooja Hegde',
      avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=400&q=80',
      lastMessage: 'Take care and have a wonderful week ahead!',
      time: 'Tuesday',
      unread: 0,
      online: false,
    },
  ];

  return (
    <View style={styles.container}>
      {!isDesktop && (
        <HeaderBar
          title="Chat"
          balanceINR={balanceINR}
          onBalancePress={onBalancePress}
        />
      )}

      {isDesktop && (
        <View style={styles.desktopChatHeader}>
          <Text style={styles.desktopChatTitle}>Messages & Conversations</Text>
          <Text style={styles.desktopChatSub}>
            Private 1:1 chat with verified hosts • ₹0.25/text • ₹0.75/photo
          </Text>
        </View>
      )}

      {/* Notifications Warning Banner */}
      {!notificationsEnabled && (
        <TouchableOpacity
          style={styles.notificationBanner}
          onPress={() => setNotificationsEnabled(true)}
          activeOpacity={0.85}
        >
          <Bell size={16} color={THEME.colors.primary} />
          <Text style={styles.notificationText}>
            Notifications are turned off. Tap to enable.
          </Text>
          <ChevronRight size={16} color={THEME.colors.primary} />
        </TouchableOpacity>
      )}

      {/* Search Header */}
      <View style={styles.searchRow}>
        <View style={styles.searchBox}>
          <Search size={16} color={THEME.colors.textMuted} />
          <TextInput
            placeholder="Search conversations..."
            placeholderTextColor={THEME.colors.textMuted}
            value={searchQuery}
            onChangeText={setSearchQuery}
            style={styles.searchInput}
          />
        </View>
      </View>

      {/* Conversations List */}
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
      >
        {conversations.map((chat) => (
          <TouchableOpacity
            key={chat.id}
            style={styles.chatRow}
            onPress={() => onConversationPress(chat)}
            activeOpacity={0.85}
          >
            {/* Avatar */}
            <View style={styles.avatarWrapper}>
              <Image source={{ uri: chat.avatarUrl }} style={styles.avatar} />
              {chat.online && <View style={styles.onlineDot} />}
            </View>

            {/* Content */}
            <View style={styles.chatContent}>
              <View style={styles.chatTopRow}>
                <Text style={styles.chatName}>{chat.name}</Text>
                <Text style={styles.chatTime}>{chat.time}</Text>
              </View>

              <View style={styles.chatBottomRow}>
                <Text style={styles.lastMessage} numberOfLines={1}>
                  {chat.lastMessage}
                </Text>

                {chat.unread > 0 ? (
                  <View style={styles.unreadBadge}>
                    <Text style={styles.unreadText}>{chat.unread}</Text>
                  </View>
                ) : (
                  <CheckCheck size={14} color={THEME.colors.primaryLight} />
                )}
              </View>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: THEME.colors.white,
  },
  notificationBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: THEME.colors.primaryBg,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(30,64,175,0.1)',
    gap: 8,
  },
  notificationText: {
    flex: 1,
    fontSize: 12,
    fontWeight: '700',
    color: THEME.colors.primary,
  },
  searchRow: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: THEME.colors.borderLight,
  },
  searchBox: {
    height: 38,
    backgroundColor: THEME.colors.borderLight,
    borderRadius: 19,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
  },
  searchInput: {
    flex: 1,
    fontSize: 13,
    color: THEME.colors.textPrimary,
    marginLeft: 6,
    paddingVertical: 0,
  },
  listContent: {
    paddingBottom: 24,
  },
  chatRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: THEME.colors.borderLight,
  },
  avatarWrapper: {
    position: 'relative',
    marginRight: 14,
  },
  avatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: THEME.colors.borderLight,
  },
  onlineDot: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: THEME.colors.online,
    borderWidth: 2,
    borderColor: THEME.colors.white,
  },
  chatContent: {
    flex: 1,
  },
  chatTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  chatName: {
    fontSize: 15,
    fontWeight: '700',
    color: THEME.colors.textPrimary,
  },
  chatTime: {
    fontSize: 11,
    color: THEME.colors.textMuted,
  },
  chatBottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 4,
  },
  lastMessage: {
    fontSize: 13,
    color: THEME.colors.textSecondary,
    flex: 1,
    marginRight: 8,
  },
  unreadBadge: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#F59E0B',
    alignItems: 'center',
    justifyContent: 'center',
  },
  unreadText: {
    color: THEME.colors.white,
    fontSize: 11,
    fontWeight: '800',
  },
  desktopChatHeader: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  desktopChatTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#0F172A',
    letterSpacing: -0.3,
  },
  desktopChatSub: {
    fontSize: 13,
    color: '#64748B',
    marginTop: 4,
  },
});
