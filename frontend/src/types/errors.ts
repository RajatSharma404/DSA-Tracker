/**
 * Error Types and Utilities
 */

export interface ApiError {
  code: string;
  message: string;
  details?: Record<string, unknown>;
  statusCode?: number;
}

export interface AppError extends Error {
  code: string;
  originalError?: unknown;
}

/**
 * Type guard for ApiError
 */
export function isApiError(error: unknown): error is ApiError {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    "message" in error
  );
}

/**
 * Type guard for AppError
 */
export function isAppError(error: unknown): error is AppError {
  return error instanceof Error && "code" in error;
}

/**
 * Convert unknown error to standardized format
 */
export function normalizeError(error: unknown): ApiError {
  if (isApiError(error)) {
    return error;
  }

  if (error instanceof Error) {
    return {
      code: "UNKNOWN_ERROR",
      message: error.message,
    };
  }

  if (typeof error === "string") {
    return {
      code: "UNKNOWN_ERROR",
      message: error,
    };
  }

  if (typeof error === "object" && error !== null && "response" in error) {
    const axiosError = error as any;
    const data = axiosError.response?.data;
    if (isApiError(data)) {
      return data;
    }
    return {
      code: "API_ERROR",
      message: data?.message || "API request failed",
      statusCode: axiosError.response?.status,
    };
  }

  return {
    code: "UNKNOWN_ERROR",
    message: "An unexpected error occurred",
  };
}

/**
 * User-friendly error message
 */
export function getErrorMessage(error: unknown): string {
  const normalized = normalizeError(error);

  const messages: Record<string, string> = {
    UNKNOWN_ERROR: "Something went wrong. Please try again.",
    API_ERROR: "Server error. Please try again later.",
    NETWORK_ERROR: "Network connection failed. Check your internet.",
    TIMEOUT: "Request timed out. Please try again.",
    UNAUTHORIZED: "Session expired. Please log in again.",
    FORBIDDEN: "You do not have permission for this action.",
    NOT_FOUND: "Resource not found.",
    VALIDATION_ERROR: "Please check your input and try again.",
  };

  return (
    messages[normalized.code] || normalized.message || "Something went wrong"
  );
}

/**
 * Error boundary context
 */
export class ErrorBoundaryError extends Error implements AppError {
  code: string;
  originalError: unknown;

  constructor(
    message: string,
    code: string = "ERROR_BOUNDARY",
    originalError?: unknown,
  ) {
    super(message);
    this.name = "ErrorBoundaryError";
    this.code = code;
    this.originalError = originalError;
  }
}
