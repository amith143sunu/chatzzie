import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Modal,
} from 'react-native';
import {
  ArrowLeft,
  CheckCircle2,
  PlusCircle,
  ArrowRight,
  Tag,
  Clock,
  Sparkles,
  CreditCard
} from 'lucide-react-native';
import { DEFAULT_RECHARGE_PACKAGES, RechargePackage } from '@chatzie/shared';
import { THEME } from '../theme';
import { PaymentCheckoutModal } from '../components/PaymentCheckoutModal';

interface WalletScreenProps {
  balanceINR: number;
  onBackPress?: () => void;
  onHistoryPress?: () => void;
  onRechargeSuccess: (amount: number, cashback: number) => void;
  isDesktop?: boolean;
}

export const WalletScreen: React.FC<WalletScreenProps> = ({
  balanceINR,
  onBackPress,
  onHistoryPress,
  onRechargeSuccess,
  isDesktop = false,
}) => {
  const [selectedPack, setSelectedPack] = useState<RechargePackage>(DEFAULT_RECHARGE_PACKAGES[5]); // default ₹2499
  const [couponApplied, setCouponApplied] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isCheckoutModalVisible, setIsCheckoutModalVisible] = useState(false);
  const [customModalVisible, setCustomModalVisible] = useState(false);
  const [customAmount, setCustomAmount] = useState('');

  const handleSelectPack = (pkg: RechargePackage) => {
    setSelectedPack(pkg);
  };

  const handleRecharge = () => {
    setIsCheckoutModalVisible(true);
  };

  const handleApplyCustomAmount = () => {
    const amt = parseFloat(customAmount);
    if (!isNaN(amt) && amt > 0) {
      const customPkg: RechargePackage = {
        id: `custom-${amt}`,
        amountINR: amt,
        cashbackINR: amt >= 999 ? Number((amt * 0.14).toFixed(1)) : 0,
      };
      setSelectedPack(customPkg);
      setCustomModalVisible(false);
      setCustomAmount('');
    }
  };

  return (
    <View style={styles.container}>
      {/* Top Header (Only on Mobile) */}
      {!isDesktop && (
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            {onBackPress && (
              <TouchableOpacity onPress={onBackPress} style={styles.backButton}>
                <ArrowLeft size={22} color={THEME.colors.textPrimary} />
              </TouchableOpacity>
            )}
            <Text style={styles.headerTitle}>Wallet</Text>
          </View>

          <View style={styles.headerRight}>
            {/* Balance Pill with Coins & INR */}
            <View style={styles.balancePill}>
              <Text style={styles.coinsAmount}>{(balanceINR * 10).toLocaleString('en-IN')}</Text>
              <Text style={styles.coinsLabel}>Coins (₹{balanceINR.toFixed(0)})</Text>
            </View>

            {/* Transactions Button */}
            {onHistoryPress && (
              <TouchableOpacity onPress={onHistoryPress} style={styles.historyBtn} activeOpacity={0.8}>
                <Clock size={18} color={THEME.colors.primary} />
              </TouchableOpacity>
            )}
          </View>
        </View>
      )}

      {isDesktop && (
        <View style={styles.desktopWalletHeader}>
          <View>
            <Text style={styles.desktopWalletTitle}>Wallet & Coin Recharge</Text>
            <Text style={styles.desktopWalletSub}>
              Universal ₹9/min Voice & ₹30/min Video • Instant automated coin credits
            </Text>
          </View>
          {onHistoryPress && (
            <TouchableOpacity onPress={onHistoryPress} style={styles.desktopHistoryBtn} activeOpacity={0.85}>
              <Clock size={15} color="#2563EB" />
              <Text style={styles.desktopHistoryText}>View Transactions</Text>
            </TouchableOpacity>
          )}
        </View>
      )}

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <Text style={styles.sectionHeading}>Add Balance</Text>

        {/* 6 Quick Packages Grid (2 cols x 3 rows) */}
        <View style={styles.packagesGrid}>
          {DEFAULT_RECHARGE_PACKAGES.map((pkg) => {
            const isSelected = selectedPack.id === pkg.id;
            return (
              <TouchableOpacity
                key={pkg.id}
                style={[
                  styles.packageCard,
                  isSelected && styles.packageCardSelected,
                ]}
                onPress={() => handleSelectPack(pkg)}
                activeOpacity={0.85}
              >
                {pkg.isBestValue && (
                  <View style={styles.bestValueBadge}>
                    <Text style={styles.bestValueText}>Best Value</Text>
                  </View>
                )}

                <Text style={styles.packageCoins}>{(pkg.amountINR * 10).toLocaleString('en-IN')} Coins</Text>
                <Text style={styles.packageAmount}>₹{pkg.amountINR}</Text>

                <View style={[styles.cashbackBadge, pkg.cashbackINR > 0 ? styles.cashbackBadgeActive : styles.cashbackBadgeZero]}>
                  <Text style={[styles.cashbackText, pkg.cashbackINR > 0 ? styles.cashbackTextActive : styles.cashbackTextZero]}>
                    {pkg.cashbackINR > 0 ? `₹${pkg.cashbackINR} Cashback` : '₹0 Cashback'}
                  </Text>
                </View>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Custom Amount Button */}
        <TouchableOpacity
          style={styles.customAmountButton}
          onPress={() => setCustomModalVisible(true)}
          activeOpacity={0.85}
        >
          <View style={styles.customAmountLeft}>
            <PlusCircle size={20} color={THEME.colors.primary} />
            <Text style={styles.customAmountText}>Add Balance You Like</Text>
          </View>
          <ArrowRight size={18} color={THEME.colors.textMuted} />
        </TouchableOpacity>

        {/* Coupon Applied Section */}
        {selectedPack.cashbackINR > 0 && couponApplied && (
          <View style={styles.couponCard}>
            <View style={styles.couponHeader}>
              <CheckCircle2 size={18} color="#16A34A" />
              <Text style={styles.couponTitle}>
                You get ₹{selectedPack.cashbackINR} extra after recharge
              </Text>
              <Text style={styles.appliedTag}>Applied</Text>
            </View>

            <Text style={styles.couponCodeText}>
              UNLIMITED 14% CASHBACK 'VALUE14'
            </Text>

            <TouchableOpacity style={styles.viewCouponsBtn} activeOpacity={0.8}>
              <Text style={styles.viewCouponsText}>View all coupons</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>

      {/* Sticky Bottom Recharge Action */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.rechargeButton, isProcessing && styles.rechargeButtonDisabled]}
          onPress={handleRecharge}
          disabled={isProcessing}
          activeOpacity={0.85}
        >
          <Text style={styles.rechargeButtonText}>
            {isProcessing ? 'Processing via Razorpay...' : `Recharge ₹${selectedPack.amountINR} →`}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Custom Amount Modal */}
      <Modal
        visible={customModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setCustomModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Enter Custom Amount</Text>
            <Text style={styles.modalSub}>Type any recharge amount in Indian Rupees (₹)</Text>

            <TextInput
              style={styles.modalInput}
              keyboardType="numeric"
              placeholder="e.g. 500"
              placeholderTextColor={THEME.colors.textMuted}
              value={customAmount}
              onChangeText={setCustomAmount}
              autoFocus
            />

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.modalCancelBtn}
                onPress={() => setCustomModalVisible(false)}
              >
                <Text style={styles.modalCancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.modalConfirmBtn}
                onPress={handleApplyCustomAmount}
              >
                <Text style={styles.modalConfirmText}>Select</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Indian Payment Gateway Checkout Modal */}
      <PaymentCheckoutModal
        visible={isCheckoutModalVisible}
        packageDetails={selectedPack}
        onClose={() => setIsCheckoutModalVisible(false)}
        onPaymentSuccess={(amount, cashback) => {
          setIsCheckoutModalVisible(false);
          onRechargeSuccess(amount, cashback);
        }}
      />
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
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: THEME.colors.textPrimary,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  balancePill: {
    paddingVertical: 4,
    paddingHorizontal: 12,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: THEME.colors.primary,
    backgroundColor: THEME.colors.primaryBg,
    alignItems: 'center',
  },
  coinsAmount: {
    fontSize: 12,
    fontWeight: '800',
    color: THEME.colors.primary,
  },
  coinsLabel: {
    fontSize: 9,
    fontWeight: '600',
    color: THEME.colors.textSecondary,
  },
  packageCoins: {
    fontSize: 14,
    fontWeight: '800',
    color: '#D97706',
    marginTop: 6,
  },
  currencySymbol: {
    fontSize: 13,
    fontWeight: '700',
    color: THEME.colors.primary,
    marginRight: 2,
  },
  balanceText: {
    fontSize: 13,
    fontWeight: '800',
    color: THEME.colors.primary,
  },
  historyBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: THEME.colors.primaryBg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 20,
    paddingBottom: 100,
  },
  sectionHeading: {
    fontSize: 16,
    fontWeight: '800',
    color: THEME.colors.textPrimary,
    marginBottom: 16,
  },
  packagesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 12,
  },
  packageCard: {
    width: '48%',
    backgroundColor: THEME.colors.white,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: THEME.colors.border,
    paddingVertical: 18,
    paddingHorizontal: 14,
    alignItems: 'center',
    position: 'relative',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 3,
    elevation: 1,
  },
  packageCardSelected: {
    borderColor: THEME.colors.primary,
    backgroundColor: THEME.colors.primaryBg,
  },
  bestValueBadge: {
    position: 'absolute',
    top: 6,
    left: 8,
    backgroundColor: '#16A34A',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  bestValueText: {
    fontSize: 9,
    fontWeight: '800',
    color: THEME.colors.white,
  },
  packageAmount: {
    fontSize: 22,
    fontWeight: '800',
    color: THEME.colors.textPrimary,
    marginTop: 8,
  },
  cashbackBadge: {
    marginTop: 10,
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 6,
    width: '100%',
    alignItems: 'center',
  },
  cashbackBadgeActive: {
    backgroundColor: '#1E3A8A',
  },
  cashbackBadgeZero: {
    backgroundColor: '#1E293B',
  },
  cashbackText: {
    fontSize: 11,
    fontWeight: '700',
  },
  cashbackTextActive: {
    color: '#93C5FD',
  },
  cashbackTextZero: {
    color: '#94A3B8',
  },
  customAmountButton: {
    marginTop: 14,
    backgroundColor: THEME.colors.white,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: THEME.colors.border,
    paddingVertical: 14,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  customAmountLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  customAmountText: {
    fontSize: 14,
    fontWeight: '700',
    color: THEME.colors.textPrimary,
  },
  couponCard: {
    marginTop: 16,
    backgroundColor: '#F0FDF4',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#BBF7D0',
    padding: 16,
  },
  couponHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  couponTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#166534',
    flex: 1,
  },
  appliedTag: {
    fontSize: 11,
    fontWeight: '800',
    color: '#DC2626',
  },
  couponCodeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#15803D',
    marginTop: 6,
  },
  viewCouponsBtn: {
    marginTop: 8,
  },
  viewCouponsText: {
    fontSize: 12,
    fontWeight: '700',
    color: THEME.colors.primary,
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: THEME.colors.white,
    borderTopWidth: 1,
    borderTopColor: THEME.colors.border,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  rechargeButton: {
    height: 50,
    backgroundColor: THEME.colors.primary,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: THEME.colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 3,
  },
  rechargeButtonDisabled: {
    opacity: 0.7,
  },
  rechargeButtonText: {
    fontSize: 16,
    fontWeight: '800',
    color: THEME.colors.white,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.5)',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  modalContent: {
    backgroundColor: THEME.colors.white,
    borderRadius: 18,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: THEME.colors.textPrimary,
  },
  modalSub: {
    fontSize: 12,
    color: THEME.colors.textSecondary,
    marginTop: 4,
    marginBottom: 16,
  },
  modalInput: {
    borderWidth: 1.5,
    borderColor: THEME.colors.border,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 16,
    color: THEME.colors.textPrimary,
    fontWeight: '700',
  },
  modalActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 20,
  },
  modalCancelBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: THEME.colors.border,
    alignItems: 'center',
  },
  modalCancelText: {
    fontSize: 14,
    fontWeight: '700',
    color: THEME.colors.textSecondary,
  },
  modalConfirmBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    backgroundColor: THEME.colors.primary,
    alignItems: 'center',
  },
  modalConfirmText: {
    fontSize: 14,
    fontWeight: '700',
    color: THEME.colors.white,
  },
  desktopWalletHeader: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  desktopWalletTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#0F172A',
    letterSpacing: -0.3,
  },
  desktopWalletSub: {
    fontSize: 13,
    color: '#64748B',
    marginTop: 4,
  },
  desktopHistoryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
    backgroundColor: '#EFF6FF',
    borderWidth: 1,
    borderColor: '#BFDBFE',
  },
  desktopHistoryText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#2563EB',
  },
});
