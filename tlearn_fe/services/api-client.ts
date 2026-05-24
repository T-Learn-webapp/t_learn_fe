import axios, {
  AxiosError,
  AxiosInstance,
  InternalAxiosRequestConfig,
} from 'axios';

import { toast } from 'sonner';

const API_BASE =
  process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5045';

let isRefreshing = false;

type FailedQueueItem = {
  resolve: () => void;
  reject: (error: unknown) => void;
};

let failedQueue: FailedQueueItem[] = [];

const processQueue = (error?: unknown) => {
  failedQueue.forEach((promise) => {
    if (error) {
      promise.reject(error);
    } else {
      promise.resolve();
    }
  });

  failedQueue = [];
};

export const api: AxiosInstance = axios.create({
  baseURL: API_BASE,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

/**
 * Dùng instance riêng cho refresh-token
 * để tránh bị interceptor gọi lặp vô hạn.
 */
const refreshClient = axios.create({
  baseURL: API_BASE,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => {
    const method = response.config.method?.toUpperCase();

    const shouldShowSuccessToast =
      method &&
      ['POST', 'PUT', 'DELETE'].includes(method) &&
      response.data?.message &&
      !response.config.url?.includes('/api/auth/refresh-token');

    if (shouldShowSuccessToast) {
      toast.success(response.data.message || 'Thao tác thành công!');
    }

    return response;
  },
  async (error: AxiosError<any>) => {
    const originalRequest = error.config as
      | (InternalAxiosRequestConfig & { _retry?: boolean })
      | undefined;

    if (!originalRequest) {
      return Promise.reject(error);
    }

    const requestUrl = originalRequest.url || '';

    const skipToastUrls = [
      '/api/auth/me',
      '/api/auth/refresh-token',
    ];

    const shouldToast = !skipToastUrls.some((url) =>
      requestUrl.includes(url)
    );

    const errorMessage =
      error.response?.data?.message ||
      error.response?.data?.error ||
      error.message ||
      'Đã có lỗi xảy ra!';

    /**
     * Nếu refresh token cũng bị 401 thì không refresh tiếp nữa.
     */
    if (
      error.response?.status === 401 &&
      requestUrl.includes('/api/auth/refresh-token')
    ) {
      processQueue(error);
      return Promise.reject(error);
    }

    /**
     * Access token hết hạn.
     */
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      if (isRefreshing) {
        return new Promise<void>((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then(() => api(originalRequest))
          .catch((queueError) => Promise.reject(queueError));
      }

      isRefreshing = true;

      try {
        await refreshClient.post('/api/auth/refresh-token', {});

        processQueue();
        isRefreshing = false;

        return api(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError);
        isRefreshing = false;

        if (typeof window !== 'undefined') {
          const currentUrl =
            window.location.pathname + window.location.search;

          const isAuthPage =
            window.location.pathname.includes('/login') ||
            window.location.pathname.includes('/register');

          if (!isAuthPage) {
            window.location.href = `/login?returnUrl=${encodeURIComponent(
              currentUrl
            )}`;
          }
        }

        return Promise.reject(refreshError);
      }
    }

    if (shouldToast) {
      toast.error(errorMessage);
    }

    return Promise.reject(error);
  }
);