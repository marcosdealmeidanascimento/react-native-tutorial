import { authApi, usersApi } from "@/services/finance";
import type { User } from "@/types/api";
import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { clearStoredToken, getStoredToken, setSessionExpiredHandler, storeTokens } from "./api";

interface AuthContextType {
  user: User | null;
  /** Presigned URL of the profile picture, or null when the user has none. */
  profilePicture: string | null;
  isAuth: boolean;
  loading: boolean;
  refreshUser: () => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  deleteAccount: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profilePicture, setProfilePicture] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const resetSession = useCallback(() => {
    setUser(null);
    setProfilePicture(null);
  }, []);

  const refreshUser = useCallback(async () => {
    const [userData, picture] = await Promise.all([usersApi.me(), usersApi.getProfilePicture()]);
    setUser(userData);
    setProfilePicture(picture);
  }, []);

  useEffect(() => {
    setSessionExpiredHandler(resetSession);

    async function loadStorageData() {
      try {
        if (await getStoredToken()) {
          await refreshUser();
        }
      } catch {
        await clearStoredToken();
        resetSession();
      } finally {
        setLoading(false);
      }
    }
    loadStorageData();

    return () => setSessionExpiredHandler(null);
  }, [refreshUser, resetSession]);

  const login = async (email: string, password: string) => {
    const tokens = await authApi.login(email, password);
    await storeTokens(tokens);
    await refreshUser();
  };

  const register = async (name: string, email: string, password: string) => {
    await authApi.register(name, email, password);
  };

  const logout = async () => {
    try {
      // Revokes the refresh token on the server; the local session is cleared regardless.
      await authApi.logout();
    } catch (error) {
      console.log("Failed to revoke session", error);
    }
    await clearStoredToken();
    resetSession();
  };

  const deleteAccount = async () => {
    if (!user) return;
    await usersApi.remove(user.id);
    await clearStoredToken();
    resetSession();
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        profilePicture,
        isAuth: !!user,
        loading,
        refreshUser,
        login,
        register,
        logout,
        deleteAccount,
      }}
    >
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
