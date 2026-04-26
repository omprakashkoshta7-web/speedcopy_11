import apiClient from './api.service';
import { API_CONFIG } from '../config/api.config';

type CreatePaymentPayload = {
  orderId: string;
  amount: number;
  currency?: string;
};

type CheckoutOptions = {
  keyId: string;
  amount: number;
  currency: string;
  orderId?: string;
  receipt?: string;
  name: string;
  description: string;
};

type CheckoutSuccess = {
  razorpayOrderId?: string;
  razorpayPaymentId: string;
  razorpaySignature?: string;
};

declare global {
  interface Window {
    Razorpay?: new (options: Record<string, unknown>) => {
      open: () => void;
      on: (event: string, callback: (response: any) => void) => void;
    };
  }
}

class PaymentService {
  private unwrapData(payload: any) {
    // Many services wrap responses as { success, message, data }. Some endpoints may double-wrap.
    let current = payload;
    for (let i = 0; i < 3; i += 1) {
      if (current && typeof current === 'object' && 'data' in current) {
        current = (current as any).data;
      } else {
        break;
      }
    }
    return current;
  }

  private pickFirst(obj: any, paths: string[]) {
    for (const path of paths) {
      const parts = path.split('.');
      let current = obj;
      let ok = true;
      for (const part of parts) {
        if (!current || typeof current !== 'object' || !(part in current)) {
          ok = false;
          break;
        }
        current = (current as any)[part];
      }
      if (ok && current !== undefined && current !== null && current !== '') return current;
    }
    return undefined;
  }

  private pickFromCandidates(candidates: any[], paths: string[]) {
    for (const candidate of candidates) {
      const value = this.pickFirst(candidate, paths);
      if (value !== undefined) return value;
    }
    return undefined;
  }

  private getEnvKeyIdFallback() {
    // Optional client-side fallback. Prefer backend-provided keyId.
    const env: any = (import.meta as any)?.env || {};
    return env.VITE_RAZORPAY_KEY_ID || env.VITE_RAZORPAY_KEY || undefined;
  }

  private async ensureRazorpayScriptLoaded() {
    if (window.Razorpay) return;

    await new Promise<void>((resolve, reject) => {
      const existingScript = document.querySelector('script[data-razorpay-sdk="true"]');
      if (existingScript) {
        existingScript.addEventListener('load', () => resolve(), { once: true });
        existingScript.addEventListener('error', () => reject(new Error('Failed to load Razorpay SDK')), {
          once: true,
        });
        return;
      }

      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.async = true;
      script.dataset.razorpaySdk = 'true';
      script.onload = () => resolve();
      script.onerror = () => reject(new Error('Failed to load Razorpay SDK'));
      document.body.appendChild(script);
    });

    if (!window.Razorpay) {
      throw new Error('Razorpay SDK unavailable');
    }
  }

  private getPrefillDetails() {
    const rawUser = localStorage.getItem('user');
    if (!rawUser) return {};

    try {
      const user = JSON.parse(rawUser);
      return {
        name: user?.name || '',
        email: user?.email || '',
        contact: user?.phone || '',
      };
    } catch {
      return {};
    }
  }

  async createPayment(payload: CreatePaymentPayload) {
    let response;
    try {
      response = await apiClient.post(API_CONFIG.ENDPOINTS.PAYMENT.CREATE, payload);
    } catch (error: any) {
      const message = String(error?.response?.data?.message || error?.message || '');
      const fallbackKeyId = this.getEnvKeyIdFallback();
      if (error?.response?.status === 502 && fallbackKeyId) {
        return {
          keyId: fallbackKeyId,
          razorpayOrderId: payload.orderId,
          amount: Math.round((Number(payload.amount) || 0) * 100),
          currency: payload.currency || 'INR',
          mock: false,
          clientSideFallback: true,
        };
      }
      throw new Error(message || 'Payment initialization failed. Please try again.');
    }

    const unwrapped = this.unwrapData(response.data);
    const candidates = [unwrapped, response.data?.data, response.data];

    const keyId =
      (this.pickFromCandidates(candidates, ['keyId', 'key_id', 'key', 'razorpayKeyId']) as string | undefined) ||
      this.getEnvKeyIdFallback();

    const razorpayOrderId = this.pickFromCandidates(candidates, [
      'razorpayOrderId',
      'razorpay_order_id',
      'orderId',
      'order_id',
      'payment.razorpayOrderId',
      'payment.razorpay_order_id',
      'payment.orderId',
      'payment.order_id',
    ]) as string | undefined;

    const currency =
      (this.pickFromCandidates(candidates, ['currency', 'payment.currency']) as string | undefined) || 'INR';

    const expectedPaise = Math.round((Number(payload.amount) || 0) * 100);
    const amountRaw = this.pickFromCandidates(candidates, [
      'amount',
      'amountInPaise',
      'amount_in_paise',
      'payment.amount',
    ]);

    let amount = Number(amountRaw);
    if (!Number.isFinite(amount) || amount <= 0) {
      amount = expectedPaise;
    } else if (Number(payload.amount) && amount === Number(payload.amount)) {
      amount = expectedPaise;
    }

    const mock = !!this.pickFromCandidates(candidates, ['mock', 'data.mock']);

    if (!keyId || !razorpayOrderId || !amount) {
      console.error('[Payment] Unexpected createPayment response:', response.data);
      console.error('[Payment] Unwrapped createPayment data:', unwrapped);
      console.error('[Payment] Parsed fields:', { keyId, razorpayOrderId, amount, currency, mock });
      throw new Error('Payment initialization failed. Please try again.');
    }

    return { keyId, razorpayOrderId, amount, currency, mock };
  }

  async verifyPayment(paymentData: CheckoutSuccess, amount?: number) {
    if (!paymentData.razorpayOrderId || !paymentData.razorpaySignature) {
      throw new Error('Payment verification requires a Razorpay order and signature.');
    }
    const response = await apiClient.post(API_CONFIG.ENDPOINTS.PAYMENT.VERIFY, {
      razorpayOrderId: paymentData.razorpayOrderId,
      razorpayPaymentId: paymentData.razorpayPaymentId,
      razorpaySignature: paymentData.razorpaySignature,
      // finance-service wallet/razorpay/verify expects these field names
      orderId: paymentData.razorpayOrderId,
      paymentId: paymentData.razorpayPaymentId,
      signature: paymentData.razorpaySignature,
      amount,
    });
    return response.data;
  }

  async creditWalletAfterClientCheckout(amount: number) {
    const response = await apiClient.post('/api/wallet/add-funds', {
      amount,
      paymentMethod: 'razorpay_test_checkout',
    });
    return response.data;
  }

  async openCheckout(options: CheckoutOptions): Promise<CheckoutSuccess> {
    // Backend mock mode returns a non-real key; skip external checkout and simulate a payment.
    if (options.keyId === 'mock_key_id' || options.keyId.startsWith('mock_')) {
      return {
        razorpayOrderId: options.orderId,
        razorpayPaymentId: `pay_mock_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
        razorpaySignature: 'mock_signature_verified',
      };
    }

    await this.ensureRazorpayScriptLoaded();

    return new Promise((resolve, reject) => {
      const Razorpay = window.Razorpay;
      if (!Razorpay) {
        reject(new Error('Razorpay SDK unavailable'));
        return;
      }

      const checkoutOptions: Record<string, unknown> = {
        key: options.keyId,
        amount: options.amount,
        currency: options.currency,
        name: options.name,
        description: options.description,
        prefill: this.getPrefillDetails(),
        method: {
          upi: true,
          card: true,
          netbanking: true,
          wallet: true,
          emi: true,
          paylater: true,
        },
        config: {
          display: {
            language: 'en',
          },
        },
        theme: { color: '#111111' },
        notes: {
          receipt: options.receipt || options.orderId || `wallet_topup_${Date.now()}`,
          purpose: 'wallet_topup',
        },
        handler: (response: any) => {
          resolve({
            razorpayOrderId: response.razorpay_order_id || options.orderId,
            razorpayPaymentId: response.razorpay_payment_id,
            razorpaySignature: response.razorpay_signature,
          });
        },
        modal: {
          ondismiss: () => reject(new Error('Payment cancelled by user')),
        },
      };

      if (options.orderId && options.orderId.startsWith('order_')) {
        checkoutOptions.order_id = options.orderId;
      }

      const razorpay = new Razorpay(checkoutOptions);

      razorpay.on('payment.failed', (response: any) => {
        const message = response?.error?.description || 'Payment failed. Please try again.';
        reject(new Error(message));
      });

      razorpay.open();
    });
  }
}

export default new PaymentService();
