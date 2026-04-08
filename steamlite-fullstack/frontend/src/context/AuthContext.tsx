import {
  createContext,
  PropsWithChildren,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { apiRequest } from "../api/client";
import { User } from "../types";

type AuthContextType = {
  user: User | null;
  loading: boolean;
  token: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (
    username: string,
    email: string,
    password: string,
    marketingEmails: boolean
  ) => Promise<{
    message: string;
    email: string;
    emailDelivery?: {
      recipient: string;
      status: string;
      sentAt: string;
      provider: string;
    };
    verificationPreviewCode?: string;
  }>;
  verifyRegistrationCode: (email: string, code: string) => Promise<{
    message: string;
    email: string;
    username: string;
  }>;
  resendVerificationCode: (email: string) => Promise<{
    message: string;
    email: string;
    emailDelivery?: {
      recipient: string;
      status: string;
      sentAt: string;
      provider: string;
    };
    verificationPreviewCode?: string;
  }>;
  logout: () => void;
  refreshProfile: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const TOKEN_KEY = "steamlite_token";

export const AuthProvider = ({ children }: PropsWithChildren) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem(TOKEN_KEY));
  const [loading, setLoading] = useState(true);

  const persistAuth = (nextToken: string, nextUser: User) => {
    localStorage.setItem(TOKEN_KEY, nextToken);
    setToken(nextToken);
    setUser(nextUser);
  };

  const clearAuth = () => {
    localStorage.removeItem(TOKEN_KEY);
    setToken(null);
    setUser(null);
  };

  const refreshProfile = async () => {
    const response = await apiRequest<{ user: User }>("/auth/me");
    setUser(response.user);
  };

  const login = async (email: string, password: string) => {
    const response = await apiRequest<{ token: string; user: User }>("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });

    persistAuth(response.token, response.user);
  };

  const register = async (
    username: string,
    email: string,
    password: string,
    marketingEmails: boolean
  ) => {
    return apiRequest<{
      message: string;
      email: string;
      emailDelivery?: {
        recipient: string;
        status: string;
        sentAt: string;
        provider: string;
      };
      verificationPreviewCode?: string;
    }>("/auth/register", {
      method: "POST",
      body: JSON.stringify({ username, email, password, marketingEmails }),
    });
  };

  const verifyRegistrationCode = async (email: string, code: string) => {
    return apiRequest<{
      message: string;
      email: string;
      username: string;
    }>("/auth/verify-email", {
      method: "POST",
      body: JSON.stringify({ email, code }),
    });
  };

  const resendVerificationCode = async (email: string) => {
    return apiRequest<{
      message: string;
      email: string;
      emailDelivery?: {
        recipient: string;
        status: string;
        sentAt: string;
        provider: string;
      };
      verificationPreviewCode?: string;
    }>("/auth/resend-verification-code", {
      method: "POST",
      body: JSON.stringify({ email }),
    });
  };

  const logout = () => {
    clearAuth();
  };

  useEffect(() => {
    const bootstrap = async () => {
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        await refreshProfile();
      } catch (_error) {
        clearAuth();
      } finally {
        setLoading(false);
      }
    };

    bootstrap();
  }, []);

  const value = useMemo(
    () => ({
      user,
      loading,
      token,
      login,
      register,
      verifyRegistrationCode,
      resendVerificationCode,
      logout,
      refreshProfile,
    }),
    [user, loading, token]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used within AuthProvider.");
  }

  return context;
};
