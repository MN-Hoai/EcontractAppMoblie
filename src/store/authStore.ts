import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

interface AuthStore {
  email: string;
  phoneNumber: string;
  isAuthenticated: boolean;
  setEmail: (email: string) => void;
  setPhoneNumber: (phone: string) => void;
  setAuthenticated: (value: boolean) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      email: "",
      phoneNumber: "",
      isAuthenticated: false,
      setEmail: (email: string) => set({ email }),
      setPhoneNumber: (phone: string) => set({ phoneNumber: phone }),
      setAuthenticated: (value: boolean) => set({ isAuthenticated: value }),
      logout: () => set({ email: "", phoneNumber: "", isAuthenticated: false }),
    }),
    {
      name: "auth-storage",
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);
