import React, { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import authService, { type LoginData, type RegisterData } from '../services/auth.service';

interface User {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  role: string;
  isActive: boolean;
  avatar?: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (data: LoginData) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  sendPhoneOtp: (phone: string) => Promise<void>;
  verifyPhoneOtp: (phone: string, otp: string) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Initialize auth state from localStorage
  useEffect(() => {
    const initAuth = async () => {
      const storedUser = authService.getCurrentUser();
      if (storedUser) {
        setUser(storedUser);
      }
      setIsLoading(false);
    };

    initAuth();
  }, []);

  // Listen for global 401s from apiClient and logout without redirect.
  useEffect(() => {
    const onUnauthorized = () => {
      localStorage.removeItem('auth_token');
      localStorage.removeItem('user');
      setUser(null);
    };

    window.addEventListener('auth:unauthorized', onUnauthorized);
    return () => window.removeEventListener('auth:unauthorized', onUnauthorized);
  }, []);

  const login = async (data: LoginData) => {
    try {
      const response = await authService.login(data);
      setUser(response.data.user);
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    }
  };

  const register = async (data: RegisterData) => {
    try {
      const response = await authService.register(data);
      setUser(response.data.user);
    } catch (error) {
      console.error('Registration failed:', error);
      throw error;
    }
  };

  const sendPhoneOtp = async (phone: string) => {
    try {
      await authService.sendPhoneOtp(phone);
    } catch (error) {
      console.error('Send OTP failed:', error);
      throw error;
    }
  };

  const verifyPhoneOtp = async (phone: string, otp: string) => {
    try {
      const response = await authService.verifyPhoneOtp(phone, otp);
      setUser(response.data.user);
    } catch (error) {
      console.error('Verify OTP failed:', error);
      throw error;
    }
  };

  const logout = () => {
    authService.logout();
    setUser(null);
  };

  const refreshUser = async () => {
    try {
      console.log('AuthContext: Starting refreshUser...');
      
      // Get user from localStorage (already saved by LoginModal)
      const storedUser = authService.getCurrentUser();
      console.log('AuthContext: Stored user from localStorage:', storedUser);
      
      if (storedUser) {
        console.log('AuthContext: Setting user from localStorage:', storedUser.name);
        setUser(storedUser);
        return;
      }
      
      console.log('AuthContext: No stored user, skipping API call');
    } catch (error) {
      console.error('AuthContext: Failed to refresh user:', error);
    }
  };

  const value = {
    user,
    isAuthenticated: !!user,
    isLoading,
    login,
    register,
    sendPhoneOtp,
    verifyPhoneOtp,
    logout,
    refreshUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
