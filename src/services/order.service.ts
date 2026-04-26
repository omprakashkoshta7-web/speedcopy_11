import apiClient from './api.service';
import { API_CONFIG } from '../config/api.config';

export interface CreateOrderData {
  items: Array<{
    productId: string;
    productName: string;
    variantId?: string;
    flowType: 'printing' | 'gifting' | 'shopping';
    printConfigId?: string;
    businessPrintConfigId?: string;
    designId?: string;
    quantity: number;
    unitPrice: number;
    totalPrice: number;
    customization?: any;
  }>;
  shippingAddress: {
    line1: string;
    line2?: string;
    city: string;
    state?: string;
    pincode: string;
    landmark?: string;
  };
  subtotal: number;
  discount?: number;
  deliveryCharge?: number;
  total: number;
  paymentMethod?: string;
}

class OrderService {
  // Cart methods
  async getCart() {
    const response = await apiClient.get('/api/orders/cart');
    return response.data;
  }

  async addToCart(data: {
    productId: string;
    productName?: string;
    flowType?: string;
    quantity: number;
    unitPrice?: number;
    totalPrice?: number;
    variantId?: string;
    printConfigId?: string;
    businessPrintConfigId?: string;
    designId?: string;
    thumbnail?: string;
    designPreview?: string;
    designJson?: string;
    designName?: string;
    options?: any;
  }) {
    const response = await apiClient.post('/api/orders/cart', data);
    return response.data;
  }

  async updateCartItem(itemId: string, quantity: number) {
    const response = await apiClient.patch(`/api/orders/cart/${itemId}`, { quantity });
    return response.data;
  }

  async removeCartItem(itemId: string) {
    const response = await apiClient.delete(`/api/orders/cart/${itemId}`);
    return response.data;
  }

  // Create new order
  async createOrder(data: CreateOrderData) {
    const response = await apiClient.post(
      API_CONFIG.ENDPOINTS.ORDERS.CREATE,
      data
    );
    return response.data;
  }

  // Get user's orders
  async getMyOrders(params?: { page?: number; limit?: number; status?: string }) {
    const response = await apiClient.get(
      API_CONFIG.ENDPOINTS.ORDERS.MY_ORDERS,
      { params }
    );
    return response.data;
  }

  // Get order by ID
  async getOrderById(orderId: string) {
    const response = await apiClient.get(
      API_CONFIG.ENDPOINTS.ORDERS.ORDER_BY_ID(orderId)
    );
    return response.data;
  }

  // Track order
  async trackOrder(orderId: string) {
    const response = await apiClient.get(
      API_CONFIG.ENDPOINTS.ORDERS.TRACK(orderId)
    );
    return response.data;
  }
}

export default new OrderService();
