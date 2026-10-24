import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, SafeAreaView, StatusBar, Alert, useWindowDimensions, Platform } from 'react-native';
import { BottomNavBar, NavTab } from './src/components/BottomNavBar';
import { DesktopHeader } from './src/components/DesktopHeader';
import { HomeScreen } from './src/screens/HomeScreen';
import { CallsScreen } from './src/screens/CallsScreen';
import { ChatScreen } from './src/screens/ChatScreen';
import { ChatDetailScreen } from './src/screens/ChatDetailScreen';
import { WalletScreen } from './src/screens/WalletScreen';
import { ListenerDetailScreen } from './src/screens/ListenerDetailScreen';
import { TransactionsScreen } from './src/screens/TransactionsScreen';
import { ActiveCallScreen } from './src/screens/ActiveCallScreen';
import { AccountScreen } from './src/screens/AccountScreen';
import { EditProfileScreen } from './src/screens/EditProfileScreen';
import { CouponsScreen } from './src/screens/CouponsScreen';
import { CallHistoryScreen } from './src/screens/CallHistoryScreen';
import { CallSummaryModal } from './src/screens/CallSummaryModal';
import { IncomingCallModal } from './src/screens/IncomingCallModal';
import { PolicyModal, PolicyType } from './src/screens/PolicyModal';
import { HelpScreen } from './src/screens/HelpScreen';
import { ListenerOnboardingModal } from './src/screens/ListenerOnboardingModal';
import { ListenerEarningsModal } from './src/screens/ListenerEarningsModal';
import { LoginScreen } from './src/screens/LoginScreen';
import { HostLiveScreen } from './src/screens/HostLiveScreen';
import { DeviceFrame, ViewMode } from './src/components/DeviceFrame';
import { InsufficientBalanceModal } from './src/components/InsufficientBalanceModal';
import { ListenerProfile, WalletTransaction, Coupon, DEFAULT_COUPONS } from '@chatzie/shared';
import { mockListeners, mockTransactions } from './src/data/mockData';
import { THEME } from './src/theme';
import { getApiBaseUrl } from './src/services/apiConfig';

type ScreenView =
  | 'tab_home'
  | 'tab_calls'
  | 'tab_chat'
  | 'tab_wallet'
  | 'chat_detail'
  | 'listener_detail'
  | 'transactions'
  | 'call_history'
  | 'edit_profile'
  | 'coupons'
  | 'active_call'
  | 'account'
  | 'help';

class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; error: Error | null }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: any) {
    console.error('Chatzie UI Error:', error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <View style={{ flex: 1, backgroundColor: '#0B0F19', justifyContent: 'center', alignItems: 'center', padding: 24 }}>
          <View style={{ backgroundColor: '#1E293B', padding: 24, borderRadius: 16, maxWidth: 440, width: '100%', borderWidth: 1, borderColor: '#334155' }}>
            <Text style={{ color: '#EF4444', fontSize: 18, fontWeight: '700', marginBottom: 8 }}>Rendering Notice</Text>
            <Text style={{ color: '#94A3B8', fontSize: 13, marginBottom: 16, lineHeight: 20 }}>
              {this.state.error?.message || 'A render error occurred.'}
            </Text>
            <TouchableOpacity
              onPress={() => {
                if (typeof window !== 'undefined') window.location.reload();
              }}
              style={{ backgroundColor: '#2563EB', paddingVertical: 12, paddingHorizontal: 16, borderRadius: 8, alignItems: 'center' }}
            >
              <Text style={{ color: '#FFFFFF', fontWeight: '600', fontSize: 14 }}>Reload Application</Text>
            </TouchableOpacity>
          </View>
        </View>
      );
    }
    return this.props.children;
  }
}

export default function App() {
  const { width } = useWindowDimensions();
  const [viewMode, setViewMode] = useState<ViewMode>(() => {
    if (typeof window !== 'undefined' && window.localStorage) {
      const saved = window.localStorage.getItem('chatzie_view_mode');
      if (saved === 'mobile' || saved === 'desktop') return saved as ViewMode;
    }
    return 'desktop';
  });
  const isLargeScreen = Platform.OS === 'web' && width > 640;
  const isDesktop = viewMode === 'desktop' && isLargeScreen;

  const [activeTab, setActiveTab] = useState<NavTab>('home');
  const [currentScreen, setCurrentScreen] = useState<ScreenView>('tab_home');

  // Real-time App State (Welcome balance ₹60.00 for instant live testing)
  const [walletBalanceINR, setWalletBalanceINR] = useState<number>(60.00);
  const [listeners, setListeners] = useState<ListenerProfile[]>(mockListeners);
  const [transactions, setTransactions] = useState<WalletTransaction[]>(mockTransactions);
  const [userName, setUserName] = useState('Amit');
  const [userRole, setUserRole] = useState<'talker' | 'listener'>('talker');
  const [userUsername, setUserUsername] = useState<string>('amit_caller');
  const [userId, setUserId] = useState<string>('u_amit');
  const [userAvatar, setUserAvatar] = useState('https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80');
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    if (typeof window !== 'undefined' && window.localStorage) {
      const saved = window.localStorage.getItem('chatzie_user_profile') || window.localStorage.getItem('chatzie_current_user');
      return !!saved;
    }
    return false;
  });

  // Load saved user identity from localStorage on startup
  useEffect(() => {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        const saved = window.localStorage.getItem('chatzie_user_profile') || window.localStorage.getItem('chatzie_current_user');
        if (saved) {
          const parsed = JSON.parse(saved);
          if (parsed.name) setUserName(parsed.name);
          if (parsed.username) setUserUsername(parsed.username);
          if (parsed.role) setUserRole(parsed.role);
          if (parsed.id) setUserId(parsed.id);
          if (parsed.avatarUrl) setUserAvatar(parsed.avatarUrl);
          if (typeof parsed.walletBalanceINR === 'number') setWalletBalanceINR(parsed.walletBalanceINR);
          if (parsed.role === 'listener') setIsListenerVerified(true);
          setIsAuthenticated(true);
        } else {
          setIsAuthenticated(false);
        }
      }
    } catch (e) {}
  }, []);

  const handleLoginSuccess = (u: any) => {
    setUserName(u.name);
    setUserRole(u.role);
    setUserId(u.id);
    setUserUsername(u.username || u.name.toLowerCase().replace(/[^a-z0-9]/g, '_'));
    if (u.avatarUrl) setUserAvatar(u.avatarUrl);
    if (typeof u.walletBalanceINR === 'number') {
      setWalletBalanceINR(u.walletBalanceINR);
    }
    setIsAuthenticated(true);

    if (u.role === 'listener') {
      setIsListenerVerified(true);
      fetch(`${getApiBaseUrl()}/api/listeners`)
        .then((r) => r.json())
        .then((data) => {
          if (Array.isArray(data)) setListeners(data);
        })
        .catch(() => {});
    }
  };

  const handleLogout = () => {
    if (typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.removeItem('chatzie_user_profile');
      window.localStorage.removeItem('chatzie_current_user');
    }
    setUserRole('talker');
    setUserName('');
    setUserUsername('');
    setIsAuthenticated(false);
    setCurrentScreen('tab_home');
  };

  const handleHostAcceptCall = (call: any) => {
    const hostProfile: ListenerProfile = {
      id: userId,
      name: userName,
      username: userUsername,
      avatarUrl: userAvatar,
      bio: 'Verified Host',
      callRatePerMinINR: call.callType === 'video' ? 30 : 9,
      chatRatePerMsgINR: 0.25,
      isOnline: true,
      isVideoEnabled: true,
      languages: ['Hindi', 'English'],
      totalCalls: 12,
      rating: 4.9,
    };
    setSelectedListener(hostProfile);
    setActiveCallType(call.callType || 'video');
    setCurrentScreen('active_call');
  };

  // Active Contexts
  const [selectedListener, setSelectedListener] = useState<ListenerProfile>(mockListeners[0]);
  const [activeCallType, setActiveCallType] = useState<'audio' | 'video'>('audio');
  const [isListenerVerified, setIsListenerVerified] = useState<boolean>(false);
  const [showOnboardingModal, setShowOnboardingModal] = useState<boolean>(false);
  const [showEarningsModal, setShowEarningsModal] = useState<boolean>(false);

  // Live sync with backend server
  useEffect(() => {
    const syncWithBackend = async () => {
      try {
        const baseUrl = getApiBaseUrl();
        const [listenersRes, usersRes] = await Promise.all([
          fetch(`${baseUrl}/api/listeners`),
          fetch(`${baseUrl}/api/admin/users`)
        ]);
        if (listenersRes.ok) {
          const data = await listenersRes.json();
          if (Array.isArray(data) && data.length > 0) {
            setListeners(data);
          }
        }
        if (usersRes.ok) {
          const userData = await usersRes.json();
          if (userData.users) {
            const currentU = userData.users.find((u: any) => u.id === userId) || userData.users.find((u: any) => u.name === userName);
            if (currentU && typeof currentU.walletBalanceINR === 'number') {
              setWalletBalanceINR(currentU.walletBalanceINR);
            }
          }
        }
      } catch (e) {}
    };

    syncWithBackend();
    const interval = setInterval(syncWithBackend, 4000);
    return () => clearInterval(interval);
  }, [userId, userName]);

  // Low balance prompt modal
  const [lowBalanceModal, setLowBalanceModal] = useState<{
    visible: boolean;
    listener: ListenerProfile | null;
    type: 'audio' | 'video';
  }>({
    visible: false,
    listener: null,
    type: 'audio',
  });

  // Modals
  const [summaryData, setSummaryData] = useState<{ visible: boolean; duration: number; cost: number }>({
    visible: false,
    duration: 0,
    cost: 0,
  });
  const [incomingCallData, setIncomingCallData] = useState<{ visible: boolean; listener: ListenerProfile }>({
    visible: false,
    listener: mockListeners[1],
  });
  const [policyModal, setPolicyModal] = useState<{ visible: boolean; type: PolicyType }>({
    visible: false,
    type: 'privacy',
  });
  const [activeCoupon, setActiveCoupon] = useState<Coupon>(DEFAULT_COUPONS[0]);

  // Handle URL auto-call parameter for instant 2-way Agora testing (audio or video)
  useEffect(() => {
    if (typeof window !== 'undefined' && window.location && window.location.search) {
      const params = new URLSearchParams(window.location.search);
      const autocallHandle = params.get('autocall');
      const autocallType = params.get('type') === 'video' ? 'video' : 'audio';
      if (autocallHandle) {
        const found = mockListeners.find(l => l.username === autocallHandle) || mockListeners[0];
        setSelectedListener(found);
        setActiveCallType(autocallType);
        setCurrentScreen('active_call');
      }
    }
  }, []);

  // Tab change handler
  const handleTabChange = (tab: NavTab) => {
    setActiveTab(tab);
    if (tab === 'home') setCurrentScreen('tab_home');
    if (tab === 'calls') setCurrentScreen('tab_calls');
    if (tab === 'chat') setCurrentScreen('tab_chat');
    if (tab === 'wallet') setCurrentScreen('tab_wallet');
  };

  // Trigger audio/video call (Voice: ₹9/min, Video: ₹30/min)
  const handleStartCall = (listener: ListenerProfile, type: 'audio' | 'video') => {
    const requiredMinBalance = type === 'video' ? 30 : 9;
    if (walletBalanceINR < requiredMinBalance) {
      setLowBalanceModal({
        visible: true,
        listener,
        type,
      });
      return;
    }

    // Send ring signal to backend for host
    try {
      const baseUrl = getApiBaseUrl();
      fetch(`${baseUrl}/api/calls/dial`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          callerName: userName || 'Caller',
          callerId: userId,
          listenerUsername: listener.username,
          callType: type,
          ratePerMin: type === 'video' ? 30 : 9,
        }),
      }).catch(() => {});

      // Register live session in admin monitor
      fetch(`${baseUrl}/api/calls/start`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          channel: `call_${listener.username}`,
          caller: `${userName || 'Caller'} (${userId})`,
          listener: `${listener.name} (@${listener.username})`,
          type,
          ratePerMinINR: type === 'video' ? 30 : 9,
        }),
      }).catch(() => {});
    } catch (e) {}

    setSelectedListener(listener);
    setActiveCallType(type);
    setCurrentScreen('active_call');
  };

  // Deduct chat costs (₹0.25 text / ₹0.75 image)
  const handleDeductChatCost = (amount: number, description: string): boolean => {
    if (walletBalanceINR < amount) {
      return false;
    }
    const newBal = Number((walletBalanceINR - amount).toFixed(2));
    setWalletBalanceINR(newBal);

    const newTx: WalletTransaction = {
      id: `tx-${Date.now()}`,
      userId: userId,
      type: 'call_deduction',
      amountINR: -amount,
      status: 'completed',
      description,
      referenceId: `chat_${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    setTransactions((prev) => [newTx, ...prev]);

    // Notify backend to credit host chat earnings (₹0.125/text, ₹0.375/photo)
    try {
      const baseUrl = getApiBaseUrl();
      fetch(`${baseUrl}/api/chat/deduct`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          callerId: userId,
          listenerId: selectedListener.id,
          type: amount >= 0.7 ? 'image' : 'text',
        }),
      }).catch(() => {});
    } catch (e) {}

    return true;
  };

  // Quick 1-tap recharge from modal and directly connect call
  const handleQuickRechargeAndCall = (amount: number) => {
    const newBal = Number((walletBalanceINR + amount).toFixed(2));
    setWalletBalanceINR(newBal);

    const newTx: WalletTransaction = {
      id: `tx_${Date.now()}`,
      userId: userId,
      type: 'recharge',
      amountINR: amount,
      status: 'completed',
      description: `Quick Wallet Top-Up ₹${amount}`,
      referenceId: `order_${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    setTransactions([newTx, ...transactions]);

    const targetListener = lowBalanceModal.listener || selectedListener;
    const targetType = lowBalanceModal.type || activeCallType;

    setLowBalanceModal({ visible: false, listener: null, type: 'audio' });

    setSelectedListener(targetListener);
    setActiveCallType(targetType);
    setCurrentScreen('active_call');
  };

  // Call Ended
  const handleEndCall = (durationSeconds: number, totalCost: number) => {
    const billedMinutes = Math.max(1, Math.ceil(durationSeconds / 60));
    const ratePerMin = activeCallType === 'video' ? 30 : 9;
    const cost = Number((billedMinutes * ratePerMin).toFixed(2));

    if (userRole === 'talker') {
      const newBal = Math.max(0, Number((walletBalanceINR - cost).toFixed(2)));
      setWalletBalanceINR(newBal);

      const newTx: WalletTransaction = {
        id: `tx-${Date.now()}`,
        userId: userId,
        type: 'call_deduction',
        amountINR: -cost,
        status: 'completed',
        description: `${activeCallType === 'video' ? 'Video' : 'Voice'} Call (${billedMinutes} min @ ₹${ratePerMin}/min) with ${selectedListener.username}`,
        referenceId: `call_${Date.now()}`,
        createdAt: new Date().toISOString(),
      };
      setTransactions([newTx, ...transactions]);
    }

    // Notify backend to credit host earnings (₹4.50/min voice, ₹16/min video) and settle balances
    try {
      const baseUrl = getApiBaseUrl();
      fetch(`${baseUrl}/api/calls/end`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          channel: `call_${selectedListener.username}`,
          durationSeconds,
          totalCost: cost,
          callerId: userId,
          listenerId: selectedListener.id,
          callType: activeCallType,
        }),
      }).catch(() => {});
    } catch (e) {}

    if (userRole === 'talker') {
      // Show Call Summary & Rating modal
      setSummaryData({
        visible: true,
        duration: durationSeconds,
        cost,
      });
      setCurrentScreen('tab_calls');
    } else {
      // Host returns to Host Live screen
      setCurrentScreen('tab_home');
    }
  };

  // Recharge Success
  const handleRechargeSuccess = (amount: number, cashback: number) => {
    const totalAdded = amount + cashback;
    const newBal = Number((walletBalanceINR + totalAdded).toFixed(2));
    setWalletBalanceINR(newBal);

    const newTx: WalletTransaction = {
      id: `tx-${Date.now()}`,
      userId: userId,
      type: 'recharge',
      amountINR: amount,
      cashbackINR: cashback,
      status: 'completed',
      description: `Wallet Recharge ₹${amount} ${cashback > 0 ? `(+₹${cashback} Cashback)` : ''}`,
      referenceId: `order_${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    setTransactions([newTx, ...transactions]);

    // Update backend user balance so admin panel stays synced
    try {
      const baseUrl = getApiBaseUrl();
      fetch(`${baseUrl}/api/admin/users/adjust-balance`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: userId,
          deltaINR: totalAdded,
          description: `Test Sandbox Recharge ₹${amount} ${cashback > 0 ? `(+₹${cashback} Cashback)` : ''}`,
        }),
      }).catch(() => {});
    } catch (e) {}

    Alert.alert(
      'Recharge Successful',
      `₹${amount} added successfully! ${cashback > 0 ? `Bonus ₹${cashback} cashback credited.` : ''} Your new balance is ₹${newBal.toFixed(2)}.`,
      [{ text: 'Great', onPress: () => setCurrentScreen('tab_wallet') }]
    );
  };

  // 1. Unauthenticated Visitor -> Render ONLY the dedicated Full-Screen Login Page!
  if (!isAuthenticated) {
    return (
      <ErrorBoundary>
        <SafeAreaView style={{ flex: 1, backgroundColor: '#0F172A' }}>
          <StatusBar barStyle="light-content" backgroundColor="#0F172A" />
          <LoginScreen onLoginSuccess={handleLoginSuccess} />
        </SafeAreaView>
      </ErrorBoundary>
    );
  }

  // 2. Authenticated as Host (Listener) -> Render Host Live Console
  if (userRole === 'listener') {
    return (
      <ErrorBoundary>
        <SafeAreaView style={styles.safeArea}>
          <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
          {currentScreen === 'active_call' ? (
            <ActiveCallScreen
              listener={selectedListener}
              callType={activeCallType}
              userBalanceINR={walletBalanceINR}
              onEndCall={handleEndCall}
              onBalanceDepleted={() => {}}
            />
          ) : (
            <HostLiveScreen
              hostName={userName}
              hostUsername={userUsername}
              hostAvatar={userAvatar}
              onAcceptCall={handleHostAcceptCall}
              onLogout={handleLogout}
            />
          )}
        </SafeAreaView>
      </ErrorBoundary>
    );
  }

  return (
    <ErrorBoundary>
      <DeviceFrame viewMode={viewMode} onToggleViewMode={setViewMode}>
        <SafeAreaView style={styles.safeArea}>
        <StatusBar barStyle="dark-content" backgroundColor={THEME.colors.white} />

        {/* Professional Desktop Header (Only rendered in Desktop Web mode) */}
        {isDesktop && (
          <DesktopHeader
            activeTab={activeTab}
            onTabChange={handleTabChange}
            balanceINR={walletBalanceINR}
            onBalancePress={() => handleTabChange('wallet')}
            onAvatarPress={() => setCurrentScreen('account')}
            onBecomeListenerPress={() => setShowOnboardingModal(true)}
            onEarningsPress={() => setShowEarningsModal(true)}
            viewMode={viewMode}
            onToggleViewMode={setViewMode}
            userName={userName}
            userRole={userRole}
          />
        )}

      <View style={styles.container}>
        {/* Main Tabs */}
        {currentScreen === 'tab_home' && (
          <HomeScreen
            balanceINR={walletBalanceINR}
            listeners={listeners}
            isDesktop={isDesktop}
            onBalancePress={() => handleTabChange('wallet')}
            onAvatarPress={() => setCurrentScreen('account')}
            onCategoryPress={() => handleTabChange('calls')}
            onListenerPress={(l) => {
              setSelectedListener(l);
              setCurrentScreen('listener_detail');
            }}
            onCallPress={handleStartCall}
            onBecomeListenerPress={() => setShowOnboardingModal(true)}
            onEarningsPress={() => setShowEarningsModal(true)}
          />
        )}

        {currentScreen === 'tab_calls' && (
          <CallsScreen
            balanceINR={walletBalanceINR}
            listeners={listeners}
            isDesktop={isDesktop}
            onBalancePress={() => handleTabChange('wallet')}
            onListenerPress={(l) => {
              setSelectedListener(l);
              setCurrentScreen('listener_detail');
            }}
            onCallPress={handleStartCall}
          />
        )}

        {currentScreen === 'tab_chat' && (
          <ChatScreen
            balanceINR={walletBalanceINR}
            isDesktop={isDesktop}
            onBalancePress={() => handleTabChange('wallet')}
            onConversationPress={(chat) => {
              const matched = listeners.find((l) => l.name.toLowerCase().includes(chat.name.toLowerCase())) || listeners[0];
              setSelectedListener(matched);
              setCurrentScreen('chat_detail');
            }}
          />
        )}

        {currentScreen === 'tab_wallet' && (
          <WalletScreen
            balanceINR={walletBalanceINR}
            isDesktop={isDesktop}
            userId={userId}
            userName={userName}
            onHistoryPress={() => setCurrentScreen('transactions')}
            onRechargeSuccess={handleRechargeSuccess}
          />
        )}

        {/* Internal Sub-Pages */}
        {currentScreen === 'chat_detail' && (
          <ChatDetailScreen
            partnerName={selectedListener.name}
            partnerAvatar={selectedListener.avatarUrl}
            partnerRate={selectedListener.callRatePerMinINR}
            userBalanceINR={walletBalanceINR}
            onBackPress={() => setCurrentScreen('tab_chat')}
            onAudioCallPress={() => handleStartCall(selectedListener, 'audio')}
            onVideoCallPress={() => handleStartCall(selectedListener, 'video')}
            onDeductChatCost={handleDeductChatCost}
            onRechargePress={() => handleTabChange('wallet')}
          />
        )}

        {currentScreen === 'listener_detail' && (
          <ListenerDetailScreen
            listener={selectedListener}
            onBackPress={() => setCurrentScreen('tab_calls')}
            onChatPress={() => setCurrentScreen('chat_detail')}
            onCallPress={(type) => handleStartCall(selectedListener, type)}
          />
        )}

        {currentScreen === 'transactions' && (
          <TransactionsScreen
            balanceINR={walletBalanceINR}
            transactions={transactions}
            onBackPress={() => handleTabChange('wallet')}
          />
        )}

        {currentScreen === 'call_history' && (
          <CallHistoryScreen
            onBackPress={() => setCurrentScreen('account')}
            onCallAgain={(handle, type) => {
              const matched = listeners.find(l => l.username === handle) || listeners[0];
              handleStartCall(matched, type);
            }}
          />
        )}

        {currentScreen === 'edit_profile' && (
          <EditProfileScreen
            initialName={userName}
            onBackPress={() => setCurrentScreen('account')}
            onSaveSuccess={(data) => {
              if (data.name) setUserName(data.name);
              if (data.avatarUrl) setUserAvatar(data.avatarUrl);
              Alert.alert('Profile Saved', 'Your profile details have been updated.');
            }}
          />
        )}

        {currentScreen === 'coupons' && (
          <CouponsScreen
            activeCouponCode={activeCoupon.code}
            onBackPress={() => setCurrentScreen('tab_wallet')}
            onApplyCoupon={(c) => {
              setActiveCoupon(c);
              Alert.alert('Coupon Applied', `${c.code}: ${c.description}`);
            }}
          />
        )}

        {currentScreen === 'account' && (
          <AccountScreen
            isListenerVerified={isListenerVerified}
            userName={userName}
            userRole={userRole}
            onBackPress={() => setCurrentScreen('tab_home')}
            onTransactionsPress={() => setCurrentScreen('transactions')}
            onHelpPress={() => setCurrentScreen('help')}
            onBecomeListenerPress={() => setShowOnboardingModal(true)}
            onEarningsPress={() => setShowEarningsModal(true)}
            onLogout={handleLogout}
          />
        )}

        {currentScreen === 'help' && (
          <HelpScreen onBackPress={() => setCurrentScreen('account')} />
        )}

        {currentScreen === 'active_call' && (
          <ActiveCallScreen
            listener={selectedListener}
            callType={activeCallType}
            userBalanceINR={walletBalanceINR}
            onEndCall={handleEndCall}
            onBalanceDepleted={() => {
              Alert.alert('Call Disconnected', 'Your wallet balance has depleted.');
              handleEndCall(60, selectedListener.callRatePerMinINR);
            }}
          />
        )}

        {/* Global Bottom Navigation Bar (Visible across 4 primary tabs only in Mobile Mode) */}
        {!isDesktop && ['tab_home', 'tab_calls', 'tab_chat', 'tab_wallet'].includes(currentScreen) && (
          <BottomNavBar
            activeTab={activeTab}
            onTabChange={handleTabChange}
            unreadChatCount={1}
          />
        )}

        {/* Listener KYC Onboarding Modal */}
        <ListenerOnboardingModal
          visible={showOnboardingModal}
          onClose={() => setShowOnboardingModal(false)}
          onSubmitSuccess={() => {
            setIsListenerVerified(true);
            Alert.alert(
              'KYC Application Submitted',
              'Your voice intro and PAN document have been submitted to the Admin for approval. You will receive a push notification once approved!'
            );
          }}
        />

        {/* Host Earnings & Settlements Modal */}
        <ListenerEarningsModal
          visible={showEarningsModal}
          onClose={() => setShowEarningsModal(false)}
          listener={selectedListener}
        />

        {/* Post-Call Summary & Rating Modal */}
        <CallSummaryModal
          visible={summaryData.visible}
          listenerName={selectedListener.name}
          listenerAvatar={selectedListener.avatarUrl}
          durationSeconds={summaryData.duration}
          totalCostINR={summaryData.cost}
          newBalanceINR={walletBalanceINR}
          onClose={() => setSummaryData({ visible: false, duration: 0, cost: 0 })}
        />

        {/* Incoming Call Simulation Modal */}
        <IncomingCallModal
          visible={incomingCallData.visible}
          callerName={incomingCallData.listener.name}
          callerAvatar={incomingCallData.listener.avatarUrl}
          callType="audio"
          ratePerMin={incomingCallData.listener.callRatePerMinINR}
          onAccept={() => {
            setIncomingCallData({ ...incomingCallData, visible: false });
            handleStartCall(incomingCallData.listener, 'audio');
          }}
          onDecline={() => setIncomingCallData({ ...incomingCallData, visible: false })}
        />

        {/* Insufficient Balance Bottom Sheet */}
        <InsufficientBalanceModal
          visible={lowBalanceModal.visible}
          currentBalanceINR={walletBalanceINR}
          requiredRateINR={lowBalanceModal.listener?.callRatePerMinINR || 9}
          listenerName={lowBalanceModal.listener?.name || 'Listener'}
          onClose={() => setLowBalanceModal({ visible: false, listener: null, type: 'audio' })}
          onQuickRechargeAndCall={handleQuickRechargeAndCall}
          onGoToWallet={() => {
            setLowBalanceModal({ visible: false, listener: null, type: 'audio' });
            handleTabChange('wallet');
          }}
        />



        {/* Legal Policy Viewer Modal */}
        <PolicyModal
          visible={policyModal.visible}
          type={policyModal.type}
          onClose={() => setPolicyModal({ ...policyModal, visible: false })}
        />
      </View>
    </SafeAreaView>
    </DeviceFrame>
    </ErrorBoundary>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: THEME.colors.white,
  },
  container: {
    flex: 1,
    backgroundColor: THEME.colors.background,
  },
});
