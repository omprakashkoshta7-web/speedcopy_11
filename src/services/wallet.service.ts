import apiClient from './api.service';
import { API_CONFIG } from '../config/api.config';

// Wallet & Finance API Interfaces
export interface WalletBalance {
  balance: number;
  currency: string;
  lastUpdated?: string;
}

export interface WalletOverview {
  balance: number;
  totalSpent: number;
  totalRefunds: number;
  totalTopups: number;
  currency: string;
  statistics?: {
    thisMonth: {
      spent: number;
      topups: number;
    };
    lastMonth: {
      spent: number;
      topups: number;
    };
  };
}

export interface Transaction {
  _id: string;
  type: string;
  amount: number;
  description: string;
  createdAt: string;
  referenceId: string;
  status: 'pending' | 'completed' | 'failed' | 'cancelled';
  metadata?: any;
}

export interface WalletLedger {
  entries: Transaction[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface TopupConfig {
  minAmount: number;
  maxAmount: number;
  processingFee: number;
  feePercentage: number;
  paymentMethods: string[];
  limits: {
    daily: number;
    monthly: number;
  };
}

export interface TopupPreview {
  amount: number;
  processingFee: number;
  total: number;
  currency: string;
  breakdown?: {
    baseAmount: number;
    fees: number;
    taxes: number;
  };
}

export interface RazorpayInitiateResponse {
  keyId: string;
  razorpayOrderId: string;
  amount: number;
  currency: string;
  mock?: boolean;
  clientSideFallback?: boolean;
}

export interface RazorpayVerifyResponse {
  success: boolean;
  wallet: WalletBalance;
  transaction: Transaction;
  message: string;
}

/**
 * Wallet Service - Handles all wallet & finance operations
 * Implements all 9 required APIs with fallback support
 */
class WalletService {
  private isNotFoundError(error: any) {
    return error?.response?.status === 404;
  }

  private isRouteNotFoundError(error: any) {
    return this.isNotFoundError(error) && 
           error?.response?.data?.message === 'Route not found';
  }

  private wrapSuccess(data: any) {
    return { success: true, data };
  }

  /**
   * 1. Get Wallet Balance - Current balance dekhna
   */
  async getBalance(): Promise<{ success: boolean; data: WalletBalance }> {
    try {
      const response = await apiClient.get(API_CONFIG.ENDPOINTS.FINANCE.WALLET_BALANCE);
      return response.data;
    } catch (error) {
      if (!this.isRouteNotFoundError(error)) throw error;
      
      // Fallback to main wallet endpoint
      const response = await apiClient.get(API_CONFIG.ENDPOINTS.FINANCE.WALLET);
      const walletData = response.data?.data || response.data || {};
      return this.wrapSuccess({
        balance: walletData.balance || 0,
        currency: 'INR',
        lastUpdated: new Date().toISOString()
      });
    }
  }

  /**
   * 2. Get Wallet Overview - Detailed stats (total spent, refunds)
   */
  async getOverview(): Promise<{ success: boolean; data: WalletOverview }> {
    try {
      const response = await apiClient.get(API_CONFIG.ENDPOINTS.FINANCE.WALLET_OVERVIEW);
      return response.data;
    } catch (error) {
      if (!this.isRouteNotFoundError(error)) throw error;
      
      // Fallback - construct overview from balance
      const balanceRes = await this.getBalance();
      return this.wrapSuccess({
        balance: balanceRes.data.balance,
        totalSpent: 0,
        totalRefunds: 0,
        totalTopups: 0,
        currency: 'INR'
      });
    }
  }

  /**
   * 3. Get Wallet Ledger - Transaction history (paginated)
   */
  async getLedger(params?: { 
    page?: number; 
    limit?: number; 
    type?: string 
  }): Promise<{ success: boolean; data: WalletLedger }> {
    try {
      const response = await apiClient.get(API_CONFIG.ENDPOINTS.FINANCE.LEDGER, { params });
      return response.data;
    } catch (error) {
      if (!this.isRouteNotFoundError(error)) throw error;
      
      // Fallback - return empty ledger
      return this.wrapSuccess({
        entries: [],
        pagination: {
          page: params?.page || 1,
          limit: params?.limit || 10,
          total: 0,
          totalPages: 0
        }
      });
    }
  }

  /**
   * 4. Get Topup Config - Topup options aur limits
   */
  async getTopupConfig(): Promise<{ success: boolean; data: TopupConfig }> {
    try {
      const response = await apiClient.get(API_CONFIG.ENDPOINTS.FINANCE.TOPUP_CONFIG);
      return response.data;
    } catch (error) {
      if (!this.isRouteNotFoundError(error)) throw error;
      
      // Fallback - default config
      return this.wrapSuccess({
        minAmount: 10,
        maxAmount: 50000,
        processingFee: 0,
        feePercentage: 0,
        paymentMethods: ['razorpay', 'upi', 'card', 'netbanking'],
        limits: {
          daily: 25000,
          monthly: 100000
        }
      });
    }
  }

  /**
   * 5. Preview Topup - Topup amount + fees calculate karna
   */
  async previewTopup(amount: number): Promise<{ success: boolean; data: TopupPreview }> {
    try {
      const response = await apiClient.post(API_CONFIG.ENDPOINTS.FINANCE.TOPUP_PREVIEW, { amount });
      return response.data;
    } catch (error) {
      if (!this.isRouteNotFoundError(error)) throw error;
      
      // Fallback calculation
      const processingFee = 0; // 0% fee as per current implementation
      return this.wrapSuccess({
        amount,
        processingFee,
        total: amount + processingFee,
        currency: 'INR',
        breakdown: {
          baseAmount: amount,
          fees: processingFee,
          taxes: 0
        }
      });
    }
  }

  /**
   * 6. Add Funds - Wallet mein paise add karna
   */
  async addFunds(amount: number, paymentMethod: string): Promise<{ success: boolean; data: any }> {
    try {
      const response = await apiClient.post(API_CONFIG.ENDPOINTS.FINANCE.ADD_FUNDS, {
        amount,
        paymentMethod
      });
      return response.data;
    } catch (error) {
      if (!this.isNotFoundError(error)) throw error;
      
      // Fallback to app endpoint
      const response = await apiClient.post('/api/app/wallet/add-funds', {
        amount,
        paymentMethod
      });
      return response.data;
    }
  }

  /**
   * 7. Initiate Razorpay - Razorpay payment start karna
   */
  async initiateRazorpay(
    amount: number, 
    orderId?: string
  ): Promise<{ success: boolean; data: RazorpayInitiateResponse }> {
    console.log('🚀 Wallet service initiating Razorpay for amount:', amount);
    
    try {
      const response = await apiClient.post(API_CONFIG.ENDPOINTS.FINANCE.RAZORPAY_INITIATE, {
        amount,
        orderId: orderId || `wallet_topup_${Date.now()}`,
        currency: 'INR'
      });
      
      console.log('✅ Wallet API response:', response.data);
      
      // Handle different response structures
      const responseData = response.data?.data || response.data;
      
      return {
        success: true,
        data: {
          keyId: responseData?.keyId || responseData?.key_id || responseData?.key || this.getEnvRazorpayKey(),
          razorpayOrderId: responseData?.razorpayOrderId || responseData?.razorpay_order_id || responseData?.orderId || orderId,
          amount: responseData?.amount || Math.round(amount * 100),
          currency: responseData?.currency || 'INR',
          mock: responseData?.mock || false,
          clientSideFallback: responseData?.clientSideFallback || false
        }
      };
    } catch (error) {
      console.warn('⚠️ Wallet API failed, trying fallback...', error);
      
      if (!this.isRouteNotFoundError(error)) throw error;
      
      // Fallback to payment service endpoint
      try {
        const response = await apiClient.post(API_CONFIG.ENDPOINTS.PAYMENT.CREATE, {
          orderId: orderId || `wallet_topup_${Date.now()}`,
          amount,
          currency: 'INR'
        });
        
        console.log('✅ Payment API fallback response:', response.data);
        
        const responseData = response.data?.data || response.data;
        
        return {
          success: true,
          data: {
            keyId: responseData?.keyId || responseData?.key_id || responseData?.key || this.getEnvRazorpayKey(),
            razorpayOrderId: responseData?.razorpayOrderId || responseData?.razorpay_order_id || responseData?.orderId || orderId,
            amount: responseData?.amount || Math.round(amount * 100),
            currency: responseData?.currency || 'INR',
            mock: responseData?.mock || false,
            clientSideFallback: responseData?.clientSideFallback || false
          }
        };
      } catch (fallbackError) {
        console.warn('⚠️ Payment API also failed, using env configuration...', fallbackError);
        
        // If both APIs fail, use environment configuration
        const envKey = this.getEnvRazorpayKey();
        return {
          success: true,
          data: {
            keyId: envKey,
            razorpayOrderId: orderId || `wallet_topup_${Date.now()}`,
            amount: Math.round(amount * 100),
            currency: 'INR',
            mock: !envKey || envKey.startsWith('mock_'),
            clientSideFallback: true
          }
        };
      }
    }
  }

  private getEnvRazorpayKey(): string {
    const env: any = (import.meta as any)?.env || {};
    const keyId = env.VITE_RAZORPAY_KEY_ID || env.VITE_RAZORPAY_KEY || 'rzp_test_6vdMK3ln1NsDMj';
    console.log('🔑 Using Razorpay key from env:', keyId ? `${keyId.substring(0, 8)}...` : 'Not found');
    return keyId;
  }

  /**
   * 8. Verify Razorpay - Payment verify karke wallet credit karna
   */
  async verifyRazorpay(
    orderId: string,
    paymentId: string,
    signature: string,
    amount?: number
  ): Promise<{ success: boolean; data: RazorpayVerifyResponse }> {
    try {
      const response = await apiClient.post(API_CONFIG.ENDPOINTS.FINANCE.RAZORPAY_VERIFY, {
        orderId,
        paymentId,
        signature,
        amount,
        // Also include alternate field names for compatibility
        razorpayOrderId: orderId,
        razorpayPaymentId: paymentId,
        razorpaySignature: signature
      });
      return response.data;
    } catch (error) {
      if (!this.isRouteNotFoundError(error)) throw error;
      
      // Fallback to payment service endpoint
      const response = await apiClient.post(API_CONFIG.ENDPOINTS.PAYMENT.VERIFY, {
        razorpayOrderId: orderId,
        razorpayPaymentId: paymentId,
        razorpaySignature: signature,
        orderId,
        paymentId,
        signature,
        amount
      });
      return response.data;
    }
  }

  /**
   * 9. Transaction History - Pura transaction log
   */
  async getTransactionHistory(params?: {
    page?: number;
    limit?: number;
    type?: string;
    startDate?: string;
    endDate?: string;
  }): Promise<{ success: boolean; data: WalletLedger }> {
    try {
      const response = await apiClient.get(API_CONFIG.ENDPOINTS.FINANCE.TRANSACTION_HISTORY, { params });
      return response.data;
    } catch (error) {
      if (!this.isRouteNotFoundError(error)) throw error;
      
      // Fallback to ledger endpoint
      return this.getLedger(params);
    }
  }

  // Additional utility methods
  async getPaymentMethods() {
    const config = await this.getTopupConfig();
    return config.data.paymentMethods;
  }

  async validateTopupAmount(amount: number): Promise<{ valid: boolean; message?: string }> {
    const config = await this.getTopupConfig();
    const { minAmount, maxAmount } = config.data;
    
    if (amount < minAmount) {
      return { valid: false, message: `Minimum topup amount is ₹${minAmount}` };
    }
    
    if (amount > maxAmount) {
      return { valid: false, message: `Maximum topup amount is ₹${maxAmount}` };
    }
    
    return { valid: true };
  }
}

export default new WalletService();