import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  useWindowDimensions,
  TextInput,
  Platform,
} from 'react-native';
import {
  BookOpen,
  Search,
  Clock,
  ArrowRight,
  Sparkles,
  PhoneCall,
  User,
} from 'lucide-react-native';
import { BlogPost } from '@chatzie/shared';
import { getApiBaseUrl } from '../../services/apiConfig';

interface BlogListScreenProps {
  onNavigate: (path: string) => void;
  onOpenLogin: () => void;
}

export const BlogListScreen: React.FC<BlogListScreenProps> = ({
  onNavigate,
  onOpenLogin,
}) => {
  const { width } = useWindowDimensions();
  const isDesktop = width > 768;
  const isWide = width > 900;

  const [blogs, setBlogs] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  const categories = [
    'All',
    'Emotional Wellness',
    'Mental Health',
    'Relationships',
    'Culture & Society',
    'Self Care',
  ];

  useEffect(() => {
    const fetchBlogs = async () => {
      setLoading(true);
      try {
        const baseUrl = getApiBaseUrl();
        const res = await fetch(`${baseUrl}/api/blogs`);
        if (res.ok) {
          const data = await res.json();
          if (data.blogs && Array.isArray(data.blogs)) {
            setBlogs(data.blogs);
          }
        }
      } catch (e) {
        console.error('Failed to load blogs', e);
      } finally {
        setLoading(false);
      }
    };
    fetchBlogs();
  }, []);

  const filteredBlogs = blogs.filter((b) => {
    const matchesSearch =
      b.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.excerpt.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesCategory =
      selectedCategory === 'All' ||
      b.category.toLowerCase() === selectedCategory.toLowerCase();

    return matchesSearch && matchesCategory;
  });

  return (
    <View style={styles.container}>
      {/* Header Banner */}
      <View style={styles.headerBanner}>
        <View style={styles.pillBadge}>
          <BookOpen size={14} color="#4F46E5" />
          <Text style={styles.pillBadgeText}>Chatzzie Editorial &amp; Stories</Text>
        </View>
        <Text style={styles.mainTitle}>Wellness, Connection &amp; Mindful Living</Text>
        <Text style={styles.subtitle}>
          Thoughtful essays and evidence-backed perspectives on relationships, overthinking, loneliness, and emotional resilience.
        </Text>
      </View>

      {/* Filter and Search Bar */}
      <View style={styles.filterSection}>
        <View style={styles.filterContainer}>
          <View style={styles.searchBar}>
            <Search size={16} color="#64748B" />
            <TextInput
              style={styles.searchInput}
              placeholder="Search topics, keywords, emotions..."
              placeholderTextColor="#94A3B8"
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.categoryPillsRow}
          >
            {categories.map((cat) => {
              const isSelected = selectedCategory === cat;
              return (
                <TouchableOpacity
                  key={cat}
                  style={[styles.categoryPill, isSelected && styles.categoryPillActive]}
                  onPress={() => setSelectedCategory(cat)}
                >
                  <Text
                    style={[
                      styles.categoryPillText,
                      isSelected && styles.categoryPillTextActive,
                    ]}
                  >
                    {cat}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>
      </View>

      {/* Blog Cards Grid */}
      <View style={styles.sectionWrap}>
        {loading ? (
          <View style={styles.loadingBox}>
            <Text style={styles.loadingText}>Loading editorial articles...</Text>
          </View>
        ) : filteredBlogs.length === 0 ? (
          <View style={styles.emptyBox}>
            <Text style={styles.emptyTitle}>No articles found</Text>
            <Text style={styles.emptySubtitle}>Try adjusting your search query or category filter.</Text>
          </View>
        ) : (
          <View style={styles.blogsGrid}>
            {filteredBlogs.map((post) => (
              <TouchableOpacity
                key={post.id}
                style={[styles.blogCard, isWide && styles.blogCardDesktop]}
                activeOpacity={0.9}
                onPress={() => onNavigate(`/blog/${post.slug}`)}
              >
                <Image source={{ uri: post.coverImage }} style={styles.blogCover} />
                <View style={styles.blogCardBody}>
                  <View style={styles.blogMetaRow}>
                    <View style={styles.blogCategoryWrap}>
                      <Text style={styles.blogCategoryPill}>{post.category}</Text>
                    </View>
                    <Text style={styles.blogReadTime}>{post.readTimeMinutes} min read</Text>
                  </View>

                  <Text style={styles.blogTitle} numberOfLines={2}>
                    {post.title}
                  </Text>

                  <Text style={styles.blogExcerpt} numberOfLines={3}>
                    {post.excerpt}
                  </Text>

                  <View style={styles.blogAuthorRow}>
                    <Image source={{ uri: post.authorAvatar }} style={styles.blogAuthorAvatar} />
                    <View style={{ flex: 1 }}>
                      <Text style={styles.blogAuthorName}>{post.authorName}</Text>
                      <Text style={styles.blogDate}>
                        {new Date(post.publishedAt).toLocaleDateString('en-IN', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </Text>
                    </View>
                    <Text style={styles.readMoreArrow}>Read →</Text>
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </View>

      {/* Bottom CTA */}
      <View style={styles.ctaSection}>
        <Text style={styles.ctaTitle}>Feeling Like You Need to Talk Right Now?</Text>
        <Text style={styles.ctaSubtitle}>
          Our verified listeners are available 24/7 for 1:1 masked phone calls. Zero judgment.
        </Text>
        <TouchableOpacity style={styles.ctaBtn} activeOpacity={0.85} onPress={onOpenLogin}>
          <PhoneCall size={18} color="#FFFFFF" />
          <Text style={styles.ctaBtnText}>Start Talking Online (Free Web App)</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  contentWrap: {
    paddingBottom: 40,
  },
  headerBanner: {
    paddingVertical: 56,
    paddingHorizontal: 24,
    maxWidth: 900,
    width: '100%',
    alignSelf: 'center',
    alignItems: 'center',
    textAlign: 'center',
  },
  pillBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#EEF2FF',
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 20,
    marginBottom: 16,
  },
  pillBadgeText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#4F46E5',
    textTransform: 'uppercase',
  },
  mainTitle: {
    fontSize: Platform.OS === 'web' ? 42 : 30,
    fontWeight: '900',
    color: '#0F172A',
    textAlign: 'center',
    letterSpacing: -1,
    marginBottom: 14,
  },
  subtitle: {
    fontSize: 16,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 26,
    maxWidth: 680,
  },

  filterSection: {
    paddingHorizontal: 24,
    marginBottom: 32,
  },
  filterContainer: {
    maxWidth: 1200,
    width: '100%',
    alignSelf: 'center',
    gap: 16,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: '#0F172A',
  },
  categoryPillsRow: {
    flexDirection: 'row',
    gap: 8,
    paddingVertical: 4,
  },
  categoryPill: {
    paddingVertical: 7,
    paddingHorizontal: 14,
    borderRadius: 20,
    backgroundColor: '#F1F5F9',
  },
  categoryPillActive: {
    backgroundColor: '#4F46E5',
  },
  categoryPillText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#475569',
  },
  categoryPillTextActive: {
    color: '#FFFFFF',
  },

  sectionWrap: {
    paddingHorizontal: 24,
    marginBottom: 48,
  },
  loadingBox: {
    paddingVertical: 60,
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 14,
    color: '#64748B',
  },
  emptyBox: {
    paddingVertical: 60,
    alignItems: 'center',
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 6,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#64748B',
  },

  blogsGrid: {
    maxWidth: 1200,
    width: '100%',
    alignSelf: 'center',
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 24,
    justifyContent: 'center',
  },
  blogCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    overflow: 'hidden',
    width: '100%',
    maxWidth: 360,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.06,
    shadowRadius: 14,
    elevation: 3,
  },
  blogCardDesktop: {
    width: '31%',
  },
  blogCover: {
    width: '100%',
    height: 190,
  },
  blogCardBody: {
    padding: 20,
  },
  blogMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  blogCategoryWrap: {
    backgroundColor: '#EEF2FF',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    alignSelf: 'flex-start',
  },
  blogCategoryPill: {
    fontSize: 11,
    fontWeight: '700',
    color: '#4F46E5',
  },
  blogReadTime: {
    fontSize: 11,
    color: '#64748B',
  },
  blogTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: '#0F172A',
    lineHeight: 24,
    marginBottom: 8,
  },
  blogExcerpt: {
    fontSize: 13,
    color: '#64748B',
    lineHeight: 20,
    marginBottom: 18,
  },
  blogAuthorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    paddingTop: 14,
  },
  blogAuthorAvatar: {
    width: 30,
    height: 30,
    borderRadius: 15,
  },
  blogAuthorName: {
    fontSize: 12,
    fontWeight: '700',
    color: '#0F172A',
  },
  blogDate: {
    fontSize: 10,
    color: '#94A3B8',
  },
  readMoreArrow: {
    fontSize: 12,
    fontWeight: '800',
    color: '#4F46E5',
  },

  ctaSection: {
    backgroundColor: '#4F46E5',
    paddingVertical: 56,
    paddingHorizontal: 24,
    alignItems: 'center',
    textAlign: 'center',
  },
  ctaTitle: {
    fontSize: Platform.OS === 'web' ? 32 : 24,
    fontWeight: '900',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 10,
  },
  ctaSubtitle: {
    fontSize: 15,
    color: '#C7D2FE',
    textAlign: 'center',
    maxWidth: 600,
    lineHeight: 24,
    marginBottom: 28,
  },
  ctaBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: '#FFFFFF',
    paddingVertical: 14,
    paddingHorizontal: 28,
    borderRadius: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 4,
  },
  ctaBtnText: {
    fontSize: 15,
    fontWeight: '800',
    color: '#4F46E5',
  },
});
