import * as SecureStore from "expo-secure-store";

const API_URL =
  process.env.EXPO_PUBLIC_BACKEND_URL;

export const getStoredToken = async () => {
  try {
    return await SecureStore.getItemAsync("accessToken");
  } catch (error) {
    console.log("Failed to get token", error);
    return null;
  }
};

export const storeAccessToken = async (token: string) => {
  try {
    await SecureStore.setItemAsync("accessToken", token);
  } catch (error) {
    console.log("Failed to store token", error);
  }
};

export const storeRefreshToken = async (token: string) => {
  try {
    await SecureStore.setItemAsync("refreshToken", token);
  } catch (error) {
    console.log("Failed to store token", error);
  }
};

export const clearStoredToken = async () => {
  try {
    await SecureStore.deleteItemAsync("accessToken");
    await SecureStore.deleteItemAsync("refreshToken");
  } catch (error) {
    console.error("Failed to clear token", error);
  }
};

export const refreshAccessToken = async () => {
  try {
    const refreshToken = await SecureStore.getItemAsync("refreshToken");
    if (!refreshToken) {
      throw new Error("No refresh token found");
    }
    const response = await fetch(`${API_URL}/auth/refresh`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ refreshToken }),
    });
  } catch (error) {
    console.error("Failed to refresh token", error);
  }
};

export const apiClient = async (
  endpoint: string,
  method = "GET",
  body: any = null,
) => {
  try {
    let token = await getStoredToken();

    const isFormData = body instanceof FormData;

    const headers: Record<string, string> = {
      Authorization: `Bearer ${token}`,
    };

    if (!isFormData) {
      headers["Content-Type"] = "application/json";
    }

    const config = {
      method,
      headers,
      body: body
        ? isFormData
          ? body
          : JSON.stringify(body)
        : null,
    };

    let response = await fetch(`${API_URL}/${endpoint}`, config);
    if (response.status === 401) {
      token = await getStoredToken();
      if (!token) {
        throw new Error("Session expired");
      }
      headers.Authorization = `Bearer ${token}`;
      response = await fetch(`${API_URL}/${endpoint}`, config);
    }

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(errorText);
    }

    return await response.json();
  } catch (error) {
    console.error("API request failed", error);
    throw error;
  }
};