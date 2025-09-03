import axios, { AxiosResponse } from 'axios';
import { useAuthStore } from '../store/authStore';
import { useNotificationStore } from '../store/notificationStore';
import { LoginCredentials, AuthResponse, ApiResponse, User } from '../types';

export class AuthService {
  private apiBaseUrl: string;
  private tokenKey: string = 'smoocho-auth-token';

  constructor() {
    this.apiBaseUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
    this.setupAxiosInterceptors();
  }

  // Setup axios interceptors for automatic token handling
  private setupAxiosInterceptors(): void {
    // Request interceptor to add auth token
    axios.interceptors.request.use(
      config => {
        const token = this.getStoredToken();
        if (token && config.headers) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      error => {
        return Promise.reject(error);
      }
    );

    // Response interceptor to handle token expiration
    axios.interceptors.response.use(
      response => {
        return response;
      },
      async error => {
        const original = error.config;

        if (error.response?.status === 401 && !original._retry) {
          original._retry = true;

          // Try to refresh token
          const refreshSuccess = await this.tryRefreshToken();

          if (refreshSuccess) {
            // Retry the original request with new token
            const token = this.getStoredToken();
            if (token) {
              original.headers.Authorization = `Bearer ${token}`;
            }
            return axios(original);
          } else {
            // Refresh failed, logout user
            this.logout();
          }
        }

        return Promise.reject(error);
      }
    );
  }

  // Login user
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    try {
      const response: AxiosResponse<ApiResponse<AuthResponse>> =
        await axios.post(`${this.apiBaseUrl}/api/auth/login`, credentials);

      if (response.data.success && response.data.data) {
        const { user, token } = response.data.data;

        // Store token
        this.storeToken(token);

        // Update auth store
        const { login } = useAuthStore.getState();
        login(user, token);

        // Show success notification
        const { addNotification } = useNotificationStore.getState();
        addNotification({
          type: 'success',
          title: 'Login Successful',
          message: `Welcome back, ${user.username}!`,
        });

        return response.data.data;
      } else {
        throw new Error(response.data.error || 'Login failed');
      }
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.error || error.message || 'Login failed';

      const { addNotification } = useNotificationStore.getState();
      addNotification({
        type: 'error',
        title: 'Login Failed',
        message: errorMessage,
      });

      throw new Error(errorMessage);
    }
  }

  // Logout user
  logout(): void {
    try {
      // Make logout request to server (fire and forget)
      axios.post(`${this.apiBaseUrl}/api/auth/logout`).catch(() => {
        // Ignore errors on logout
      });
    } catch (error) {
      // Ignore errors on logout
    }

    // Clear local data
    this.clearStoredToken();

    // Update auth store
    const { logout } = useAuthStore.getState();
    logout();

    // Show logout notification
    const { addNotification } = useNotificationStore.getState();
    addNotification({
      type: 'info',
      title: 'Logged Out',
      message: 'You have been logged out successfully',
    });

    // Redirect to login (will be handled by App.tsx)
  }

  // Register new user (if enabled)
  async register(userData: {
    username: string;
    email: string;
    password: string;
    role?: string;
  }): Promise<AuthResponse> {
    try {
      const response: AxiosResponse<ApiResponse<AuthResponse>> =
        await axios.post(`${this.apiBaseUrl}/api/auth/register`, userData);

      if (response.data.success && response.data.data) {
        const { user, token } = response.data.data;

        // Store token
        this.storeToken(token);

        // Update auth store
        const { login } = useAuthStore.getState();
        login(user, token);

        // Show success notification
        const { addNotification } = useNotificationStore.getState();
        addNotification({
          type: 'success',
          title: 'Registration Successful',
          message: `Welcome to Smoocho Bill, ${user.username}!`,
        });

        return response.data.data;
      } else {
        throw new Error(response.data.error || 'Registration failed');
      }
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.error || error.message || 'Registration failed';

      const { addNotification } = useNotificationStore.getState();
      addNotification({
        type: 'error',
        title: 'Registration Failed',
        message: errorMessage,
      });

      throw new Error(errorMessage);
    }
  }

  // Refresh authentication token
  async refreshToken(): Promise<boolean> {
    try {
      const currentToken = this.getStoredToken();
      if (!currentToken) {
        return false;
      }

      const response: AxiosResponse<ApiResponse<{ token: string }>> =
        await axios.post(`${this.apiBaseUrl}/api/auth/refresh`, {
          token: currentToken,
        });

      if (response.data.success && response.data.data) {
        const { token } = response.data.data;
        this.storeToken(token);

        // Update token in auth store
        const { user, login } = useAuthStore.getState();
        if (user) {
          login(user, token);
        }

        console.log('✅ Token refreshed successfully');
        return true;
      }

      return false;
    } catch (error) {
      console.log('❌ Token refresh failed:', error);
      return false;
    }
  }

  // Try to refresh token silently
  private async tryRefreshToken(): Promise<boolean> {
    try {
      return await this.refreshToken();
    } catch (error) {
      console.log('Silent token refresh failed:', error);
      return false;
    }
  }

  // Get current user profile
  async getCurrentUser(): Promise<User | null> {
    try {
      const response: AxiosResponse<ApiResponse<User>> = await axios.get(
        `${this.apiBaseUrl}/api/auth/me`
      );

      if (response.data.success && response.data.data) {
        return response.data.data;
      }

      return null;
    } catch (error) {
      console.log('Failed to get current user:', error);
      return null;
    }
  }

  // Update user profile
  async updateProfile(updates: Partial<User>): Promise<User> {
    try {
      const response: AxiosResponse<ApiResponse<User>> = await axios.put(
        `${this.apiBaseUrl}/api/auth/profile`,
        updates
      );

      if (response.data.success && response.data.data) {
        // Update auth store
        const { updateUser } = useAuthStore.getState();
        updateUser(response.data.data);

        const { addNotification } = useNotificationStore.getState();
        addNotification({
          type: 'success',
          title: 'Profile Updated',
          message: 'Your profile has been updated successfully',
        });

        return response.data.data;
      } else {
        throw new Error(response.data.error || 'Failed to update profile');
      }
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.error ||
        error.message ||
        'Failed to update profile';

      const { addNotification } = useNotificationStore.getState();
      addNotification({
        type: 'error',
        title: 'Update Failed',
        message: errorMessage,
      });

      throw new Error(errorMessage);
    }
  }

  // Change password
  async changePassword(
    currentPassword: string,
    newPassword: string
  ): Promise<void> {
    try {
      const response: AxiosResponse<ApiResponse> = await axios.post(
        `${this.apiBaseUrl}/api/auth/change-password`,
        {
          currentPassword,
          newPassword,
        }
      );

      if (response.data.success) {
        const { addNotification } = useNotificationStore.getState();
        addNotification({
          type: 'success',
          title: 'Password Changed',
          message: 'Your password has been changed successfully',
        });
      } else {
        throw new Error(response.data.error || 'Failed to change password');
      }
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.error ||
        error.message ||
        'Failed to change password';

      const { addNotification } = useNotificationStore.getState();
      addNotification({
        type: 'error',
        title: 'Password Change Failed',
        message: errorMessage,
      });

      throw new Error(errorMessage);
    }
  }

  // Check if user is authenticated
  isAuthenticated(): boolean {
    const token = this.getStoredToken();
    const { isAuthenticated } = useAuthStore.getState();
    return !!(token && isAuthenticated);
  }

  // Get stored token
  getStoredToken(): string | null {
    try {
      return localStorage.getItem(this.tokenKey);
    } catch (error) {
      console.warn('Failed to get stored token:', error);
      return null;
    }
  }

  // Store token securely
  private storeToken(token: string): void {
    try {
      localStorage.setItem(this.tokenKey, token);
    } catch (error) {
      console.error('Failed to store token:', error);
    }
  }

  // Clear stored token
  private clearStoredToken(): void {
    try {
      localStorage.removeItem(this.tokenKey);
    } catch (error) {
      console.warn('Failed to clear stored token:', error);
    }
  }

  // Check token validity
  isTokenValid(): boolean {
    const token = this.getStoredToken();
    if (!token) return false;

    try {
      // Basic JWT structure check
      const parts = token.split('.');
      if (parts.length !== 3) return false;

      // Decode payload to check expiration
      const payload = JSON.parse(atob(parts[1]));
      const now = Math.floor(Date.now() / 1000);

      return payload.exp > now;
    } catch (error) {
      console.warn('Token validation failed:', error);
      return false;
    }
  }

  // Get token expiration time
  getTokenExpiration(): Date | null {
    const token = this.getStoredToken();
    if (!token) return null;

    try {
      const parts = token.split('.');
      const payload = JSON.parse(atob(parts[1]));
      return new Date(payload.exp * 1000);
    } catch (error) {
      console.warn('Failed to get token expiration:', error);
      return null;
    }
  }

  // Auto-refresh token before expiration
  scheduleTokenRefresh(): void {
    const expiration = this.getTokenExpiration();
    if (!expiration) return;

    const now = new Date();
    const timeUntilExpiration = expiration.getTime() - now.getTime();
    const refreshTime = timeUntilExpiration - 5 * 60 * 1000; // Refresh 5 minutes before expiration

    if (refreshTime > 0) {
      setTimeout(() => {
        this.refreshToken().then(success => {
          if (success) {
            // Schedule next refresh
            this.scheduleTokenRefresh();
          }
        });
      }, refreshTime);
    }
  }

  // Initialize auth state from stored token
  async initializeAuth(): Promise<void> {
    const { setLoading } = useAuthStore.getState();

    try {
      setLoading(true);

      const token = this.getStoredToken();
      if (!token || !this.isTokenValid()) {
        // No valid token, user needs to login
        return;
      }

      // Token exists and is valid, try to get current user
      const user = await this.getCurrentUser();
      if (user) {
        const { login } = useAuthStore.getState();
        login(user, token);

        // Schedule token refresh
        this.scheduleTokenRefresh();

        console.log('✅ Auth initialized from stored token');
      } else {
        // Failed to get user, clear invalid token
        this.clearStoredToken();
      }
    } catch (error) {
      console.error('Auth initialization failed:', error);
      this.clearStoredToken();
    } finally {
      setLoading(false);
    }
  }
}

// Export singleton instance
export const authService = new AuthService();

// Auto-initialize auth when service is imported
if (typeof window !== 'undefined') {
  // Initialize auth state on app load
  authService.initializeAuth();
}
