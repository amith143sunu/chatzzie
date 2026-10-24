import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
} from 'react-native';
import {
  Search,
  Filter,
  ChevronDown,
  Video,
  Sparkles,
  Users
} from 'lucide-react-native';
import { HeaderBar } from '../components/HeaderBar';
import { ListenerCard } from '../components/ListenerCard';
import { ListenerProfile, TOP_LANGUAGES } from '@chatzie/shared';
import { THEME } from '../theme';

interface CallsScreenProps {
  balanceINR: number;
  listeners: ListenerProfile[];
  isDesktop?: boolean;
  onBalancePress: () => void;
  onListenerPress: (listener: ListenerProfile) => void;
  onCallPress: (listener: ListenerProfile, type: 'audio' | 'video') => void;
}

export const CallsScreen: React.FC<CallsScreenProps> = ({
  balanceINR,
  listeners,
  isDesktop = false,
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
      {/* Mobile Header Bar (Only visible when NOT in Desktop mode) */}
      {!isDesktop && (
        <HeaderBar
          title="Chatzie"
          balanceINR={balanceINR}
          onBalancePress={onBalancePress}
        />
      )}

      {/* Filter & Search Bar */}
      <View style={styles.filterBar}>
        {/* Search Input Box */}
        <View style={styles.searchBox}>
          <Search size={16} color={THEME.colors.textMuted} />
          <TextInput
            placeholder="Search listeners by name, language..."
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
            {selectedLanguage === 'All' ? 'All Languages' : selectedLanguage}
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

      {/* Listeners Feed - Multi-column responsive grid on desktop */}
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.feedScroll}
      >
        <View style={styles.metaHeader}>
          <Text style={styles.metaCount}>{filteredListeners.length} Verified Hosts Online</Text>
          <Text style={styles.metaTariff}>All calls: ₹9/min Voice • ₹30/min Video</Text>
        </View>

        <View style={isDesktop ? styles.desktopGrid : styles.mobileList}>
          {filteredListeners.map((listener) => (
            <View key={listener.id} style={isDesktop ? styles.desktopCol : undefined}>
              <ListenerCard
                listener={listener}
                onCardPress={() => onListenerPress(listener)}
                onCallPress={(type) => onCallPress(listener, type)}
              />
            </View>
          ))}
        </View>

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
    paddingVertical: 12,
    backgroundColor: THEME.colors.white,
    borderBottomWidth: 1,
    borderBottomColor: THEME.colors.border,
    gap: 10,
  },
  searchBox: {
    flex: 1,
    height: 40,
    backgroundColor: THEME.colors.inputBg,
    borderRadius: 20,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    height: 40,
    fontSize: 13,
    color: THEME.colors.textPrimary,
  },
  filterPill: {
    height: 38,
    paddingHorizontal: 14,
    borderRadius: 20,
    backgroundColor: THEME.colors.background,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderWidth: 1,
    borderColor: THEME.colors.border,
  },
  filterPillActive: {
    borderColor: THEME.colors.primary,
    backgroundColor: THEME.colors.primaryBg,
  },
  filterPillText: {
    fontSize: 12,
    fontWeight: '600',
    color: THEME.colors.textSecondary,
  },
  filterPillTextActive: {
    color: THEME.colors.primary,
    fontWeight: '700',
  },
  langPickerContainer: {
    backgroundColor: THEME.colors.white,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: THEME.colors.borderLight,
  },
  langList: {
    paddingHorizontal: 16,
    gap: 8,
  },
  langChip: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: THEME.colors.background,
    borderWidth: 1,
    borderColor: THEME.colors.border,
  },
  langChipActive: {
    backgroundColor: THEME.colors.primary,
    borderColor: THEME.colors.primary,
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
    paddingBottom: 32,
  },
  metaHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  metaCount: {
    fontSize: 13,
    fontWeight: '800',
    color: '#334155',
  },
  metaTariff: {
    fontSize: 12,
    fontWeight: '600',
    color: '#0284C7',
  },
  desktopGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 8,
  },
  desktopCol: {
    width: '50%',
    minWidth: 320,
  },
  mobileList: {
    width: '100%',
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
  },
});
