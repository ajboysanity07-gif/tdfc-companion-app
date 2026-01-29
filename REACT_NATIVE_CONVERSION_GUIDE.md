# React Native Conversion Guide for TDFC Application

**Date:** January 28, 2026
**Application:** TDFC Loan Management System
**Target Platform:** iOS & Android using React Native with Expo

---

## Table of Contents

1. [Fundamentals](#fundamentals)
2. [Architecture Overview](#architecture-overview)
3. [Step-by-Step Implementation Guide](#step-by-step-implementation-guide)
4. [Key Differences from Web](#key-differences-from-web)
5. [Authentication & Security](#authentication--security)
6. [Data Management](#data-management)
7. [UI/UX Considerations](#uiux-considerations)
8. [Testing & Deployment](#testing--deployment)

---

## Fundamentals

### What is React Native?

React Native is a framework for building native mobile applications using JavaScript and React. Unlike web apps that run in a browser, React Native apps compile to native code for iOS and Android, providing:

- **Native Performance:** Direct access to device APIs (camera, location, sensors, etc.)
- **Code Reuse:** Share business logic between iOS and Android
- **Faster Development:** Hot reloading, faster iteration
- **Platform Flexibility:** Platform-specific code when needed

### Why React Native for TDFC?

Your current stack uses React 18 + TypeScript, making React Native an ideal choice because:
- Leverage existing React expertise
- Share 70-80% of business logic code
- Reuse component patterns and state management
- TypeScript support for type safety
- Significant development efficiency

### Key Limitations vs Web

| Feature | Web (Current) | React Native |
|---------|---------------|--------------|
| Direct DOM Access | ✅ Yes | ❌ No - Uses Native components |
| CSS/Tailwind | ✅ Full support | ⚠️ StyleSheet (CSS-in-JS) |
| File System | Limited | ✅ Full access |
| Camera/Biometric | Plugin required | ✅ Native support |
| Background Tasks | ⚠️ Limited | ✅ Full support |
| Web Views | N/A | ⚠️ WebView available |
| Performance | Browser-dependent | ✅ Near-native performance |

---

## Architecture Overview

### Current Web Architecture

```
Web Client (React + TypeScript)
         ↓
    Inertia.js
         ↓
    Laravel Backend (Repository-Service Pattern)
         ↓
    Database (MySQL/MSSQL)
```

### React Native Architecture

```
Mobile Client (React Native + TypeScript)
         ↓
    REST API / GraphQL
         ↓
    Existing Laravel Backend
         ↓
    Database (MySQL/MSSQL)
```

### Key Architectural Decisions

1. **Shared Backend:** Keep your existing Laravel API unchanged
2. **New API Layer:** Create/extend REST endpoints for mobile needs
3. **Cross-Platform Code:** Share business logic, UI is platform-specific
4. **State Management:** Use React Context or Redux (same as web)
5. **Authentication:** Use existing Laravel Sanctum with mobile tokens

---

## Step-by-Step Implementation Guide

### Phase 1: Project Setup (Week 1)

#### Step 1.1: Initialize React Native Project

```bash
# Option 1: Using Expo (Recommended for fastest development)
npx create-expo-app@latest TDFCapp-mobile --template

# Option 2: Using React Native CLI (More control)
npx react-native@latest init TDFCapp-mobile --template react-native-template-typescript
```

**Choose Expo if:**
- You need rapid prototyping
- Don't require custom native modules initially
- Want to test on physical devices easily
- Need over-the-air updates capability

**Choose React Native CLI if:**
- You need deep native integration
- Plan to use many native packages
- Have iOS/Android build expertise

**Recommendation:** Start with Expo, migrate to bare workflow if needed.

#### Step 1.2: Install Core Dependencies

```bash
cd TDFCapp-mobile
npm install

# HTTP Client
npm install axios
npm install react-native-netinfo

# State Management
npm install @react-navigation/native @react-navigation/bottom-tabs @react-navigation/stack
npm install react-native-screens react-native-safe-area-context react-native-gesture-handler

# Storage (for tokens, cache)
npm install @react-native-async-storage/async-storage

# Type checking
npm install --save-dev typescript @types/react @types/react-native

# Utilities
npm install dayjs lodash
npm install --save-dev @types/lodash

# UI Components (Choose one or combine):
# Option A: React Native Paper (Material Design)
npm install react-native-paper

# Option B: React Native Elements
npm install react-native-elements react-native-vector-icons

# Option C: NativeWind (Tailwind for RN)
npm install nativewind tailwindcss

# Biometric Authentication
npm install expo-local-authentication

# Camera (if needed for photo uploads)
npm install expo-camera expo-image-picker

# Push Notifications (optional)
npm install expo-notifications
```

#### Step 1.3: Project Structure

Create the following folder structure:

```
TDFCapp-mobile/
├── src/
│   ├── api/                          # API client configuration
│   │   ├── client.ts                 # Axios instance
│   │   ├── endpoints.ts              # API endpoint definitions
│   │   └── interceptors.ts           # Request/response interceptors
│   │
│   ├── services/                     # Business logic services (shared with web)
│   │   ├── authService.ts
│   │   ├── loanService.ts
│   │   ├── clientService.ts
│   │   ├── productService.ts
│   │   └── dashboardService.ts
│   │
│   ├── hooks/                        # Custom React hooks
│   │   ├── useAuth.ts
│   │   ├── useApi.ts
│   │   ├── useForm.ts
│   │   └── useLocalStorage.ts
│   │
│   ├── context/                      # React Context for state
│   │   ├── AuthContext.tsx
│   │   ├── AppContext.tsx
│   │   └── AppProvider.tsx
│   │
│   ├── screens/                      # Screen components
│   │   ├── Auth/
│   │   │   ├── LoginScreen.tsx
│   │   │   ├── RegisterScreen.tsx
│   │   │   └── BiometricScreen.tsx
│   │   │
│   │   ├── Admin/
│   │   │   ├── DashboardScreen.tsx
│   │   │   ├── ClientManagementScreen.tsx
│   │   │   ├── ProductManagementScreen.tsx
│   │   │   └── LoansApprovalScreen.tsx
│   │   │
│   │   ├── Client/
│   │   │   ├── DashboardScreen.tsx
│   │   │   ├── MyLoansScreen.tsx
│   │   │   ├── ApplyLoanScreen.tsx
│   │   │   ├── TransactionsScreen.tsx
│   │   │   └── ProfileScreen.tsx
│   │   │
│   │   ├── Common/
│   │   │   ├── SplashScreen.tsx
│   │   │   ├── LoadingScreen.tsx
│   │   │   └── ErrorScreen.tsx
│   │   │
│   │   └── Settings/
│   │       └── SettingsScreen.tsx
│   │
│   ├── components/                   # Reusable UI components
│   │   ├── Button/
│   │   │   └── Button.tsx
│   │   │
│   │   ├── Input/
│   │   │   ├── TextInput.tsx
│   │   │   ├── DatePicker.tsx
│   │   │   └── SelectPicker.tsx
│   │   │
│   │   ├── Card/
│   │   │   ├── Card.tsx
│   │   │   └── LoanCard.tsx
│   │   │
│   │   ├── Header/
│   │   │   ├── Header.tsx
│   │   │   └── TabBar.tsx
│   │   │
│   │   ├── List/
│   │   │   ├── FlatList.tsx
│   │   │   ├── TransactionList.tsx
│   │   │   └── ClientList.tsx
│   │   │
│   │   └── Modal/
│   │       ├── ConfirmModal.tsx
│   │       └── BottomSheet.tsx
│   │
│   ├── types/                        # TypeScript types (shared with web)
│   │   ├── auth.ts
│   │   ├── loan.ts
│   │   ├── client.ts
│   │   ├── user.ts
│   │   ├── transaction.ts
│   │   └── api.ts
│   │
│   ├── utils/                        # Utility functions
│   │   ├── formatting.ts             # Date, currency formatting
│   │   ├── validation.ts             # Form validation
│   │   ├── errorHandling.ts
│   │   ├── storage.ts
│   │   └── permissions.ts
│   │
│   ├── config/                       # Configuration
│   │   ├── constants.ts
│   │   ├── api.config.ts
│   │   └── theme.ts
│   │
│   ├── App.tsx                       # Main app component
│   └── index.ts                      # App entry point
│
├── app.json                          # Expo/RN configuration
├── package.json
├── tsconfig.json
├── .env.example
└── .env (git ignored)
```

#### Step 1.4: Configure TypeScript

Update `tsconfig.json`:

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "useDefineForClassFields": true,
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,
    "esModuleInterop": true,
    "allowSyntheticDefaultImports": true,

    /* Bundler mode */
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx",

    /* Path aliases */
    "baseUrl": ".",
    "paths": {
      "@/*": ["src/*"],
      "@components/*": ["src/components/*"],
      "@screens/*": ["src/screens/*"],
      "@services/*": ["src/services/*"],
      "@hooks/*": ["src/hooks/*"],
      "@types/*": ["src/types/*"],
      "@utils/*": ["src/utils/*"]
    }
  }
}
```

#### Step 1.5: Environment Configuration

Create `.env.example`:

```
# API Configuration
EXPO_PUBLIC_API_URL=http://localhost:8000
EXPO_PUBLIC_API_TIMEOUT=30000

# Feature Flags
EXPO_PUBLIC_ENABLE_BIOMETRIC=true
EXPO_PUBLIC_ENABLE_OFFLINE_MODE=false

# Debug
EXPO_PUBLIC_DEBUG_MODE=false
```

Create `.env` (actual configuration):

```
EXPO_PUBLIC_API_URL=https://your-production-api.com
EXPO_PUBLIC_API_TIMEOUT=30000
EXPO_PUBLIC_ENABLE_BIOMETRIC=true
EXPO_PUBLIC_ENABLE_OFFLINE_MODE=false
EXPO_PUBLIC_DEBUG_MODE=false
```

---

### Phase 2: API Integration (Week 1-2)

#### Step 2.1: Configure Axios Client

**File:** `src/api/client.ts`

```typescript
import axios, { AxiosInstance, InternalAxiosRequestConfig } from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Create axios instance
const apiClient: AxiosInstance = axios.create({
  baseURL: process.env.EXPO_PUBLIC_API_URL,
  timeout: parseInt(process.env.EXPO_PUBLIC_API_TIMEOUT || '30000'),
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

// Request interceptor - add auth token
apiClient.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    try {
      const token = await AsyncStorage.getItem('auth_token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (error) {
      console.error('Error retrieving auth token:', error);
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor - handle errors
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Handle 401 Unauthorized
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      try {
        // Attempt to refresh token
        const refreshToken = await AsyncStorage.getItem('refresh_token');
        if (refreshToken) {
          const response = await axios.post(
            `${process.env.EXPO_PUBLIC_API_URL}/api/auth/refresh`,
            { refresh_token: refreshToken }
          );
          
          const { access_token } = response.data;
          await AsyncStorage.setItem('auth_token', access_token);
          
          // Retry original request
          return apiClient(originalRequest);
        }
      } catch (refreshError) {
        // Refresh failed - user needs to login again
        await AsyncStorage.removeItem('auth_token');
        await AsyncStorage.removeItem('refresh_token');
        // Dispatch logout action (handle in navigation)
      }
    }

    return Promise.reject(error);
  }
);

export default apiClient;
```

#### Step 2.2: Define API Endpoints

**File:** `src/api/endpoints.ts`

```typescript
export const API_ENDPOINTS = {
  // Authentication
  AUTH: {
    LOGIN: '/api/auth/login',
    LOGOUT: '/api/auth/logout',
    REGISTER: '/api/auth/register',
    REFRESH: '/api/auth/refresh',
    ME: '/api/auth/me',
    VERIFY_OTP: '/api/auth/verify-otp',
  },

  // Admin APIs
  ADMIN: {
    DASHBOARD: '/api/admin/dashboard',
    CLIENTS: {
      LIST: '/api/admin/clients',
      SHOW: (id: string) => `/api/admin/clients/${id}`,
      UPDATE: (id: string) => `/api/admin/clients/${id}`,
      DELETE: (id: string) => `/api/admin/clients/${id}`,
    },
    LOANS: {
      LIST: '/api/admin/loans',
      PENDING_APPROVAL: '/api/admin/loans/pending-approval',
      APPROVE: (id: string) => `/api/admin/loans/${id}/approve`,
      REJECT: (id: string) => `/api/admin/loans/${id}/reject`,
      SHOW: (id: string) => `/api/admin/loans/${id}`,
    },
    PRODUCTS: {
      LIST: '/api/admin/products',
      CREATE: '/api/admin/products',
      UPDATE: (id: string) => `/api/admin/products/${id}`,
      DELETE: (id: string) => `/api/admin/products/${id}`,
    },
    REPORTS: {
      SUMMARY: '/api/admin/reports/summary',
      DETAILED: '/api/admin/reports/detailed',
      EXPORT: '/api/admin/reports/export',
    },
  },

  // Client APIs
  CLIENT: {
    DASHBOARD: '/api/client/dashboard',
    LOANS: {
      LIST: '/api/client/loans',
      SHOW: (id: string) => `/api/client/loans/${id}`,
      APPLY: '/api/client/loans/apply',
    },
    APPLICATIONS: {
      LIST: '/api/client/applications',
      SHOW: (id: string) => `/api/client/applications/${id}`,
    },
    TRANSACTIONS: {
      LIST: '/api/client/transactions',
      SHOW: (id: string) => `/api/client/transactions/${id}`,
      DOWNLOAD_STATEMENT: '/api/client/transactions/statement',
    },
    PROFILE: {
      GET: '/api/client/profile',
      UPDATE: '/api/client/profile',
      CHANGE_PASSWORD: '/api/client/change-password',
      UPLOAD_DOCUMENT: '/api/client/upload-document',
    },
  },

  // User APIs
  USER: {
    PROFILE: '/api/user/profile',
    UPDATE_PROFILE: '/api/user/profile/update',
    PREFERENCES: '/api/user/preferences',
    NOTIFICATIONS: '/api/user/notifications',
  },
};
```

#### Step 2.3: Create API Service Functions

**File:** `src/api/service.ts`

```typescript
import apiClient from './client';
import { API_ENDPOINTS } from './endpoints';

// Auth Service
export const authApi = {
  login: (email: string, password: string) =>
    apiClient.post(API_ENDPOINTS.AUTH.LOGIN, { email, password }),

  logout: () =>
    apiClient.post(API_ENDPOINTS.AUTH.LOGOUT),

  register: (data: any) =>
    apiClient.post(API_ENDPOINTS.AUTH.REGISTER, data),

  refreshToken: (refreshToken: string) =>
    apiClient.post(API_ENDPOINTS.AUTH.REFRESH, { refresh_token: refreshToken }),

  getCurrentUser: () =>
    apiClient.get(API_ENDPOINTS.AUTH.ME),

  verifyOtp: (email: string, otp: string) =>
    apiClient.post(API_ENDPOINTS.AUTH.VERIFY_OTP, { email, otp }),
};

// Admin Service
export const adminApi = {
  getDashboard: () =>
    apiClient.get(API_ENDPOINTS.ADMIN.DASHBOARD),

  getClients: (params?: any) =>
    apiClient.get(API_ENDPOINTS.ADMIN.CLIENTS.LIST, { params }),

  getClient: (id: string) =>
    apiClient.get(API_ENDPOINTS.ADMIN.CLIENTS.SHOW(id)),

  updateClient: (id: string, data: any) =>
    apiClient.put(API_ENDPOINTS.ADMIN.CLIENTS.UPDATE(id), data),

  getPendingLoans: (params?: any) =>
    apiClient.get(API_ENDPOINTS.ADMIN.LOANS.PENDING_APPROVAL, { params }),

  approveLoan: (id: string, data: any) =>
    apiClient.post(API_ENDPOINTS.ADMIN.LOANS.APPROVE(id), data),

  rejectLoan: (id: string, data: any) =>
    apiClient.post(API_ENDPOINTS.ADMIN.LOANS.REJECT(id), data),

  getProducts: () =>
    apiClient.get(API_ENDPOINTS.ADMIN.PRODUCTS.LIST),

  createProduct: (data: any) =>
    apiClient.post(API_ENDPOINTS.ADMIN.PRODUCTS.CREATE, data),

  updateProduct: (id: string, data: any) =>
    apiClient.put(API_ENDPOINTS.ADMIN.PRODUCTS.UPDATE(id), data),

  deleteProduct: (id: string) =>
    apiClient.delete(API_ENDPOINTS.ADMIN.PRODUCTS.DELETE(id)),

  getReports: (type: 'summary' | 'detailed') =>
    apiClient.get(
      type === 'summary'
        ? API_ENDPOINTS.ADMIN.REPORTS.SUMMARY
        : API_ENDPOINTS.ADMIN.REPORTS.DETAILED
    ),
};

// Client Service
export const clientApi = {
  getDashboard: () =>
    apiClient.get(API_ENDPOINTS.CLIENT.DASHBOARD),

  getLoans: (params?: any) =>
    apiClient.get(API_ENDPOINTS.CLIENT.LOANS.LIST, { params }),

  getLoan: (id: string) =>
    apiClient.get(API_ENDPOINTS.CLIENT.LOANS.SHOW(id)),

  applyLoan: (data: any) =>
    apiClient.post(API_ENDPOINTS.CLIENT.LOANS.APPLY, data),

  getApplications: (params?: any) =>
    apiClient.get(API_ENDPOINTS.CLIENT.APPLICATIONS.LIST, { params }),

  getApplication: (id: string) =>
    apiClient.get(API_ENDPOINTS.CLIENT.APPLICATIONS.SHOW(id)),

  getTransactions: (params?: any) =>
    apiClient.get(API_ENDPOINTS.CLIENT.TRANSACTIONS.LIST, { params }),

  getTransaction: (id: string) =>
    apiClient.get(API_ENDPOINTS.CLIENT.TRANSACTIONS.SHOW(id)),

  downloadStatement: (params?: any) =>
    apiClient.get(API_ENDPOINTS.CLIENT.TRANSACTIONS.DOWNLOAD_STATEMENT, {
      params,
      responseType: 'blob',
    }),

  getProfile: () =>
    apiClient.get(API_ENDPOINTS.CLIENT.PROFILE.GET),

  updateProfile: (data: any) =>
    apiClient.put(API_ENDPOINTS.CLIENT.PROFILE.UPDATE, data),

  changePassword: (currentPassword: string, newPassword: string) =>
    apiClient.post(API_ENDPOINTS.CLIENT.PROFILE.CHANGE_PASSWORD, {
      current_password: currentPassword,
      new_password: newPassword,
    }),

  uploadDocument: (formData: FormData) =>
    apiClient.post(API_ENDPOINTS.CLIENT.PROFILE.UPLOAD_DOCUMENT, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
};

// User Service
export const userApi = {
  getProfile: () =>
    apiClient.get(API_ENDPOINTS.USER.PROFILE),

  updateProfile: (data: any) =>
    apiClient.put(API_ENDPOINTS.USER.UPDATE_PROFILE, data),

  getPreferences: () =>
    apiClient.get(API_ENDPOINTS.USER.PREFERENCES),

  updatePreferences: (data: any) =>
    apiClient.put(API_ENDPOINTS.USER.PREFERENCES, data),

  getNotifications: () =>
    apiClient.get(API_ENDPOINTS.USER.NOTIFICATIONS),
};
```

---

### Phase 3: Authentication & State Management (Week 2)

#### Step 3.1: Create Authentication Context

**File:** `src/context/AuthContext.tsx`

```typescript
import React, { createContext, useState, useCallback, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as LocalAuthentication from 'expo-local-authentication';
import { authApi } from '@/api/service';

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'client' | 'user';
  avatar?: string;
}

export interface AuthContextType {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isBiometricAvailable: boolean;
  
  login: (email: string, password: string) => Promise<void>;
  loginWithBiometric: () => Promise<void>;
  register: (data: any) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
  enableBiometric: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isBiometricAvailable, setIsBiometricAvailable] = useState(false);

  // Check biometric availability
  useEffect(() => {
    checkBiometricAvailability();
    bootstrapAsync();
  }, []);

  const checkBiometricAvailability = async () => {
    try {
      if (process.env.EXPO_PUBLIC_ENABLE_BIOMETRIC !== 'true') {
        setIsBiometricAvailable(false);
        return;
      }

      const available = await LocalAuthentication.hasHardwareAsync();
      const enrolled = await LocalAuthentication.isEnrolledAsync();
      setIsBiometricAvailable(available && enrolled);
    } catch (error) {
      console.error('Error checking biometric:', error);
      setIsBiometricAvailable(false);
    }
  };

  const bootstrapAsync = async () => {
    try {
      setIsLoading(true);
      
      const token = await AsyncStorage.getItem('auth_token');
      if (token) {
        // Verify token is still valid
        const response = await authApi.getCurrentUser();
        setUser(response.data.user);
      }
    } catch (error) {
      console.error('Error during bootstrap:', error);
      // Clear invalid token
      await AsyncStorage.removeItem('auth_token');
    } finally {
      setIsLoading(false);
    }
  };

  const login = useCallback(async (email: string, password: string) => {
    try {
      setIsLoading(true);
      const response = await authApi.login(email, password);
      
      const { access_token, refresh_token, user: userData } = response.data;
      
      await AsyncStorage.setItem('auth_token', access_token);
      await AsyncStorage.setItem('refresh_token', refresh_token);
      setUser(userData);
    } catch (error: any) {
      const message = error.response?.data?.message || 'Login failed';
      throw new Error(message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const loginWithBiometric = useCallback(async () => {
    try {
      setIsLoading(true);
      
      // Authenticate with biometric
      const result = await LocalAuthentication.authenticateAsync({
        disableDeviceFallback: false,
        reason: 'Unlock TDFC Application',
      });

      if (!result.success) {
        throw new Error('Biometric authentication failed');
      }

      // Retrieve stored credentials or refresh token
      const storedCredentials = await AsyncStorage.getItem('biometric_credentials');
      if (storedCredentials) {
        const { email, password } = JSON.parse(storedCredentials);
        await login(email, password);
      } else {
        // Use refresh token if available
        const refreshToken = await AsyncStorage.getItem('refresh_token');
        if (refreshToken) {
          const response = await authApi.refreshToken(refreshToken);
          const { access_token, user: userData } = response.data;
          
          await AsyncStorage.setItem('auth_token', access_token);
          setUser(userData);
        } else {
          throw new Error('No credentials found for biometric login');
        }
      }
    } catch (error: any) {
      throw new Error(error.message || 'Biometric login failed');
    } finally {
      setIsLoading(false);
    }
  }, [login]);

  const register = useCallback(async (data: any) => {
    try {
      setIsLoading(true);
      const response = await authApi.register(data);
      
      const { access_token, refresh_token, user: userData } = response.data;
      
      await AsyncStorage.setItem('auth_token', access_token);
      await AsyncStorage.setItem('refresh_token', refresh_token);
      setUser(userData);
    } catch (error: any) {
      const message = error.response?.data?.message || 'Registration failed';
      throw new Error(message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      setIsLoading(true);
      await authApi.logout();
      
      await AsyncStorage.removeItem('auth_token');
      await AsyncStorage.removeItem('refresh_token');
      await AsyncStorage.removeItem('biometric_credentials');
      setUser(null);
    } catch (error) {
      console.error('Logout error:', error);
      // Still clear local state even if API call fails
      await AsyncStorage.removeItem('auth_token');
      await AsyncStorage.removeItem('refresh_token');
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const refreshUser = useCallback(async () => {
    try {
      const response = await authApi.getCurrentUser();
      setUser(response.data.user);
    } catch (error) {
      console.error('Error refreshing user:', error);
      throw error;
    }
  }, []);

  const enableBiometric = useCallback(async () => {
    try {
      const result = await LocalAuthentication.authenticateAsync({
        disableDeviceFallback: false,
        reason: 'Enable biometric login',
      });

      if (!result.success) {
        throw new Error('Biometric setup failed');
      }

      // Store credentials (encrypted storage recommended)
      const email = user?.email;
      if (email) {
        await AsyncStorage.setItem(
          'biometric_enabled',
          'true'
        );
      }
    } catch (error: any) {
      throw new Error(error.message || 'Failed to enable biometric');
    }
  }, [user?.email]);

  const value: AuthContextType = {
    user,
    isAuthenticated: !!user,
    isLoading,
    isBiometricAvailable,
    login,
    loginWithBiometric,
    register,
    logout,
    refreshUser,
    enableBiometric,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
```

#### Step 3.2: Create Custom Auth Hook

**File:** `src/hooks/useAuth.ts`

```typescript
import { useContext } from 'react';
import { AuthContext, AuthContextType } from '@/context/AuthContext';

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  
  return context;
};
```

#### Step 3.3: Create Custom API Hook

**File:** `src/hooks/useApi.ts`

```typescript
import { useState, useCallback } from 'react';
import { AxiosError } from 'axios';

interface UseApiState<T> {
  data: T | null;
  loading: boolean;
  error: Error | null;
}

export function useApi<T>(
  apiFunction: (...args: any[]) => Promise<any>,
  executeOnMount = false
) {
  const [state, setState] = useState<UseApiState<T>>({
    data: null,
    loading: executeOnMount,
    error: null,
  });

  const execute = useCallback(
    async (...args: any[]) => {
      setState({ data: null, loading: true, error: null });
      try {
        const response = await apiFunction(...args);
        const data = response.data;
        setState({ data, loading: false, error: null });
        return data;
      } catch (error) {
        const err = error instanceof Error ? error : new Error('Unknown error');
        setState({ data: null, loading: false, error: err });
        throw err;
      }
    },
    [apiFunction]
  );

  // Execute on mount if specified
  const executeOnMountCallback = useCallback(async () => {
    setState({ data: null, loading: true, error: null });
    try {
      const response = await apiFunction();
      const data = response.data;
      setState({ data, loading: false, error: null });
      return data;
    } catch (error) {
      const err = error instanceof Error ? error : new Error('Unknown error');
      setState({ data: null, loading: false, error: err });
    }
  }, [apiFunction]);

  if (executeOnMount) {
    executeOnMountCallback();
  }

  return { ...state, execute };
}
```

---

### Phase 4: Navigation Setup (Week 2)

#### Step 4.1: Configure React Navigation

**File:** `src/navigation/RootNavigator.tsx`

```typescript
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { ActivityIndicator, View } from 'react-native';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';

import { useAuth } from '@/hooks/useAuth';

// Screens
import SplashScreen from '@/screens/Common/SplashScreen';
import LoginScreen from '@/screens/Auth/LoginScreen';
import RegisterScreen from '@/screens/Auth/RegisterScreen';

// Admin Screens
import AdminDashboardScreen from '@/screens/Admin/DashboardScreen';
import ClientManagementScreen from '@/screens/Admin/ClientManagementScreen';
import ProductManagementScreen from '@/screens/Admin/ProductManagementScreen';
import LoansApprovalScreen from '@/screens/Admin/LoansApprovalScreen';

// Client Screens
import ClientDashboardScreen from '@/screens/Client/DashboardScreen';
import MyLoansScreen from '@/screens/Client/MyLoansScreen';
import ApplyLoanScreen from '@/screens/Client/ApplyLoanScreen';
import TransactionsScreen from '@/screens/Client/TransactionsScreen';
import ClientProfileScreen from '@/screens/Client/ProfileScreen';

import SettingsScreen from '@/screens/Settings/SettingsScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

// Auth Navigation
const AuthNavigator = () => (
  <Stack.Navigator
    screenOptions={{
      headerShown: false,
      cardStyle: { backgroundColor: 'white' },
    }}
  >
    <Stack.Screen name="Login" component={LoginScreen} />
    <Stack.Screen name="Register" component={RegisterScreen} />
  </Stack.Navigator>
);

// Admin Navigation
const AdminNavigator = () => (
  <Tab.Navigator
    screenOptions={{
      tabBarActiveTintColor: '#2196F3',
      tabBarInactiveTintColor: '#999',
      headerShown: true,
    }}
  >
    <Tab.Screen
      name="AdminDashboard"
      component={AdminDashboardScreen}
      options={{
        title: 'Dashboard',
        tabBarIcon: ({ color, size }) => (
          <MaterialCommunityIcons name="home" size={size} color={color} />
        ),
      }}
    />
    <Tab.Screen
      name="Clients"
      component={ClientManagementScreen}
      options={{
        title: 'Clients',
        tabBarIcon: ({ color, size }) => (
          <MaterialCommunityIcons name="account-multiple" size={size} color={color} />
        ),
      }}
    />
    <Tab.Screen
      name="Products"
      component={ProductManagementScreen}
      options={{
        title: 'Products',
        tabBarIcon: ({ color, size }) => (
          <MaterialCommunityIcons name="shopping" size={size} color={color} />
        ),
      }}
    />
    <Tab.Screen
      name="Approvals"
      component={LoansApprovalScreen}
      options={{
        title: 'Approvals',
        tabBarIcon: ({ color, size }) => (
          <MaterialCommunityIcons name="check-circle" size={size} color={color} />
        ),
      }}
    />
    <Tab.Screen
      name="AdminSettings"
      component={SettingsScreen}
      options={{
        title: 'Settings',
        tabBarIcon: ({ color, size }) => (
          <MaterialCommunityIcons name="cog" size={size} color={color} />
        ),
      }}
    />
  </Tab.Navigator>
);

// Client Navigation
const ClientNavigator = () => (
  <Tab.Navigator
    screenOptions={{
      tabBarActiveTintColor: '#2196F3',
      tabBarInactiveTintColor: '#999',
      headerShown: true,
    }}
  >
    <Tab.Screen
      name="ClientDashboard"
      component={ClientDashboardScreen}
      options={{
        title: 'Dashboard',
        tabBarIcon: ({ color, size }) => (
          <MaterialCommunityIcons name="home" size={size} color={color} />
        ),
      }}
    />
    <Tab.Screen
      name="MyLoans"
      component={MyLoansScreen}
      options={{
        title: 'My Loans',
        tabBarIcon: ({ color, size }) => (
          <MaterialCommunityIcons name="credit" size={size} color={color} />
        ),
      }}
    />
    <Tab.Screen
      name="ApplyLoan"
      component={ApplyLoanScreen}
      options={{
        title: 'Apply Loan',
        tabBarIcon: ({ color, size }) => (
          <MaterialCommunityIcons name="plus-circle" size={size} color={color} />
        ),
      }}
    />
    <Tab.Screen
      name="Transactions"
      component={TransactionsScreen}
      options={{
        title: 'Transactions',
        tabBarIcon: ({ color, size }) => (
          <MaterialCommunityIcons name="history" size={size} color={color} />
        ),
      }}
    />
    <Tab.Screen
      name="ClientProfile"
      component={ClientProfileScreen}
      options={{
        title: 'Profile',
        tabBarIcon: ({ color, size }) => (
          <MaterialCommunityIcons name="account" size={size} color={color} />
        ),
      }}
    />
  </Tab.Navigator>
);

// Root Navigator
const RootNavigator = () => {
  const { isAuthenticated, isLoading, user } = useAuth();

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#2196F3" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {isAuthenticated ? (
          <>
            {user?.role === 'admin' ? (
              <Stack.Screen name="AdminApp" component={AdminNavigator} />
            ) : (
              <Stack.Screen name="ClientApp" component={ClientNavigator} />
            )}
            <Stack.Screen
              name="Settings"
              component={SettingsScreen}
              options={{
                presentation: 'modal',
              }}
            />
          </>
        ) : (
          <Stack.Screen name="Auth" component={AuthNavigator} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default RootNavigator;
```

---

### Phase 5: Screen Implementation (Week 3-4)

#### Step 5.1: Example - Login Screen

**File:** `src/screens/Auth/LoginScreen.tsx`

```typescript
import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ScrollView,
} from 'react-native';
import { useAuth } from '@/hooks/useAuth';
import Button from '@/components/Button/Button';
import TextInput from '@/components/Input/TextInput';

const LoginScreen: React.FC<any> = ({ navigation }) => {
  const { login, loginWithBiometric, isBiometricAvailable } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    try {
      setLoading(true);
      await login(email, password);
    } catch (error: any) {
      Alert.alert('Login Failed', error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleBiometricLogin = async () => {
    try {
      setLoading(true);
      await loginWithBiometric();
    } catch (error: any) {
      Alert.alert('Biometric Login Failed', error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={styles.title}>TDFC Loan Management</Text>
          <Text style={styles.subtitle}>Sign In</Text>
        </View>

        <View style={styles.form}>
          <TextInput
            placeholder="Email"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            editable={!loading}
          />

          <TextInput
            placeholder="Password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            editable={!loading}
          />

          <Button
            title="Sign In"
            onPress={handleLogin}
            loading={loading}
            style={styles.button}
          />

          {isBiometricAvailable && (
            <Button
              title="Sign In with Biometric"
              onPress={handleBiometricLogin}
              loading={loading}
              variant="outlined"
              style={styles.button}
            />
          )}

          <View style={styles.footer}>
            <Text style={styles.footerText}>Don't have an account? </Text>
            <Pressable
              onPress={() => navigation.navigate('Register')}
              disabled={loading}
            >
              <Text style={styles.link}>Register</Text>
            </Pressable>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 20,
  },
  header: {
    marginBottom: 40,
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginTop: 8,
  },
  form: {
    gap: 16,
  },
  button: {
    marginTop: 8,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 20,
  },
  footerText: {
    color: '#666',
  },
  link: {
    color: '#2196F3',
    fontWeight: '600',
  },
});

export default LoginScreen;
```

#### Step 5.2: Example - Dashboard Screen

**File:** `src/screens/Client/DashboardScreen.tsx`

```typescript
import React, { useEffect, useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useApi } from '@/hooks/useApi';
import { clientApi } from '@/api/service';

const ClientDashboardScreen: React.FC = () => {
  const { data: dashboard, loading, error, execute } = useApi(
    clientApi.getDashboard,
    true
  );

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#2196F3" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>{error.message}</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.greeting}>Welcome back!</Text>
        <Text style={styles.name}>{dashboard?.user?.name}</Text>
      </View>

      <View style={styles.statsContainer}>
        <StatCard
          title="Total Loans"
          value={dashboard?.total_loans}
          icon="credit"
        />
        <StatCard
          title="Active Loans"
          value={dashboard?.active_loans}
          icon="check-circle"
        />
        <StatCard
          title="Pending Approvals"
          value={dashboard?.pending_approvals}
          icon="clock"
        />
        <StatCard
          title="Total Balance"
          value={`₦${dashboard?.total_balance?.toLocaleString()}`}
          icon="wallet"
        />
      </View>

      {dashboard?.recent_transactions && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Recent Transactions</Text>
          {dashboard.recent_transactions.map((transaction) => (
            <TransactionItem key={transaction.id} transaction={transaction} />
          ))}
        </View>
      )}
    </ScrollView>
  );
};

const StatCard: React.FC<any> = ({ title, value, icon }) => (
  <View style={styles.statCard}>
    <MaterialCommunityIcons name={icon} size={24} color="#2196F3" />
    <Text style={styles.statTitle}>{title}</Text>
    <Text style={styles.statValue}>{value}</Text>
  </View>
);

const TransactionItem: React.FC<any> = ({ transaction }) => (
  <View style={styles.transactionItem}>
    <View style={styles.transactionInfo}>
      <Text style={styles.transactionType}>{transaction.type}</Text>
      <Text style={styles.transactionDate}>{transaction.date}</Text>
    </View>
    <Text style={styles.transactionAmount}>₦{transaction.amount}</Text>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    backgroundColor: '#2196F3',
    padding: 20,
    paddingTop: 40,
  },
  greeting: {
    color: '#fff',
    fontSize: 14,
  },
  name: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 4,
  },
  statsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 12,
    gap: 12,
  },
  statCard: {
    flex: 1,
    minWidth: '48%',
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    elevation: 2,
  },
  statTitle: {
    marginTop: 8,
    fontSize: 12,
    color: '#666',
  },
  statValue: {
    marginTop: 4,
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  section: {
    paddingHorizontal: 12,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#333',
  },
  transactionItem: {
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  transactionInfo: {
    flex: 1,
  },
  transactionType: {
    fontWeight: '600',
    color: '#333',
  },
  transactionDate: {
    fontSize: 12,
    color: '#999',
    marginTop: 4,
  },
  transactionAmount: {
    fontWeight: 'bold',
    color: '#2196F3',
  },
  errorText: {
    color: 'red',
    fontSize: 16,
  },
});

export default ClientDashboardScreen;
```

---

### Phase 6: UI Components Library (Week 3)

#### Step 6.1: Create Reusable Components

**File:** `src/components/Button/Button.tsx`

```typescript
import React from 'react';
import {
  Pressable,
  StyleSheet,
  Text,
  ActivityIndicator,
  ViewStyle,
} from 'react-native';

interface ButtonProps {
  title: string;
  onPress: () => void;
  loading?: boolean;
  disabled?: boolean;
  variant?: 'primary' | 'outlined' | 'text';
  size?: 'small' | 'medium' | 'large';
  style?: ViewStyle;
}

const Button: React.FC<ButtonProps> = ({
  title,
  onPress,
  loading = false,
  disabled = false,
  variant = 'primary',
  size = 'medium',
  style,
}) => {
  const isDisabled = disabled || loading;

  return (
    <Pressable
      onPress={onPress}
      disabled={isDisabled}
      style={({ pressed }) => [
        styles.container,
        styles[variant],
        styles[`size_${size}`],
        pressed && styles.pressed,
        isDisabled && styles.disabled,
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator
          color={variant === 'outlined' ? '#2196F3' : '#fff'}
          size="small"
        />
      ) : (
        <Text
          style={[
            styles.text,
            styles[`text_${variant}`],
            styles[`textSize_${size}`],
          ]}
        >
          {title}
        </Text>
      )}
    </Pressable>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  primary: {
    backgroundColor: '#2196F3',
  },
  outlined: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: '#2196F3',
  },
  text: {
    fontWeight: '600',
  },
  text_primary: {
    color: '#fff',
  },
  text_outlined: {
    color: '#2196F3',
  },
  text_text: {
    color: '#2196F3',
  },
  size_small: {
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  size_medium: {
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  size_large: {
    paddingVertical: 16,
    paddingHorizontal: 24,
  },
  textSize_small: {
    fontSize: 12,
  },
  textSize_medium: {
    fontSize: 14,
  },
  textSize_large: {
    fontSize: 16,
  },
  pressed: {
    opacity: 0.7,
  },
  disabled: {
    opacity: 0.5,
  },
});

export default Button;
```

**File:** `src/components/Input/TextInput.tsx`

```typescript
import React from 'react';
import {
  TextInput as RNTextInput,
  StyleSheet,
  View,
  Text,
  TextInputProps as RNTextInputProps,
} from 'react-native';

interface TextInputProps extends RNTextInputProps {
  label?: string;
  error?: string;
  helperText?: string;
}

const TextInput: React.FC<TextInputProps> = ({
  label,
  error,
  helperText,
  style,
  ...props
}) => {
  return (
    <View style={styles.container}>
      {label && <Text style={styles.label}>{label}</Text>}
      <RNTextInput
        style={[
          styles.input,
          error && styles.inputError,
          style,
        ]}
        placeholderTextColor="#999"
        {...props}
      />
      {error && <Text style={styles.errorText}>{error}</Text>}
      {helperText && <Text style={styles.helperText}>{helperText}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
    color: '#333',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 14,
    color: '#333',
  },
  inputError: {
    borderColor: '#f44336',
  },
  errorText: {
    color: '#f44336',
    fontSize: 12,
    marginTop: 4,
  },
  helperText: {
    color: '#999',
    fontSize: 12,
    marginTop: 4,
  },
});

export default TextInput;
```

---

### Phase 7: Backend API Enhancement (Week 3-4)

#### Step 7.1: Create/Update Mobile-Specific Endpoints

Your existing API already supports mobile usage, but optimize it:

```php
// In app/Http/Controllers/Api/MobileAuthController.php
<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class MobileAuthController extends Controller
{
    /**
     * Login for mobile clients
     */
    public function login(Request $request)
    {
        $credentials = $request->validate([
            'email' => 'required|email',
            'password' => 'required',
            'device_name' => 'required', // "iPhone", "Android", etc
        ]);

        if (!Auth::attempt(['email' => $credentials['email'], 'password' => $credentials['password']])) {
            return response()->json([
                'message' => 'Invalid credentials',
            ], 401);
        }

        $user = Auth::user();
        $token = $user->createToken($credentials['device_name'])->plainTextToken;

        return response()->json([
            'access_token' => $token,
            'token_type' => 'Bearer',
            'user' => $user->only(['id', 'name', 'email', 'role']),
        ]);
    }

    /**
     * Refresh token
     */
    public function refresh(Request $request)
    {
        $user = Auth::user();
        
        return response()->json([
            'access_token' => $user->currentAccessToken()->token,
            'user' => $user->only(['id', 'name', 'email', 'role']),
        ]);
    }

    /**
     * Logout
     */
    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()->delete();

        return response()->json([
            'message' => 'Logged out successfully',
        ]);
    }
}
```

---

## Key Differences from Web

### 1. **Navigation**
| Web | React Native |
|-----|--------------|
| URL-based routing | Stack/Tab navigation |
| Browser history | Navigation stack |
| Deep linking setup | Native deep linking |
| Query parameters | Route params |

### 2. **Styling**
| Web | React Native |
|-----|--------------|
| CSS/Tailwind | StyleSheet/NativeWind |
| Responsive breakpoints | `useWindowDimensions` hook |
| Flexbox similar | Flexbox identical |
| No media queries | Conditional rendering |

### 3. **Platform-Specific Code**
```typescript
// Platform-specific implementation
import { Platform } from 'react-native';

if (Platform.OS === 'ios') {
  // iOS-specific code
} else if (Platform.OS === 'android') {
  // Android-specific code
}

// Or use platform-specific file extensions:
// Button.ios.tsx (iOS)
// Button.android.tsx (Android)
// Button.tsx (fallback)
```

### 4. **Permission Handling**
```typescript
import * as Permissions from 'expo-permissions';

const requestCameraPermission = async () => {
  const { status } = await Permissions.askAsync(Permissions.CAMERA);
  return status === 'granted';
};
```

### 5. **Performance Considerations**
- Use `FlatList` instead of rendering large lists
- Implement pagination for data loading
- Optimize images with `expo-image`
- Use `React.memo` for expensive components
- Implement proper cleanup in `useEffect`

---

## Authentication & Security

### 1. **Token Storage**
```typescript
// Use secure storage for tokens
import * as SecureStore from 'expo-secure-store';

// Store token securely
await SecureStore.setItemAsync('auth_token', token);

// Retrieve token
const token = await SecureStore.getItemAsync('auth_token');
```

### 2. **Certificate Pinning (Production)**
```typescript
// Configure certificate pinning for iOS and Android
import { fetch as httpsFetch } from 'https';

// Use: https://github.com/OkHttp/okhttp-tls
```

### 3. **Biometric Authentication**
Already implemented in AuthContext (Step 3.1)

### 4. **SSL/TLS**
- Always use HTTPS in production
- Implement certificate pinning
- Validate server certificates

---

## Data Management

### 1. **Local Caching**
```typescript
import AsyncStorage from '@react-native-async-storage/async-storage';

// Cache API responses
const cacheData = async (key: string, data: any) => {
  await AsyncStorage.setItem(key, JSON.stringify(data));
};

const getCachedData = async (key: string) => {
  const data = await AsyncStorage.getItem(key);
  return data ? JSON.parse(data) : null;
};
```

### 2. **Offline Support**
```typescript
import NetInfo from '@react-native-community/netinfo';

const useOfflineMode = () => {
  const [isOnline, setIsOnline] = useState(true);

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener(state => {
      setIsOnline(state.isConnected);
    });

    return unsubscribe;
  }, []);

  return isOnline;
};
```

### 3. **State Persistence**
```typescript
// Persist auth state on app launch
useEffect(() => {
  bootstrapAsync(); // In AuthContext
}, []);
```

---

## UI/UX Considerations

### 1. **Safe Area**
```typescript
import { SafeAreaView } from 'react-native-safe-area-context';

<SafeAreaView style={{ flex: 1 }}>
  {/* Content */}
</SafeAreaView>
```

### 2. **Bottom Sheet for Modals**
```typescript
// Use react-native-bottom-sheet instead of full-screen modals
import BottomSheet from '@gorhom/bottom-sheet';
```

### 3. **Gestures**
```typescript
import { GestureHandlerRootView } from 'react-native-gesture-handler';
```

### 4. **Status Bar Customization**
```typescript
import { StatusBar } from 'expo-status-bar';

<StatusBar barStyle="dark-content" backgroundColor="#fff" />
```

---

## Testing & Deployment

### 1. **Testing Setup**
```bash
npm install --save-dev @testing-library/react-native jest @testing-library/jest-native
```

**Example Test:**
```typescript
import { render, screen } from '@testing-library/react-native';
import LoginScreen from '@/screens/Auth/LoginScreen';

describe('LoginScreen', () => {
  it('should render login form', () => {
    render(<LoginScreen />);
    expect(screen.getByPlaceholderText('Email')).toBeTruthy();
    expect(screen.getByPlaceholderText('Password')).toBeTruthy();
  });
});
```

### 2. **iOS Deployment**
```bash
# Build for iOS
expo build:ios

# Or using EAS CLI (recommended)
npm install -g eas-cli
eas build --platform ios
```

**app.json configuration:**
```json
{
  "expo": {
    "name": "TDFC",
    "slug": "tdfc-app",
    "ios": {
      "bundleIdentifier": "com.tdfc.app",
      "supportsTabletMode": true
    }
  }
}
```

### 3. **Android Deployment**
```bash
# Build for Android
expo build:android

# Or using EAS
eas build --platform android
```

**app.json configuration:**
```json
{
  "expo": {
    "android": {
      "package": "com.tdfc.app",
      "permissions": [
        "INTERNET",
        "CAMERA",
        "READ_EXTERNAL_STORAGE",
        "WRITE_EXTERNAL_STORAGE"
      ]
    }
  }
}
```

### 4. **Submission to App Stores**

**Apple App Store:**
1. Create App ID in Apple Developer
2. Configure signing certificates
3. Build and submit via App Store Connect
4. Fill metadata, screenshots, and privacy policy
5. Submit for review (typically 24-48 hours)

**Google Play Store:**
1. Create app in Google Play Console
2. Sign APK/AAB with signing key
3. Upload AAB (recommended)
4. Fill store listing with screenshots
5. Set pricing and distribution
6. Submit for review (usually approved same day)

---

## Implementation Checklist

- [ ] Phase 1: Project Setup
  - [ ] Initialize React Native project with Expo
  - [ ] Install core dependencies
  - [ ] Set up project structure
  - [ ] Configure TypeScript
  - [ ] Create environment configuration

- [ ] Phase 2: API Integration
  - [ ] Configure Axios client
  - [ ] Define API endpoints
  - [ ] Create API service functions
  - [ ] Set up request/response interceptors

- [ ] Phase 3: Authentication
  - [ ] Create AuthContext
  - [ ] Implement login/logout
  - [ ] Set up biometric authentication
  - [ ] Configure token storage

- [ ] Phase 4: Navigation
  - [ ] Install React Navigation
  - [ ] Create root navigator
  - [ ] Set up auth and app stacks
  - [ ] Configure tab navigation

- [ ] Phase 5: Screens (Ongoing)
  - [ ] Implement auth screens (login, register)
  - [ ] Implement admin screens
  - [ ] Implement client screens
  - [ ] Handle error states

- [ ] Phase 6: UI Components
  - [ ] Create Button component
  - [ ] Create TextInput component
  - [ ] Create Card component
  - [ ] Create List component
  - [ ] Create Modal component

- [ ] Phase 7: Backend Optimization
  - [ ] Create mobile-specific endpoints
  - [ ] Optimize API response sizes
  - [ ] Implement pagination
  - [ ] Add API rate limiting

- [ ] Testing
  - [ ] Write unit tests
  - [ ] Write integration tests
  - [ ] Test on physical devices
  - [ ] Load testing

- [ ] Deployment
  - [ ] Configure app signing
  - [ ] Build for iOS and Android
  - [ ] Test on multiple devices
  - [ ] Submit to App Stores

---

## Common Issues & Solutions

### Issue: Blank screen after build
**Solution:** Check that your main component is properly exported and `App.tsx` is correctly configured.

### Issue: API calls fail on Android
**Solution:** Add `android:usesCleartextTraffic="true"` for development, ensure HTTPS in production.

### Issue: Images not loading
**Solution:** Use `expo-image` or `react-native-fast-image` for better image handling.

### Issue: App crashes on navigation
**Solution:** Ensure all screens are properly registered in navigation stack.

### Issue: Biometric not working
**Solution:** Check device has biometric enrolled, verify permissions in `app.json`.

---

## Resources

- **Documentation:**
  - React Native: https://reactnative.dev
  - Expo: https://docs.expo.dev
  - React Navigation: https://reactnavigation.org
  - Axios: https://axios-http.com

- **UI Libraries:**
  - React Native Paper: https://callstack.github.io/react-native-paper
  - NativeWind: https://www.nativewind.dev
  - UI Kitten: https://akveo.github.io/react-native-ui-kitten

- **State Management:**
  - Redux: https://redux.js.org
  - Zustand: https://github.com/pmndrs/zustand
  - Jotai: https://jotai.org

- **Testing:**
  - Testing Library: https://testing-library.com/react-native
  - Detox: https://wix.github.io/Detox

---

## Next Steps

1. **Start with Phase 1-2:** Get project setup and API integration working
2. **Test with Mock Data:** Before connecting to live API
3. **Iterate on Screens:** Build one feature at a time
4. **Test on Devices:** Use physical iOS/Android devices early
5. **Optimize Performance:** Monitor app performance metrics
6. **Plan for Stores:** Start building app store presence early

---

**Last Updated:** January 28, 2026
**Version:** 1.0
