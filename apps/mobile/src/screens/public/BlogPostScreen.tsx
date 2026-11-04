import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  useWindowDimensions,
  Platform,
} from 'react-native';
import {
  ArrowLeft,
  Clock,
  Calendar,
  Share2,
  PhoneCall,
  CheckCircle2,
  Sparkles,
  BookOpen,
} from 'lucide-react-native';
import { BlogPost } from '@chatzie/shared';
import { getApiBaseUrl } from '../../services/apiConfig';

interface BlogPostScreenProps {
  slug: string;
  onNavigate: (path: string) => void;
  onOpenLogin: () => void;
}

export const BlogPostScreen: React.FC<BlogPostScreenProps> = ({
  slug,
  onNavigate,
  onOpenLogin,
}) => {
  const { width } = useWindowDimensions();
  const isDesktop = width > 768;

  const [post, setPost] = useState<BlogPost | null>(null);
  const [loading, setLoading] = useState(true);
  const [copiedNotice, setCopiedNotice] = useState(false);

  useEffect(() => {
    const fetchPost = async () => {
      setLoading(true);
      try {
        const baseUrl = getApiBaseUrl();
        const res = await fetch(`${baseUrl}/api/blogs/${slug}`);
        if (res.ok) {
          const data = await res.json();
          if (data.post) {
            setPost(data.post);
          }
        }
      } catch (e) {
        console.error('Failed to load blog post', e);
      } finally {
        setLoading(false);
      }
    };
    if (slug) fetchPost();
  }, [slug]);

  const handleShare = () => {
    if (typeof window !== 'undefined') {
      if (navigator.share) {
        navigator.share({
          title: post?.title,
          text: post?.excerpt,
          url: window.location.href,
        }).catch(() => {});
      } else if (navigator.clipboard) {
        navigator.clipboard.writeText(window.location.href);
        setCopiedNotice(true);
        setTimeout(() => setCopiedNotice(false), 3000);
      }
    }
  };

  if (loading) {
    return (
      <View style={styles.centerBox}>
        <Text style={styles.loadingText}>Loading article...</Text>
      </View>
    );
  }

  if (!post) {
    return (
      <View style={styles.centerBox}>
        <Text style={styles.notFoundTitle}>Article Not Found</Text>
        <Text style={styles.notFoundSub}>The article you are looking for may have moved or was unpublished.</Text>
        <TouchableOpacity style={styles.backBtn} onPress={() => onNavigate('/blog')}>
          <ArrowLeft size={16} color="#FFFFFF" />
          <Text style={styles.backBtnText}>Back to Blog</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.articleContainer}>
        {/* Breadcrumb / Back button */}
        <TouchableOpacity style={styles.backLinkRow} onPress={() => onNavigate('/blog')}>
          <ArrowLeft size={16} color="#4F46E5" />
          <Text style={styles.backLinkText}>Back to All Articles</Text>
        </TouchableOpacity>

        {/* Category & Read Time */}
        <View style={styles.metaTopRow}>
          <View style={styles.categoryPillWrap}>
            <Text style={styles.categoryPill}>{post.category}</Text>
          </View>
          <View style={styles.timeRow}>
            <Clock size={13} color="#64748B" />
            <Text style={styles.timeText}>{post.readTimeMinutes} min read</Text>
          </View>
        </View>

        {/* Title & Subtitle */}
        <Text style={styles.articleTitle}>{post.title}</Text>
        <Text style={styles.articleExcerpt}>{post.excerpt}</Text>

        {/* Author Bio Bar */}
        <View style={styles.authorBar}>
          <View style={styles.authorInfo}>
            <Image source={{ uri: post.authorAvatar }} style={styles.authorAvatar} />
            <View>
              <Text style={{ fontWeight: '800', fontSize: 14, color: '#0F172A' }}>{post.authorName}</Text>
              <Text style={{ fontSize: 11, color: '#64748B' }}>
                Published on{' '}
                {new Date(post.publishedAt).toLocaleDateString('en-IN', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric',
                })}
              </Text>
            </View>
          </View>

          <TouchableOpacity style={styles.shareBtn} onPress={handleShare}>
            <Share2 size={15} color="#4F46E5" />
            <Text style={styles.shareBtnText}>{copiedNotice ? 'Link Copied!' : 'Share'}</Text>
          </TouchableOpacity>
        </View>

        {/* Hero Cover Image */}
        <Image source={{ uri: post.coverImage }} style={styles.coverImage} />

        {/* Content Body (Formatted Markdown paragraphs) */}
        <View style={styles.articleBody}>
          {post.content.split('\n\n').map((paragraph, index) => {
            const trimmed = paragraph.trim();
            if (trimmed.startsWith('### ')) {
              return (
                <Text key={index} style={styles.bodyH3}>
                  {trimmed.replace('### ', '')}
                </Text>
              );
            }
            if (trimmed.startsWith('#### ')) {
              return (
                <Text key={index} style={styles.bodyH4}>
                  {trimmed.replace('#### ', '')}
                </Text>
              );
            }
            if (trimmed.startsWith('1. ') || trimmed.startsWith('2. ') || trimmed.startsWith('3. ')) {
              return (
                <Text key={index} style={styles.numberedItem}>
                  {trimmed}
                </Text>
              );
            }
            return (
              <Text key={index} style={styles.bodyParagraph}>
                {trimmed}
              </Text>
            );
          })}
        </View>

        {/* In-Article Confidante Prompt Box */}
        <View style={styles.inArticleCta}>
          <View style={styles.inArticleIconBox}>
            <PhoneCall size={24} color="#4F46E5" />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={{ fontSize: 16, fontWeight: '800', color: '#0F172A' }}>
              Relating to this right now?
            </Text>
            <Text style={{ fontSize: 13, color: '#64748B', marginTop: 4 }}>
              You don&apos;t have to battle thoughts alone. Connect with a verified human listener in under 15 seconds.
            </Text>
          </View>
          <TouchableOpacity style={styles.inArticleBtn} onPress={onOpenLogin}>
            <Text style={styles.inArticleBtnText}>Talk to a Confidante</Text>
          </TouchableOpacity>
        </View>

        {/* Tags */}
        <View style={styles.tagsRow}>
          {post.tags.map((tag, i) => (
            <View key={i} style={styles.tagPill}>
              <Text style={styles.tagPillText}>#{tag}</Text>
            </View>
          ))}
        </View>
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
    paddingBottom: 60,
  },
  centerBox: {
    flex: 1,
    padding: 60,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
  },
  loadingText: {
    fontSize: 14,
    color: '#64748B',
  },
  notFoundTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 8,
  },
  notFoundSub: {
    fontSize: 14,
    color: '#64748B',
    marginBottom: 20,
    textAlign: 'center',
  },
  backBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#4F46E5',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 10,
  },
  backBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF',
  },

  articleContainer: {
    maxWidth: 780,
    width: '100%',
    alignSelf: 'center',
    paddingHorizontal: 24,
    paddingTop: 36,
  },
  backLinkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 24,
  },
  backLinkText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#4F46E5',
  },

  metaTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 14,
  },
  categoryPillWrap: {
    backgroundColor: '#EEF2FF',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  categoryPill: {
    fontSize: 11,
    fontWeight: '800',
    color: '#4F46E5',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  timeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  timeText: {
    fontSize: 12,
    color: '#64748B',
  },

  articleTitle: {
    fontSize: Platform.OS === 'web' ? 36 : 26,
    fontWeight: '900',
    color: '#0F172A',
    lineHeight: Platform.OS === 'web' ? 46 : 34,
    letterSpacing: -0.8,
    marginBottom: 14,
  },
  articleExcerpt: {
    fontSize: 16,
    color: '#475569',
    lineHeight: 26,
    marginBottom: 24,
  },

  authorBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 28,
  },
  authorInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  authorAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  shareBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#EEF2FF',
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 10,
  },
  shareBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#4F46E5',
  },

  coverImage: {
    width: '100%',
    height: 360,
    borderRadius: 20,
    marginBottom: 36,
  },

  articleBody: {
    marginBottom: 40,
  },
  bodyH3: {
    fontSize: 22,
    fontWeight: '800',
    color: '#0F172A',
    marginTop: 28,
    marginBottom: 12,
    letterSpacing: -0.3,
  },
  bodyH4: {
    fontSize: 18,
    fontWeight: '800',
    color: '#1E293B',
    marginTop: 20,
    marginBottom: 8,
  },
  bodyParagraph: {
    fontSize: 16,
    color: '#334155',
    lineHeight: 28,
    marginBottom: 18,
  },
  numberedItem: {
    fontSize: 15,
    color: '#334155',
    lineHeight: 24,
    marginBottom: 10,
    paddingLeft: 12,
  },

  inArticleCta: {
    backgroundColor: '#F8FAFC',
    borderRadius: 20,
    padding: 24,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 18,
    flexWrap: 'wrap',
    marginBottom: 32,
  },
  inArticleIconBox: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: '#EEF2FF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  inArticleBtn: {
    backgroundColor: '#4F46E5',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 12,
  },
  inArticleBtnText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#FFFFFF',
  },

  tagsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    paddingTop: 20,
  },
  tagPill: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  tagPillText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748B',
  },
});
