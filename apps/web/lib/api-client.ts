import axios, {
  AxiosInstance,
  AxiosError,
  InternalAxiosRequestConfig,
  AxiosResponse,
} from "axios";

// API response wrapper type
export interface ApiResponse<T> {
  data: T;
  message?: string;
  error?: string;
}

// API error type
export interface ApiError {
  message: string;
  statusCode?: number;
  code?: string;
  details?: unknown;
}

/** Current tenant ID (set after login from user.tenantId). Backend requires tenant_id for dashboard/transactions. */
export function getCurrentTenantId(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("current_tenant_id");
}

export function setCurrentTenantId(tenantId: string | null): void {
  if (typeof window === "undefined") return;
  if (tenantId == null) localStorage.removeItem("current_tenant_id");
  else localStorage.setItem("current_tenant_id", tenantId);
}

const TENANT_NAME_KEY = "current_tenant_name";

export function getCurrentTenantName(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(TENANT_NAME_KEY);
}

export function setCurrentTenantName(name: string | null): void {
  if (typeof window === "undefined") return;
  if (name == null) localStorage.removeItem(TENANT_NAME_KEY);
  else localStorage.setItem(TENANT_NAME_KEY, name);
}

// Create axios instance – backend uses global prefix /api/v1
const apiBase = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";
const baseURL = apiBase.replace(/\/api\/v1\/?$/, "") + "/api/v1";

export const api: AxiosInstance = axios.create({
  baseURL,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 30000, // 30 seconds timeout
});

// Request interceptor: auth token + optional tenant context
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("auth_token");
      if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      const tenantId = localStorage.getItem("current_tenant_id");
      if (tenantId && config.headers) {
        config.headers["X-Tenant-Id"] = tenantId;
      }
    }
    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  },
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response: AxiosResponse) => {
    return response;
  },
  (error: AxiosError<ApiError>) => {
    const apiError: ApiError = {
      message: error.message || "An unexpected error occurred",
      statusCode: error.response?.status,
      code: error.code,
    };

    // Handle specific error status codes
    if (error.response) {
      const { status, data } = error.response;

      switch (status) {
        case 400:
          apiError.message =
            data?.message || "Bad request. Please check your input.";
          apiError.details = data?.details;
          break;
        case 401:
          apiError.message = "Unauthorized. Please log in again.";
          // Clear token and redirect to login
          if (typeof window !== "undefined") {
            localStorage.removeItem("auth_token");
            window.location.href = "/login";
          }
          break;
        case 403:
          apiError.message =
            "Forbidden. You do not have permission to perform this action.";
          break;
        case 404:
          apiError.message = "Resource not found.";
          break;
        case 409:
          apiError.message =
            data?.message || "Conflict. The resource already exists.";
          break;
        case 422:
          apiError.message =
            data?.message || "Validation error. Please check your input.";
          apiError.details = data?.details;
          break;
        case 429:
          apiError.message = "Too many requests. Please try again later.";
          break;
        case 500:
          apiError.message = "Internal server error. Please try again later.";
          break;
        case 502:
        case 503:
        case 504:
          apiError.message = "Service unavailable. Please try again later.";
          break;
        default:
          apiError.message =
            data?.message || `Request failed with status ${status}`;
      }
    } else if (error.request) {
      // Request was made but no response received
      apiError.message = "Network error. Please check your connection.";
    }

    // Log error in development
    if (process.env.NODE_ENV === "development") {
      console.error("API Error:", apiError);
    }

    return Promise.reject(apiError);
  },
);

// Type-safe request methods
export const apiClient = {
  get: <T>(
    url: string,
    config?: { params?: Record<string, unknown> | unknown },
  ) => api.get<ApiResponse<T>>(url, config as any).then((res) => res.data.data),

  post: <T>(
    url: string,
    data?: unknown,
    config?: { params?: Record<string, unknown> | unknown },
  ) =>
    api
      .post<ApiResponse<T>>(url, data, config as any)
      .then((res) => res.data.data),

  put: <T>(
    url: string,
    data?: unknown,
    config?: { params?: Record<string, unknown> | unknown },
  ) =>
    api
      .put<ApiResponse<T>>(url, data, config as any)
      .then((res) => res.data.data),

  patch: <T>(
    url: string,
    data?: unknown,
    config?: { params?: Record<string, unknown> | unknown },
  ) =>
    api
      .patch<ApiResponse<T>>(url, data, config as any)
      .then((res) => res.data.data),

  delete: <T>(
    url: string,
    config?: { params?: Record<string, unknown> | unknown },
  ) =>
    api.delete<ApiResponse<T>>(url, config as any).then((res) => res.data.data),
};

export default api;
