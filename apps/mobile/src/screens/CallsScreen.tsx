import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
} from 'react-native';
import { Search, ChevronDown, Video } from 'lucide-react-native';
import { HeaderBar } from '../components/HeaderBar';
import { ListenerCard } from '../components/ListenerCard';
import { ListenerProfile, TOP_LANGUAGES } from '@chatzie/shared';
import { THEME } from '../theme';

interface CallsScreenProps {
  balanceINR: number;
  listeners: ListenerProfile[];
  onBalancePress: () => void;
  onListenerPress: (listener: ListenerProfile) => void;
  onCallPress: (listener: ListenerProfile, type: 'audio' | 'video') => void;
}

export const CallsScreen: React.FC<CallsScreenProps> = ({
  balanceINR,
  listeners,
  onBalancePress,
  onListenerPress,
  onCallPress,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLanguage, setSelectedLanguage] = useState('All');
  const [videoOnly, setVideoOnly] = useState(false);
  const [showLangPicker, setShowLangPicker] = useState(false);

  const filteredListeners = listeners.filter((listener) => {
    const matchesSearch =
      listener.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
      listener.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      listener.languages.some(l => l.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesLang =
      selectedLanguage === 'All' || listener.languages.includes(selectedLanguage);

    const matchesVideo = !videoOnly || listener.isVideoEnabled;

    return matchesSearch && matchesLang && matchesVideo;
  });

  return (
    <View style={styles.container}>
      <HeaderBar
        title="Chatzie"
        balanceINR={balanceINR}
        onBalancePress={onBalancePress}
      />

      {/* Filter Bar */}
      <View style={styles.filterBar}>
        {/* Search Input Box */}
        <View style={styles.searchBox}>
          <Search size={16} color={THEME.colors.textMuted} />
          <TextInput
            placeholder="Search listeners..."
            placeholderTextColor={THEME.colors.textMuted}
            value={searchQuery}
            onChangeText={setSearchQuery}
            style={styles.searchInput}
          />
        </View>

        {/* Language Filter Pill */}
        <TouchableOpacity
          style={[styles.filterPill, selectedLanguage !== 'All' && styles.filterPillActive]}
          onPress={() => setShowLangPicker(!showLangPicker)}
          activeOpacity={0.8}
        >
          <Text style={[styles.filterPillText, selectedLanguage !== 'All' && styles.filterPillTextActive]}>
            {selectedLanguage === 'All' ? 'Language' : selectedLanguage}
          </Text>
          <ChevronDown size={14} color={selectedLanguage !== 'All' ? THEME.colors.primary : THEME.colors.textSecondary} />
        </TouchableOpacity>

        {/* Video Call Filter Toggle Pill */}
        <TouchableOpacity
          style={[styles.filterPill, videoOnly && styles.filterPillActive]}
          onPress={() => setVideoOnly(!videoOnly)}
          activeOpacity={0.8}
        >
          <Video size={14} color={videoOnly ? THEME.colors.primary : THEME.colors.textSecondary} />
          <Text style={[styles.filterPillText, videoOnly && styles.filterPillTextActive]}>
            Video Call
          </Text>
        </TouchableOpacity>
      </View>

      {/* Language Picker Dropdown Sheet (if open) */}
      {showLangPicker && (
        <View style={styles.langPickerContainer}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.langList}>
            {['All', ...TOP_LANGUAGES].map((lang) => (
              <TouchableOpacity
                key={lang}
                style={[styles.langChip, selectedLanguage === lang && styles.langChipActive]}
                onPress={() => {
                  setSelectedLanguage(lang);
                  setShowLangPicker(false);
                }}
              >
                <Text style={[styles.langChipText, selectedLanguage === lang && styles.langChipTextActive]}>
                  {lang}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      )}

      {/* Listeners Feed */}
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.feedScroll}
      >
        <View style={{ height: 8 }} />
        {filteredListeners.map((listener) => (
          <ListenerCard
            key={listener.id}
            listener={listener}
            onCardPress={() => onListenerPress(listener)}
            onCallPress={(type) => onCallPress(listener, type)}
          />
        ))}

        {filteredListeners.length === 0 && (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyTitle}>No Listeners Found</Text>
            <Text style={styles.emptySub}>Try adjusting your search query or language filter.</Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: THEME.colors.background,
  },
  filterBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: THEME.colors.white,
    borderBottomWidth: 1,
    borderBottomColor: THEME.colors.border,
    gap: 8,
  },
  searchBox: {
    flex: 1,
    height: 38,
    backgroundColor: THEME.colors.borderLight,
    borderRadius: 19,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 13,
    color: THEME.colors.textPrimary,
    marginLeft: 6,
    paddingVertical: 0,
  },
  filterPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    height: 38,
    paddingHorizontal: 12,
    borderRadius: 19,
    backgroundColor: THEME.colors.white,
    borderWidth: 1,
    borderColor: THEME.colors.border,
  },
  filterPillActive: {
    borderColor: THEME.colors.primary,
    backgroundColor: THEME.colors.primaryBg,
  },
  filterPillText: {
    fontSize: 12,
    fontWeight: '700',
    color: THEME.colors.textSecondary,
  },
  filterPillTextActive: {
    color: THEME.colors.primary,
  },
  langPickerContainer: {
    backgroundColor: THEME.colors.white,
    borderBottomWidth: 1,
    borderBottomColor: THEME.colors.border,
    paddingVertical: 8,
  },
  langList: {
    paddingHorizontal: 16,
    gap: 8,
  },
  langChip: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: THEME.colors.borderLight,
  },
  langChipActive: {
    backgroundColor: THEME.colors.primary,
  },
  langChipText: {
    fontSize: 12,
    fontWeight: '600',
    color: THEME.colors.textSecondary,
  },
  langChipTextActive: {
    color: THEME.colors.white,
    fontWeight: '700',
  },
  feedScroll: {
    paddingBottom: 24,
  },
  emptyContainer: {
    padding: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: THEME.colors.textPrimary,
  },
  emptySub: {
    fontSize: 13,
    color: THEME.colors.textSecondary,
    marginTop: 4,
    textAlign: 'center',
  }
});
