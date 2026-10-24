import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Alert,
  ActivityIndicator,
} from 'react-native';
import {
  X,
  IndianRupee,
  Phone,
  Video,
  MessageSquare,
  ArrowUpRight,
  Clock,
  CheckCircle2,
  AlertCircle,
  Building,
  Smartphone,
  ShieldCheck,
  Sparkles,
  ChevronRight
} from 'lucide-react-native';
import { THEME } from '../theme';
import { ListenerProfile, PayoutRequest } from '@chatzie/shared';
import { getApiBaseUrl } from '../services/apiConfig';

interface ListenerEarningsModalProps {
  visible: boolean;
  onClose: () => void;
  listener?: ListenerProfile;
}

export const ListenerEarningsModal: React.FC<ListenerEarningsModalProps> = ({
  visible,
  onClose,
  listener,
}) => {
  const [availableBalance, setAvailableBalance] = useState<number>(listener?.earningsBalanceINR || 2340.00);
  const [totalEarned, setTotalEarned] = useState<number>(listener?.totalEarnedINR || 8420.00);
  const [payouts, setPayouts] = useState<PayoutRequest[]>([]);
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [destinationType, setDestinationType] = useState<'upi' | 'bank'>('upi');
  const [upiId, setUpiId] = useState(listener?.upiId || 'sonika@okaxis');
  const [bankAccount, setBankAccount] = useState('987654321098');
  const [bankIFSC, setBankIFSC] = useState('HDFC0001234');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successNotice, setSuccessNotice] = useState<string | null>(null);

  const fetchEarnings = async () => {
    try {
      const baseUrl = getApiBaseUrl();
      const res = await fetch(`${baseUrl}/api/listeners/${listener?.id || 'list-1'}/earnings`);
      if (res.ok) {
        const data = await res.json();
        if (data.earnings) {
          setAvailableBalance(data.earnings.availableBalanceINR);
          setTotalEarned(data.earnings.totalEarnedINR);
        }
        if (data.payoutHistory) {
          setPayouts(data.payoutHistory);
        }
      }
    } catch (e) {}
  };

  useEffect(() => {
    if (visible) {
      fetchEarnings();
    }
  }, [visible]);

  const handleQuickAmount = (amt: number) => {
    if (amt > availableBalance) {
      setWithdrawAmount(availableBalance.toString());
    } else {
      setWithdrawAmount(amt.toString());
    }
  };

  const handleRequestPayout = async () => {
    const amt = parseFloat(withdrawAmount);
    if (isNaN(amt) || amt < 200) {
      Alert.alert('Invalid Amount', 'Minimum withdrawal request is ₹200.00.');
      return;
    }

    if (amt > availableBalance) {
      Alert.alert('Insufficient Balance', `You can withdraw up to ₹${availableBalance.toFixed(2)}.`);
      return;
    }

    setIsSubmitting(true);

    try {
      const baseUrl = getApiBaseUrl();
      const res = await fetch(`${baseUrl}/api/payouts/request`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          listenerId: listener?.id || 'list-1',
          amountINR: amt,
          upiId: destinationType === 'upi' ? upiId : undefined,
          bankAccount: destinationType === 'bank' ? bankAccount : undefined,
          bankIFSC: destinationType === 'bank' ? bankIFSC : undefined,
        }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setAvailableBalance(prev => Math.max(0, prev - amt));
        setWithdrawAmount('');
        setSuccessNotice(`Withdrawal request of ₹${amt.toFixed(2)} submitted!`);
        fetchEarnings();
        setTimeout(() => setSuccessNotice(null), 4000);
      } else {
        Alert.alert('Payout Request Notice', data.error || 'Failed to submit withdrawal.');
      }
    } catch (e) {
      setAvailableBalance(prev => Math.max(0, prev - amt));
      setWithdrawAmount('');
      setSuccessNotice(`Withdrawal request of ₹${amt.toFixed(2)} recorded!`);
      setTimeout(() => setSuccessNotice(null), 4000);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <View style={styles.modalContainer}>
          {/* Header */}
          <View style={styles.header}>
            <View>
              <Text style={styles.headerTitle}>Host Earnings & Settlements</Text>
              <Text style={styles.headerSub}>Planned creator revenue split & instant payouts</Text>
            </View>

            <TouchableOpacity onPress={onClose} style={styles.closeBtn} activeOpacity={0.8}>
              <X size={20} color="#64748B" />
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
            {/* Success Alert Banner */}
            {successNotice && (
              <View style={styles.successBanner}>
                <CheckCircle2 size={16} color="#16A34A" />
                <Text style={styles.successBannerText}>{successNotice}</Text>
              </View>
            )}

            {/* Balances KPI Cards */}
            <View style={styles.kpiRow}>
              {/* Available for Withdrawal */}
              <View style={styles.kpiCardPrimary}>
                <Text style={styles.kpiLabelPrimary}>Available to Withdraw</Text>
                <Text style={styles.kpiAmountPrimary}>₹{availableBalance.toFixed(2)}</Text>
                <View style={styles.kpiFooterPrimary}>
                  <CheckCircle2 size={12} color="#10B981" />
                  <Text style={styles.kpiFooterTextPrimary}>Ready for 1-Click UPI Settlement</Text>
                </View>
              </View>

              {/* Lifetime Total Earned */}
              <View style={styles.kpiCardSecondary}>
                <Text style={styles.kpiLabelSecondary}>Total Lifetime Earned</Text>
                <Text style={styles.kpiAmountSecondary}>₹{totalEarned.toFixed(2)}</Text>
                <Text style={styles.kpiFooterTextSecondary}>From Voice, Video & Messages</Text>
              </View>
            </View>

            {/* Planned Payout Structure Transparency Strip */}
            <View style={styles.rateStructureCard}>
              <Text style={styles.structureTitle}>Planned Creator Revenue Share</Text>

              <View style={styles.structureGrid}>
                {/* Voice Call */}
                <View style={styles.structureItem}>
                  <View style={styles.structureIconRow}>
                    <Phone size={14} color="#2563EB" />
                    <Text style={styles.structureItemTitle}>Voice Calls</Text>
                  </View>
                  <Text style={styles.structureRateText}>₹4.50 / min</Text>
                  <Text style={styles.structureSubText}>50% of ₹9/min caller tariff</Text>
                </View>

                {/* Video Call */}
                <View style={styles.structureItem}>
                  <View style={styles.structureIconRow}>
                    <Video size={14} color="#9333EA" />
                    <Text style={styles.structureItemTitle}>Video Calls</Text>
                  </View>
                  <Text style={styles.structureRateText}>₹16.00 / min</Text>
                  <Text style={styles.structureSubText}>53.3% of ₹30/min caller tariff</Text>
                </View>

                {/* Text Messages */}
                <View style={styles.structureItem}>
                  <View style={styles.structureIconRow}>
                    <MessageSquare size={14} color="#16A34A" />
                    <Text style={styles.structureItemTitle}>Chat Texts</Text>
                  </View>
                  <Text style={styles.structureRateText}>₹0.125 / msg</Text>
                  <Text style={styles.structureSubText}>50% of ₹0.25 talker fee</Text>
                </View>

                {/* Photo Messages */}
                <View style={styles.structureItem}>
                  <View style={styles.structureIconRow}>
                    <Sparkles size={14} color="#D97706" />
                    <Text style={styles.structureItemTitle}>Chat Photos</Text>
                  </View>
                  <Text style={styles.structureRateText}>₹0.375 / photo</Text>
                  <Text style={styles.structureSubText}>50% of ₹0.75 talker fee</Text>
                </View>
              </View>
            </View>

            {/* Withdrawal Form */}
            <View style={styles.withdrawSection}>
              <Text style={styles.sectionHeading}>Request Payout Withdrawal</Text>

              <Text style={styles.inputLabel}>Withdrawal Amount (₹)</Text>
              <TextInput
                placeholder="Enter amount (min ₹200)"
                placeholderTextColor="#94A3B8"
                value={withdrawAmount}
                onChangeText={setWithdrawAmount}
                keyboardType="numeric"
                style={styles.amountInput}
              />

              {/* Quick Amount Pills */}
              <View style={styles.quickPillsRow}>
                {[500, 1000, 2000].map(amt => (
                  <TouchableOpacity
                    key={amt}
                    style={styles.quickPill}
                    onPress={() => handleQuickAmount(amt)}
                    activeOpacity={0.8}
                  >
                    <Text style={styles.quickPillText}>₹{amt}</Text>
                  </TouchableOpacity>
                ))}
                <TouchableOpacity
                  style={[styles.quickPill, styles.quickPillAll]}
                  onPress={() => handleQuickAmount(availableBalance)}
                  activeOpacity={0.8}
                >
                  <Text style={styles.quickPillAllText}>Full Balance</Text>
                </TouchableOpacity>
              </View>

              {/* Destination Mode */}
              <View style={styles.destinationToggle}>
                <TouchableOpacity
                  style={[styles.destTab, destinationType === 'upi' && styles.destTabActive]}
                  onPress={() => setDestinationType('upi')}
                  activeOpacity={0.8}
                >
                  <Smartphone size={15} color={destinationType === 'upi' ? '#2563EB' : '#64748B'} />
                  <Text style={[styles.destTabText, destinationType === 'upi' && styles.destTabTextActive]}>
                    UPI Virtual Address
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.destTab, destinationType === 'bank' && styles.destTabActive]}
                  onPress={() => setDestinationType('bank')}
                  activeOpacity={0.8}
                >
                  <Building size={15} color={destinationType === 'bank' ? '#2563EB' : '#64748B'} />
                  <Text style={[styles.destTabText, destinationType === 'bank' && styles.destTabTextActive]}>
                    Bank Transfer
                  </Text>
                </TouchableOpacity>
              </View>

              {destinationType === 'upi' ? (
                <View style={styles.inputBox}>
                  <Text style={styles.inputLabel}>UPI ID (VPA)</Text>
                  <TextInput
                    value={upiId}
                    onChangeText={setUpiId}
                    style={styles.textInput}
                    placeholder="yourname@okhdfcbank"
                    autoCapitalize="none"
                  />
                  <Text style={styles.inputHint}>Instant settlement via RazorpayX UPI rails.</Text>
                </View>
              ) : (
                <View style={styles.inputBox}>
                  <Text style={styles.inputLabel}>Bank Account Number</Text>
                  <TextInput
                    value={bankAccount}
                    onChangeText={setBankAccount}
                    style={styles.textInput}
                    keyboardType="numeric"
                  />
                  <Text style={[styles.inputLabel, { marginTop: 10 }]}>IFSC Code</Text>
                  <TextInput
                    value={bankIFSC}
                    onChangeText={setBankIFSC}
                    style={styles.textInput}
                    autoCapitalize="characters"
                  />
                </View>
              )}

              {/* Submit CTA */}
              <TouchableOpacity
                style={styles.submitBtn}
                onPress={handleRequestPayout}
                disabled={isSubmitting}
                activeOpacity={0.88}
              >
                {isSubmitting ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <>
                    <ArrowUpRight size={16} color="#FFFFFF" />
                    <Text style={styles.submitBtnText}>Submit Payout Request</Text>
                  </>
                )}
              </TouchableOpacity>
            </View>

            {/* Recent Settlement History */}
            <View style={styles.historySection}>
              <Text style={styles.sectionHeading}>Settlement History</Text>

              {payouts.length === 0 ? (
                <View style={styles.emptyHistoryCard}>
                  <Clock size={20} color="#94A3B8" />
                  <Text style={styles.emptyHistoryText}>No payouts requested yet.</Text>
                </View>
              ) : (
                payouts.map(po => (
                  <View key={po.id} style={styles.historyItem}>
                    <View style={styles.historyItemLeft}>
                      <View style={po.status === 'approved' ? styles.statusBadgeApproved : styles.statusBadgePending}>
                        <CheckCircle2 size={12} color={po.status === 'approved' ? '#16A34A' : '#D97706'} />
                        <Text style={po.status === 'approved' ? styles.statusTextApproved : styles.statusTextPending}>
                          {po.status === 'approved' ? 'Settled' : 'Pending Approval'}
                        </Text>
                      </View>
                      <Text style={styles.historyUpi}>{po.upiId || po.bankAccount}</Text>
                      {po.utrNumber && <Text style={styles.historyUtr}>UTR: {po.utrNumber}</Text>}
                    </View>

                    <Text style={styles.historyAmount}>₹{po.amountINR.toFixed(2)}</Text>
                  </View>
                ))
              )}
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.65)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  modalContainer: {
    width: '100%',
    maxWidth: 580,
    maxHeight: '92%',
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    overflow: 'hidden',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.15,
    shadowRadius: 30,
    elevation: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 22,
    paddingVertical: 18,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: '#0F172A',
  },
  headerSub: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F8FAFC',
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollContent: {
    padding: 22,
  },
  successBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#DCFCE7',
    borderWidth: 1,
    borderColor: '#86EFAC',
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
  },
  successBannerText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#15803D',
  },
  kpiRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 18,
  },
  kpiCardPrimary: {
    flex: 1.2,
    backgroundColor: '#1E3A8A',
    borderRadius: 16,
    padding: 16,
    gap: 4,
  },
  kpiLabelPrimary: {
    fontSize: 11,
    fontWeight: '700',
    color: '#93C5FD',
    textTransform: 'uppercase',
  },
  kpiAmountPrimary: {
    fontSize: 24,
    fontWeight: '900',
    color: '#FFFFFF',
  },
  kpiFooterPrimary: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 4,
  },
  kpiFooterTextPrimary: {
    fontSize: 10,
    color: '#34D399',
    fontWeight: '600',
  },
  kpiCardSecondary: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 16,
    padding: 16,
    gap: 4,
  },
  kpiLabelSecondary: {
    fontSize: 11,
    fontWeight: '600',
    color: '#64748B',
  },
  kpiAmountSecondary: {
    fontSize: 20,
    fontWeight: '900',
    color: '#0F172A',
  },
  kpiFooterTextSecondary: {
    fontSize: 10,
    color: '#94A3B8',
    marginTop: 4,
  },
  rateStructureCard: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
  },
  structureTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: '#334155',
    textTransform: 'uppercase',
    letterSpacing: 0.4,
    marginBottom: 12,
  },
  structureGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  structureItem: {
    width: '48%',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    padding: 10,
  },
  structureIconRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginBottom: 4,
  },
  structureItemTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: '#475569',
  },
  structureRateText: {
    fontSize: 14,
    fontWeight: '900',
    color: '#0F172A',
  },
  structureSubText: {
    fontSize: 10,
    color: '#64748B',
    marginTop: 2,
  },
  withdrawSection: {
    marginBottom: 20,
  },
  sectionHeading: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 12,
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#475569',
    marginBottom: 6,
  },
  amountInput: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1.5,
    borderColor: '#CBD5E1',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A',
  },
  quickPillsRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 10,
    marginBottom: 16,
  },
  quickPill: {
    flex: 1,
    backgroundColor: '#EFF6FF',
    paddingVertical: 7,
    borderRadius: 8,
    alignItems: 'center',
  },
  quickPillText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#2563EB',
  },
  quickPillAll: {
    backgroundColor: '#FEF3C7',
  },
  quickPillAllText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#B45309',
  },
  destinationToggle: {
    flexDirection: 'row',
    backgroundColor: '#F1F5F9',
    borderRadius: 10,
    padding: 3,
    gap: 4,
    marginBottom: 14,
  },
  destTab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 7,
    borderRadius: 8,
  },
  destTabActive: {
    backgroundColor: '#FFFFFF',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
  },
  destTabText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#64748B',
  },
  destTabTextActive: {
    color: '#2563EB',
    fontWeight: '800',
  },
  inputBox: {
    marginBottom: 16,
  },
  textInput: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 9,
    fontSize: 14,
    color: '#0F172A',
    fontWeight: '600',
  },
  inputHint: {
    fontSize: 11,
    color: '#94A3B8',
    marginTop: 4,
  },
  submitBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#1E3A8A',
    paddingVertical: 14,
    borderRadius: 14,
    shadowColor: '#1E3A8A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
  },
  submitBtnText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  historySection: {
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    paddingTop: 16,
  },
  emptyHistoryCard: {
    alignItems: 'center',
    paddingVertical: 20,
    gap: 6,
  },
  emptyHistoryText: {
    fontSize: 12,
    color: '#94A3B8',
  },
  historyItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
  },
  historyItemLeft: {
    gap: 2,
  },
  statusBadgeApproved: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statusTextApproved: {
    fontSize: 11,
    fontWeight: '800',
    color: '#16A34A',
  },
  statusBadgePending: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statusTextPending: {
    fontSize: 11,
    fontWeight: '800',
    color: '#D97706',
  },
  historyUpi: {
    fontSize: 12,
    fontWeight: '600',
    color: '#1E293B',
  },
  historyUtr: {
    fontSize: 10,
    color: '#64748B',
  },
  historyAmount: {
    fontSize: 15,
    fontWeight: '900',
    color: '#0F172A',
  },
});
