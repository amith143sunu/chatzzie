import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
} from 'react-native';
import { ArrowLeft, Tag, CheckCircle2, Percent, ArrowRight } from 'lucide-react-native';
import { DEFAULT_COUPONS, Coupon } from '@chatzie/shared';
import { THEME } from '../theme';

interface CouponsScreenProps {
  onBackPress: () => void;
  onApplyCoupon: (coupon: Coupon) => void;
  activeCouponCode?: string;
}

export const CouponsScreen: React.FC<CouponsScreenProps> = ({
  onBackPress,
  onApplyCoupon,
  activeCouponCode = 'VALUE14',
}) => {
  const [inputCode, setInputCode] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const allCoupons: Coupon[] = [
    ...DEFAULT_COUPONS,
    {
      id: 'coupon-night',
      code: 'NIGHTOWL10',
      discountPercentage: 10,
      description: 'Get 10% Extra Balance on all midnight recharges (11 PM - 4 AM)',
      minRechargeINR: 399,
      maxCashbackINR: 300,
      isActive: true,
    },
    {
      id: 'coupon-weekend',
      code: 'WEEKEND25',
      discountPercentage: 25,
      description: 'Super Weekend Special: 25% Extra Cashback on Recharges above ₹1499',
      minRechargeINR: 1499,
      maxCashbackINR: 600,
      isActive: true,
    }
  ];

  const handleApplyInput = () => {
    const matched = allCoupons.find(c => c.code.toUpperCase() === inputCode.trim().toUpperCase());
    if (matched) {
      onApplyCoupon(matched);
      onBackPress();
    } else {
      setErrorMsg('Invalid or expired promo code.');
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={onBackPress} style={styles.backBtn}>
          <ArrowLeft size={22} color={THEME.colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Coupons & Offers</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Promo Code Input Box */}
        <View style={styles.inputCard}>
          <View style={styles.inputRow}>
            <Tag size={18} color={THEME.colors.primary} />
            <TextInput
              style={styles.textInput}
              placeholder="Enter Promo Code"
              placeholderTextColor={THEME.colors.textMuted}
              autoCapitalize="characters"
              value={inputCode}
              onChangeText={(t) => { setInputCode(t); setErrorMsg(''); }}
            />
            <TouchableOpacity
              style={[styles.applyBtn, !inputCode.trim() && styles.applyBtnDisabled]}
              onPress={handleApplyInput}
              disabled={!inputCode.trim()}
            >
              <Text style={styles.applyBtnText}>Apply</Text>
            </TouchableOpacity>
          </View>
          {errorMsg ? <Text style={styles.errorText}>{errorMsg}</Text> : null}
        </View>

        {/* Coupons List */}
        <Text style={styles.sectionHeading}>Available Offers for You</Text>

        <View style={styles.couponList}>
          {allCoupons.map((coupon) => {
            const isApplied = activeCouponCode === coupon.code;
            return (
              <View
                key={coupon.id}
                style={[
                  styles.couponCard,
                  isApplied && styles.couponCardApplied
                ]}
              >
                <View style={styles.couponTop}>
                  <View style={styles.codeBadge}>
                    <Text style={styles.codeText}>{coupon.code}</Text>
                  </View>

                  {isApplied ? (
                    <View style={styles.appliedTag}>
                      <CheckCircle2 size={14} color="#16A34A" />
                      <Text style={styles.appliedTagText}>Applied</Text>
                    </View>
                  ) : (
                    <TouchableOpacity
                      style={styles.applyCouponBtn}
                      onPress={() => {
                        onApplyCoupon(coupon);
                        onBackPress();
                      }}
                      activeOpacity={0.8}
                    >
                      <Text style={styles.applyCouponBtnText}>Apply</Text>
                    </TouchableOpacity>
                  )}
                </View>

                <Text style={styles.couponDesc}>{coupon.description}</Text>

                <View style={styles.couponFooter}>
                  <Text style={styles.couponMinText}>
                    Min recharge: ₹{coupon.minRechargeINR} • Max cashback: ₹{coupon.maxCashbackINR}
                  </Text>
                </View>
              </View>
            );
          })}
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: THEME.colors.background,
  },
  header: {
    height: 60,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    backgroundColor: THEME.colors.white,
    borderBottomWidth: 1,
    borderBottomColor: THEME.colors.borderLight,
    gap: 12,
  },
  backBtn: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: THEME.colors.textPrimary,
  },
  content: {
    padding: 16,
    paddingBottom: 40,
  },
  inputCard: {
    backgroundColor: THEME.colors.white,
    borderRadius: 14,
    padding: 12,
    borderWidth: 1.5,
    borderColor: THEME.colors.border,
    marginBottom: 20,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  textInput: {
    flex: 1,
    fontSize: 14,
    fontWeight: '700',
    color: THEME.colors.textPrimary,
  },
  applyBtn: {
    backgroundColor: THEME.colors.primary,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  applyBtnDisabled: {
    opacity: 0.4,
  },
  applyBtnText: {
    color: THEME.colors.white,
    fontSize: 13,
    fontWeight: '800',
  },
  errorText: {
    color: THEME.colors.red,
    fontSize: 11,
    fontWeight: '600',
    marginTop: 8,
    marginLeft: 4,
  },
  sectionHeading: {
    fontSize: 15,
    fontWeight: '800',
    color: THEME.colors.textPrimary,
    marginBottom: 12,
  },
  couponList: {
    gap: 12,
  },
  couponCard: {
    backgroundColor: THEME.colors.white,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1.5,
    borderColor: THEME.colors.border,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 3,
    elevation: 1,
  },
  couponCardApplied: {
    borderColor: '#16A34A',
    backgroundColor: '#F0FDF4',
  },
  couponTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  codeBadge: {
    backgroundColor: THEME.colors.primaryBg,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: 'rgba(30,64,175,0.2)',
  },
  codeText: {
    fontSize: 13,
    fontWeight: '800',
    color: THEME.colors.primary,
    fontFamily: 'monospace',
  },
  appliedTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  appliedTagText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#16A34A',
  },
  applyCouponBtn: {
    borderWidth: 1.5,
    borderColor: THEME.colors.primary,
    paddingVertical: 5,
    paddingHorizontal: 14,
    borderRadius: 6,
  },
  applyCouponBtnText: {
    fontSize: 12,
    fontWeight: '800',
    color: THEME.colors.primary,
  },
  couponDesc: {
    fontSize: 13,
    color: THEME.colors.textPrimary,
    fontWeight: '600',
    lineHeight: 18,
  },
  couponFooter: {
    marginTop: 10,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: THEME.colors.borderLight,
  },
  couponMinText: {
    fontSize: 11,
    color: THEME.colors.textSecondary,
  }
});
