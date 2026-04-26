
import apiClient from './api.service';
import { API_CONFIG } from '../config/api.config';

class ProductService {
  // Business Printing APIs
  async getBusinessPrintingHome() {
    const response = await apiClient.get(
      API_CONFIG.ENDPOINTS.PRODUCTS.BUSINESS_PRINTING.HOME
    );
    return response.data;
  }

  async getBusinessPrintTypes() {
    const response = await apiClient.get(
      API_CONFIG.ENDPOINTS.PRODUCTS.BUSINESS_PRINTING.TYPES
    );
    return response.data;
  }

  async getBusinessPrintingCategories() {
    const response = await apiClient.get(
      API_CONFIG.ENDPOINTS.PRODUCTS.BUSINESS_PRINTING.CATEGORIES
    );
    return response.data;
  }

  async getBusinessProducts(params?: {
    page?: number;
    limit?: number;
    category?: string;
    search?: string;
  }) {
    const response = await apiClient.get(
      API_CONFIG.ENDPOINTS.PRODUCTS.BUSINESS_PRINTING.PRODUCTS,
      { params }
    );
    return response.data;
  }

  async getBusinessProductById(id: string) {
    const response = await apiClient.get(
      API_CONFIG.ENDPOINTS.PRODUCTS.BUSINESS_PRINTING.PRODUCT_BY_ID(id)
    );
    return response.data;
  }

  async getPickupLocations(lat: number, lng: number, radius?: number, pincode?: string) {
    const response = await apiClient.get(
      API_CONFIG.ENDPOINTS.PRODUCTS.BUSINESS_PRINTING.PICKUP_LOCATIONS,
      { params: { lat, lng, radius, ...(pincode ? { pincode } : {}) } }
    );
    return response.data;
  }

  async getNearbyVendorStores(params?: {
    lat?: number;
    lng?: number;
    radius?: number;
    limit?: number;
    pincode?: string;
  }) {
    const response = await apiClient.get(
      API_CONFIG.ENDPOINTS.VENDORS.NEARBY_STORES,
      { params }
    );
    return response.data;
  }

  async saveBusinessPrintConfig(data: any) {
    const response = await apiClient.post(
      API_CONFIG.ENDPOINTS.PRODUCTS.BUSINESS_PRINTING.CONFIGURE,
      data
    );
    return response.data;
  }

  async getBusinessPrintConfig(id: string) {
    const response = await apiClient.get(
      API_CONFIG.ENDPOINTS.PRODUCTS.BUSINESS_PRINTING.CONFIG_BY_ID(id)
    );
    return response.data;
  }

  // Get uploaded files for print config
  async getUploadedFiles() {
    const response = await apiClient.get('/api/products/printing/files');
    return response.data;
  }

  // Upload files for print config
  async uploadFiles(formData: FormData) {
    const response = await apiClient.post('/api/products/printing/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  }

  // Regular Printing APIs
  async getPrintingHome() {
    const response = await apiClient.get(
      API_CONFIG.ENDPOINTS.PRODUCTS.PRINTING.HOME
    );
    return response.data;
  }

  async getPrintingCategories() {
    const response = await apiClient.get(
      API_CONFIG.ENDPOINTS.PRODUCTS.PRINTING.CATEGORIES
    );
    return response.data;
  }

  async getPrintingDocumentTypes() {
    const response = await apiClient.get(
      '/api/products/printing/document-types'
    );
    return response.data;
  }

  async getPrintingProducts(params?: {
    page?: number;
    limit?: number;
    category?: string;
  }) {
    const response = await apiClient.get(
      '/api/products',
      { params: { ...params, flowType: 'printing' } }
    );
    return response.data;
  }

  // Gifting APIs
  async getGiftingHome() {
    const response = await apiClient.get(
      API_CONFIG.ENDPOINTS.PRODUCTS.GIFTING.HOME
    );
    return response.data;
  }

  async getGiftingCategories() {
    const response = await apiClient.get(
      API_CONFIG.ENDPOINTS.PRODUCTS.GIFTING.CATEGORIES
    );
    return response.data;
  }

  async getGiftingProducts(params?: {
    page?: number;
    limit?: number;
    category?: string;
  }) {
    try {
      const response = await apiClient.get(
        API_CONFIG.ENDPOINTS.PRODUCTS.GIFTING.PRODUCTS,
        { params }
      );
      return response.data;
    } catch (error: any) {
      console.error('Error fetching gifting products:', error);
      // Fallback - return empty array instead of crashing
      return {
        success: false,
        data: {
          products: [],
          meta: { total: 0, page: 1, limit: 12, pages: 0 }
        },
        message: 'Failed to fetch gifting products'
      };
    }
  }

  async getGiftingProductById(id: string) {
    const response = await apiClient.get(
      API_CONFIG.ENDPOINTS.PRODUCTS.GIFTING.PRODUCT_BY_ID(id)
    );
    return response.data;
  }

  async getShoppingProducts(params?: {
    page?: number;
    limit?: number;
    category?: string;
  }) {
    try {
      const response = await apiClient.get(
        API_CONFIG.ENDPOINTS.PRODUCTS.SHOPPING.PRODUCTS,
        { params }
      );
      return response.data;
    } catch (error: any) {
      console.error('Error fetching shopping products:', error);
      // Fallback - return empty array instead of crashing
      return {
        success: false,
        data: {
          products: [],
          meta: { total: 0, page: 1, limit: 12, pages: 0 }
        },
        message: 'Failed to fetch shopping products'
      };
    }
  }

  async getShoppingProductById(id: string) {
    const response = await apiClient.get(
      API_CONFIG.ENDPOINTS.PRODUCTS.SHOPPING.PRODUCT_BY_ID(id)
    );
    return response.data;
  }

  async getProductById(id: string) {
    const response = await apiClient.get(`/api/products/${id}`);
    return response.data;
  }

  async getAllProducts(params?: {
    page?: number;
    limit?: number;
    category?: string;
    flowType?: string;
    search?: string;
  }) {
    const response = await apiClient.get('/api/products', { params });
    return response.data;
  }

  async getCategories(flowType?: string) {
    const response = await apiClient.get('/api/products/categories', { params: flowType ? { flowType } : undefined });
    return response.data;
  }

  async getShoppingCategories() {
    const response = await apiClient.get(
      API_CONFIG.ENDPOINTS.PRODUCTS.SHOPPING.CATEGORIES
    );
    return response.data;
  }
}

export default new ProductService();
