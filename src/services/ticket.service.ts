import apiClient from './api.service';

export interface CreateTicketData {
  subject: string;
  description: string;
  category: 'order_issue' | 'payment_issue' | 'delivery_issue' | 'product_issue' | 'account_issue' | 'other';
  orderId?: string;
  attachments?: string[];
}

class TicketService {
  // Create a new support ticket
  async createTicket(data: CreateTicketData) {
    const response = await apiClient.post('/api/tickets', data);
    return response.data;
  }

  // Get user's tickets
  async getMyTickets(params?: { page?: number; limit?: number; status?: string }) {
    const response = await apiClient.get('/api/tickets', { params });
    return response.data;
  }

  // Get ticket by ID
  async getTicketById(id: string) {
    const response = await apiClient.get(`/api/tickets/${id}`);
    return response.data;
  }

  // Reply to a ticket
  async replyToTicket(id: string, message: string, attachments?: string[]) {
    const response = await apiClient.post(`/api/tickets/${id}/reply`, {
      message,
      attachments,
    });
    return response.data;
  }

  // Get ticket summary
  async getTicketSummary() {
    const response = await apiClient.get('/api/tickets/summary');
    return response.data;
  }
}

export default new TicketService();
