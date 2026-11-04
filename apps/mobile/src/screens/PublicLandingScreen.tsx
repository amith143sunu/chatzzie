'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  Modal,
  TouchableOpacity,
  Platform,
} from 'react-native';
import { X } from 'lucide-react-native';
import { LoginScreen } from './LoginScreen';
import { PublicNavbar } from './public/PublicNavbar';
import { PublicFooter } from './public/PublicFooter';
import { PublicHomeScreen } from './public/PublicHomeScreen';
import { HowItWorksScreen } from './public/HowItWorksScreen';
import { WhyChatzzieScreen } from './public/WhyChatzzieScreen';
import { HostsDirectoryScreen } from './public/HostsDirectoryScreen';
import { DownloadHubScreen } from './public/DownloadHubScreen';
import { BlogListScreen } from './public/BlogListScreen';
import { BlogPostScreen } from './public/BlogPostScreen';
import { FaqScreen } from './public/FaqScreen';
import { LegalPageScreen } from './public/LegalPageScreen';

interface PublicLandingScreenProps {
  onLoginSuccess: (user: any) => void;
  onOpenHostPortal: () => void;
  onOpenAdminLogin: () => void;
}

export const PublicLandingScreen: React.FC<PublicLandingScreenProps> = ({
  onLoginSuccess,
  onOpenHostPortal,
  onOpenAdminLogin,
}) => {
  // Initialize current route from window.location.pathname
  const [currentPath, setCurrentPath] = useState<string>(() => {
    if (typeof window !== 'undefined' && window.location) {
      const p = window.location.pathname || '/';
      return p;
    }
    return '/';
  });

  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const scrollViewRef = useRef<ScrollView>(null);

  // Sync route on popstate (browser back and forward buttons)
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const handlePopState = () => {
        const path = window.location.pathname || '/';
        setCurrentPath(path);
        if (scrollViewRef.current) {
          scrollViewRef.current.scrollTo({ y: 0, animated: false });
        }
      };

      window.addEventListener('popstate', handlePopState);
      return () => window.removeEventListener('popstate', handlePopState);
    }
  }, []);

  const navigateTo = (path: string) => {
    if (path === '/host') {
      onOpenHostPortal();
      return;
    }
    if (path === '/admin/login' || path === '/admin') {
      onOpenAdminLogin();
      return;
    }

    setCurrentPath(path);

    if (scrollViewRef.current) {
      scrollViewRef.current.scrollTo({ y: 0, animated: false });
    }

    if (typeof window !== 'undefined') {
      if (window.history && window.history.pushState) {
        window.history.pushState({}, '', path);
      }
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // Determine active view based on path
  const renderCurrentPage = () => {
    if (currentPath === '/how-it-works') {
      return (
        <HowItWorksScreen
          onNavigate={navigateTo}
          onOpenLogin={() => setIsLoginModalOpen(true)}
        />
      );
    }

    if (currentPath === '/why-chatzzie') {
      return (
        <WhyChatzzieScreen
          onNavigate={navigateTo}
          onOpenLogin={() => setIsLoginModalOpen(true)}
        />
      );
    }

    if (currentPath === '/hosts') {
      return (
        <HostsDirectoryScreen
          onNavigate={navigateTo}
          onOpenLogin={() => setIsLoginModalOpen(true)}
          onOpenHostPortal={onOpenHostPortal}
        />
      );
    }

    if (currentPath === '/download') {
      return (
        <DownloadHubScreen
          onNavigate={navigateTo}
          onOpenLogin={() => setIsLoginModalOpen(true)}
        />
      );
    }

    if (currentPath === '/blog') {
      return (
        <BlogListScreen
          onNavigate={navigateTo}
          onOpenLogin={() => setIsLoginModalOpen(true)}
        />
      );
    }

    if (currentPath.startsWith('/blog/')) {
      const slug = currentPath.replace('/blog/', '').split('?')[0].split('#')[0];
      return (
        <BlogPostScreen
          slug={slug}
          onNavigate={navigateTo}
          onOpenLogin={() => setIsLoginModalOpen(true)}
        />
      );
    }

    if (currentPath === '/faq') {
      return (
        <FaqScreen
          onNavigate={navigateTo}
          onOpenLogin={() => setIsLoginModalOpen(true)}
        />
      );
    }

    if (currentPath === '/terms') {
      return <LegalPageScreen initialDoc="terms" onNavigate={navigateTo} />;
    }

    if (currentPath === '/privacy') {
      return <LegalPageScreen initialDoc="privacy" onNavigate={navigateTo} />;
    }

    if (currentPath === '/refund') {
      return <LegalPageScreen initialDoc="refund" onNavigate={navigateTo} />;
    }

    if (currentPath === '/community') {
      return <LegalPageScreen initialDoc="community" onNavigate={navigateTo} />;
    }

    // Default: Home Page
    return (
      <PublicHomeScreen
        onNavigate={navigateTo}
        onOpenLogin={() => setIsLoginModalOpen(true)}
        onOpenHostPortal={onOpenHostPortal}
      />
    );
  };

  return (
    <View style={styles.container}>
      {/* 1. Global Public Navbar */}
      <PublicNavbar
        currentPath={currentPath}
        onNavigate={navigateTo}
        onOpenLogin={() => setIsLoginModalOpen(true)}
        onOpenHostPortal={onOpenHostPortal}
      />

      {/* 2. Scrollable Body with Page Content & Public Footer */}
      <ScrollView
        ref={scrollViewRef}
        style={styles.mainScrollView}
        contentContainerStyle={styles.mainScrollContent}
        showsVerticalScrollIndicator={true}
      >
        <View style={styles.pageBody}>
          {renderCurrentPage()}
        </View>

        {/* 3. Global Public Footer (Scrolls naturally at bottom of content) */}
        <PublicFooter
          onNavigate={navigateTo}
          onOpenLogin={() => setIsLoginModalOpen(true)}
          onOpenHostPortal={onOpenHostPortal}
          onOpenAdminLogin={onOpenAdminLogin}
        />
      </ScrollView>

      {/* 4. Instant Sign In Modal */}
      <Modal
        visible={isLoginModalOpen}
        animationType="fade"
        transparent={true}
        onRequestClose={() => setIsLoginModalOpen(false)}
      >
        <View style={styles.loginModalOverlay}>
          <View style={styles.loginModalContainer}>
            <TouchableOpacity
              style={styles.closeLoginModalBtn}
              onPress={() => setIsLoginModalOpen(false)}
            >
              <X size={20} color="#FFFFFF" />
            </TouchableOpacity>

            <LoginScreen
              onLoginSuccess={(user) => {
                setIsLoginModalOpen(false);
                onLoginSuccess(user);
              }}
              onOpenHostPortal={() => {
                setIsLoginModalOpen(false);
                onOpenHostPortal();
              }}
            />
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    height: '100%',
    backgroundColor: '#FFFFFF',
  },
  mainScrollView: {
    flex: 1,
    width: '100%',
  },
  mainScrollContent: {
    flexGrow: 1,
    flexDirection: 'column',
    justifyContent: 'space-between',
  },
  pageBody: {
    flex: 1,
    width: '100%',
  },
  loginModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  loginModalContainer: {
    width: '100%',
    maxWidth: 440,
    backgroundColor: '#0F172A',
    borderRadius: 24,
    overflow: 'hidden',
    position: 'relative',
    borderWidth: 1,
    borderColor: '#334155',
    maxHeight: '90%',
  },
  closeLoginModalBtn: {
    position: 'absolute',
    top: 14,
    right: 14,
    zIndex: 9999,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
});
