import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import "react-native-reanimated";

import { useColorScheme } from "@/hooks/use-color-scheme";

export const unstable_settings = {
  anchor: "(tabs)",
};

export default function RootLayout() {
  const colorScheme = useColorScheme();

  return (
    <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="login" options={{ headerShown: false }} />
        <Stack.Screen
          name="certificate-info"
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="choose-certificate"
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="identity-verification"
          options={{ headerShown: false }}
        />
        <Stack.Screen name="id-camera-front" options={{ headerShown: false }} />
        <Stack.Screen name="id-camera-back" options={{ headerShown: false }} />
        <Stack.Screen
          name="identity-verified"
          options={{ headerShown: false }}
        />
        <Stack.Screen name="id-information" options={{ headerShown: false }} />
        <Stack.Screen name="sign-contract" options={{ headerShown: false }} />
        <Stack.Screen
          name="modal"
          options={{ presentation: "modal", title: "Modal" }}
        />
      </Stack>
      <StatusBar style="auto" />
    </ThemeProvider>
  );
}
