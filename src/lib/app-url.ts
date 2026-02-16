const resolveEnvBaseUrl = () =>
  import.meta.env.VITE_PUBLIC_SITE_URL ||
  import.meta.env.VITE_APP_URL ||
  import.meta.env.VITE_SITE_URL;

export const normalizeTrustedBaseUrl = (candidate?: string | null): string | null => {
  if (!candidate) return null;

  try {
    const parsedUrl = new URL(candidate);
    if (!/^https?:$/.test(parsedUrl.protocol)) {
      console.warn("Ignoring base URL with unsupported protocol.");
      return null;
    }

    if (parsedUrl.username || parsedUrl.password) {
      console.warn("Ignoring base URL containing credentials.");
      return null;
    }

    parsedUrl.hash = "";
    parsedUrl.search = "";

    const normalized = parsedUrl.toString();
    return normalized.endsWith("/") ? normalized.slice(0, -1) : normalized;
  } catch {
    console.warn("Ignoring invalid base URL from environment.");
    return null;
  }
};

export const getAppBaseUrl = () => {
  const candidate = resolveEnvBaseUrl()?.toString().trim();
  const baseUrl = normalizeTrustedBaseUrl(candidate) ?? window.location.origin;

  return baseUrl.endsWith("/") ? baseUrl.slice(0, -1) : baseUrl;
};
