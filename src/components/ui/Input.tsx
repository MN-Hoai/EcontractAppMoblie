import { useColorScheme } from "@/hooks/use-color-scheme";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import React from "react";
import {
    StyleSheet,
    TextInput,
    TextInputProps,
    View,
} from "react-native";
import { ThemedText } from "./themed-text";

interface InputProps extends TextInputProps {
    label?: string;
    icon?: keyof typeof MaterialCommunityIcons.glyphMap;
    error?: string;
}

export function Input({ label, icon, error, style, ...props }: InputProps) {
    const colorScheme = useColorScheme();
    const isDark = colorScheme === "dark";

    return (
        <View style={styles.container}>
            {label && <ThemedText style={styles.label}>{label}</ThemedText>}
            <View
                style={[
                    styles.inputContainer,
                    {
                        backgroundColor: isDark ? "#1D3D47" : "#F5F7FA",
                        borderColor: error ? "#FF5252" : "transparent",
                        borderWidth: error ? 1 : 0,
                    },
                ]}
            >
                {icon && (
                    <MaterialCommunityIcons
                        name={icon}
                        size={20}
                        color={isDark ? "#AAA" : "#666"}
                        style={styles.icon}
                    />
                )}
                <TextInput
                    style={[
                        styles.input,
                        { color: isDark ? "#FFF" : "#333" },
                        style,
                    ]}
                    placeholderTextColor={isDark ? "#666" : "#AAA"}
                    {...props}
                />
            </View>
            {error && <ThemedText style={styles.errorText}>{error}</ThemedText>}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        width: "100%",
        marginBottom: 20,
    },
    label: {
        fontSize: 14,
        fontWeight: "600",
        marginBottom: 8,
        marginLeft: 4,
    },
    inputContainer: {
        flexDirection: "row",
        alignItems: "center",
        height: 56,
        borderRadius: 16,
        paddingHorizontal: 16,
    },
    icon: {
        marginRight: 12,
    },
    input: {
        flex: 1,
        fontSize: 16,
        fontWeight: "500",
    },
    errorText: {
        color: "#FF5252",
        fontSize: 12,
        marginTop: 4,
        marginLeft: 4,
    },
});
