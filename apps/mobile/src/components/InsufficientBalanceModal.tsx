import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Pressable
} from 'react-native';
import { IndianRupee, X, Zap, ChevronRight, Wallet } from 'lucide-react-native';
import { THEME } from '../theme';

interface InsufficientBalanceModalProps {
  visible: boolean;
  currentBalanceINR: number;
  requiredRateINR: number;
  listenerName: string;
  onClose: () => void;
  onQuickRechargeAndCall: (amountINR: number) => void;
  onGoToWallet: () => void;
}

export const InsufficientBalanceModal: React.FC<InsufficientBalanceModalProps> = ({
  visible,
  currentBalanceINR,
  requiredRateINR,
  listenerName,
  onClose,
  onQuickRechargeAndCall,
  onGoToWallet,
}) => {
  const [selectedPack, setSelectedPack] = useState<number>(70);
  const packs = [70, 140, 350];

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <Pressable style={styles.backdrop} onPress={onClose}>
        <Pressable style={styles.sheet} onPress={(e) => e.stopPropagation()}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerLeft}>
              <View style={styles.iconCircle}>
                <Wallet size={20} color={THEME.colors.primary} />
              </View>
              <View>
                <Text style={styles.title}>Low Wallet Balance</Text>
                <Text style={styles.subtitle}>Recharge required to connect call</Text>
              </View>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <X size={18} color={THEME.colors.textMuted} />
            </TouchableOpacity>
          </View>

          {/* Balance Comparison Card */}
          <View style={styles.balanceCard}>
            <View style={styles.balanceCol}>
              <Text style={styles.balanceLabel}>Current Balance</Text>
              <Text style={styles.balanceValueCurrent}>₹{currentBalanceINR.toFixed(2)}</Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.balanceCol}>
              <Text style={styles.balanceLabel}>{listenerName}'s Tariff</Text>
              <Text style={styles.balanceValueRequired}>₹{requiredRateINR.toFixed(2)} / min</Text>
            </View>
          </View>

          {/* Quick Packs Selector */}
          <Text style={styles.sectionTitle}>Select Quick Recharge Package</Text>
          <View style={styles.packsRow}>
            {packs.map((amt) => {
              const isSelected = selectedPack === amt;
              return (
                <TouchableOpacity
                  key={amt}
                  style={[styles.packChip, isSelected && styles.packChipSelected]}
                  onPress={() => setSelectedPack(amt)}
                  activeOpacity={0.8}
                >
                  <Text style={[styles.packAmt, isSelected && styles.packAmtSelected]}>
                    ₹{amt}
                  </Text>
                  <Text style={[styles.packMins, isSelected && styles.packMinsSelected]}>
                    ~{Math.floor(amt / requiredRateINR)} mins
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Primary Action Button */}
          <TouchableOpacity
            style={styles.rechargeBtn}
            onPress={() => onQuickRechargeAndCall(selectedPack)}
            activeOpacity={0.85}
          >
            <Zap size={18} color="#FFFFFF" fill="#FFFFFF" />
            <Text style={styles.rechargeBtnText}>
              Add ₹{selectedPack} & Start Call Now
            </Text>
          </TouchableOpacity>

          {/* Secondary Link to Wallet Screen */}
          <TouchableOpacity
            style={styles.walletLinkBtn}
            onPress={onGoToWallet}
            activeOpacity={0.8}
          >
            <Text style={styles.walletLinkText}>View All Packages & Coupons</Text>
            <ChevronRight size={14} color={THEME.colors.primary} />
          </TouchableOpacity>
        </Pressable>
      </Pressable>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.6)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    paddingBottom: 28,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#EFF6FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A',
  },
  subtitle: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
  },
  closeBtn: {
    padding: 6,
    borderRadius: 16,
    backgroundColor: '#F1F5F9',
  },
  balanceCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 16,
  },
  balanceCol: {
    flex: 1,
    alignItems: 'center',
  },
  divider: {
    width: 1,
    height: 32,
    backgroundColor: '#CBD5E1',
  },
  balanceLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: '#64748B',
    marginBottom: 4,
  },
  balanceValueCurrent: {
    fontSize: 16,
    fontWeight: '800',
    color: '#DC2626',
  },
  balanceValueRequired: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A',
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#475569',
    marginBottom: 10,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  packsRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 18,
  },
  packChip: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
  },
  packChipSelected: {
    borderColor: THEME.colors.primary,
    backgroundColor: '#EFF6FF',
  },
  packAmt: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A',
  },
  packAmtSelected: {
    color: THEME.colors.primary,
  },
  packMins: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 2,
    fontWeight: '500',
  },
  packMinsSelected: {
    color: THEME.colors.primary,
    fontWeight: '700',
  },
  rechargeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: THEME.colors.primary,
    paddingVertical: 14,
    borderRadius: 14,
    shadowColor: THEME.colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
  },
  rechargeBtnText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  walletLinkBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    marginTop: 12,
    paddingVertical: 6,
  },
  walletLinkText: {
    fontSize: 12,
    fontWeight: '700',
    color: THEME.colors.primary,
  },
});
