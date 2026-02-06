const resolveEnvBaseUrl = () =>
  import.meta.env.VITE_PUBLIC_SITE_URL ||
  import.meta.env.VITE_APP_URL ||
  import.meta.env.VITE_SITE_URL;

export const getAppBaseUrl = () => {
  const candidate = resolveEnvBaseUrl()?.toString().trim();
  const baseUrl = candidate && candidate.length > 0 ? candidate : window.location.origin;

  return baseUrl.endsWith("/") ? baseUrl.slice(0, -1) : baseUrl;
};
