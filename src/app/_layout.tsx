import {
    DarkTheme,
    DefaultTheme,
    ThemeProvider,
} from "@react-navigation/native";
import { Stack, useRouter, useSegments } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useEffect, useRef, useState } from "react";
import "react-native-reanimated";
import { AppState, AppStateStatus, View, ActivityIndicator } from "react-native";

import { useColorScheme } from "@/hooks/use-color-scheme";
import { useAuthStore } from "@/store/authStore";
import { getTokens } from "@/services/secureStorage";
import { refreshAccessToken } from "@/services/authService";
import {
    checkSessionTimeout,
    recordBackgroundTime,
    clearBackgroundTime,
} from "@/services/sessionManager";
import LockScreen from "@/features/auth/screens/LockScreen";

export const unstable_settings = {
    anchor: "(tabs)",
};

export default function RootLayout() {
    const colorScheme = useColorScheme();
    const router = useRouter();
    const segments = useSegments();
    const [isBootstrapping, setIsBootstrapping] = useState(true);
    const appStateRef = useRef<AppStateStatus>(AppState.currentState);

    const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
    const hasHydrated = useAuthStore((s) => s.hasHydrated);
    const isLocked = useAuthStore((s) => s.isLocked);
    const expiresAt = useAuthStore((s) => s.expiresAt);
    const loadTokensFromSecureStore = useAuthStore((s) => s.loadTokensFromSecureStore);
    const setAuthData = useAuthStore((s) => s.setAuthData);
    const logout = useAuthStore((s) => s.logout);
    const lockSession = useAuthStore((s) => s.lockSession);
    const user = useAuthStore((s) => s.user);
    const requestId = useAuthStore((s) => s.requestId);

    // ─── Auto-Login Bootstrap ───────────────────────────────────────────────
    useEffect(() => {
        if (!hasHydrated) return;

        const bootstrap = async () => {
            try {
                if (!isAuthenticated) {
                    setIsBootstrapping(false);
                    return;
                }

                // Load tokens into memory from SecureStore
                await loadTokensFromSecureStore();
                const { accessToken, refreshToken } = await getTokens();

                if (!accessToken && !refreshToken) {
                    await logout();
                    setIsBootstrapping(false);
                    return;
                }

                // Check if access token expired
                const now = Date.now();
                const expiry = expiresAt ? new Date(expiresAt).getTime() : 0;
                const isExpired = !expiresAt || now >= expiry - 60_000;

                if (!isExpired && accessToken) {
                    // Token valid, check if lock needed
                    const needsLock = await checkSessionTimeout();
                    if (needsLock) lockSession();
                    setIsBootstrapping(false);
                    return;
                }

                // Try to refresh silently
                if (refreshToken) {
                    try {
                        const authResponse = await refreshAccessToken(refreshToken);
                        if (authResponse?.success && authResponse.data && user) {
                            await setAuthData({
                                accessToken: authResponse.data.access_token,
                                refreshToken: authResponse.data.refresh_token || refreshToken,
                                expiresAt: authResponse.data.expires_at || "",
                                user: authResponse.data.user || user,
                                requestId: requestId || user.id,
                            });
                            // Check if lock needed after refresh
                            const needsLock = await checkSessionTimeout();
                            if (needsLock) lockSession();
                        } else {
                            await logout();
                        }
                    } catch {
                        await logout();
                    }
                } else {
                    await logout();
                }
            } finally {
                setIsBootstrapping(false);
            }
        };

        bootstrap();
    }, [hasHydrated]);

    // ─── AppState: Track background → foreground ───────────────────────────
    useEffect(() => {
        const subscription = AppState.addEventListener("change", async (nextState: AppStateStatus) => {
            const prevState = appStateRef.current;
            appStateRef.current = nextState;

            // App is going to background
            if (nextState === "background" || nextState === "inactive") {
                if (isAuthenticated) {
                    await recordBackgroundTime();
                }
            }

            // App is coming back to foreground
            if (
                (prevState === "background" || prevState === "inactive") &&
                nextState === "active"
            ) {
                if (isAuthenticated) {
                    const needsLock = await checkSessionTimeout();
                    if (needsLock) {
                        lockSession();
                    } else {
                        // Still within timeout window, clear the background time
                        await clearBackgroundTime();
                    }
                }
            }
        });

        return () => subscription.remove();
    }, [isAuthenticated]);

    // ─── Navigation Guard ───────────────────────────────────────────────────
    useEffect(() => {
        if (!hasHydrated || isBootstrapping || isLocked) return;

        const inAuthGroup = segments[0] === "(auth)";

        if (!isAuthenticated && !inAuthGroup) {
            router.replace("/(auth)/login");
        } else if (isAuthenticated && inAuthGroup) {
            router.replace("/(tabs)");
        }
    }, [isAuthenticated, hasHydrated, isBootstrapping, isLocked, segments]);

    // Show loading while hydrating/bootstrapping
    if (!hasHydrated || isBootstrapping) {
        return (
            <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
                <ActivityIndicator size="large" color="#2092EC" />
            </View>
        );
    }

    // Show lock screen if session is locked (authenticated but needs re-auth)
    if (isLocked && isAuthenticated) {
        const handleSwitchAccount = async () => {
            await logout();
        };
        return <LockScreen onSwitchAccount={handleSwitchAccount} />;
    }

    return (
        <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
            <View style={{ flex: 1, backgroundColor: "#FFFFFF" }}>
                <Stack screenOptions={{ headerShown: false, contentStyle: { paddingTop: 0, backgroundColor: "transparent" } }}>
                    <Stack.Screen name="(auth)" />
                    <Stack.Screen name="(tabs)" />
                    <Stack.Screen name="(kyc)" />
                    <Stack.Screen name="(contract)" />
                    <Stack.Screen name="(certificate)" />
                </Stack>
                <StatusBar style="auto" />
            </View>
        </ThemeProvider>
    );
}
