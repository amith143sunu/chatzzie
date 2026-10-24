export type UserRole = 'talker' | 'listener' | 'admin';
export type UserStatus = 'online' | 'busy' | 'offline';
export type KYCStatus = 'pending' | 'verified' | 'rejected' | 'not_submitted';
export interface User {
    id: string;
    phone: string;
    name: string;
    avatarUrl: string;
    walletBalanceINR: number;
    role: UserRole;
    isListenerVerified: boolean;
    preferredLanguages: string[];
    createdAt: string;
}
export interface ListenerProfile {
    id: string;
    userId: string;
    username: string;
    name: string;
    avatarUrl: string;
    bio: string;
    languages: string[];
    callRatePerMinINR: number;
    isVideoEnabled: boolean;
    status: UserStatus;
    rating: number;
    totalReviews: number;
    followersCount: number;
    giftsCount: number;
    voiceBioUrl?: string;
    voiceBioDurationSeconds?: number;
    kycStatus: KYCStatus;
    panNumber?: string;
    upiId?: string;
    bankAccountNumber?: string;
    bankIFSC?: string;
    isAvailableForCalls: boolean;
    earningsBalanceINR?: number;
    totalEarnedINR?: number;
}
export type CallType = 'audio' | 'video';
export type CallStatus = 'initiated' | 'ringing' | 'connected' | 'completed' | 'declined' | 'missed' | 'failed';
export interface CallSession {
    id: string;
    callerId: string;
    callerName: string;
    callerAvatarUrl: string;
    listenerId: string;
    listenerName: string;
    listenerAvatarUrl: string;
    callType: CallType;
    ratePerMinINR: number;
    startedAt?: string;
    connectedAt?: string;
    endedAt?: string;
    durationSeconds: number;
    totalChargedINR: number;
    listenerEarnedINR: number;
    status: CallStatus;
    agoraChannelName: string;
    agoraTokenCaller?: string;
    agoraTokenListener?: string;
}
export type TransactionType = 'recharge' | 'call_deduction' | 'cashback_earned' | 'gift_sent' | 'gift_received' | 'payout';
export type TransactionStatus = 'completed' | 'pending' | 'failed';
export interface WalletTransaction {
    id: string;
    userId: string;
    type: TransactionType;
    amountINR: number;
    cashbackINR?: number;
    status: TransactionStatus;
    description: string;
    referenceId: string;
    createdAt: string;
}
export interface RechargePackage {
    id: string;
    amountINR: number;
    cashbackINR: number;
    isBestValue?: boolean;
    badgeLabel?: string;
}
export interface CoinPackage {
    id: string;
    coins: number;
    bonusCoins: number;
    priceINR: number;
    badgeLabel?: string;
    isPopular?: boolean;
}
export interface Coupon {
    id: string;
    code: string;
    discountPercentage: number;
    description: string;
    minRechargeINR: number;
    maxCashbackINR: number;
    isActive: boolean;
}
export interface PushNotificationPayload {
    title: string;
    body: string;
    target: 'all' | 'talkers' | 'listeners' | 'specific_user';
    targetUserId?: string;
    deepLink?: string;
    scheduledAt?: string;
    sentAt?: string;
    totalDelivered?: number;
}
export interface PayoutRequest {
    id: string;
    listenerId: string;
    listenerName: string;
    amountINR: number;
    upiId?: string;
    bankAccount?: string;
    bankIFSC?: string;
    status: 'pending' | 'processing' | 'approved' | 'rejected';
    requestedAt: string;
    processedAt?: string;
    rejectionReason?: string;
    utrNumber?: string;
}
export type PaymentGatewayProvider = 'razorpay' | 'cashfree' | 'stripe' | 'mock';
export interface PaymentOrder {
    orderId: string;
    provider: PaymentGatewayProvider;
    amountINR: number;
    currency: string;
    userId: string;
    status: 'created' | 'paid' | 'failed';
    gatewayOrderId?: string;
    gatewayKeyId?: string;
    cashbackINR?: number;
    notes?: Record<string, any>;
    createdAt: string;
}
export interface PaymentVerificationRequest {
    orderId: string;
    gatewayOrderId?: string;
    gatewayPaymentId?: string;
    gatewaySignature?: string;
    amountINR: number;
    cashbackINR?: number;
    userId: string;
    paymentMethod?: 'upi' | 'card' | 'netbanking' | 'wallet';
}
export interface ListenerEarningsSummary {
    listenerId: string;
    listenerName: string;
    totalEarnedINR: number;
    availableBalanceINR: number;
    totalWithdrawnINR: number;
    pendingPayoutINR: number;
    totalAudioMinutes: number;
    totalVideoMinutes: number;
    totalChatMessages: number;
}
