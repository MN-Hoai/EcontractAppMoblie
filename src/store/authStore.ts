import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { UserInfo } from "../services/authService";

interface AuthStore {
  email: string;
  phoneNumber: string;
  isAuthenticated: boolean;
  hasHydrated: boolean;
  accessToken: string | null;
  refreshToken: string | null;
  expiresAt: string | null;
  user: UserInfo | null;
  requestId: string | null;
  setHasHydrated: (state: boolean) => void;
  setEmail: (email: string) => void;
  setPhoneNumber: (phone: string) => void;
  setAuthenticated: (value: boolean) => void;
  setAuthData: (data: { accessToken: string; refreshToken: string; expiresAt: string; user: UserInfo; requestId: string }) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      email: "",
      phoneNumber: "",
      isAuthenticated: false,
      hasHydrated: false,
      accessToken: null,
      refreshToken: null,
      expiresAt: null,
      user: null,
      requestId: null,
      setHasHydrated: (state: boolean) => set({ hasHydrated: state }),
      setEmail: (email: string) => set({ email }),
      setPhoneNumber: (phone: string) => set({ phoneNumber: phone }),
      setAuthenticated: (value: boolean) => set({ isAuthenticated: value }),
      setAuthData: (data) => set({
        accessToken: data.accessToken,
        refreshToken: data.refreshToken,
        expiresAt: data.expiresAt,
        user: data.user,
        requestId: data.requestId,
        isAuthenticated: true,
        email: data.user.email,
      }),
      logout: () => set({
        email: "",
        phoneNumber: "",
        isAuthenticated: false,
        accessToken: null,
        refreshToken: null,
        expiresAt: null,
        user: null,
        requestId: null
      }),
    }),
    {
      name: "auth-storage",
      storage: createJSONStorage(() => AsyncStorage),
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    },
  ),
);
