import { useColorScheme } from "@/hooks/use-color-scheme";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Tabs } from "expo-router";

export default function TabLayout() {
    const colorScheme = useColorScheme();
    const isDark = colorScheme === "dark";

    return (
        <Tabs
            screenOptions={{
                headerShown: false,
                tabBarStyle: {
                    backgroundColor: isDark ? "#0D1B23" : "#FFFFFF",
                    borderTopColor: isDark ? "#1D3D47" : "#E0E0E0",
                },
                tabBarActiveTintColor: "#2092EC",
                tabBarInactiveTintColor: isDark ? "#666" : "#AAA",
            }}
        >
            <Tabs.Screen
                name="index"
                options={{
                    title: "Trang chủ",
                    tabBarIcon: ({ color, size }) => (
                        <MaterialCommunityIcons name="home" color={color} size={size} />
                    ),
                }}
            />
            <Tabs.Screen
                name="internal"
                options={{
                    title: "Hợp đồng nội bộ",
                    tabBarIcon: ({ color, size }) => (
                        <MaterialCommunityIcons name="file-document" color={color} size={size} />
                    ),
                }}
            />
            <Tabs.Screen
                name="digital"
                options={{
                    title: "Hợp đồng số",
                    tabBarIcon: ({ color, size }) => (
                        <MaterialCommunityIcons name="signature" color={color} size={size} />
                    ),
                }}
            />
        </Tabs>
    );
}
