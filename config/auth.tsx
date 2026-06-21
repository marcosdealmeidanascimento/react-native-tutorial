import { createContext, useContext, useEffect, useState } from "react";
import { clearStoredToken, getStoredToken, storeAccessToken, storeRefreshToken } from "./api";

interface AuthContextType {
  user: any | null;
  profilePicture: any | null;
  isAuth: boolean;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

const API_URL = process.env.EXPO_PUBLIC_BACKEND_URL;

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<any | null>(null);
  const [profilePicture, setProfilePicture] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadStorageData() {
      try {
        const token = await getStoredToken();
        if (token) {
          const userData = await fetchUserData(token);
          setUser(userData);
          const profilePicture = await getProfilePicture(token);
          setProfilePicture(profilePicture);
        }
      } catch (e) {
        await clearStoredToken();
      } finally {
        setLoading(false);
      }
    }
    loadStorageData();
  }, []);

  const fetchUserData = async (token: string) => {
    const response = await fetch(`${API_URL}/users/me`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!response.ok) throw new Error();
    return await response.json();
  };

  const getProfilePicture = async (token: string) => {
    const response = await fetch(`${API_URL}/users/profile-picture`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!response.ok) throw new Error();
    return await response.json();
  }

  const login = async (email: string, password: string) => {
    try {
      const response = await fetch(`${API_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) throw new Error("Login failed");

      const data = await response.json();

      await storeAccessToken(data.accessToken);
      await storeRefreshToken(data.refreshToken);

      const userData = await fetchUserData(data.accessToken);
      setUser(userData);

      const profilePicture = await getProfilePicture(data.accessToken);
      setProfilePicture(profilePicture.url);

    } catch (error) {
      throw new Error("Login failed");
    }
  };

  const register = async (name: string, email: string, password: string) => {
    try {
      const response = await fetch(`${API_URL}/users`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });

      if (!response.ok) throw new Error("Registration failed");
    } catch (error) {
      throw new Error("Registration failed");
    }
  };

  const logout = async () => {
    try {
      await clearStoredToken();
      setUser(null);
    } catch (error) {
      throw new Error("Logout failed");
    }
  };

  const isAuth = !!user;

  return (
    <AuthContext.Provider value={{ user, isAuth, loading, login, register, logout, profilePicture }}>
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}