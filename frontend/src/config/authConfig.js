import config from './config'

export const msalConfig = {
  auth: {
    clientId: config.msalClientId,
    authority: `https://login.microsoftonline.com/${config.msalTenantId}`,
    redirectUri: config.msalRedirectUri,
  },
  cache: {
    cacheLocation: 'localStorage',
    storeAuthStateInCookie: false,
  },
}

export const loginRequest = {
  scopes: config.msalScopes,
}
