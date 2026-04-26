import apiClient from './api.service';
import { API_CONFIG } from '../config/api.config';

class FinanceService {
  private isNotFoundError(error: any) {
    return error?.response?.status === 404;
  }

  private isRouteNotFoundError(error: any) {
    return this.isNotFoundError(error)
      && error?.response?.data?.message === 'Route not found';
  }

  private async getWalletBundle() {
    const response = await apiClient.get('/api/app/wallet');
    return response.data;
  }

  private extractWalletBundle(bundle: any) {
    return bundle?.data || bundle || {};
  }

  private wrapSuccess(data: any) {
    return {
      success: true,
      data,
    };
  }

  // Get wallet balance
  async getWallet() {
    try {
      const response = await apiClient.get(API_CONFIG.ENDPOINTS.FINANCE.WALLET);
      return response.data;
    } catch (error) {
      if (!this.isRouteNotFoundError(error)) throw error;

      const bundle = this.extractWalletBundle(await this.getWalletBundle());
      const wallet = bundle?.overview?.wallet || bundle?.overview || {};
      return this.wrapSuccess(wallet);
    }
  }

  // Get wallet overview
  async getWalletOverview() {
    try {
      const response = await apiClient.get(
        API_CONFIG.ENDPOINTS.FINANCE.WALLET_OVERVIEW
      );
      return response.data;
    } catch (error) {
      if (!this.isRouteNotFoundError(error)) throw error;

      const bundle = this.extractWalletBundle(await this.getWalletBundle());
      return this.wrapSuccess(bundle?.overview || {});
    }
  }

  // Get ledger/transaction history
  async getLedger(params?: { page?: number; limit?: number; type?: string }) {
    try {
      const response = await apiClient.get(
        API_CONFIG.ENDPOINTS.FINANCE.LEDGER,
        { params }
      );
      return response.data;
    } catch (error) {
      if (!this.isRouteNotFoundError(error)) throw error;

      const bundle = this.extractWalletBundle(await this.getWalletBundle());
      return this.wrapSuccess(bundle?.ledger || {});
    }
  }

  // Get topup configuration (contains payment methods)
  async getTopupConfig() {
    try {
      const response = await apiClient.get(API_CONFIG.ENDPOINTS.FINANCE.TOPUP_CONFIG);
      return response.data;
    } catch (error) {
      if (!this.isRouteNotFoundError(error)) throw error;

      const bundle = this.extractWalletBundle(await this.getWalletBundle());
      const topupConfig = bundle?.topup_config || bundle?.overview || {};
      return this.wrapSuccess(topupConfig);
    }
  }

  // Preview topup
  async previewTopup(amount: number) {
    const response = await apiClient.post('/api/wallet/topup-preview', { amount });
    return response.data;
  }

  // Get payment methods (same as topup config)
  async getPaymentMethods() {
    return this.getTopupConfig();
  }

  // Add funds to wallet
  async addFunds(amount: number, paymentMethod: string) {
    try {
      const response = await apiClient.post('/api/wallet/add-funds', {
        amount,
        paymentMethod,
      });
      return response.data;
    } catch (error) {
      if (!this.isNotFoundError(error)) throw error;

      const response = await apiClient.post('/api/app/wallet/add-funds', {
        amount,
        paymentMethod,
      });
      return response.data;
    }
  }

  // Initiate Razorpay payment
  async initiateRazorpayPayment(amount: number) {
    const response = await apiClient.post('/api/wallet/razorpay/initiate', { amount });
    return response.data;
  }

  // Verify Razorpay payment
  async verifyRazorpayPayment(orderId: string, paymentId: string, signature: string) {
    const response = await apiClient.post('/api/wallet/razorpay/verify', {
      orderId,
      paymentId,
      signature,
    });
    return response.data;
  }

  // Handle payment failure
  async handlePaymentFailure(orderId: string, errorMessage: string) {
    const response = await apiClient.post('/api/wallet/razorpay/failure', {
      orderId,
      errorMessage,
    });
    return response.data;
  }

  // Get payment history
  async getPaymentHistory(params?: { page?: number; limit?: number }) {
    const response = await apiClient.get('/api/wallet/payment-history', { params });
    return response.data;
  }

  // Get referrals
  async getReferrals() {
    const response = await apiClient.get('/api/referrals');
    return response.data;
  }

  // Get referral summary
  async getReferralSummary() {
    const response = await apiClient.get('/api/referrals/summary');
    return response.data;
  }

  // Apply referral code
  async applyReferral(code: string) {
    const response = await apiClient.post('/api/referrals/apply', { code });
    return response.data;
  }
}

export default new FinanceService();
