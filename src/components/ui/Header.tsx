import { useColorScheme } from "@/hooks/use-color-scheme";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React from "react";
import {
    StyleSheet,
    TouchableOpacity,
    View,
} from "react-native";
import { ThemedText } from "./themed-text";

interface HeaderProps {
    title: string;
    showBack?: boolean;
    rightElement?: React.ReactNode;
}

export function Header({ title, showBack = true, rightElement }: HeaderProps) {
    const router = useRouter();
    const colorScheme = useColorScheme();
    const isDark = colorScheme === "dark";

    return (
        <View style={styles.container}>
            {showBack ? (
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <MaterialCommunityIcons
                        name="arrow-left"
                        size={26}
                        color={isDark ? "#FFF" : "#000"}
                    />
                </TouchableOpacity>
            ) : (
                <View style={styles.spacer} />
            )}

            <ThemedText type="subtitle" style={styles.title} numberOfLines={1}>
                {title}
            </ThemedText>

            {rightElement ? (
                <View style={styles.rightContent}>{rightElement}</View>
            ) : (
                <View style={styles.spacer} />
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        height: 60,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingHorizontal: 16,
    },
    backButton: {
        width: 40,
        height: 40,
        alignItems: "center",
        justifyContent: "center",
    },
    title: {
        flex: 1,
        textAlign: "center",
        fontSize: 18,
        fontWeight: "700",
    },
    rightContent: {
        width: 40,
        alignItems: "center",
        justifyContent: "center",
    },
    spacer: {
        width: 40,
    },
});
