import { Stack } from "expo-router";

export default function ContractLayout() {
    return (
        <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="contracts" />
            <Stack.Screen name="contract-detail" />
            <Stack.Screen name="contract-content" />
            <Stack.Screen name="sign-contract" />
            <Stack.Screen name="sign-contract-preview" />
            <Stack.Screen name="sign-contract-view" />
            <Stack.Screen name="sign" />
            <Stack.Screen name="sign-otp" />
            <Stack.Screen name="sign-val" />
        </Stack>
    );
}
