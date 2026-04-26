import apiClient from './api.service';

export interface DesignTemplate {
  _id: string;
  name: string;
  category: string;
  flowType: 'gifting' | 'business_printing' | 'shopping';
  isPremium: boolean;
  productId?: string;
  previewImage?: string;
  dimensions?: { width?: number; height?: number; unit?: string };
  tags?: string[];
}

export interface SavedDesign {
  _id: string;
  productId: string;
  name: string;
  canvasJson: unknown;
  previewImage?: string;
  flowType: 'gifting' | 'business_printing' | 'shopping';
  designType: 'premium' | 'normal';
  templateId?: string;
  dimensions?: { width?: number; height?: number; unit?: string };
  isFinalized: boolean;
  isSaved?: boolean;
}

interface DesignData {
  productId: string;
  flowType: string;
  canvasJson?: any;
  designName?: string;
  thumbnail?: string;
}

interface BlankDesignData {
  productId: string;
  flowType: string;
  dimensions?: {
    width: number;
    height: number;
    unit: string;
  };
}

interface FrameData {
  designId: string;
  frameName: string;
  frameIndex?: number;
  dimensions?: {
    width: number;
    height: number;
    unit: string;
  };
  canvasJson?: any;
  thumbnail?: string;
}

class DesignService {
  async getPremiumTemplates(params?: { productId?: string; category?: string }): Promise<DesignTemplate[]> {
    try {
      const response = await apiClient.get('/api/designs/templates/premium', { params });
      return response.data?.data || response.data || [];
    } catch (error: any) {
      console.error('Failed to load premium templates:', error);
      return [];
    }
  }

  async getTemplates(filters?: {
    flowType?: string;
    category?: string;
    isPremium?: boolean;
    productId?: string;
  }) {
    try {
      const params = new URLSearchParams();
      if (filters?.flowType) params.append('flowType', filters.flowType);
      if (filters?.category) params.append('category', filters.category);
      if (filters?.isPremium !== undefined) params.append('isPremium', String(filters.isPremium));
      if (filters?.productId) params.append('productId', filters.productId);

      const response = await apiClient.get(
        `/api/designs/templates?${params.toString()}`
      );
      return response.data;
    } catch (error: any) {
      console.error('Failed to load templates:', error);
      return { success: false, data: [], message: 'Failed to load templates' };
    }
  }

  async createBlankDesign(data: BlankDesignData) {
    const response = await apiClient.post('/api/designs/blank', data);
    return response.data;
  }

  async createFromTemplate(body: { productId: string; templateId: string; flowType: string }): Promise<SavedDesign> {
    const response = await apiClient.post('/api/designs/from-template', body);
    return response.data?.data || response.data;
  }

  async saveDesign(data: DesignData) {
    const response = await apiClient.post('/api/designs', data);
    return response.data;
  }

  async getMyDesigns(filters?: {
    productId?: string;
    finalized?: boolean;
    savedOnly?: boolean;
  }) {
    const params = new URLSearchParams();
    if (filters?.productId) params.append('productId', filters.productId);
    if (filters?.finalized !== undefined) params.append('finalized', String(filters.finalized));
    if (filters?.savedOnly !== undefined) params.append('savedOnly', String(filters.savedOnly));

    const response = await apiClient.get(
      `/api/designs?${params.toString()}`
    );
    return response.data;
  }

  async getDesignById(designId: string) {
    const response = await apiClient.get(`/api/designs/${designId}`);
    return response.data;
  }

  async updateDesign(designId: string, data: any) {
    const response = await apiClient.put(`/api/designs/${designId}`, data);
    return response.data;
  }

  async markDesignApproved(designId: string, orderId?: string) {
    const response = await apiClient.patch(`/api/designs/${designId}/approve`, {
      orderId,
    });
    return response.data;
  }

  // Frame management APIs
  async addFrame(data: FrameData) {
    const response = await apiClient.post(`/api/designs/${data.designId}/frames`, {
      frameName: data.frameName,
      frameIndex: data.frameIndex,
      dimensions: data.dimensions,
      canvasJson: data.canvasJson,
      thumbnail: data.thumbnail,
    });
    return response.data;
  }

  async getFrames(designId: string) {
    const response = await apiClient.get(`/api/designs/${designId}/frames`);
    return response.data;
  }

  async updateFrame(designId: string, frameId: string, data: Partial<FrameData>) {
    const response = await apiClient.put(`/api/designs/${designId}/frames/${frameId}`, {
      frameName: data.frameName,
      dimensions: data.dimensions,
      canvasJson: data.canvasJson,
      thumbnail: data.thumbnail,
    });
    return response.data;
  }

  async deleteFrame(designId: string, frameId: string) {
    const response = await apiClient.delete(`/api/designs/${designId}/frames/${frameId}`);
    return response.data;
  }

  async reorderFrames(designId: string, frameIds: string[]) {
    const response = await apiClient.patch(`/api/designs/${designId}/frames/reorder`, {
      frameIds,
    });
    return response.data;
  }

  // Load frames for a product
  async loadProductFrames(productId: string) {
    try {
      // Try multiple endpoints
      const endpoints = [
        `/api/designs/product/${productId}/frames`,
        `/api/designs/frames?productId=${productId}`,
        `/api/designs?productId=${productId}`
      ];

      for (const endpoint of endpoints) {
        try {
          const response = await apiClient.get(endpoint);
          const data = response.data?.data || response.data || [];
          if (Array.isArray(data) && data.length > 0) {
            console.log(`✅ Frames loaded from ${endpoint}:`, data);
            return data;
          }
        } catch (err) {
          console.log(`⚠️ Endpoint ${endpoint} failed, trying next...`);
          continue;
        }
      }

      console.log('⚠️ No frames found from any endpoint, using defaults');
      return [];
    } catch (error) {
      console.error('Failed to load product frames:', error);
      return [];
    }
  }
}

export default new DesignService();
