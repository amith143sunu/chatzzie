'use client';

import React, { useState, useEffect } from 'react';
import {
  BookOpen,
  Plus,
  Search,
  Eye,
  Edit2,
  Trash2,
  CheckCircle2,
  Clock,
  Tag,
  Sparkles,
  ExternalLink,
  X,
  FileText,
  RefreshCw,
  Image as ImageIcon
} from 'lucide-react';
import { BlogPost } from '@chatzie/shared';
import { getApiBaseUrl } from '../apiConfig';

const PRESET_COVERS = [
  { label: 'Night Thoughts', url: 'https://images.unsplash.com/photo-1518495973542-4542c06a5843?auto=format&fit=crop&w=800&q=80' },
  { label: 'Conversations', url: 'https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=800&q=80' },
  { label: 'Heart & Healing', url: 'https://images.unsplash.com/photo-1516589178581-6cd7833ae3b2?auto=format&fit=crop&w=800&q=80' },
  { label: 'Empathetic Connection', url: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=800&q=80' },
  { label: 'Peaceful Meditation', url: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&w=800&q=80' },
];

export default function AdminBlogsPage() {
  const [blogs, setBlogs] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedStatus, setSelectedStatus] = useState<'All' | 'published' | 'draft'>('All');

  // Modal / Drawer state
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [editingPost, setEditingPost] = useState<BlogPost | null>(null);
  const [editorTab, setEditorTab] = useState<'write' | 'preview'>('write');

  // Form Fields
  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [category, setCategory] = useState('Emotional Wellness');
  const [tags, setTags] = useState('');
  const [coverImage, setCoverImage] = useState(PRESET_COVERS[0].url);
  const [authorName, setAuthorName] = useState('Chatzzie Editorial Team');
  const [authorAvatar, setAuthorAvatar] = useState('https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80');
  const [readTimeMinutes, setReadTimeMinutes] = useState(5);
  const [excerpt, setExcerpt] = useState('');
  const [content, setContent] = useState('');
  const [isPublished, setIsPublished] = useState(true);
  const [formError, setFormError] = useState('');
  const [saving, setSaving] = useState(false);

  const fetchBlogs = async () => {
    setLoading(true);
    try {
      const baseUrl = getApiBaseUrl();
      const res = await fetch(`${baseUrl}/api/admin/blogs`);
      if (res.ok) {
        const data = await res.json();
        if (data.blogs) {
          setBlogs(data.blogs);
        }
      }
    } catch (e) {
      console.error('Failed to fetch admin blogs', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBlogs();
  }, []);

  const handleOpenCreate = () => {
    setEditingPost(null);
    setTitle('');
    setSlug('');
    setCategory('Emotional Wellness');
    setTags('Wellness, Connection, Overthinking');
    setCoverImage(PRESET_COVERS[0].url);
    setAuthorName('Chatzzie Editorial Team');
    setAuthorAvatar('https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80');
    setReadTimeMinutes(5);
    setExcerpt('');
    setContent('');
    setIsPublished(true);
    setFormError('');
    setEditorTab('write');
    setIsEditorOpen(true);
  };

  const handleOpenEdit = (post: BlogPost) => {
    setEditingPost(post);
    setTitle(post.title);
    setSlug(post.slug);
    setCategory(post.category);
    setTags(post.tags.join(', '));
    setCoverImage(post.coverImage);
    setAuthorName(post.authorName);
    setAuthorAvatar(post.authorAvatar);
    setReadTimeMinutes(post.readTimeMinutes);
    setExcerpt(post.excerpt);
    setContent(post.content);
    setIsPublished(post.isPublished);
    setFormError('');
    setEditorTab('write');
    setIsEditorOpen(true);
  };

  const handleTitleChange = (val: string) => {
    setTitle(val);
    if (!editingPost) {
      const generated = val
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');
      setSlug(generated);
    }
  };

  const handleSavePost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) {
      setFormError('Article title and content body are required.');
      return;
    }

    setSaving(true);
    setFormError('');

    try {
      const baseUrl = getApiBaseUrl();
      const payload = {
        title: title.trim(),
        slug: slug.trim() || title.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
        category,
        tags: tags.split(',').map((t) => t.trim()).filter(Boolean),
        coverImage,
        authorName,
        authorAvatar,
        readTimeMinutes: Number(readTimeMinutes) || 4,
        excerpt: excerpt.trim() || title.trim(),
        content: content.trim(),
        isPublished,
      };

      let res;
      if (editingPost) {
        res = await fetch(`${baseUrl}/api/admin/blogs/${editingPost.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
      } else {
        res = await fetch(`${baseUrl}/api/admin/blogs`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
      }

      if (res.ok) {
        setIsEditorOpen(false);
        fetchBlogs();
      } else {
        const data = await res.json();
        setFormError(data.error || 'Failed to save blog post.');
      }
    } catch (e: any) {
      setFormError(e.message || 'Network error while saving post.');
    } finally {
      setSaving(false);
    }
  };

  const handleDeletePost = async (id: string, postTitle: string) => {
    if (!window.confirm(`Are you sure you want to permanently delete "${postTitle}"?`)) return;

    try {
      const baseUrl = getApiBaseUrl();
      const res = await fetch(`${baseUrl}/api/admin/blogs/${id}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        fetchBlogs();
      }
    } catch (e) {
      console.error('Failed to delete blog post', e);
    }
  };

  const handleTogglePublish = async (post: BlogPost) => {
    try {
      const baseUrl = getApiBaseUrl();
      const res = await fetch(`${baseUrl}/api/admin/blogs/${post.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isPublished: !post.isPublished }),
      });
      if (res.ok) {
        fetchBlogs();
      }
    } catch (e) {
      console.error('Failed to toggle publish status', e);
    }
  };

  // Filtered
  const filteredBlogs = blogs.filter((b) => {
    const matchesSearch =
      b.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.excerpt.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesCategory =
      selectedCategory === 'All' || b.category.toLowerCase() === selectedCategory.toLowerCase();

    const matchesStatus =
      selectedStatus === 'All' ||
      (selectedStatus === 'published' && b.isPublished) ||
      (selectedStatus === 'draft' && !b.isPublished);

    return matchesSearch && matchesCategory && matchesStatus;
  });

  const totalViews = blogs.reduce((acc, b) => acc + (b.viewsCount || 0), 0);
  const totalPublished = blogs.filter((b) => b.isPublished).length;
  const totalDrafts = blogs.filter((b) => !b.isPublished).length;

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 font-sans">
      {/* 1. Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-600/20 text-indigo-400 flex items-center justify-center">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white tracking-tight">Blog &amp; Editorial CMS</h1>
              <p className="text-xs text-slate-400">
                Publish wellness articles, relationship guides, and emotional care stories to the public website.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchBlogs}
            className="flex items-center gap-2 px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded-lg transition"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
          <button
            onClick={handleOpenCreate}
            className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-lg shadow-lg shadow-indigo-600/30 transition"
          >
            <Plus className="w-4 h-4" />
            Create New Article
          </button>
        </div>
      </div>

      {/* 2. Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Articles</span>
            <FileText className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="text-2xl font-black text-white mt-2">{blogs.length}</div>
          <span className="text-xs text-slate-500">All authored posts</span>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Published Live</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-black text-emerald-400 mt-2">{totalPublished}</div>
          <span className="text-xs text-slate-500">Live on /blog</span>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Drafts</span>
            <Clock className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-black text-amber-400 mt-2">{totalDrafts}</div>
          <span className="text-xs text-slate-500">Unpublished drafts</span>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Reads</span>
            <Eye className="w-4 h-4 text-blue-400" />
          </div>
          <div className="text-2xl font-black text-blue-400 mt-2">{totalViews.toLocaleString()}</div>
          <span className="text-xs text-slate-500">Cumulative page views</span>
        </div>
      </div>

      {/* 3. Filters & Search Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search articles, keywords, tags..."
            className="w-full pl-9 pr-4 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
          />
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto flex-wrap">
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="bg-slate-950 border border-slate-800 text-xs text-slate-300 rounded-xl px-3 py-2 focus:outline-none focus:border-indigo-500"
          >
            <option value="All">All Categories</option>
            <option value="Emotional Wellness">Emotional Wellness</option>
            <option value="Mental Health">Mental Health</option>
            <option value="Relationships">Relationships</option>
            <option value="Culture & Society">Culture &amp; Society</option>
          </select>

          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value as any)}
            className="bg-slate-950 border border-slate-800 text-xs text-slate-300 rounded-xl px-3 py-2 focus:outline-none focus:border-indigo-500"
          >
            <option value="All">All Statuses</option>
            <option value="published">Published</option>
            <option value="draft">Draft</option>
          </select>
        </div>
      </div>

      {/* 4. Articles Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-950/50 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                <th className="py-4 px-6">Article</th>
                <th className="py-4 px-6">Category &amp; Tags</th>
                <th className="py-4 px-6">Author</th>
                <th className="py-4 px-6">Views</th>
                <th className="py-4 px-6">Status</th>
                <th className="py-4 px-6">Published</th>
                <th className="py-4 px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-xs text-slate-300">
              {filteredBlogs.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-500">
                    No articles found matching your criteria.
                  </td>
                </tr>
              ) : (
                filteredBlogs.map((post) => (
                  <tr key={post.id} className="hover:bg-slate-800/40 transition">
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3 max-w-md">
                        <img
                          src={post.coverImage}
                          alt={post.title}
                          className="w-14 h-14 rounded-xl object-cover border border-slate-800 shrink-0"
                        />
                        <div>
                          <div className="font-bold text-slate-100 text-sm line-clamp-1">{post.title}</div>
                          <div className="text-slate-400 text-xs line-clamp-1 mt-0.5">{post.excerpt}</div>
                          <div className="text-[10px] text-slate-500 font-mono mt-1">/blog/{post.slug}</div>
                        </div>
                      </div>
                    </td>

                    <td className="py-4 px-6">
                      <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 mb-1">
                        {post.category}
                      </span>
                      <div className="flex gap-1 flex-wrap">
                        {post.tags.slice(0, 2).map((t, i) => (
                          <span key={i} className="text-[10px] text-slate-400">
                            #{t}
                          </span>
                        ))}
                      </div>
                    </td>

                    <td className="py-4 px-6">
                      <div className="flex items-center gap-2">
                        <img
                          src={post.authorAvatar}
                          alt={post.authorName}
                          className="w-6 h-6 rounded-full object-cover"
                        />
                        <span className="text-xs text-slate-200 font-medium">{post.authorName}</span>
                      </div>
                      <span className="text-[10px] text-slate-500">{post.readTimeMinutes} min read</span>
                    </td>

                    <td className="py-4 px-6">
                      <span className="font-semibold text-slate-200">{post.viewsCount || 0}</span>
                    </td>

                    <td className="py-4 px-6">
                      <button
                        onClick={() => handleTogglePublish(post)}
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold transition ${
                          post.isPublished
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/20'
                            : 'bg-amber-500/10 text-amber-400 border border-amber-500/30 hover:bg-amber-500/20'
                        }`}
                      >
                        <span className={`w-1.5 h-1.5 rounded-full ${post.isPublished ? 'bg-emerald-400' : 'bg-amber-400'}`} />
                        {post.isPublished ? 'Published' : 'Draft'}
                      </button>
                    </td>

                    <td className="py-4 px-6 text-slate-400 text-xs">
                      {new Date(post.publishedAt).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </td>

                    <td className="py-4 px-6 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <a
                          href={`http://localhost:8680/blog/${post.slug}`}
                          target="_blank"
                          rel="noreferrer"
                          className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg transition"
                          title="View Live on Website"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                        <button
                          onClick={() => handleOpenEdit(post)}
                          className="p-1.5 bg-indigo-600/20 hover:bg-indigo-600/40 text-indigo-400 rounded-lg transition"
                          title="Edit Article"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeletePost(post.id, post.title)}
                          className="p-1.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-lg transition"
                          title="Delete Article"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 5. Editor Drawer / Modal */}
      {isEditorOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-4xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden">
            {/* Modal Header */}
            <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center font-bold">
                  {editingPost ? <Edit2 className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                </div>
                <div>
                  <h2 className="text-base font-bold text-white">
                    {editingPost ? 'Edit Blog Article' : 'Create New Wellness Article'}
                  </h2>
                  <p className="text-xs text-slate-400">Content directly updates on the public /blog pages.</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <div className="bg-slate-800 p-1 rounded-lg flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => setEditorTab('write')}
                    className={`px-3 py-1 rounded text-xs font-semibold transition ${
                      editorTab === 'write' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    Editor
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditorTab('preview')}
                    className={`px-3 py-1 rounded text-xs font-semibold transition ${
                      editorTab === 'preview' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    Preview
                  </button>
                </div>

                <button
                  onClick={() => setIsEditorOpen(false)}
                  className="p-1.5 text-slate-400 hover:text-white rounded-lg transition"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleSavePost} className="p-6 overflow-y-auto space-y-5 flex-1">
              {formError && (
                <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-xs font-semibold">
                  {formError}
                </div>
              )}

              {editorTab === 'write' ? (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Title */}
                    <div className="md:col-span-2">
                      <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                        Article Title *
                      </label>
                      <input
                        type="text"
                        value={title}
                        onChange={(e) => handleTitleChange(e.target.value)}
                        placeholder="e.g. Navigating Late-Night Overthinking: Why Talking It Out Heals"
                        className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white focus:outline-none focus:border-indigo-500"
                        required
                      />
                    </div>

                    {/* Slug */}
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                        URL Slug *
                      </label>
                      <input
                        type="text"
                        value={slug}
                        onChange={(e) => setSlug(e.target.value)}
                        placeholder="e.g. navigating-late-night-overthinking"
                        className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-indigo-400 font-mono focus:outline-none focus:border-indigo-500"
                        required
                      />
                    </div>

                    {/* Category */}
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                        Category
                      </label>
                      <select
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                        className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500"
                      >
                        <option value="Emotional Wellness">Emotional Wellness</option>
                        <option value="Mental Health">Mental Health</option>
                        <option value="Relationships">Relationships</option>
                        <option value="Culture & Society">Culture &amp; Society</option>
                        <option value="Self Care">Self Care</option>
                      </select>
                    </div>

                    {/* Tags */}
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                        Tags (comma separated)
                      </label>
                      <input
                        type="text"
                        value={tags}
                        onChange={(e) => setTags(e.target.value)}
                        placeholder="Overthinking, Sleep, Anxiety"
                        className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500"
                      />
                    </div>

                    {/* Read Time */}
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                        Read Time (Minutes)
                      </label>
                      <input
                        type="number"
                        min="1"
                        max="30"
                        value={readTimeMinutes}
                        onChange={(e) => setReadTimeMinutes(Number(e.target.value))}
                        className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500"
                      />
                    </div>

                    {/* Author Name */}
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                        Author Name
                      </label>
                      <input
                        type="text"
                        value={authorName}
                        onChange={(e) => setAuthorName(e.target.value)}
                        placeholder="Dr. Aanya Sen"
                        className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500"
                      />
                    </div>

                    {/* Author Avatar URL */}
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                        Author Avatar URL
                      </label>
                      <input
                        type="text"
                        value={authorAvatar}
                        onChange={(e) => setAuthorAvatar(e.target.value)}
                        placeholder="https://images.unsplash.com/..."
                        className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500"
                      />
                    </div>

                    {/* Cover Image URL & Quick Presets */}
                    <div className="md:col-span-2 space-y-2">
                      <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">
                        Cover Image URL
                      </label>
                      <input
                        type="text"
                        value={coverImage}
                        onChange={(e) => setCoverImage(e.target.value)}
                        placeholder="https://images.unsplash.com/photo-..."
                        className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500"
                      />
                      <div className="flex items-center gap-2 overflow-x-auto pt-1">
                        <span className="text-[10px] text-slate-500 uppercase font-bold shrink-0">Presets:</span>
                        {PRESET_COVERS.map((preset, idx) => (
                          <button
                            key={idx}
                            type="button"
                            onClick={() => setCoverImage(preset.url)}
                            className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded text-[10px] shrink-0 font-medium transition"
                          >
                            {preset.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Excerpt */}
                    <div className="md:col-span-2">
                      <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                        Short Excerpt (Shows on cards &amp; social previews)
                      </label>
                      <textarea
                        rows={2}
                        value={excerpt}
                        onChange={(e) => setExcerpt(e.target.value)}
                        placeholder="Brief 1-2 sentence hook describing the article..."
                        className="w-full px-4 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500"
                      />
                    </div>

                    {/* Content (Markdown) */}
                    <div className="md:col-span-2">
                      <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                        Article Body (Markdown Supported) *
                      </label>
                      <textarea
                        rows={12}
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        placeholder="### Heading 1&#10;&#10;Write your article paragraphs here. Use markdown for headings, bold, bullet points..."
                        className="w-full p-4 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 font-mono focus:outline-none focus:border-indigo-500 leading-relaxed"
                        required
                      />
                    </div>

                    {/* Published status toggle */}
                    <div className="md:col-span-2 flex items-center justify-between p-3.5 bg-slate-950 border border-slate-800 rounded-xl">
                      <div>
                        <div className="text-xs font-bold text-white">Publish Status</div>
                        <div className="text-[11px] text-slate-400">
                          {isPublished ? 'This article will be immediately visible on /blog' : 'Draft only (hidden from public)'}
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => setIsPublished(!isPublished)}
                        className={`w-12 h-6 flex items-center rounded-full p-1 transition duration-300 ${
                          isPublished ? 'bg-indigo-600 justify-end' : 'bg-slate-700 justify-start'
                        }`}
                      >
                        <div className="bg-white w-4 h-4 rounded-full shadow-md" />
                      </button>
                    </div>
                  </div>
                </>
              ) : (
                /* Preview Tab */
                <div className="space-y-6 max-w-2xl mx-auto py-4">
                  <div className="space-y-3">
                    <span className="inline-block px-3 py-1 rounded-full text-xs font-bold bg-indigo-500/20 text-indigo-400">
                      {category}
                    </span>
                    <h1 className="text-2xl md:text-3xl font-black text-white">{title || 'Untitled Article'}</h1>
                    <div className="flex items-center gap-3 text-xs text-slate-400">
                      <img src={authorAvatar} alt={authorName} className="w-8 h-8 rounded-full object-cover" />
                      <div>
                        <div className="font-bold text-slate-200">{authorName}</div>
                        <div>{readTimeMinutes} min read • Preview Mode</div>
                      </div>
                    </div>
                  </div>

                  {coverImage && (
                    <img
                      src={coverImage}
                      alt={title}
                      className="w-full h-64 object-cover rounded-2xl border border-slate-800"
                    />
                  )}

                  <div className="text-slate-300 text-sm leading-relaxed whitespace-pre-line space-y-4 font-sans">
                    {content || 'No content written yet.'}
                  </div>
                </div>
              )}

              {/* Modal Footer */}
              <div className="pt-4 border-t border-slate-800 flex items-center justify-end gap-3 bg-slate-900 sticky bottom-0">
                <button
                  type="button"
                  onClick={() => setIsEditorOpen(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded-xl transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl shadow-lg shadow-indigo-600/30 transition disabled:opacity-50"
                >
                  {saving ? 'Saving...' : editingPost ? 'Update Article' : 'Publish Article'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
