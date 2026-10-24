import { RechargePackage, Coupon, CoinPackage } from './types';
export declare const CHATZIE_COLORS: {
    readonly primary: "#1E40AF";
    readonly primaryLight: "#3B82F6";
    readonly primaryDark: "#1E3A8A";
    readonly primaryBg: "#EFF6FF";
    readonly white: "#FFFFFF";
    readonly background: "#F8FAFC";
    readonly surface: "#FFFFFF";
    readonly cardBg: "#FFFFFF";
    readonly border: "#E2E8F0";
    readonly borderLight: "#F1F5F9";
    readonly red: "#DC2626";
    readonly redLight: "#FEE2E2";
    readonly redBadge: "#EF4444";
    readonly textPrimary: "#0F172A";
    readonly textSecondary: "#64748B";
    readonly textMuted: "#94A3B8";
    readonly statusOnline: "#16A34A";
    readonly statusBusy: "#D97706";
    readonly statusOffline: "#94A3B8";
    readonly categoryGuidance: "#EEF2FF";
    readonly categoryRelax: "#F0F9FF";
    readonly categorySocial: "#F5F3FF";
};
export declare const COIN_EXCHANGE_RATE = 10;
export declare const PLATFORM_PRICING: {
    readonly audioCallRateINR: 9;
    readonly audioListenerPayoutINR: 4.5;
    readonly videoCallRateINR: 30;
    readonly videoListenerPayoutINR: 16;
    readonly chatTextMessageRateINR: 0.25;
    readonly chatImageMessageRateINR: 0.75;
};
export declare const DEFAULT_COIN_PACKAGES: CoinPackage[];
export declare const DEFAULT_RECHARGE_PACKAGES: RechargePackage[];
export declare const DEFAULT_COUPONS: Coupon[];
export declare const TOP_LANGUAGES: string[];
export declare const CATEGORIES: ({
    id: string;
    title: string;
    description: string;
    bgColor: "#EEF2FF";
    iconName: string;
} | {
    id: string;
    title: string;
    description: string;
    bgColor: "#F0F9FF";
    iconName: string;
} | {
    id: string;
    title: string;
    description: string;
    bgColor: "#F5F3FF";
    iconName: string;
})[];
