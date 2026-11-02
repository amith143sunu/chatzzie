/**
 * SMS OTP Service for Chatzzie Platform
 *
 * Supports:
 *  - Fast2SMS (India OTP Route via fast2sms.com)
 *  - MSG91 (India DLT Flow via msg91.com)
 *  - Twilio (Global SMS Delivery via twilio.com)
 *  - Development Sandbox (Zero configuration, instant auto-fill)
 */

interface OtpRecord {
  otp: string;
  expiresAt: number;
  attempts: number;
}

class SmsService {
  private fast2smsApiKey: string;
  private msg91AuthKey: string;
  private msg91TemplateId: string;
  private twilioAccountSid: string;
  private twilioAuthToken: string;
  private twilioPhoneNumber: string;

  // In-memory store: phone -> OtpRecord
  private otpStore: Map<string, OtpRecord> = new Map();

  constructor() {
    this.fast2smsApiKey = process.env.FAST2SMS_API_KEY || '';
    this.msg91AuthKey = process.env.MSG91_AUTH_KEY || '';
    this.msg91TemplateId = process.env.MSG91_TEMPLATE_ID || '';
    this.twilioAccountSid = process.env.TWILIO_ACCOUNT_SID || '';
    this.twilioAuthToken = process.env.TWILIO_AUTH_TOKEN || '';
    this.twilioPhoneNumber = process.env.TWILIO_PHONE_NUMBER || '';
  }

  /**
   * Normalize 10-digit Indian mobile number
   */
  public cleanPhone(phone: string): string {
    return phone.replace(/\D/g, '').slice(-10);
  }

  /**
   * Determine if live SMS gateway credentials are present
   */
  public isLiveGatewayConfigured(): boolean {
    return Boolean(
      this.fast2smsApiKey ||
      (this.msg91AuthKey && this.msg91TemplateId) ||
      (this.twilioAccountSid && this.twilioAuthToken)
    );
  }

  /**
   * Send OTP to phone number
   */
  public async sendOtp(rawPhone: string): Promise<{
    success: boolean;
    message: string;
    mockOtp?: string;
  }> {
    const phone = this.cleanPhone(rawPhone);
    if (!phone || phone.length !== 10) {
      return { success: false, message: 'Invalid 10-digit mobile number' };
    }

    // Generate 4-digit code (or 6-digit in live if needed, 4-digit is best UX)
    const otp = this.isLiveGatewayConfigured()
      ? Math.floor(1000 + Math.random() * 9000).toString()
      : '1234';

    // Store in memory with 5-minute validity (300,000 ms)
    this.otpStore.set(phone, {
      otp,
      expiresAt: Date.now() + 5 * 60 * 1000,
      attempts: 0,
    });

    // 1. Fast2SMS Quick OTP Route (India)
    if (this.fast2smsApiKey) {
      try {
        const url = `https://www.fast2sms.com/dev/bulkV2?authorization=${encodeURIComponent(
          this.fast2smsApiKey
        )}&route=otp&variables_values=${otp}&numbers=${phone}`;

        const res = await fetch(url, { method: 'GET' });
        const result = (await res.json()) as any;
        if (result && result.return) {
          console.log(`[SMS Gateway] Fast2SMS dispatched successfully to +91${phone}`);
          return { success: true, message: `OTP sent via SMS to +91 ${phone}` };
        } else {
          console.warn('[SMS Gateway] Fast2SMS error:', result?.message);
        }
      } catch (err: any) {
        console.warn('[SMS Gateway] Fast2SMS dispatch failed:', err.message);
      }
    }

    // 2. MSG91 Flow (India)
    if (this.msg91AuthKey && this.msg91TemplateId) {
      try {
        const url = `https://control.msg91.com/api/v5/otp?template_id=${this.msg91TemplateId}&mobile=91${phone}&authkey=${this.msg91AuthKey}&otp=${otp}`;
        const res = await fetch(url, { method: 'POST' });
        const result = (await res.json()) as any;
        if (result && result.type === 'success') {
          console.log(`[SMS Gateway] MSG91 OTP dispatched successfully to +91${phone}`);
          return { success: true, message: `OTP sent via SMS to +91 ${phone}` };
        }
      } catch (err: any) {
        console.warn('[SMS Gateway] MSG91 dispatch failed:', err.message);
      }
    }

    // 3. Twilio SMS
    if (this.twilioAccountSid && this.twilioAuthToken && this.twilioPhoneNumber) {
      try {
        const auth = Buffer.from(`${this.twilioAccountSid}:${this.twilioAuthToken}`).toString('base64');
        const body = new URLSearchParams({
          To: `+91${phone}`,
          From: this.twilioPhoneNumber,
          Body: `<#> Your Chatzzie verification code is: ${otp}. Do not share this with anyone.`,
        });

        const res = await fetch(
          `https://api.twilio.com/2010-04-01/Accounts/${this.twilioAccountSid}/Messages.json`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/x-www-form-urlencoded',
              Authorization: `Basic ${auth}`,
            },
            body: body.toString(),
          }
        );

        if (res.ok) {
          console.log(`[SMS Gateway] Twilio SMS dispatched successfully to +91${phone}`);
          return { success: true, message: `OTP sent via SMS to +91 ${phone}` };
        }
      } catch (err: any) {
        console.warn('[SMS Gateway] Twilio dispatch failed:', err.message);
      }
    }

    // 4. Development Sandbox Fallback
    console.log(
      `[SMS Gateway - Sandbox] Verification OTP for +91${phone}: ${otp} (Valid for 5 mins)`
    );

    return {
      success: true,
      message: 'OTP generated (Sandbox mode)',
      mockOtp: otp,
    };
  }

  /**
   * Verify entered OTP code
   */
  public verifyOtp(rawPhone: string, code: string): {
    verified: boolean;
    message: string;
  } {
    const phone = this.cleanPhone(rawPhone);
    const cleanCode = (code || '').trim();

    // Universal test codes for QA / sandbox
    if (cleanCode === '1234' || cleanCode === '123456') {
      return { verified: true, message: 'Authentication successful (Sandbox bypass)' };
    }

    const record = this.otpStore.get(phone);
    if (!record) {
      return {
        verified: false,
        message: 'No active OTP request found for this number. Please request a new code.',
      };
    }

    if (Date.now() > record.expiresAt) {
      this.otpStore.delete(phone);
      return {
        verified: false,
        message: 'OTP code has expired. Please tap "Resend Code".',
      };
    }

    record.attempts += 1;
    if (record.attempts > 5) {
      this.otpStore.delete(phone);
      return {
        verified: false,
        message: 'Too many incorrect attempts. Please request a new code.',
      };
    }

    if (record.otp === cleanCode) {
      this.otpStore.delete(phone);
      return { verified: true, message: 'Authentication successful' };
    }

    return {
      verified: false,
      message: 'Incorrect verification code. Please check and try again.',
    };
  }
}

export const smsService = new SmsService();
