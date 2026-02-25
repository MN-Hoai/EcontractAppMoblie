import { MaterialCommunityIcons } from "@expo/vector-icons";
import React from "react";
import {
    ActivityIndicator,
    StyleSheet,
    TouchableOpacity,
    TouchableOpacityProps,
} from "react-native";
import { ThemedText } from "./themed-text";

interface ButtonProps extends TouchableOpacityProps {
    title: string;
    variant?: "primary" | "secondary" | "outline" | "danger";
    loading?: boolean;
    icon?: keyof typeof MaterialCommunityIcons.glyphMap;
    fullWidth?: boolean;
}

export function Button({
    title,
    variant = "primary",
    loading = false,
    icon,
    fullWidth = true,
    style,
    disabled,
    ...props
}: ButtonProps) {
    const getBackgroundColor = () => {
        if (disabled || loading) return "#E0E0E0";
        switch (variant) {
            case "primary": return "#2092EC";
            case "secondary": return "#4CAF50";
            case "outline": return "transparent";
            case "danger": return "#FF5252";
            default: return "#2092EC";
        }
    };

    const getTextColor = () => {
        if (disabled || loading) return "#999";
        if (variant === "outline") return "#2092EC";
        return "#FFF";
    };

    return (
        <TouchableOpacity
            style={[
                styles.base,
                {
                    backgroundColor: getBackgroundColor(),
                    borderWidth: variant === "outline" ? 1.5 : 0,
                    borderColor: variant === "outline" ? "#2092EC" : "transparent",
                    width: fullWidth ? "100%" : "auto",
                },
                style,
            ]}
            disabled={disabled || loading}
            {...props}
        >
            {loading ? (
                <ActivityIndicator color={getTextColor()} />
            ) : (
                <React.Fragment>
                    {icon && (
                        <MaterialCommunityIcons
                            name={icon}
                            size={20}
                            color={getTextColor()}
                            style={styles.icon}
                        />
                    )}
                    <ThemedText
                        style={[
                            styles.text,
                            { color: getTextColor() },
                        ]}
                    >
                        {title}
                    </ThemedText>
                </React.Fragment>
            )}
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    base: {
        height: 54,
        borderRadius: 14,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        paddingHorizontal: 24,
    },
    text: {
        fontSize: 16,
        fontWeight: "700",
    },
    icon: {
        marginRight: 8,
    },
});
