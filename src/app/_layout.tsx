import {
    DarkTheme,
    DefaultTheme,
    ThemeProvider,
} from "@react-navigation/native";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Stack, useRouter, useSegments } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useEffect, useRef, useState } from "react";
import "react-native-reanimated";
import { AppState, AppStateStatus, View, ActivityIndicator } from "react-native";

const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            retry: 2,
            staleTime: 5 * 60 * 1000, // 5 minutes
            refetchOnWindowFocus: false,
        },
    },
});

import { useColorScheme } from "@/hooks/use-color-scheme";
import { useAuthStore } from "@/store/auth-store";
import { getTokens } from "@/services/secure-storage";
import { refreshAccessToken } from "@/services/auth/token-refresh";
import {
    checkSessionTimeout,
    recordBackgroundTime,
    clearBackgroundTime,
} from "@/services/session-manager";
import LockScreen from "@/features/auth/screens/LockScreen";

import { useFonts } from 'expo-font';
import { Arimo_400Regular, Arimo_700Bold, Arimo_400Regular_Italic } from '@expo-google-fonts/arimo';
import { Tinos_400Regular, Tinos_700Bold, Tinos_400Regular_Italic } from '@expo-google-fonts/tinos';
import { Cousine_400Regular } from '@expo-google-fonts/cousine';
import { ComicNeue_400Regular } from '@expo-google-fonts/comic-neue';
import { DancingScript_400Regular } from '@expo-google-fonts/dancing-script';
import { Lora_400Regular, Lora_400Regular_Italic } from '@expo-google-fonts/lora';
import { Roboto_400Regular, Roboto_700Bold } from '@expo-google-fonts/roboto';

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

    const [fontsLoaded] = useFonts({
        Arimo_400Regular,
        Arimo_700Bold,
        Arimo_400Regular_Italic,
        Tinos_400Regular,
        Tinos_700Bold,
        Tinos_400Regular_Italic,
        Cousine_400Regular,
        ComicNeue_400Regular,
        DancingScript_400Regular,
        Lora_400Regular,
        Lora_400Regular_Italic,
        Roboto_400Regular,
        Roboto_700Bold,
    });

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
    if (!hasHydrated || isBootstrapping || !fontsLoaded) {
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
        <QueryClientProvider client={queryClient}>
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
        </QueryClientProvider>
    );
}
