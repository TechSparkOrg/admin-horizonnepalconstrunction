import axios from "axios";
import { toast } from "sonner";

const STATUS_MESSAGES: Record<number, string> = {
  400: "Invalid request. Please check your input.",
  401: "Session expired. Please log in again.",
  403: "You don't have permission to do this.",
  404: "Resource not found.",
  422: "Validation failed. Check your input.",
  429: "Too many requests. Please wait.",
  500: "Server error. Please try again later.",
};

export interface AppError {
  message: string;
  status: number;
  raw?: unknown;
}

function extractDjangoMessage(data: unknown): string | null {
  if (!data || typeof data !== "object" || Array.isArray(data)) return null;

  const obj = data as Record<string, unknown>;

  if (typeof obj.detail === "string") return obj.detail;
  if (typeof obj.message === "string") return obj.message;
  if (Array.isArray(obj.non_field_errors)) return obj.non_field_errors.join(", ");

  const messages: string[] = [];
  for (const key in obj) {
    const val = obj[key];
    if (Array.isArray(val)) {
      messages.push(`${key}: ${val.join(", ")}`);
    } else if (typeof val === "string") {
      messages.push(val);
    }
  }

  return messages.length > 0 ? messages.join(" | ") : null;
}

export class ErrorHandler {
  static parse(error: unknown): AppError {
    if (axios.isAxiosError(error)) {
      if (error.response) {
        const { status, data } = error.response;
        const message = extractDjangoMessage(data) ?? STATUS_MESSAGES[status] ?? "An unexpected error occurred.";
        return { message, status, raw: data };
      }
      if (error.request) {
        return { message: "No response received from server. Check your connection.", status: 0 };
      }
    }

    if (error instanceof Error) {
      return { message: error.message, status: 500 };
    }

    return { message: "Something went wrong.", status: 500 };
  }

  static toast(message: string): void {
    toast.error(message);
  }
}