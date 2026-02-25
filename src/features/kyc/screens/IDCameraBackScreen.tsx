import { ThemedText } from "@/components/ui/themed-text";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import {
    StyleSheet,
    TouchableOpacity,
    View
} from "react-native";

export default function IDCameraBackScreen() {
    const colorScheme = useColorScheme();
    const isDark = colorScheme === "dark";
    const router = useRouter();

    return (
        <View style={[styles.container, { backgroundColor: "#000" }]}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()}>
                    <MaterialCommunityIcons name="close" size={28} color="#FFF" />
                </TouchableOpacity>
                <ThemedText style={styles.title}>Chụp mặt sau CMND/CCCD</ThemedText>
                <View style={{ width: 28 }} />
            </View>

            <View style={styles.cameraPlaceholder}>
                <View style={styles.guideFrame} />
                <ThemedText style={styles.guideText}>Đặt mặt sau thẻ vào khung hình</ThemedText>
            </View>

            <View style={styles.controls}>
                <TouchableOpacity style={styles.shutter} onPress={() => router.push("/id-information")} />
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 20, paddingTop: 60 },
    title: { color: "#FFF", fontSize: 16, fontWeight: "600" },
    cameraPlaceholder: { flex: 1, alignItems: "center", justifyContent: "center" },
    guideFrame: { width: "85%", height: 220, borderWidth: 2, borderColor: "#2092EC", borderRadius: 16, borderStyle: "dashed" },
    guideText: { color: "#FFF", marginTop: 24, fontSize: 14, opacity: 0.8 },
    controls: { height: 120, alignItems: "center", justifyContent: "center" },
    shutter: { width: 70, height: 70, borderRadius: 35, backgroundColor: "#FFF", borderWidth: 5, borderColor: "rgba(255,255,255,0.3)" },
});
