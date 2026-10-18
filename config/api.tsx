import type { AuthTokens } from "@/types/api";
import * as SecureStore from "expo-secure-store";

export const API_URL = process.env.EXPO_PUBLIC_BACKEND_URL;

const ACCESS_TOKEN_KEY = "accessToken";
const REFRESH_TOKEN_KEY = "refreshToken";

export class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
  }
}

export const getStoredToken = async () => {
  try {
    return await SecureStore.getItemAsync(ACCESS_TOKEN_KEY);
  } catch (error) {
    console.log("Failed to get token", error);
    return null;
  }
};

export const storeTokens = async ({ accessToken, refreshToken }: AuthTokens) => {
  await SecureStore.setItemAsync(ACCESS_TOKEN_KEY, accessToken);
  await SecureStore.setItemAsync(REFRESH_TOKEN_KEY, refreshToken);
};

export const clearStoredToken = async () => {
  try {
    await SecureStore.deleteItemAsync(ACCESS_TOKEN_KEY);
    await SecureStore.deleteItemAsync(REFRESH_TOKEN_KEY);
  } catch (error) {
    console.error("Failed to clear token", error);
  }
};

// Called when the refresh token is no longer accepted, so the auth context can drop the user.
let onSessionExpired: (() => void) | null = null;
export const setSessionExpiredHandler = (handler: (() => void) | null) => {
  onSessionExpired = handler;
};

// Concurrent 401s share a single refresh request.
let refreshPromise: Promise<string | null> | null = null;

export const refreshAccessToken = () => {
  if (!refreshPromise) {
    refreshPromise = (async () => {
      try {
        const refreshToken = await SecureStore.getItemAsync(REFRESH_TOKEN_KEY);
        if (!refreshToken) return null;

        const response = await fetch(`${API_URL}/auth/refresh`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ refreshToken }),
        });
        if (!response.ok) return null;

        const tokens: AuthTokens = await response.json();
        await storeTokens(tokens);
        return tokens.accessToken;
      } catch (error) {
        console.error("Failed to refresh token", error);
        return null;
      } finally {
        refreshPromise = null;
      }
    })();
  }
  return refreshPromise;
};

async function readError(response: Response) {
  const text = await response.text();
  try {
    const json = JSON.parse(text);
    return json.message || json.error || text;
  } catch {
    return text || `Request failed with status ${response.status}`;
  }
}

type RequestOptions = {
  /** Send the bearer token and retry once after refreshing it on 401. */
  auth?: boolean;
};

export const apiClient = async <T = any,>(
  endpoint: string,
  method = "GET",
  body: any = null,
  { auth = true }: RequestOptions = {},
): Promise<T> => {
  const isFormData = body instanceof FormData;

  const send = (token: string | null) => {
    const headers: Record<string, string> = {};
    if (auth && token) headers.Authorization = `Bearer ${token}`;
    if (body && !isFormData) headers["Content-Type"] = "application/json";

    return fetch(`${API_URL}/${endpoint}`, {
      method,
      headers,
      body: body ? (isFormData ? body : JSON.stringify(body)) : null,
    });
  };

  let response = await send(auth ? await getStoredToken() : null);

  if (auth && response.status === 401) {
    const newToken = await refreshAccessToken();
    if (!newToken) {
      await clearStoredToken();
      onSessionExpired?.();
      throw new ApiError(401, "Sessão expirada. Faça login novamente.");
    }
    response = await send(newToken);
  }

  if (!response.ok) {
    throw new ApiError(response.status, await readError(response));
  }

  if (response.status === 204) {
    return null as T;
  }

  const text = await response.text();
  return (text ? JSON.parse(text) : null) as T;
};
