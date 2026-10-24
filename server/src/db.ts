import { User, ListenerProfile, WalletTransaction, PayoutRequest, PushNotificationPayload, PaymentOrder } from '@chatzie/shared';

// Clean Real Live State - Zero Mock/Bogus Accounts
export const mockListeners: ListenerProfile[] = [];

export const mockUsers: User[] = [];

export const mockTransactions: WalletTransaction[] = [];

export const mockPayouts: PayoutRequest[] = [];

export const mockPushNotifications: PushNotificationPayload[] = [];

export interface ModerationReport {
  id: string;
  reporterId: string;
  targetUsername: string;
  reason: string;
  channelName: string;
  durationSeconds: number;
  status: 'pending' | 'resolved' | 'dismissed';
  actionTaken?: string;
  createdAt: string;
}

export const mockReports: ModerationReport[] = [];

export const mockOrders: PaymentOrder[] = [];
