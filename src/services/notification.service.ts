import apiClient from './api.service';
import { API_CONFIG } from '../config/api.config';

class NotificationService {
  // Get all notifications
  async getNotifications() {
    const response = await apiClient.get(API_CONFIG.ENDPOINTS.NOTIFICATIONS.GET_ALL);
    return response.data;
  }

  // Mark single notification as read
  async markAsRead(id: string) {
    const response = await apiClient.patch(API_CONFIG.ENDPOINTS.NOTIFICATIONS.MARK_READ(id));
    return response.data;
  }

  // Mark all notifications as read
  async markAllAsRead() {
    const response = await apiClient.patch(API_CONFIG.ENDPOINTS.NOTIFICATIONS.MARK_ALL_READ);
    return response.data;
  }
}

export default new NotificationService();
