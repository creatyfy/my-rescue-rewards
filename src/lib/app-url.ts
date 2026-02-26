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
  const envUrl = normalizeTrustedBaseUrl(candidate);

  if (envUrl) {
    return envUrl.endsWith("/") ? envUrl.slice(0, -1) : envUrl;
  }

  const origin = window.location.origin;

  // If running on a Lovable preview URL, use the published URL instead
  // so that end-users (who don't have Lovable access) get valid links.
  if (origin.includes("lovableproject.com") || origin.includes("id-preview--") || origin.includes("lovable.app")) {
    const publishedUrl = "https://meuresgate.com.br";
    return publishedUrl;
  }

  return origin.endsWith("/") ? origin.slice(0, -1) : origin;
};
