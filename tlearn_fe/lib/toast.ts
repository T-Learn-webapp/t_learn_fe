import { toast as sonnerToast } from 'sonner';
import { isAxiosError } from 'axios';

export function getErrorMessage(
  error: unknown,
  fallback = 'Đã xảy ra lỗi'
): string {
  if (isAxiosError(error)) {
    const data = error.response?.data as { message?: string } | undefined;
    return data?.message || error.message || fallback;
  }
  if (error instanceof Error) {
    return error.message || fallback;
  }
  return fallback;
}

export const toast = {
  success: (message: string, description?: string) =>
    sonnerToast.success(message, { description }),

  error: (message: string, description?: string) =>
    sonnerToast.error(message, { description }),

  info: (message: string, description?: string) =>
    sonnerToast.info(message, { description }),

  warning: (message: string, description?: string) =>
    sonnerToast.warning(message, { description }),

  promise: sonnerToast.promise,

  fromError: (error: unknown, fallback?: string) =>
    sonnerToast.error(getErrorMessage(error, fallback)),
};
