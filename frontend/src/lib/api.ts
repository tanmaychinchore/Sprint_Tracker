/**
 * Centralized API helper — auto-injects JWT Authorization header
 * and handles 401 token expiry globally.
 */

const API_BASE = "/api";

export async function apiFetch<T = any>(
  url: string,
  options: RequestInit = {}
): Promise<T> {
  const token = localStorage.getItem("token");

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE}${url}`, {
    ...options,
    headers,
  });

  // Handle auth failures globally
  if (response.status === 401) {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    window.location.href = "/login";
    throw new Error("Session expired. Please log in again.");
  }

  if (!response.ok) {
    let errorMessage = "Something went wrong";
    try {
      const errorData = await response.json();
      errorMessage = errorData.message || errorData.error || errorMessage;
    } catch {}
    throw new Error(errorMessage);
  }

  return response.json();
}
