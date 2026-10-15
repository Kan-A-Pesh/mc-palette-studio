/**
 * Validates if a URL is safe for redirects within the application
 * @param url - The URL to validate
 * @param fallbackUrl - Fallback URL if validation fails (default: "/")
 * @returns A safe URL string
 */
export function validateRedirectUrl(url?: string, fallbackUrl = "/"): string {
  if (typeof url !== "string") {
    return fallbackUrl;
  }

  const trimmedUrl = url.trim();

  if (
    trimmedUrl.startsWith("/") &&
    (trimmedUrl.length === 1 || trimmedUrl[1] !== "/")
  ) {
    return trimmedUrl;
  }

  if (typeof window !== "undefined") {
    try {
      const url = new URL(trimmedUrl, window.location.href);
      if (url.origin === window.location.origin) {
        return trimmedUrl;
      }
    } catch {
      // Invalid URL, continue to fallback
    }
  }

  return fallbackUrl;
}
