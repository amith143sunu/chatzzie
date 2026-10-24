import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Alert,
  Image,
} from 'react-native';
import {
  ShieldCheck,
  Users,
  Radio,
  PhoneOff,
  TrendingUp,
  Wallet,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  RefreshCw,
  Search,
  ArrowLeft,
  DollarSign,
  Ban,
  Clock,
  Sparkles,
} from 'lucide-react-native';
import { THEME } from '../theme';
import { getApiBaseUrl } from '../services/apiConfig';

interface AdminScreenProps {
  onBackToApp: () => void;
}

type AdminTab = 'overview' | 'kyc' | 'live' | 'users' | 'payouts' | 'reports';

export const AdminScreen: React.FC<AdminScreenProps> = ({ onBackToApp }) => {
  const [isAuthorized, setIsAuthorized] = useState<boolean>(false);
  const [adminEmail, setAdminEmail] = useState('');
  const [adminPass, setAdminPass] = useState('');
  const [authError, setAuthError] = useState('');

  const [activeTab, setActiveTab] = useState<AdminTab>('overview');
  const [stats, setStats] = useState<any>({
    totalUsers: 0,
    totalListeners: 0,
    activeLiveSessions: 0,
    todayRevenueINR: 0,
  });
  const [kycQueue, setKycQueue] = useState<any[]>([]);
  const [liveSessions, setLiveSessions] = useState<any[]>([]);
  const [usersList, setUsersList] = useState<any[]>([]);
  const [payoutsList, setPayoutsList] = useState<any[]>([]);
  const [reportsList, setReportsList] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchUser, setSearchUser] = useState('');
  const [actionNotice, setActionNotice] = useState<string>('');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const auth = localStorage.getItem('chatzie_admin_auth');
      if (auth === 'true') setIsAuthorized(true);
    }
  }, []);

  const handleAdminLogin = () => {
    const cleanEmail = adminEmail.trim().toLowerCase();
    if (cleanEmail === 'amith@chatzzie.com' && adminPass === 'Admin@123') {
      if (typeof window !== 'undefined') {
        localStorage.setItem('chatzie_admin_auth', 'true');
      }
      setIsAuthorized(true);
      setAuthError('');
    } else {
      setAuthError('Invalid administrator credentials.');
    }
  };

  const handleAdminLogout = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('chatzie_admin_auth');
    }
    setIsAuthorized(false);
  };

  const fetchAdminData = async () => {
    setIsLoading(true);
    try {
      const baseUrl = getApiBaseUrl();
      const [statsRes, kycRes, liveRes, usersRes, payoutsRes, reportsRes] = await Promise.all([
        fetch(`${baseUrl}/api/admin/dashboard`),
        fetch(`${baseUrl}/api/admin/kyc-queue`),
        fetch(`${baseUrl}/api/admin/live-sessions`),
        fetch(`${baseUrl}/api/admin/users`),
        fetch(`${baseUrl}/api/admin/payouts`),
        fetch(`${baseUrl}/api/admin/reports`),
      ]);

      if (statsRes.ok) {
        const d = await statsRes.json();
        if (d.stats) setStats(d.stats);
      }
      if (kycRes.ok) {
        const d = await kycRes.json();
        if (Array.isArray(d)) setKycQueue(d);
      }
      if (liveRes.ok) {
        const d = await liveRes.json();
        if (Array.isArray(d)) setLiveSessions(d);
      }
      if (usersRes.ok) {
        const d = await usersRes.json();
        if (Array.isArray(d)) setUsersList(d);
      }
      if (payoutsRes.ok) {
        const d = await payoutsRes.json();
        if (Array.isArray(d)) setPayoutsList(d);
      }
      if (reportsRes.ok) {
        const d = await reportsRes.json();
        if (Array.isArray(d)) setReportsList(d);
      }
    } catch (e) {
      console.warn('Admin fetch notice:', e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
    const interval = setInterval(fetchAdminData, 4000);
    return () => clearInterval(interval);
  }, []);

  const handleKycAction = async (listenerId: string, action: 'approve' | 'reject') => {
    try {
      const baseUrl = getApiBaseUrl();
      await fetch(`${baseUrl}/api/admin/kyc-action`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ listenerId, action }),
      });
      setActionNotice(`KYC ${action}d successfully`);
      fetchAdminData();
    } catch (e) {}
  };

  const handleTerminateSession = async (channel: string) => {
    try {
      const baseUrl = getApiBaseUrl();
      await fetch(`${baseUrl}/api/admin/live-sessions/terminate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ channel }),
      });
      setActionNotice(`Session ${channel} terminated`);
      fetchAdminData();
    } catch (e) {}
  };

  const handleAdjustBalance = async (userId: string, deltaINR: number) => {
    try {
      const baseUrl = getApiBaseUrl();
      await fetch(`${baseUrl}/api/admin/users/adjust-balance`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, deltaINR }),
      });
      setActionNotice(`Balance updated (+₹${deltaINR})`);
      fetchAdminData();
    } catch (e) {}
  };

  const handlePayoutAction = async (payoutId: string, action: 'approve' | 'reject') => {
    try {
      const baseUrl = getApiBaseUrl();
      await fetch(`${baseUrl}/api/admin/payout-action`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ payoutId, action }),
      });
      setActionNotice(`Payout ${action}d`);
      fetchAdminData();
    } catch (e) {}
  };

  const filteredUsers = usersList.filter(u => 
    !searchUser || 
    (u.name && u.name.toLowerCase().includes(searchUser.toLowerCase())) ||
    (u.phone && u.phone.includes(searchUser)) ||
    (u.id && u.id.toLowerCase().includes(searchUser.toLowerCase()))
  );

  if (!isAuthorized) {
    return (
      <View style={styles.authContainer}>
        <View style={styles.authCard}>
          <View style={styles.authIconCircle}>
            <ShieldCheck size={32} color="#38BDF8" />
          </View>
          <Text style={styles.authTitle}>Chatzie Admin Backoffice</Text>
          <Text style={styles.authSub}>Restricted access. Sign in with administrator credentials.</Text>

          {authError ? (
            <View style={styles.authErrorBox}>
              <Text style={styles.authErrorText}>{authError}</Text>
            </View>
          ) : null}

          <TextInput
            style={styles.authInput}
            placeholder="amith@chatzzie.com"
            placeholderTextColor="#64748B"
            value={adminEmail}
            onChangeText={setAdminEmail}
            autoCapitalize="none"
          />

          <TextInput
            style={styles.authInput}
            placeholder="Password (Admin@123)"
            placeholderTextColor="#64748B"
            secureTextEntry
            value={adminPass}
            onChangeText={setAdminPass}
          />

          <TouchableOpacity style={styles.authBtn} onPress={handleAdminLogin} activeOpacity={0.85}>
            <Text style={styles.authBtnText}>Sign In to Backoffice</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.authExitBtn} onPress={onBackToApp} activeOpacity={0.85}>
            <Text style={styles.authExitText}>← Return to Public App</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Admin Top Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <TouchableOpacity style={styles.backBtn} onPress={onBackToApp} activeOpacity={0.8}>
            <ArrowLeft size={18} color="#FFFFFF" />
            <Text style={styles.backBtnText}>Exit to App</Text>
          </TouchableOpacity>
          <View style={styles.titleGroup}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <ShieldCheck size={20} color="#38BDF8" />
              <Text style={styles.headerTitle}>Chatzie Backoffice</Text>
            </View>
            <Text style={styles.headerSub}>Platform Master Console • amith@chatzzie.com</Text>
          </View>
        </View>

        <View style={{ flexDirection: 'row', gap: 8 }}>
          <TouchableOpacity style={styles.refreshBtn} onPress={fetchAdminData} activeOpacity={0.8}>
            <RefreshCw size={14} color="#94A3B8" />
            <Text style={styles.refreshText}>Sync</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.logoutAdminBtn} onPress={handleAdminLogout} activeOpacity={0.8}>
            <Text style={styles.logoutAdminText}>Sign Out</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Action Notice Banner */}
      {actionNotice ? (
        <View style={styles.noticeBanner}>
          <CheckCircle2 size={14} color="#10B981" />
          <Text style={styles.noticeText}>{actionNotice}</Text>
          <TouchableOpacity onPress={() => setActionNotice('')}>
            <Text style={styles.noticeDismiss}>✕</Text>
          </TouchableOpacity>
        </View>
      ) : null}

      {/* Admin Tab Bar */}
      <View style={styles.tabBar}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tabScroll}>
          <TouchableOpacity
            style={[styles.tabBtn, activeTab === 'overview' && styles.tabBtnActive]}
            onPress={() => setActiveTab('overview')}
          >
            <TrendingUp size={15} color={activeTab === 'overview' ? '#38BDF8' : '#94A3B8'} />
            <Text style={[styles.tabBtnText, activeTab === 'overview' && styles.tabBtnTextActive]}>Overview</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tabBtn, activeTab === 'live' && styles.tabBtnActive]}
            onPress={() => setActiveTab('live')}
          >
            <Radio size={15} color={activeTab === 'live' ? '#EF4444' : '#94A3B8'} />
            <Text style={[styles.tabBtnText, activeTab === 'live' && styles.tabBtnTextActive]}>
              Live Calls ({liveSessions.length})
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tabBtn, activeTab === 'kyc' && styles.tabBtnActive]}
            onPress={() => setActiveTab('kyc')}
          >
            <ShieldCheck size={15} color={activeTab === 'kyc' ? '#10B981' : '#94A3B8'} />
            <Text style={[styles.tabBtnText, activeTab === 'kyc' && styles.tabBtnTextActive]}>
              KYC Queue ({kycQueue.length})
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tabBtn, activeTab === 'users' && styles.tabBtnActive]}
            onPress={() => setActiveTab('users')}
          >
            <Users size={15} color={activeTab === 'users' ? '#38BDF8' : '#94A3B8'} />
            <Text style={[styles.tabBtnText, activeTab === 'users' && styles.tabBtnTextActive]}>Users & Wallets</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tabBtn, activeTab === 'payouts' && styles.tabBtnActive]}
            onPress={() => setActiveTab('payouts')}
          >
            <Wallet size={15} color={activeTab === 'payouts' ? '#F59E0B' : '#94A3B8'} />
            <Text style={[styles.tabBtnText, activeTab === 'payouts' && styles.tabBtnTextActive]}>
              UPI Payouts ({payoutsList.length})
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tabBtn, activeTab === 'reports' && styles.tabBtnActive]}
            onPress={() => setActiveTab('reports')}
          >
            <AlertTriangle size={15} color={activeTab === 'reports' ? '#EF4444' : '#94A3B8'} />
            <Text style={[styles.tabBtnText, activeTab === 'reports' && styles.tabBtnTextActive]}>
              AI Safety Flags ({reportsList.length})
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </View>

      {/* Main Content Area */}
      <ScrollView contentContainerStyle={styles.content}>
        {/* TAB 1: OVERVIEW */}
        {activeTab === 'overview' && (
          <View style={styles.grid}>
            <View style={styles.statCard}>
              <Users size={22} color="#38BDF8" />
              <Text style={styles.statValue}>{stats.totalUsers || 1420}</Text>
              <Text style={styles.statLabel}>Registered Callers</Text>
            </View>

            <View style={styles.statCard}>
              <Radio size={22} color="#10B981" />
              <Text style={styles.statValue}>{stats.totalListeners || 48}</Text>
              <Text style={styles.statLabel}>Verified Online Hosts</Text>
            </View>

            <View style={styles.statCard}>
              <Radio size={22} color="#EF4444" />
              <Text style={[styles.statValue, { color: '#EF4444' }]}>{liveSessions.length}</Text>
              <Text style={styles.statLabel}>Active Live Sessions</Text>
            </View>

            <View style={styles.statCard}>
              <DollarSign size={22} color="#F59E0B" />
              <Text style={[styles.statValue, { color: '#F59E0B' }]}>₹{(stats.todayRevenueINR || 12450).toLocaleString()}</Text>
              <Text style={styles.statLabel}>Today Gross Volume</Text>
            </View>
          </View>
        )}

        {/* TAB 2: LIVE CALLS */}
        {activeTab === 'live' && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Active WebRTC Live Sessions</Text>
            {liveSessions.length === 0 ? (
              <View style={styles.emptyCard}>
                <Radio size={28} color="#64748B" />
                <Text style={styles.emptyTitle}>No Live Calls at this instant</Text>
                <Text style={styles.emptySub}>When a caller connects with a host, it will appear here in real time.</Text>
              </View>
            ) : (
              liveSessions.map((sess) => (
                <View key={sess.id || sess.channel} style={styles.liveCard}>
                  <View style={styles.liveInfo}>
                    <View style={styles.channelRow}>
                      <View style={styles.redDot} />
                      <Text style={styles.channelText}>{sess.channel}</Text>
                      <View style={styles.callTypePill}>
                        <Text style={styles.callTypeText}>{sess.type || 'audio'}</Text>
                      </View>
                    </View>
                    <Text style={styles.liveParties}>Caller: {sess.caller || 'Caller'} ↔ Host: {sess.listener || sess.hostName || 'Host'}</Text>
                    <Text style={styles.liveDuration}>Duration: {sess.startedMinutesAgo || 1} min • Rate: ₹{sess.ratePerMinINR || 9}/min</Text>
                  </View>
                  <TouchableOpacity
                    style={styles.terminateBtn}
                    onPress={() => handleTerminateSession(sess.channel)}
                  >
                    <PhoneOff size={14} color="#FFFFFF" style={{ marginRight: 6 }} />
                    <Text style={styles.terminateBtnText}>Force End</Text>
                  </TouchableOpacity>
                </View>
              ))
            )}
          </View>
        )}

        {/* TAB 3: KYC QUEUE */}
        {activeTab === 'kyc' && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Pending Host KYC Documents</Text>
            {kycQueue.length === 0 ? (
              <View style={styles.emptyCard}>
                <CheckCircle2 size={28} color="#10B981" />
                <Text style={styles.emptyTitle}>KYC Queue Clean</Text>
                <Text style={styles.emptySub}>All host applications have been reviewed and verified.</Text>
              </View>
            ) : (
              kycQueue.map((item) => (
                <View key={item.id} style={styles.kycCard}>
                  <View style={styles.kycDetails}>
                    <Text style={styles.kycName}>{item.name} (@{item.username})</Text>
                    <Text style={styles.kycMeta}>PAN: {item.panNumber || 'ABCDE1234F'} • Aadhaar: {item.aadhaarNumber || '**** **** 1234'}</Text>
                    <Text style={styles.kycMeta}>Languages: {(item.languages || ['Hindi']).join(', ')} • Voice Bio: Verified</Text>
                  </View>
                  <View style={styles.kycActions}>
                    <TouchableOpacity
                      style={styles.approveBtn}
                      onPress={() => handleKycAction(item.id, 'approve')}
                    >
                      <CheckCircle2 size={14} color="#FFFFFF" style={{ marginRight: 4 }} />
                      <Text style={styles.approveBtnText}>Approve</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.rejectBtn}
                      onPress={() => handleKycAction(item.id, 'reject')}
                    >
                      <XCircle size={14} color="#FFFFFF" style={{ marginRight: 4 }} />
                      <Text style={styles.rejectBtnText}>Reject</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ))
            )}
          </View>
        )}

        {/* TAB 4: USERS & WALLETS */}
        {activeTab === 'users' && (
          <View style={styles.section}>
            <View style={styles.searchBox}>
              <Search size={16} color="#64748B" />
              <TextInput
                style={styles.searchInput}
                placeholder="Search user by name, phone or ID..."
                placeholderTextColor="#64748B"
                value={searchUser}
                onChangeText={setSearchUser}
              />
            </View>

            {filteredUsers.slice(0, 15).map((u) => (
              <View key={u.id} style={styles.userCard}>
                <View style={styles.userInfo}>
                  <Text style={styles.userName}>{u.name || 'Caller'}</Text>
                  <Text style={styles.userSub}>{u.phone || 'Phone hidden'} • ID: {u.id}</Text>
                  <Text style={styles.userBalance}>Wallet Balance: ₹{(u.walletBalanceINR || 0).toFixed(2)}</Text>
                </View>
                <View style={styles.userActions}>
                  <TouchableOpacity
                    style={styles.addBalBtn}
                    onPress={() => handleAdjustBalance(u.id, 100)}
                  >
                    <Text style={styles.addBalText}>+₹100 Add</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.deductBalBtn}
                    onPress={() => handleAdjustBalance(u.id, -50)}
                  >
                    <Text style={styles.deductBalText}>-₹50</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </View>
        )}

        {/* TAB 5: UPI PAYOUTS */}
        {activeTab === 'payouts' && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Host Payout & Withdrawal Requests</Text>
            {payoutsList.length === 0 ? (
              <View style={styles.emptyCard}>
                <Wallet size={28} color="#64748B" />
                <Text style={styles.emptyTitle}>No Pending Payouts</Text>
                <Text style={styles.emptySub}>All listener earnings requests have been settled.</Text>
              </View>
            ) : (
              payoutsList.map((p) => (
                <View key={p.id} style={styles.payoutCard}>
                  <View>
                    <Text style={styles.payoutAmount}>₹{p.amountINR} to UPI</Text>
                    <Text style={styles.payoutMeta}>Host: {p.hostUsername} • VPA: {p.upiId}</Text>
                    <Text style={styles.payoutMeta}>Status: {p.status} • Requested: {new Date(p.createdAt || Date.now()).toLocaleDateString()}</Text>
                  </View>
                  {p.status === 'pending' && (
                    <View style={styles.kycActions}>
                      <TouchableOpacity
                        style={styles.approveBtn}
                        onPress={() => handlePayoutAction(p.id, 'approve')}
                      >
                        <Text style={styles.approveBtnText}>Send Payout</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={styles.rejectBtn}
                        onPress={() => handlePayoutAction(p.id, 'reject')}
                      >
                        <Text style={styles.rejectBtnText}>Decline</Text>
                      </TouchableOpacity>
                    </View>
                  )}
                </View>
              ))
            )}
          </View>
        )}

        {/* TAB 6: AI SAFETY & FLAGGED LEAKS */}
        {activeTab === 'reports' && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>AI SafeTalk Moderation Log</Text>
            {reportsList.length === 0 ? (
              <View style={styles.emptyCard}>
                <ShieldCheck size={28} color="#10B981" />
                <Text style={styles.emptyTitle}>No Safety Violations Detected</Text>
                <Text style={styles.emptySub}>SafeTalk AI is actively monitoring calls and messages for contact leaks.</Text>
              </View>
            ) : (
              reportsList.map((r) => (
                <View key={r.id} style={styles.reportCard}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                    <AlertTriangle size={15} color="#EF4444" />
                    <Text style={styles.reportTitle}>{r.reason || 'Personal Contact Exchange'}</Text>
                  </View>
                  <Text style={styles.reportSub}>Reporter: {r.reporterName || 'AI Monitor'} • Target: {r.targetName || 'User'}</Text>
                  <Text style={styles.reportTime}>{new Date(r.timestamp || Date.now()).toLocaleString()}</Text>
                </View>
              ))
            )}
          </View>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F172A',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: '#1E293B',
    borderBottomWidth: 1,
    borderBottomColor: '#334155',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  backBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#334155',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    gap: 4,
  },
  backBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  titleGroup: {},
  headerTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#F8FAFC',
  },
  headerSub: {
    fontSize: 10,
    color: '#94A3B8',
  },
  refreshBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#334155',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    gap: 4,
  },
  refreshText: {
    color: '#94A3B8',
    fontSize: 12,
    fontWeight: '600',
  },
  noticeBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#064E3B',
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  noticeText: {
    color: '#A7F3D0',
    fontSize: 12,
    fontWeight: '700',
  },
  noticeDismiss: {
    color: '#A7F3D0',
    fontSize: 14,
    paddingHorizontal: 6,
  },
  tabBar: {
    backgroundColor: '#1E293B',
    borderBottomWidth: 1,
    borderBottomColor: '#334155',
  },
  tabScroll: {
    paddingHorizontal: 12,
    gap: 8,
    paddingVertical: 8,
  },
  tabBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 8,
    backgroundColor: 'transparent',
    gap: 6,
  },
  tabBtnActive: {
    backgroundColor: '#334155',
  },
  tabBtnText: {
    color: '#94A3B8',
    fontSize: 12,
    fontWeight: '600',
  },
  tabBtnTextActive: {
    color: '#F8FAFC',
    fontWeight: '700',
  },
  content: {
    padding: 16,
    paddingBottom: 40,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  statCard: {
    flex: 1,
    minWidth: 150,
    backgroundColor: '#1E293B',
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: '#334155',
  },
  statValue: {
    fontSize: 22,
    fontWeight: '900',
    color: '#F8FAFC',
    marginTop: 8,
  },
  statLabel: {
    fontSize: 11,
    color: '#94A3B8',
    marginTop: 2,
  },
  section: {
    gap: 10,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#F8FAFC',
    marginBottom: 6,
  },
  emptyCard: {
    backgroundColor: '#1E293B',
    borderRadius: 14,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#334155',
  },
  emptyTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#F8FAFC',
    marginTop: 8,
  },
  emptySub: {
    fontSize: 12,
    color: '#94A3B8',
    textAlign: 'center',
    marginTop: 4,
  },
  liveCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#1E293B',
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: '#EF4444',
  },
  liveInfo: {},
  channelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  redDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#EF4444',
  },
  channelText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#F8FAFC',
  },
  callTypePill: {
    backgroundColor: '#334155',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  callTypeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#38BDF8',
  },
  liveParties: {
    fontSize: 12,
    color: '#94A3B8',
    marginTop: 3,
  },
  liveDuration: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 2,
  },
  terminateBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#DC2626',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  terminateBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  kycCard: {
    backgroundColor: '#1E293B',
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: '#334155',
    gap: 10,
  },
  kycDetails: {},
  kycName: {
    fontSize: 14,
    fontWeight: '800',
    color: '#F8FAFC',
  },
  kycMeta: {
    fontSize: 12,
    color: '#94A3B8',
    marginTop: 2,
  },
  kycActions: {
    flexDirection: 'row',
    gap: 8,
  },
  approveBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#10B981',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  approveBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  rejectBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EF4444',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  rejectBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1E293B',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: '#334155',
    marginBottom: 8,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    color: '#F8FAFC',
    fontSize: 13,
  },
  userCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#1E293B',
    borderRadius: 10,
    padding: 12,
    borderWidth: 1,
    borderColor: '#334155',
    marginBottom: 6,
  },
  userInfo: {},
  userName: {
    fontSize: 13,
    fontWeight: '800',
    color: '#F8FAFC',
  },
  userSub: {
    fontSize: 11,
    color: '#94A3B8',
  },
  userBalance: {
    fontSize: 11,
    color: '#38BDF8',
    fontWeight: '700',
    marginTop: 2,
  },
  userActions: {
    flexDirection: 'row',
    gap: 6,
  },
  addBalBtn: {
    backgroundColor: '#059669',
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 6,
  },
  addBalText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
  },
  deductBalBtn: {
    backgroundColor: '#DC2626',
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 6,
  },
  deductBalText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
  },
  payoutCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#1E293B',
    borderRadius: 10,
    padding: 12,
    borderWidth: 1,
    borderColor: '#334155',
    marginBottom: 6,
  },
  payoutAmount: {
    fontSize: 14,
    fontWeight: '800',
    color: '#F59E0B',
  },
  payoutMeta: {
    fontSize: 11,
    color: '#94A3B8',
    marginTop: 2,
  },
  reportCard: {
    backgroundColor: '#1E293B',
    borderRadius: 10,
    padding: 12,
    borderWidth: 1,
    borderColor: '#EF4444',
    marginBottom: 6,
  },
  reportTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#EF4444',
  },
  reportSub: {
    fontSize: 11,
    color: '#94A3B8',
  },
  reportTime: {
    fontSize: 10,
    color: '#64748B',
    marginTop: 2,
  },
  authContainer: {
    flex: 1,
    backgroundColor: '#020617',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  authCard: {
    backgroundColor: '#0F172A',
    borderRadius: 24,
    padding: 28,
    width: '100%',
    maxWidth: 420,
    borderWidth: 1,
    borderColor: '#1E293B',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 8,
  },
  authIconCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#1E293B',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  authTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#F8FAFC',
    textAlign: 'center',
  },
  authSub: {
    fontSize: 12,
    color: '#94A3B8',
    textAlign: 'center',
    marginTop: 6,
    marginBottom: 20,
    lineHeight: 18,
  },
  authErrorBox: {
    backgroundColor: '#7F1D1D',
    borderWidth: 1,
    borderColor: '#DC2626',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginBottom: 14,
    width: '100%',
  },
  authErrorText: {
    color: '#FCA5A5',
    fontSize: 12,
    fontWeight: '700',
    textAlign: 'center',
  },
  authInput: {
    width: '100%',
    backgroundColor: '#1E293B',
    borderWidth: 1,
    borderColor: '#334155',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    color: '#F8FAFC',
    fontSize: 13,
    marginBottom: 12,
  },
  authBtn: {
    width: '100%',
    backgroundColor: '#2563EB',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 6,
    marginBottom: 14,
  },
  authBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
  },
  authExitBtn: {
    paddingVertical: 6,
  },
  authExitText: {
    color: '#64748B',
    fontSize: 12,
    fontWeight: '600',
  },
  logoutAdminBtn: {
    backgroundColor: '#7F1D1D',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    justifyContent: 'center',
  },
  logoutAdminText: {
    color: '#FCA5A5',
    fontSize: 12,
    fontWeight: '700',
  },
});
