import { Stack } from "expo-router";

export default function CertificateLayout() {
    return (
        <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="certificate-info" />
            <Stack.Screen name="choose-certificate" />
            <Stack.Screen name="choose-certificate2" />
        </Stack>
    );
}
