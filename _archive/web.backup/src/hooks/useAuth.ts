import { create } from "zustand";
import { persist } from "zustand/middleware";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

export interface User {
  id: string;
  name: string;
  email: string;
  role: "admin" | "user";
  permissions: string[];
  tenantId: string;
  createdAt: Date;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

interface AuthActions {
  signIn: (email: string, password: string) => Promise<boolean>;
  signOut: () => void;
  fetchCurrentUser: () => Promise<void>;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  clearError: () => void;
}

class ApiService {
  private baseURL: string;
  private token: string | null = null;

  constructor() {
    this.baseURL = API_BASE_URL;
    if (typeof window !== "undefined") {
      this.token = localStorage.getItem("auth_token");
    }
  }

  setToken(token: string) {
    this.token = token;
    if (typeof window !== "undefined") {
      localStorage.setItem("auth_token", token);
    }
  }

  clearToken() {
    this.token = null;
    if (typeof window !== "undefined") {
      localStorage.removeItem("auth_token");
    }
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {},
  ): Promise<ApiResponse<T>> {
    const url = `${this.baseURL}${endpoint}`;
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      ...((options.headers as Record<string, string>) || {}),
    };

    if (this.token) {
      headers.Authorization = `Bearer ${this.token}`;
    }

    try {
      const response = await fetch(url, {
        ...options,
        headers,
      });

      const data = await response.json();

      if (!response.ok) {
        return {
          success: false,
          error: data.message || `HTTP ${response.status}`,
        };
      }

      return {
        success: true,
        data,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Network error",
      };
    }
  }

  async signIn(email: string, password: string) {
    return this.request("/auth/sign-in", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });
  }

  async signOut() {
    return this.request("/auth/sign-out", {
      method: "POST",
    });
  }

  async getCurrentUser() {
    return this.request<User>("/auth/me");
  }
}

export const apiService = new ApiService();

export const useAuthStore = create<AuthState & AuthActions>()(
  persist(
    (set, get) => ({
      // Initial state
      user: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      // Actions
      setLoading: (loading) => set({ isLoading: loading }),

      setError: (error) => set({ error }),

      clearError: () => set({ error: null }),

      signIn: async (email, password) => {
        set({ isLoading: true, error: null });

        try {
          const response = await apiService.signIn(email, password);

          if (response.success && response.data) {
            const data = response.data as any;
            const { user, session } = data;

            // Store auth token from session
            const token = session?.accessToken;
            if (token) {
              apiService.setToken(token);
            }

            // Store user info
            set({
              user: {
                id: user.id,
                name: user.displayName || user.email,
                email: user.email,
                role: user.role === "admin" ? "admin" : "user",
                permissions: user.permissions || [],
                tenantId: user.tenantId,
                createdAt: new Date(),
              },
              isAuthenticated: true,
              isLoading: false,
              error: null,
            });

            return true;
          } else {
            set({
              error: response.error || "Sign in failed",
              isLoading: false,
            });
            return false;
          }
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : "Sign in failed",
            isLoading: false,
          });
          return false;
        }
      },

      signOut: async () => {
        try {
          await apiService.signOut();
        } catch (error) {
          console.error("Sign out error:", error);
        } finally {
          apiService.clearToken();
          set({
            user: null,
            isAuthenticated: false,
            error: null,
          });
        }
      },

      fetchCurrentUser: async () => {
        try {
          const response = await apiService.getCurrentUser();

          if (response.success && response.data) {
            set({
              user: response.data,
              isAuthenticated: true,
            });
          }
        } catch (error) {
          console.error("Failed to fetch current user:", error);
        }
      },
    }),
    {
      name: "bridge-auth-storage",
      partialize: () => ({
        isLoading: false,
        error: null,
      }),
    },
  ),
);
