import apiClient from './api.service';
import { API_CONFIG } from '../config/api.config';

// Template interface matching backend schema
export interface DesignTemplate {
  _id: string;
  name: string;
  category: string;
  flowType: 'gifting' | 'business_printing' | 'shopping';
  isPremium: boolean;
  productId?: string;
  canvasJson: any;
  previewImage?: string;
  dimensions?: {
    width?: number;
    height?: number;
    unit?: string;
  };
  isActive?: boolean;
  tags?: string[];
  sortOrder?: number;
  createdAt?: string;
  updatedAt?: string;
}

// Design interface matching backend schema
export interface SavedDesign {
  _id: string;
  userId: string;
  productId: string;
  name: string;
  canvasJson: any;
  previewImage?: string;
  flowType: 'gifting' | 'business_printing' | 'shopping';
  designType: 'premium' | 'normal';
  templateId?: string;
  dimensions?: {
    width?: number;
    height?: number;
    unit?: string;
  };
  isFinalized: boolean;
  isSaved: boolean;
  lastApprovedOrderId?: string;
  createdAt?: string;
  updatedAt?: string;
}

// Request interfaces
interface SaveDesignData {
  productId: string;
  name?: string;
  canvasJson: any;
  previewImage?: string;
  flowType: 'gifting' | 'business_printing' | 'shopping';
  designType?: 'premium' | 'normal';
  templateId?: string;
  dimensions?: {
    width: number;
    height: number;
    unit: string;
  };
  isFinalized?: boolean;
  isSaved?: boolean;
}

interface BlankDesignData {
  productId: string;
  flowType: 'gifting' | 'business_printing' | 'shopping';
  dimensions?: {
    width: number;
    height: number;
    unit: string;
  };
}

interface TemplateDesignData {
  productId: string;
  templateId: string;
  flowType: 'gifting' | 'business_printing' | 'shopping';
}

interface UpdateDesignData {
  name?: string;
  canvasJson?: any;
  previewImage?: string;
  isFinalized?: boolean;
  isSaved?: boolean;
  dimensions?: {
    width: number;
    height: number;
    unit: string;
  };
}

// Frame interface
export interface Frame {
  _id: string;
  id: string;
  name: string;
  frameName: string;
  canvasJson: any;
  thumbnail?: string;
  image?: string;
  dimensions?: {
    width?: number;
    height?: number;
    unit?: string;
  };
}

/**
 * Design Service - Handles all design & template operations
 * Implements all 9 Premium Design APIs with fallback support
 */
class DesignService {
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
   * 1. Get Premium Templates ⭐
   * GET /api/designs/templates/premium
   */
  async getPremiumTemplates(params?: {
    productId?: string;
    category?: string;
  }): Promise<{ success: boolean; data: DesignTemplate[] }> {
    try {
      console.log('🎨 Getting premium templates with params:', params);
      const response = await apiClient.get(API_CONFIG.ENDPOINTS.DESIGNS.TEMPLATES_PREMIUM, { params });
      console.log('✅ Premium templates response:', response.data);
      return response.data;
    } catch (error) {
      console.warn('⚠️ Premium templates API failed, using fallback...', error);
      
      if (!this.isRouteNotFoundError(error)) throw error;
      
      // Fallback to regular templates with premium filter
      try {
        const fallbackResponse = await apiClient.get(API_CONFIG.ENDPOINTS.DESIGNS.TEMPLATES, { 
          params: { ...params, isPremium: true } 
        });
        return fallbackResponse.data;
      } catch (fallbackError) {
        console.warn('⚠️ Fallback also failed, returning empty array');
        return this.wrapSuccess([]);
      }
    }
  }

  /**
   * 2. Get All Templates (with Premium Filter)
   * GET /api/designs/templates?isPremium=true
   */
  async getTemplates(filters?: {
    flowType?: 'gifting' | 'business_printing' | 'shopping';
    category?: string;
    isPremium?: boolean;
    productId?: string;
  }): Promise<{ success: boolean; data: DesignTemplate[] }> {
    try {
      console.log('📋 Getting templates with filters:', filters);
      const response = await apiClient.get(API_CONFIG.ENDPOINTS.DESIGNS.TEMPLATES, { params: filters });
      console.log('✅ Templates response:', response.data);
      return response.data;
    } catch (error) {
      console.warn('⚠️ Templates API failed:', error);
      
      if (!this.isRouteNotFoundError(error)) throw error;
      
      // Return empty array as fallback
      return this.wrapSuccess([]);
    }
  }

  /**
   * 3. Create Design from Premium Template ⭐
   * POST /api/designs/from-template
   */
  async createFromTemplate(data: TemplateDesignData): Promise<{ success: boolean; data: SavedDesign; message: string }> {
    try {
      console.log('🎯 Creating design from template:', data);
      const response = await apiClient.post(API_CONFIG.ENDPOINTS.DESIGNS.FROM_TEMPLATE, data);
      console.log('✅ Template design created:', response.data);
      return response.data;
    } catch (error) {
      console.warn('⚠️ Template creation failed:', error);
      
      if (!this.isRouteNotFoundError(error)) throw error;
      
      // Fallback: Create a basic design structure
      const fallbackDesign: SavedDesign = {
        _id: `design_${Date.now()}`,
        userId: 'current_user',
        productId: data.productId,
        name: 'Premium Design',
        canvasJson: { objects: [], background: '#ffffff' },
        flowType: data.flowType,
        designType: 'premium',
        templateId: data.templateId,
        isFinalized: false,
        isSaved: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      return {
        success: true,
        data: fallbackDesign,
        message: 'Design created with fallback template'
      };
    }
  }

  /**
   * 4. Create Blank Canvas
   * POST /api/designs/blank
   */
  async createBlankDesign(data: BlankDesignData): Promise<{ success: boolean; data: SavedDesign; message: string }> {
    try {
      console.log('🎨 Creating blank design:', data);
      const response = await apiClient.post(API_CONFIG.ENDPOINTS.DESIGNS.BLANK, data);
      console.log('✅ Blank design created:', response.data);
      return response.data;
    } catch (error) {
      console.warn('⚠️ Blank design creation failed:', error);
      
      if (!this.isRouteNotFoundError(error)) throw error;
      
      // Fallback: Create a basic blank design structure
      const fallbackDesign: SavedDesign = {
        _id: `design_${Date.now()}`,
        userId: 'current_user',
        productId: data.productId,
        name: 'Blank Canvas',
        canvasJson: { 
          objects: [], 
          background: '#ffffff',
          width: data.dimensions?.width || 600,
          height: data.dimensions?.height || 400
        },
        flowType: data.flowType,
        designType: 'normal',
        dimensions: data.dimensions || { width: 600, height: 400, unit: 'px' },
        isFinalized: false,
        isSaved: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      return {
        success: true,
        data: fallbackDesign,
        message: 'Blank design created with fallback'
      };
    }
  }

  /**
   * 5. Save Design
   * POST /api/designs
   */
  async saveDesign(data: SaveDesignData): Promise<{ success: boolean; data: SavedDesign; message: string }> {
    try {
      console.log('💾 Saving design:', { ...data, canvasJson: '[Canvas JSON]' });
      const response = await apiClient.post(API_CONFIG.ENDPOINTS.DESIGNS.SAVE, data);
      console.log('✅ Design saved:', response.data);
      return response.data;
    } catch (error) {
      console.warn('⚠️ Design save failed:', error);
      
      if (!this.isRouteNotFoundError(error)) throw error;
      
      // Fallback: Save to localStorage
      const designId = `design_${Date.now()}`;
      const fallbackDesign: SavedDesign = {
        _id: designId,
        userId: 'current_user',
        productId: data.productId,
        name: data.name || 'Untitled Design',
        canvasJson: data.canvasJson,
        previewImage: data.previewImage,
        flowType: data.flowType,
        designType: data.designType || 'normal',
        templateId: data.templateId,
        dimensions: data.dimensions,
        isFinalized: data.isFinalized || false,
        isSaved: data.isSaved !== false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      // Save to localStorage as fallback
      const savedDesigns = JSON.parse(localStorage.getItem('speedcopy_saved_designs') || '[]');
      savedDesigns.push(fallbackDesign);
      localStorage.setItem('speedcopy_saved_designs', JSON.stringify(savedDesigns));
      
      return {
        success: true,
        data: fallbackDesign,
        message: 'Design saved locally (offline mode)'
      };
    }
  }

  /**
   * 6. Get My Designs
   * GET /api/designs?productId=product_123
   */
  async getMyDesigns(filters?: {
    productId?: string;
    finalized?: boolean;
    savedOnly?: boolean;
  }): Promise<{ success: boolean; data: SavedDesign[] }> {
    try {
      console.log('📂 Getting my designs with filters:', filters);
      const response = await apiClient.get(API_CONFIG.ENDPOINTS.DESIGNS.MY_DESIGNS, { params: filters });
      console.log('✅ My designs response:', response.data);
      return response.data;
    } catch (error) {
      console.warn('⚠️ My designs API failed:', error);
      
      if (!this.isRouteNotFoundError(error)) throw error;
      
      // Fallback: Get from localStorage
      const savedDesigns = JSON.parse(localStorage.getItem('speedcopy_saved_designs') || '[]');
      let filteredDesigns = savedDesigns;
      
      if (filters?.productId) {
        filteredDesigns = filteredDesigns.filter((d: SavedDesign) => d.productId === filters.productId);
      }
      if (filters?.finalized !== undefined) {
        filteredDesigns = filteredDesigns.filter((d: SavedDesign) => d.isFinalized === filters.finalized);
      }
      if (filters?.savedOnly) {
        filteredDesigns = filteredDesigns.filter((d: SavedDesign) => d.isSaved === true);
      }
      
      return this.wrapSuccess(filteredDesigns);
    }
  }

  /**
   * 7. Get Design by ID
   * GET /api/designs/{id}
   */
  async getDesignById(designId: string): Promise<{ success: boolean; data: SavedDesign }> {
    try {
      console.log('🔍 Getting design by ID:', designId);
      const response = await apiClient.get(API_CONFIG.ENDPOINTS.DESIGNS.DESIGN_BY_ID(designId));
      console.log('✅ Design by ID response:', response.data);
      return response.data;
    } catch (error) {
      console.warn('⚠️ Get design by ID failed:', error);
      
      if (!this.isRouteNotFoundError(error)) throw error;
      
      // Fallback: Search in localStorage
      const savedDesigns = JSON.parse(localStorage.getItem('speedcopy_saved_designs') || '[]');
      const design = savedDesigns.find((d: SavedDesign) => d._id === designId);
      
      if (design) {
        return this.wrapSuccess(design);
      }
      
      throw new Error('Design not found');
    }
  }

  /**
   * 8. Update Design
   * PUT /api/designs/{id}
   */
  async updateDesign(designId: string, data: UpdateDesignData): Promise<{ success: boolean; data: SavedDesign; message: string }> {
    try {
      console.log('✏️ Updating design:', designId, { ...data, canvasJson: '[Canvas JSON]' });
      const response = await apiClient.put(API_CONFIG.ENDPOINTS.DESIGNS.UPDATE_DESIGN(designId), data);
      console.log('✅ Design updated:', response.data);
      return response.data;
    } catch (error) {
      console.warn('⚠️ Design update failed:', error);
      
      if (!this.isRouteNotFoundError(error)) throw error;
      
      // Fallback: Update in localStorage
      const savedDesigns = JSON.parse(localStorage.getItem('speedcopy_saved_designs') || '[]');
      const designIndex = savedDesigns.findIndex((d: SavedDesign) => d._id === designId);
      
      if (designIndex !== -1) {
        savedDesigns[designIndex] = {
          ...savedDesigns[designIndex],
          ...data,
          updatedAt: new Date().toISOString()
        };
        localStorage.setItem('speedcopy_saved_designs', JSON.stringify(savedDesigns));
        
        return {
          success: true,
          data: savedDesigns[designIndex],
          message: 'Design updated locally (offline mode)'
        };
      }
      
      throw new Error('Design not found for update');
    }
  }

  /**
   * 9. Approve Design
   * PATCH /api/designs/{id}/approve
   */
  async markDesignApproved(designId: string, orderId?: string): Promise<{ success: boolean; data: SavedDesign; message: string }> {
    try {
      console.log('✅ Approving design:', designId, 'for order:', orderId);
      const response = await apiClient.patch(API_CONFIG.ENDPOINTS.DESIGNS.APPROVE_DESIGN(designId), { orderId });
      console.log('✅ Design approved:', response.data);
      return response.data;
    } catch (error) {
      console.warn('⚠️ Design approval failed:', error);
      
      if (!this.isRouteNotFoundError(error)) throw error;
      
      // Fallback: Mark as approved in localStorage
      const savedDesigns = JSON.parse(localStorage.getItem('speedcopy_saved_designs') || '[]');
      const designIndex = savedDesigns.findIndex((d: SavedDesign) => d._id === designId);
      
      if (designIndex !== -1) {
        savedDesigns[designIndex] = {
          ...savedDesigns[designIndex],
          isFinalized: true,
          lastApprovedOrderId: orderId,
          updatedAt: new Date().toISOString()
        };
        localStorage.setItem('speedcopy_saved_designs', JSON.stringify(savedDesigns));
        
        return {
          success: true,
          data: savedDesigns[designIndex],
          message: 'Design approved locally (offline mode)'
        };
      }
      
      throw new Error('Design not found for approval');
    }
  }

  // Additional utility methods for backward compatibility
  async getProductFrames(productId: string): Promise<{ success: boolean; data: Frame[] }> {
    try {
      const response = await apiClient.get(`/api/designs/product/${productId}/frames`);
      return response.data;
    } catch (error) {
      console.warn('Product frames API not available, using fallback');
      return this.wrapSuccess([]);
    }
  }

  async loadProductFrames(productId: string): Promise<Frame[]> {
    try {
      const response = await this.getProductFrames(productId);
      return response.data || [];
    } catch (error) {
      console.error('Failed to load product frames:', error);
      return [];
    }
  }

  // Utility methods for premium design workflow
  async isPremiumTemplate(templateId: string): Promise<boolean> {
    try {
      const templates = await this.getPremiumTemplates();
      return templates.data.some(t => t._id === templateId);
    } catch (error) {
      console.warn('Could not verify premium template status:', error);
      return false;
    }
  }

  async getTemplatesByCategory(category: string, isPremium?: boolean): Promise<DesignTemplate[]> {
    try {
      const response = await this.getTemplates({ category, isPremium });
      return response.data;
    } catch (error) {
      console.error('Failed to get templates by category:', error);
      return [];
    }
  }

  async getTemplatesByProduct(productId: string, isPremium?: boolean): Promise<DesignTemplate[]> {
    try {
      const response = await this.getTemplates({ productId, isPremium });
      return response.data;
    } catch (error) {
      console.error('Failed to get templates by product:', error);
      return [];
    }
  }
}

export default new DesignService();
