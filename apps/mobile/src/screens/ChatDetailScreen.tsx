'use client';

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Image,
  KeyboardAvoidingView,
  Platform,
  Alert,
  Modal,
} from 'react-native';
import {
  ArrowLeft,
  Phone,
  Video,
  Send,
  ShieldAlert,
  Mic,
  Sparkles,
  CheckCheck,
  Image as ImageIcon,
  Plus,
  Coins,
  X
} from 'lucide-react-native';
import { THEME } from '../theme';

interface ChatDetailScreenProps {
  partnerName: string;
  partnerAvatar: string;
  partnerRate: number;
  userBalanceINR: number;
  onBackPress: () => void;
  onAudioCallPress: () => void;
  onVideoCallPress: () => void;
  onDeductChatCost: (amount: number, description: string) => boolean;
  onRechargePress: () => void;
}

interface Message {
  id: string;
  sender: 'user' | 'partner';
  text: string;
  imageUrl?: string;
  time: string;
}

const SAMPLE_PHOTO_PRESETS = [
  {
    label: 'Coffee & Relax',
    url: 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?auto=format&fit=crop&w=400&q=80',
    caption: 'Taking a cozy break with warm coffee ☕',
  },
  {
    label: 'Sunset Sky',
    url: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=400&q=80',
    caption: 'Look at the calming sky outside today!',
  },
  {
    label: 'Peaceful Nature',
    url: 'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?auto=format&fit=crop&w=400&q=80',
    caption: 'Nature is always so therapeutic.',
  },
  {
    label: 'Desk View',
    url: 'https://images.unsplash.com/photo-1497215728101-856f4ea42174?auto=format&fit=crop&w=400&q=80',
    caption: 'Finally wrapping up work for the evening.',
  },
];

export const ChatDetailScreen: React.FC<ChatDetailScreenProps> = ({
  partnerName,
  partnerAvatar,
  partnerRate,
  userBalanceINR,
  onBackPress,
  onAudioCallPress,
  onVideoCallPress,
  onDeductChatCost,
  onRechargePress,
}) => {
  const [inputText, setInputText] = useState('');
  const [showPhotoPicker, setShowPhotoPicker] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'm1',
      sender: 'partner',
      text: `Hello! Nice to connect with you on Chatzie. How has your day been?`,
      time: '10:05 AM',
    },
    {
      id: 'm2',
      sender: 'user',
      text: 'Hey! Work was quite busy today, just wanted someone neutral to talk with and relax.',
      time: '10:08 AM',
    },
    {
      id: 'm3',
      sender: 'partner',
      text: 'I completely understand! Take a deep breath. We can chat here or hop on a quick audio call whenever you feel like.',
      time: '10:10 AM',
    }
  ]);

  const quickIcebreakers = [
    'How do you unwind after a busy day?',
    'What music helps you relax?',
    'Free for a quick audio call?',
    'Any good book or show recommendations?'
  ];

  // Send Text Message (Costs ₹0.25)
  const handleSendText = () => {
    if (!inputText.trim()) return;

    if (userBalanceINR < 0.25) {
      Alert.alert(
        'Insufficient Balance',
        'Sending a chat message costs ₹0.25. Please recharge your wallet to continue.',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Recharge Now', onPress: onRechargePress },
        ]
      );
      return;
    }

    const deducted = onDeductChatCost(0.25, `Chat text message to ${partnerName}`);
    if (!deducted) return;

    const newMsg: Message = {
      id: `m_${Date.now()}`,
      sender: 'user',
      text: inputText.trim(),
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages([...messages, newMsg]);
    setInputText('');

    const replies = [
      'That makes total sense. I am listening!',
      'I appreciate you sharing that with me. It really helps to talk things through.',
      'That sounds interesting! Tell me a bit more about how that felt.',
      'Whenever you want to talk more in-depth, feel free to start an audio call!'
    ];
    const randomReply = replies[Math.floor(Math.random() * replies.length)];

    // Simulate partner response
    setTimeout(() => {
      const replyMsg: Message = {
        id: `m_${Date.now() + 1}`,
        sender: 'partner',
        text: randomReply,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages(prev => [...prev, replyMsg]);
    }, 1200);
  };

  // Send Image Message (Costs ₹0.75)
  const handleSendImage = (preset: typeof SAMPLE_PHOTO_PRESETS[0]) => {
    setShowPhotoPicker(false);

    if (userBalanceINR < 0.75) {
      Alert.alert(
        'Insufficient Balance',
        'Sending a photo message costs ₹0.75. Please recharge your wallet to continue.',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Recharge Now', onPress: onRechargePress },
        ]
      );
      return;
    }

    const deducted = onDeductChatCost(0.75, `Photo message to ${partnerName}`);
    if (!deducted) return;

    const newMsg: Message = {
      id: `m_img_${Date.now()}`,
      sender: 'user',
      text: preset.caption,
      imageUrl: preset.url,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages(prev => [...prev, newMsg]);

    setTimeout(() => {
      const replyMsg: Message = {
        id: `m_${Date.now() + 1}`,
        sender: 'partner',
        text: 'That is a wonderful photo! Thanks for sharing this moment with me.',
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages(prev => [...prev, replyMsg]);
    }, 1500);
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      {/* Top Navigation Bar */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <TouchableOpacity onPress={onBackPress} style={styles.backBtn}>
            <ArrowLeft size={22} color={THEME.colors.textPrimary} />
          </TouchableOpacity>

          <Image source={{ uri: partnerAvatar }} style={styles.avatar} />

          <View>
            <Text style={styles.partnerName}>{partnerName}</Text>
            <View style={styles.onlineStatus}>
              <View style={styles.greenDot} />
              <Text style={styles.onlineText}>Online • ₹9/min Voice</Text>
            </View>
          </View>
        </View>

        {/* Call Shortcuts */}
        <View style={styles.headerRight}>
          <TouchableOpacity
            style={styles.callShortcutBtn}
            onPress={onAudioCallPress}
            activeOpacity={0.8}
            title="Start Voice Call (₹9/min)"
          >
            <Phone size={18} color={THEME.colors.primary} />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.callShortcutBtn}
            onPress={onVideoCallPress}
            activeOpacity={0.8}
            title="Start Video Call (₹30/min)"
          >
            <Video size={18} color="#7C3AED" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Chat Tariff Banner */}
      <View style={styles.tariffPillBanner}>
        <View style={styles.tariffPillLeft}>
          <Coins size={13} color="#D97706" />
          <Text style={styles.tariffPillText}>
            Text: <Text style={styles.boldText}>₹0.25</Text> • Photo: <Text style={styles.boldText}>₹0.75</Text>
          </Text>
        </View>
        <TouchableOpacity onPress={onRechargePress} style={styles.balanceTag}>
          <Text style={styles.balanceTagText}>Bal: ₹{userBalanceINR.toFixed(2)}</Text>
          <Text style={styles.rechargePlusText}>+ Add</Text>
        </TouchableOpacity>
      </View>

      {/* Anti-Information Sharing Policy Warning */}
      <View style={styles.safetyBanner}>
        <ShieldAlert size={15} color="#DC2626" />
        <Text style={styles.safetyText}>
          Sharing phone numbers, personal social handles, or external UPI is prohibited for user safety.
        </Text>
      </View>

      {/* Messages Scroll Area */}
      <ScrollView
        style={styles.messagesContainer}
        contentContainerStyle={styles.messagesContent}
        showsVerticalScrollIndicator={false}
      >
        {messages.map((msg) => {
          const isUser = msg.sender === 'user';
          return (
            <View
              key={msg.id}
              style={[
                styles.bubbleWrapper,
                isUser ? styles.userBubbleWrapper : styles.partnerBubbleWrapper,
              ]}
            >
              <View
                style={[
                  styles.bubble,
                  isUser ? styles.userBubble : styles.partnerBubble,
                ]}
              >
                {/* Attached Photo */}
                {msg.imageUrl && (
                  <View style={styles.bubbleImageContainer}>
                    <Image source={{ uri: msg.imageUrl }} style={styles.bubbleImage} />
                  </View>
                )}

                <Text
                  style={[
                    styles.messageText,
                    isUser ? styles.userMessageText : styles.partnerMessageText,
                  ]}
                >
                  {msg.text}
                </Text>
                <View style={styles.bubbleFooter}>
                  <Text
                    style={[
                      styles.timestamp,
                      isUser ? styles.userTimestamp : styles.partnerTimestamp,
                    ]}
                  >
                    {msg.time}
                  </Text>
                  {isUser && (
                    <CheckCheck size={12} color="#BFDBFE" style={{ marginLeft: 4 }} />
                  )}
                </View>
              </View>
            </View>
          );
        })}
      </ScrollView>

      {/* Quick Icebreakers */}
      <View style={styles.icebreakersRow}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.icebreakersScroll}>
          {quickIcebreakers.map((ib, i) => (
            <TouchableOpacity
              key={i}
              style={styles.icebreakerChip}
              onPress={() => setInputText(ib)}
              activeOpacity={0.8}
            >
              <Text style={styles.icebreakerText}>{ib}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Bottom Message Input Bar */}
      <View style={styles.inputBar}>
        {/* Photo Attachment Button */}
        <TouchableOpacity
          style={styles.attachBtn}
          onPress={() => setShowPhotoPicker(true)}
          activeOpacity={0.8}
          title="Send Photo (₹0.75)"
        >
          <ImageIcon size={20} color={THEME.colors.primary} />
        </TouchableOpacity>

        <TextInput
          style={styles.inputField}
          placeholder="Type message (₹0.25)..."
          placeholderTextColor={THEME.colors.textMuted}
          value={inputText}
          onChangeText={setInputText}
          multiline
        />

        <TouchableOpacity
          style={[styles.sendBtn, !inputText.trim() && styles.sendBtnDisabled]}
          onPress={handleSendText}
          disabled={!inputText.trim()}
          activeOpacity={0.85}
        >
          <Send size={17} color={THEME.colors.white} />
        </TouchableOpacity>
      </View>

      {/* Photo Picker Modal */}
      <Modal
        visible={showPhotoPicker}
        transparent
        animationType="fade"
        onRequestClose={() => setShowPhotoPicker(false)}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <View>
                <Text style={styles.modalTitle}>Send a Photo</Text>
                <Text style={styles.modalSub}>Each photo costs ₹0.75 • Select an image to send</Text>
              </View>
              <TouchableOpacity onPress={() => setShowPhotoPicker(false)} style={styles.modalCloseBtn}>
                <X size={18} color="#64748B" />
              </TouchableOpacity>
            </View>

            <View style={styles.photoGrid}>
              {SAMPLE_PHOTO_PRESETS.map((preset, idx) => (
                <TouchableOpacity
                  key={idx}
                  style={styles.photoGridItem}
                  onPress={() => handleSendImage(preset)}
                  activeOpacity={0.85}
                >
                  <Image source={{ uri: preset.url }} style={styles.photoGridThumb} />
                  <Text style={styles.photoGridLabel}>{preset.label}</Text>
                  <Text style={styles.photoCostBadge}>₹0.75</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>
      </Modal>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  header: {
    height: 64,
    backgroundColor: THEME.colors.white,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: THEME.colors.borderLight,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  backBtn: {
    padding: 4,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: THEME.colors.primary,
  },
  partnerName: {
    fontSize: 15,
    fontWeight: '800',
    color: THEME.colors.textPrimary,
  },
  onlineStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 1,
  },
  greenDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: THEME.colors.online,
  },
  onlineText: {
    fontSize: 11,
    color: THEME.colors.textSecondary,
    fontWeight: '500',
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  callShortcutBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  tariffPillBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: '#FDE68A',
  },
  tariffPillLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  tariffPillText: {
    fontSize: 11,
    color: '#92400E',
    fontWeight: '600',
  },
  boldText: {
    fontWeight: '800',
    color: '#78350F',
  },
  balanceTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#FCD34D',
  },
  balanceTagText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#1E3A8A',
  },
  rechargePlusText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#059669',
  },
  safetyBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#FEF2F2',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#FEE2E2',
  },
  safetyText: {
    fontSize: 11,
    color: '#991B1B',
    flex: 1,
    lineHeight: 15,
  },
  messagesContainer: {
    flex: 1,
  },
  messagesContent: {
    padding: 16,
    gap: 12,
  },
  bubbleWrapper: {
    flexDirection: 'row',
    width: '100%',
  },
  userBubbleWrapper: {
    justifyContent: 'flex-end',
  },
  partnerBubbleWrapper: {
    justifyContent: 'flex-start',
  },
  bubble: {
    maxWidth: '82%',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 16,
  },
  userBubble: {
    backgroundColor: THEME.colors.primary,
    borderBottomRightRadius: 4,
  },
  partnerBubble: {
    backgroundColor: THEME.colors.white,
    borderBottomLeftRadius: 4,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  bubbleImageContainer: {
    marginBottom: 8,
    borderRadius: 10,
    overflow: 'hidden',
  },
  bubbleImage: {
    width: 200,
    height: 140,
    borderRadius: 10,
    backgroundColor: '#E2E8F0',
  },
  messageText: {
    fontSize: 14,
    lineHeight: 20,
  },
  userMessageText: {
    color: THEME.colors.white,
  },
  partnerMessageText: {
    color: THEME.colors.textPrimary,
  },
  bubbleFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    marginTop: 4,
  },
  timestamp: {
    fontSize: 10,
  },
  userTimestamp: {
    color: '#BFDBFE',
  },
  partnerTimestamp: {
    color: THEME.colors.textMuted,
  },
  icebreakersRow: {
    paddingVertical: 6,
    backgroundColor: THEME.colors.white,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  icebreakersScroll: {
    paddingHorizontal: 12,
    gap: 8,
  },
  icebreakerChip: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  icebreakerText: {
    fontSize: 11,
    color: THEME.colors.textSecondary,
    fontWeight: '500',
  },
  inputBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: THEME.colors.white,
    borderTopWidth: 1,
    borderTopColor: THEME.colors.borderLight,
    gap: 8,
  },
  attachBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#EFF6FF',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#DBEAFE',
  },
  inputField: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 8,
    fontSize: 14,
    color: THEME.colors.textPrimary,
    maxHeight: 90,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  sendBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: THEME.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendBtnDisabled: {
    backgroundColor: '#94A3B8',
    opacity: 0.5,
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    maxWidth: 380,
    width: '100%',
    padding: 20,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A',
  },
  modalSub: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 2,
  },
  modalCloseBtn: {
    padding: 4,
  },
  photoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    justifyContent: 'space-between',
  },
  photoGridItem: {
    width: '48%',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    overflow: 'hidden',
    backgroundColor: '#F8FAFC',
    alignItems: 'center',
    paddingBottom: 8,
    position: 'relative',
  },
  photoGridThumb: {
    width: '100%',
    height: 85,
    backgroundColor: '#CBD5E1',
  },
  photoGridLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#1E293B',
    marginTop: 6,
  },
  photoCostBadge: {
    fontSize: 10,
    fontWeight: '800',
    color: '#D97706',
    marginTop: 1,
  },
});
