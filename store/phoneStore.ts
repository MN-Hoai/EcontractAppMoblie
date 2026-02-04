import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

interface PhoneStore {
  phoneNumber: string;
  setPhoneNumber: (phone: string) => void;
  clearPhoneNumber: () => void;
}

export const usePhoneStore = create<PhoneStore>()(
  persist(
    (set) => ({
      phoneNumber: "",
      setPhoneNumber: (phone: string) => set({ phoneNumber: phone }),
      clearPhoneNumber: () => set({ phoneNumber: "" }),
    }),
    {
      name: "phone-storage",
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);
