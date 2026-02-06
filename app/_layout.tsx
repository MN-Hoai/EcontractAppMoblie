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
      <Stack screenOptions={{ headerShown: false, contentStyle: { paddingTop: 40, backgroundColor: "#FFFFFF" } }}>
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="login" />
        <Stack.Screen name="certificate-info" />
        <Stack.Screen name="choose-certificate" />
        <Stack.Screen name="identity-verification" />
        <Stack.Screen name="id-camera-front" />
        <Stack.Screen name="id-camera-back" />
        <Stack.Screen name="identity-verified" />
        <Stack.Screen name="id-information" />
        <Stack.Screen name="sign-contract" />
        <Stack.Screen name="sign-otp" />

        <Stack.Screen
          name="modal"
          options={{ presentation: "modal", title: "Modal" }}
        />
      </Stack>
      <StatusBar style="auto" />
    </ThemeProvider>
  );
}
