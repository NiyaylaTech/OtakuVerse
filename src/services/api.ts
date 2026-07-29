/**
 * OtakuVerse API Client Helper
 * Handles communication with the Express backend using VITE_API_URL
 */

const getApiBaseUrl = (): string => {
  const envUrl = import.meta.env.VITE_API_URL;
  if (envUrl && typeof envUrl === 'string' && envUrl.trim().length > 0) {
    // Remove trailing slashes
    return envUrl.replace(/\/+$/, '');
  }
  // Fallback to relative path for single-origin or local dev proxy
  return '';
};

export interface UserProfile {
  id: string;
  username: string;
  displayName: string;
  email: string;
  avatarUrl?: string;
  bio?: string;
  animeLevel: number;
  experiencePoints: number;
  favoriteGenres: string[];
  createdAt: string;
  updatedAt: string;
}

export interface AuthResponse {
  message?: string;
  token: string;
  user: UserProfile;
}

export interface ApiErrorResponse {
  error: string;
}

/**
 * Generic fetch wrapper with timeout and token attachment
 */
async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {},
  token?: string | null
): Promise<T> {
  const baseUrl = getApiBaseUrl();
  const url = `${baseUrl}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    Accept: 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 12000); // 12 second timeout

  try {
    const response = await fetch(url, {
      ...options,
      headers,
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    const responseText = await response.text();
    let data: any;

    try {
      data = JSON.parse(responseText);
    } catch {
      if (!response.ok) {
        throw new Error(`Server returned HTTP status ${response.status}.`);
      }
      throw new Error('Received invalid non-JSON response from server.');
    }

    if (!response.ok) {
      throw new Error(data.error || `Request failed with status ${response.status}`);
    }

    return data as T;
  } catch (error: any) {
    clearTimeout(timeoutId);
    if (error.name === 'AbortError') {
      throw new Error('Network request timed out. Please check your connection or backend status.');
    }
    throw error;
  }
}

/**
 * Register a new account
 */
export async function registerUser(payload: {
  username: string;
  displayName: string;
  email: string;
  password: string;
  confirmPassword?: string;
}): Promise<AuthResponse> {
  return apiRequest<AuthResponse>('/api/auth/register', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

/**
 * Sign in existing user
 */
export async function loginUser(payload: {
  identifier: string;
  password: string;
}): Promise<AuthResponse> {
  return apiRequest<AuthResponse>('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

/**
 * Fetch current user profile using JWT token
 */
export async function fetchCurrentUser(token: string): Promise<{ user: UserProfile }> {
  return apiRequest<{ user: UserProfile }>('/api/auth/me', {
    method: 'GET',
  }, token);
}
