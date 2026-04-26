import apiClient from './api.service';
import { API_CONFIG } from '../config/api.config';

export interface UpdateProfileData {
  name?: string;
  email?: string;
  phone?: string;
}

export interface AddressData {
  label: string;
  line1: string;
  line2?: string;
  city: string;
  state: string;
  pincode: string;
  landmark?: string;
}

class UserService {
  // Get user profile
  async getProfile() {
    const response = await apiClient.get(API_CONFIG.ENDPOINTS.USER.PROFILE);
    return response.data;
  }

  // Update user profile
  async updateProfile(data: UpdateProfileData) {
    const response = await apiClient.put(
      API_CONFIG.ENDPOINTS.USER.PROFILE,
      data
    );
    return response.data;
  }

  // Get user addresses
  async getAddresses() {
    const response = await apiClient.get(API_CONFIG.ENDPOINTS.USER.ADDRESSES);
    return response.data;
  }

  // Add new address
  async addAddress(data: AddressData) {
    const response = await apiClient.post(
      API_CONFIG.ENDPOINTS.USER.ADDRESSES,
      data
    );
    return response.data;
  }

  // Update address
  async updateAddress(addressId: string, data: AddressData) {
    const response = await apiClient.put(
      `${API_CONFIG.ENDPOINTS.USER.ADDRESSES}/${addressId}`,
      data
    );
    return response.data;
  }

  // Delete address
  async deleteAddress(addressId: string) {
    const response = await apiClient.delete(
      `${API_CONFIG.ENDPOINTS.USER.ADDRESSES}/${addressId}`
    );
    return response.data;
  }
}

export default new UserService();
