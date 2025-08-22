import React, { createContext, useContext, useEffect, useState, ReactNode, useCallback } from 'react';
import { authAPI } from '@/services/api';
import { userAPI } from '@/services/api';

interface User {
  id: string;
  email: string;
  fullName: string;
  role: 'owner' | 'student' | 'admin';
  profile?: any;
  business?: any;
  settings?: any;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  error: string | null;
  login: (email: string, password: string, userType?: string) => Promise<void>;
  register: (userData: any) => Promise<void>;
  ownerRegister: (ownerData: any) => Promise<void>;
  studentRegister: (studentData: any) => Promise<void>;
  logout: () => void;
  clearError: () => void;
  updateUser: (userData: Partial<User>) => Promise<any>;
  refreshUserProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Check for existing token on mount
  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');
    
    if (storedToken && storedUser) {
      setToken(storedToken);
      setUser(JSON.parse(storedUser));
    }
    
    setLoading(false);
  }, []);

  const login = async (email: string, password: string, userType?: string) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await authAPI.login({ email, password, userType });
      
      setToken(response.token);
      setUser(response.user);
      
      localStorage.setItem('token', response.token);
      localStorage.setItem('user', JSON.stringify(response.user));
      
      // Return the redirect path for the calling component to handle
      return response.redirectTo || (response.user.role === 'student' ? '/student-dashboard' : '/owner-dashboard');
      
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const register = async (userData: any) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await authAPI.register(userData);
      
      setToken(response.token);
      setUser(response.user);
      
      localStorage.setItem('token', response.token);
      localStorage.setItem('user', JSON.stringify(response.user));
      
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const ownerRegister = async (ownerData: any) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await authAPI.ownerRegister(ownerData);
      
      setToken(response.token);
      setUser(response.user);
      
      localStorage.setItem('token', response.token);
      localStorage.setItem('user', JSON.stringify(response.user));
      
      // Return the redirect path
      return response.redirectTo || '/owner-dashboard';
      
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const studentRegister = async (studentData: any) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await authAPI.studentRegister(studentData);
      
      setToken(response.token);
      setUser(response.user);
      
      localStorage.setItem('token', response.token);
      localStorage.setItem('user', JSON.stringify(response.user));
      
      // Return the redirect path
      return response.redirectTo || '/student-dashboard';
      
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  };

  const clearError = () => {
    setError(null);
  };

  // Enhanced updateUser function that calls the backend
  const updateUser = async (userData: Partial<User>) => {
    if (!user || !token) return;
    
    try {
      const response = await userAPI.updateProfile(userData);
      
      // Update local state
      const updatedUser = { ...user, ...response.data };
      setUser(updatedUser);
      localStorage.setItem('user', JSON.stringify(updatedUser));
      
      return response;
    } catch (error) {
      console.error('Error updating user profile:', error);
      throw error;
    }
  };

  // New function to refresh user profile from backend
  const refreshUserProfile = useCallback(async () => {
    if (!token) return;
    
    try {
      const response = await userAPI.getProfile();
      setUser(response.data);
      localStorage.setItem('user', JSON.stringify(response.data));
    } catch (error) {
      console.error('Error refreshing user profile:', error);
      // If token is invalid, logout user
      if (error.response?.status === 401) {
        logout();
      }
    }
  }, [token]);

  const value: AuthContextType = {
    user,
    token,
    loading,
    error,
    login,
    register,
    ownerRegister,
    studentRegister,
    logout,
    clearError,
    updateUser,
    refreshUserProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
