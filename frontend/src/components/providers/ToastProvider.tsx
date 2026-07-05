/**
 * Toast Notification Provider and Hook
 * Uses Sonner for toast notifications
 */

"use client";

import { Toaster, toast } from "sonner";
import {
  AlertCircle,
  CheckCircle2,
  Info,
  AlertTriangle,
} from "lucide-react";

/**
 * Toast Provider Wrapper
 */
export function ToastProvider() {
  return (
    <Toaster
      position="top-right"
      theme="dark"
      richColors={true}
      closeButton={true}
      expand={true}
      visibleToasts={3}
      style={
        {
          "--sonner-color-success": "#22c55e",
          "--sonner-color-error": "#ef4444",
          "--sonner-color-warning": "#f59e0b",
          "--sonner-color-info": "#3b82f6",
        } as React.CSSProperties
      }
    />
  );
}

/**
 * Toast utilities - easier API
 */
export const useToast = () => ({
  /**
   * Success notification
   */
  success: (message: string, description?: string) => {
    toast.success(message, {
      description,
      icon: <CheckCircle2 size={16} />,
    });
  },

  /**
   * Error notification
   */
  error: (message: string, description?: string) => {
    toast.error(message, {
      description,
      icon: <AlertCircle size={16} />,
    });
  },

  /**
   * Warning notification
   */
  warning: (message: string, description?: string) => {
    toast.warning(message, {
      description,
      icon: <AlertTriangle size={16} />,
    });
  },

  /**
   * Info notification
   */
  info: (message: string, description?: string) => {
    toast.info(message, {
      description,
      icon: <Info size={16} />,
    });
  },

  /**
   * Loading notification
   */
  loading: (message: string) => {
    return toast.loading(message);
  },

  /**
   * Promise-based notification
   */
  promise: <T,>(
    promise: Promise<T>,
    {
      loading,
      success,
      error: errorMsg,
    }: {
      loading: string;
      success: string | ((data: T) => string);
      error: string | ((error: Error) => string);
    },
  ) => {
    return toast.promise(promise, {
      loading,
      success: (data: T) =>
        typeof success === "function" ? success(data) : success,
      error: (error: Error) =>
        typeof errorMsg === "function" ? errorMsg(error) : errorMsg,
    });
  },

  /**
   * Dismiss a specific toast
   */
  dismiss: (toastId?: string | number) => {
    toast.dismiss(toastId);
  },

  /**
   * Dismiss all toasts
   */
  dismissAll: () => {
    toast.dismiss();
  },
});

/**
 * Hook compatibility wrapper - use like: const { success } = useToast()
 */
export function useToastNotification() {
  return useToast();
}
