/**
 * Centralized API configuration and safe request helpers
 */

export const API_BASE_URL = (
  import.meta.env.VITE_API_URL || "http://localhost:3001"
).replace(/\/+$/, "");

/**
 * Returns the full API URL for a given path
 */
export function apiUrl(path: string): string {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  if (!API_BASE_URL) {
    return normalizedPath;
  }
  return `${API_BASE_URL}${normalizedPath}`;
}

/**
 * Safe fetch helper that validates HTTP status and application/json content-type
 */
export async function fetchJson<T = any>(
  path: string,
  options?: RequestInit
): Promise<T> {
  const requestUrl = apiUrl(path);

  console.log("Episode API request URL:", requestUrl);

  const response = await fetch(requestUrl, options);

  console.log("Episode API response URL:", response.url);
  console.log("Episode API status:", response.status);
  console.log("Episode API content type:", response.headers.get("content-type"));

  const contentType = response.headers.get("content-type") || "";

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(
      `Episode request failed: ${response.status} ${errorBody.slice(0, 200)}`
    );
  }

  if (!contentType.includes("application/json")) {
    const responseText = await response.text();

    console.error("Expected JSON but received:", {
      url: response.url,
      status: response.status,
      contentType,
      responsePreview: responseText.slice(0, 200),
    });

    throw new Error("The episode service returned an invalid response.");
  }

  return response.json();
}
