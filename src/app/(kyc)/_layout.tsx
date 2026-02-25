import { Stack } from "expo-router";

export default function KycLayout() {
    return (
        <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="identity-verification" />
            <Stack.Screen name="id-camera-front" />
            <Stack.Screen name="id-camera-back" />
            <Stack.Screen name="id-information" />
        </Stack>
    );
}
