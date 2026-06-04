const config = {
  apiBaseUrl: import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:5028/api',
  msalClientId: import.meta.env.VITE_MSAL_CLIENT_ID ?? '',
  msalTenantId: import.meta.env.VITE_MSAL_TENANT_ID ?? 'common',
  msalRedirectUri: import.meta.env.VITE_MSAL_REDIRECT_URI ?? window.location.origin,
  msalScopes: (import.meta.env.VITE_MSAL_SCOPES ?? 'openid,profile,email')
    .split(',')
    .map(s => s.trim())
    .filter(Boolean),
}

export default config
