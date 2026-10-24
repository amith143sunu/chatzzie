import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  TextInput,
  Alert,
} from 'react-native';
import { Bell, Search, ChevronRight, CheckCheck } from 'lucide-react-native';
import { HeaderBar } from '../components/HeaderBar';
import { THEME } from '../theme';
import { getApiBaseUrl } from '../services/apiConfig';

interface ChatScreenProps {
  balanceINR: number;
  onBalancePress: () => void;
  onConversationPress: (conversation: any) => void;
  isDesktop?: boolean;
  userName?: string;
  userId?: string;
}

export const ChatScreen: React.FC<ChatScreenProps> = ({
  balanceINR,
  onBalancePress,
  onConversationPress,
  isDesktop = false,
  userName = 'Caller',
  userId = 'u_caller',
}) => {
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [conversations, setConversations] = useState<any[]>([
    {
      id: 'c-1',
      name: 'Priya Sharma',
      username: 'priya_sharma',
      avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
      lastMessage: 'Thanks for connecting! Send me a message or call whenever you are ready.',
      time: 'Just now',
      unread: 0,
      online: true,
    }
  ]);

  // Real-Time Caller Conversations Poller
  useEffect(() => {
    let isMounted = true;
    const fetchConversations = async () => {
      try {
        const baseUrl = getApiBaseUrl();
        const effectiveCaller = userName || userId || 'Caller';
        const res = await fetch(`${baseUrl}/api/chat/caller-conversations?caller=${encodeURIComponent(effectiveCaller)}`);
        if (res.ok) {
          const data = await res.json();
          if (data.success && Array.isArray(data.conversations) && data.conversations.length > 0 && isMounted) {
            setConversations(data.conversations);
          }
        }
      } catch (e) {}
    };

    fetchConversations();
    const interval = setInterval(fetchConversations, 2000);
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [userName, userId]);

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
      <TouchableOpacity
        style={styles.notificationBanner}
        onPress={async () => {
          if (typeof window !== 'undefined' && 'Notification' in window) {
            try {
              const perm = await Notification.requestPermission();
              if (perm === 'granted') {
                setNotificationsEnabled(true);
                Alert.alert('Notifications Enabled', 'You will now receive notifications for incoming messages and calls!');
                return;
              }
            } catch (e) {}
          }
          setNotificationsEnabled(!notificationsEnabled);
        }}
        activeOpacity={0.85}
      >
        <Bell size={16} color={THEME.colors.primary} />
        <Text style={styles.notificationText}>
          {notificationsEnabled ? '🔔 Real-time notifications active' : 'Notifications are turned off. Tap to enable.'}
        </Text>
        <ChevronRight size={16} color={THEME.colors.primary} />
      </TouchableOpacity>

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
        {(searchQuery.trim()
          ? conversations.filter(c => c.name.toLowerCase().includes(searchQuery.toLowerCase()) || (c.lastMessage && c.lastMessage.toLowerCase().includes(searchQuery.toLowerCase())))
          : conversations
        ).map((chat) => (
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
