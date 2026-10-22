import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { ArrowLeft, ArrowDownCircle, Clock, CheckCircle2 } from 'lucide-react-native';
import { WalletTransaction } from '@chatzie/shared';
import { THEME } from '../theme';

interface TransactionsScreenProps {
  balanceINR: number;
  transactions: WalletTransaction[];
  onBackPress: () => void;
}

export const TransactionsScreen: React.FC<TransactionsScreenProps> = ({
  balanceINR,
  transactions,
  onBackPress,
}) => {
  const [activeTab, setActiveTab] = useState<'wallet' | 'payment_logs'>('wallet');

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <TouchableOpacity onPress={onBackPress} style={styles.backBtn}>
            <ArrowLeft size={22} color={THEME.colors.textPrimary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Transactions</Text>
        </View>

        <TouchableOpacity style={styles.rechargeHistoryPill} activeOpacity={0.8}>
          <Clock size={14} color={THEME.colors.primary} />
          <Text style={styles.rechargeHistoryText}>Recharge history</Text>
        </TouchableOpacity>
      </View>

      {/* Balance Bar */}
      <View style={styles.balanceBar}>
        <Text style={styles.balanceLabel}>Wallet Balance</Text>
        <Text style={styles.balanceValue}>₹{balanceINR.toFixed(2)}</Text>
      </View>

      {/* Sub-tabs */}
      <View style={styles.tabSwitcher}>
        <TouchableOpacity
          style={[styles.tabButton, activeTab === 'wallet' && styles.tabButtonActive]}
          onPress={() => setActiveTab('wallet')}
          activeOpacity={0.85}
        >
          <Text style={[styles.tabText, activeTab === 'wallet' && styles.tabTextActive]}>
            Wallet Transactions
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tabButton, activeTab === 'payment_logs' && styles.tabButtonActive]}
          onPress={() => setActiveTab('payment_logs')}
          activeOpacity={0.85}
        >
          <Text style={[styles.tabText, activeTab === 'payment_logs' && styles.tabTextActive]}>
            Payment Logs
          </Text>
        </TouchableOpacity>
      </View>

      {/* Transactions List */}
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
      >
        {transactions.map((tx) => (
          <View key={tx.id} style={styles.txItem}>
            <View style={styles.txLeft}>
              <View style={styles.iconCircle}>
                <ArrowDownCircle size={22} color="#16A34A" />
              </View>
              <View>
                <Text style={styles.txTitle}>
                  {tx.type === 'recharge' ? 'Recharge' : tx.type === 'cashback_earned' ? 'Cashback Earned' : 'Call Charge'}
                </Text>
                <Text style={styles.txDate}>
                  {new Date(tx.createdAt).toLocaleDateString('en-IN', {
                    day: 'numeric',
                    month: 'short',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </Text>
              </View>
            </View>

            <View style={styles.txRight}>
              <Text style={[
                styles.txAmount,
                tx.type === 'cashback_earned' ? styles.txAmountCashback : styles.txAmountNormal
              ]}>
                {tx.type === 'cashback_earned' ? `+${tx.amountINR.toFixed(2)}` : tx.amountINR.toFixed(2)}
              </Text>
              <Text style={styles.txStatus}>Completed</Text>
            </View>
          </View>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: THEME.colors.white,
  },
  header: {
    height: 64,
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
    gap: 12,
  },
  backBtn: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: THEME.colors.textPrimary,
  },
  rechargeHistoryPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderWidth: 1,
    borderColor: THEME.colors.primary,
    borderRadius: 18,
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: THEME.colors.primaryBg,
  },
  rechargeHistoryText: {
    fontSize: 12,
    fontWeight: '700',
    color: THEME.colors.primary,
  },
  balanceBar: {
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: THEME.colors.borderLight,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  balanceLabel: {
    fontSize: 13,
    color: THEME.colors.textSecondary,
    fontWeight: '600',
  },
  balanceValue: {
    fontSize: 18,
    fontWeight: '800',
    color: THEME.colors.primary,
  },
  tabSwitcher: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 10,
    gap: 10,
    borderBottomWidth: 1,
    borderBottomColor: THEME.colors.borderLight,
  },
  tabButton: {
    paddingVertical: 7,
    paddingHorizontal: 16,
    borderRadius: 20,
    backgroundColor: THEME.colors.borderLight,
  },
  tabButtonActive: {
    backgroundColor: THEME.colors.primary,
  },
  tabText: {
    fontSize: 12,
    fontWeight: '700',
    color: THEME.colors.textSecondary,
  },
  tabTextActive: {
    color: THEME.colors.white,
  },
  listContent: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  txItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: THEME.colors.borderLight,
  },
  txLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  iconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#DCFCE7',
    alignItems: 'center',
    justifyContent: 'center',
  },
  txTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: THEME.colors.textPrimary,
  },
  txDate: {
    fontSize: 11,
    color: THEME.colors.textMuted,
    marginTop: 2,
  },
  txRight: {
    alignItems: 'flex-end',
  },
  txAmount: {
    fontSize: 15,
    fontWeight: '800',
  },
  txAmountNormal: {
    color: THEME.colors.textPrimary,
  },
  txAmountCashback: {
    color: '#16A34A',
  },
  txStatus: {
    fontSize: 11,
    color: '#16A34A',
    fontWeight: '600',
    marginTop: 2,
  }
});
