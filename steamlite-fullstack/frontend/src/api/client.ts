const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

export class ApiError extends Error {
  status: number;
  details: unknown;

  constructor(message: string, status: number, details?: unknown) {
    super(message);
    this.status = status;
    this.details = details;
  }
}

export const apiRequest = async <T>(path: string, options: RequestInit = {}) => {
  const token = localStorage.getItem("steamlite_token");
  const headers = new Headers(options.headers || {});

  headers.set("Content-Type", "application/json");

  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers,
  });

  const data = await response
    .json()
    .catch(() => ({ message: "The server returned an unreadable response." }));

  if (!response.ok) {
    throw new ApiError(data.message || "Request failed.", response.status, data);
  }

  return data as T;
};

export { API_URL };
