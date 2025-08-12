import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { API_CONFIG, apiGet, getAuthHeaders } from '../config/api';

interface AuthState {
  isAuthenticated: boolean;
  adminId: number | null;
  token: string | null;
  isLoading: boolean;
}

interface AuthContextType {
  auth: AuthState;
  login: (token: string, adminId: number) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [auth, setAuth] = useState<AuthState>({
    isAuthenticated: false,
    adminId: null,
    token: null,
    isLoading: true
  });

  useEffect(() => {
    const validateStoredToken = async () => {
      const token = localStorage.getItem('adminToken');
      const adminId = localStorage.getItem('adminId');
      
      if (token && adminId) {
        try {
          // Validate token with backend
          const response = await apiGet(API_CONFIG.ENDPOINTS.VALIDATE_TOKEN, {
            headers: getAuthHeaders(token)
          });

          if (response.ok) {
            // Token is valid
            setAuth({
              isAuthenticated: true,
              adminId: parseInt(adminId),
              token,
              isLoading: false
            });
          } else {
            // Token is invalid or expired
            console.log('Stored token is invalid or expired');
            localStorage.removeItem('adminToken');
            localStorage.removeItem('adminId');
            setAuth({
              isAuthenticated: false,
              adminId: null,
              token: null,
              isLoading: false
            });
          }
        } catch (error) {
          console.error('Error validating token:', error);
          // Network error - remove stored token to be safe
          localStorage.removeItem('adminToken');
          localStorage.removeItem('adminId');
          setAuth({
            isAuthenticated: false,
            adminId: null,
            token: null,
            isLoading: false
          });
        }
      } else {
        // No stored token, set loading to false
        setAuth(prev => ({ ...prev, isLoading: false }));
      }
    };

    validateStoredToken();
  }, []);

  const login = (token: string, adminId: number) => {
    localStorage.setItem('adminToken', token);
    localStorage.setItem('adminId', adminId.toString());
    setAuth({
      isAuthenticated: true,
      adminId,
      token,
      isLoading: false
    });
  };

  const logout = () => {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminId');
    setAuth({
      isAuthenticated: false,
      adminId: null,
      token: null,
      isLoading: false
    });
  };

  return (
    <AuthContext.Provider value={{ auth, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}