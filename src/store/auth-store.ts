import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { UserInfo } from "../services/auth/auth-types";
import { clearTokens, getTokens, saveTokens } from "../services/secure-storage";

interface AuthStore {
    // Non-sensitive data (persisted to AsyncStorage)
    isAuthenticated: boolean;
    hasHydrated: boolean;
    expiresAt: string | null;
    user: UserInfo | null;
    requestId: string | null;
    email: string;
    phoneNumber: string;

    // Sensitive data (memory-only, NOT persisted)
    accessToken: string | null;
    refreshToken: string | null;

    // Lock screen state (memory-only)
    isLocked: boolean;

    // Actions
    setHasHydrated: (state: boolean) => void;
    setEmail: (email: string) => void;
    setPhoneNumber: (phone: string) => void;
    setAuthenticated: (value: boolean) => void;
    setAuthData: (data: {
        accessToken: string;
        refreshToken: string;
        expiresAt: string;
        user: UserInfo;
        requestId: string;
    }) => Promise<void>;
    loadTokensFromSecureStore: () => Promise<void>;
    lockSession: () => void;
    unlockSession: () => void;
    logout: () => Promise<void>;
}

export const useAuthStore = create<AuthStore>()(
    persist(
        (set, get) => ({
            // Persisted (non-sensitive)
            isAuthenticated: false,
            hasHydrated: false,
            expiresAt: null,
            user: null,
            requestId: null,
            email: "",
            phoneNumber: "",

            // Memory-only (will always start null on app cold start)
            accessToken: null,
            refreshToken: null,
            isLocked: false,

            setHasHydrated: (state: boolean) => set({ hasHydrated: state }),
            setEmail: (email: string) => set({ email }),
            setPhoneNumber: (phone: string) => set({ phoneNumber: phone }),
            setAuthenticated: (value: boolean) => set({ isAuthenticated: value }),

            /**
             * Called after successful login / token refresh.
             * Tokens → SecureStore | User info → AsyncStorage (via persist) | Access token → memory
             */
            setAuthData: async (data) => {
                // Save tokens to SecureStore (secure)
                await saveTokens(data.accessToken, data.refreshToken);

                // Save non-sensitive info to memory + AsyncStorage
                set({
                    accessToken: data.accessToken,
                    refreshToken: data.refreshToken,
                    expiresAt: data.expiresAt,
                    user: data.user,
                    requestId: data.requestId,
                    isAuthenticated: true,
                    email: data.user.email,
                });
            },

            /**
             * Called on app startup to load tokens from SecureStore into memory.
             */
            loadTokensFromSecureStore: async () => {
                const { accessToken, refreshToken } = await getTokens();
                if (accessToken || refreshToken) {
                    set({ accessToken, refreshToken });
                }
            },

            /**
             * Lock the app — shows LockScreen, user must re-authenticate.
             */
            lockSession: () => set({ isLocked: true }),

            /**
             * Unlock the app after successful biometric/password re-authentication.
             */
            unlockSession: () => set({ isLocked: false }),

            /**
             * Clear all auth data: SecureStore, AsyncStorage, and memory.
             */
            logout: async () => {
                await clearTokens();
                set({
                    email: "",
                    phoneNumber: "",
                    isAuthenticated: false,
                    accessToken: null,
                    refreshToken: null,
                    expiresAt: null,
                    user: null,
                    requestId: null,
                });
            },
        }),
        {
            name: "auth-storage",
            storage: createJSONStorage(() => AsyncStorage),
            // Only persist non-sensitive data to AsyncStorage
            partialize: (state) => ({
                isAuthenticated: state.isAuthenticated,
                expiresAt: state.expiresAt,
                user: state.user,
                requestId: state.requestId,
                email: state.email,
                phoneNumber: state.phoneNumber,
            }),
            onRehydrateStorage: () => (state) => {
                state?.setHasHydrated(true);
            },
        },
    ),
);
