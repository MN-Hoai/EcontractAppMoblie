import { ThemedText } from "@/components/ui/themed-text";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import React, { useState } from "react";
import { Dimensions, Image, Modal, Platform, SafeAreaView, StyleSheet, TouchableOpacity, View } from "react-native";
import { WebView } from "react-native-webview";
import { FONT_OPTIONS } from "./SignOptionsModal";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");

type SignaturePlacementModalProps = {
    visible: boolean;
    pdfUrl: string;
    config: any;
    onClose: () => void;
    onConfirm: (position: { x: number; y: number }) => void;
};

export function SignaturePlacementModal({ visible, pdfUrl, config, onClose, onConfirm }: SignaturePlacementModalProps) {
    const isDark = useColorScheme() === "dark";
    const [position, setPosition] = useState<{ x: number; y: number } | null>(null);

    const handleTouch = (evt: any) => {
        const { locationX, locationY } = evt.nativeEvent;
        setPosition({ x: locationX, y: locationY });
    };

    if (!visible) return null;

    return (
        <Modal visible={visible} animationType="fade" transparent>
            <SafeAreaView style={[styles.container, { backgroundColor: isDark ? "#0D1B23" : "#F8FAFC" }]}>
                {/* Header Instruction */}
                <View style={[styles.header, { backgroundColor: isDark ? "#1D3D47" : "#FFF" }]}>
                    <TouchableOpacity onPress={onClose} style={styles.iconBtn}>
                        <MaterialCommunityIcons name="arrow-left" size={24} color={isDark ? "#FFF" : "#333"} />
                    </TouchableOpacity>
                    <View style={styles.headerTexts}>
                        <ThemedText style={styles.headerTitle}>Chọn vị trí ký</ThemedText>
                        <ThemedText style={styles.instructionText}>* Vui lòng chạm vào bất kỳ vị trí nào trên hợp đồng để thêm chữ ký</ThemedText>
                    </View>
                </View>

                {/* PDF & Touch Overlay */}
                <View style={styles.viewerWrapper}>
                    {pdfUrl ? (
                         <WebView
                            source={{ uri: `https://docs.google.com/gview?embedded=true&url=${encodeURIComponent(pdfUrl)}` }}
                            style={styles.webview}
                            scrollEnabled={true}
                        />
                    ) : (
                        <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
                            <MaterialCommunityIcons name="file-document-outline" size={64} color="#CBD5E1" />
                            <ThemedText style={{ marginTop: 16, opacity: 0.5 }}>Không tìm thấy tài liệu gốc.</ThemedText>
                        </View>
                    )}

                    {/* Touch Receiver Overlay */}
                    <View 
                        style={styles.touchOverlay}
                        onStartShouldSetResponder={() => true}
                        onResponderRelease={handleTouch}
                    >
                        {position && (
                            <View 
                                style={[
                                    styles.signatureStamp, 
                                    { left: position.x - 70, top: position.y - 40 },
                                    (config?.type === 3 || config?.type === 2) && { flexDirection: "column", padding: 12 }
                                ]}
                            >
                                {config?.type === 1 && config?.imageUri && (
                                    <>
                                        <Image source={{ uri: config.imageUri }} style={styles.stampImage} resizeMode="contain" />
                                        <View style={styles.stampInfos}>
                                            {config?.infos?.includes("name") && <ThemedText style={styles.stampText}>Nguyễn Văn A</ThemedText>}
                                            {config?.infos?.includes("email") && <ThemedText style={styles.stampText}>nguyenvana@gmail.com</ThemedText>}
                                            {config?.infos?.includes("phone") && <ThemedText style={styles.stampText}>0987654321</ThemedText>}
                                            {config?.infos?.includes("date") && <ThemedText style={styles.stampText}>28/03/2026</ThemedText>}
                                        </View>
                                    </>
                                )}
                                {config?.type === 2 && config?.imageUri && (
                                    <>
                                        <Image source={{ uri: config.imageUri }} style={[styles.stampImage, { marginBottom: 6, width: 100, height: 60 }]} resizeMode="contain" />
                                        <View style={{ alignItems: "center", gap: 2 }}>
                                            {config?.infos?.includes("name") && <ThemedText style={styles.stampTextCenter}>Nguyễn Văn A</ThemedText>}
                                            {config?.infos?.includes("email") && <ThemedText style={styles.stampTextCenter}>nguyenvana@gmail.com</ThemedText>}
                                            {config?.infos?.includes("phone") && <ThemedText style={styles.stampTextCenter}>0987654321</ThemedText>}
                                            {config?.infos?.includes("date") && <ThemedText style={styles.stampTextCenter}>28/03/2026</ThemedText>}
                                        </View>
                                    </>
                                )}
                                {config?.type === 3 && config?.fontId && (
                                    <>
                                        <View style={{ alignItems: 'center', justifyContent: 'center', marginBottom: 6 }}>
                                            <ThemedText style={[{ fontSize: 18, color: "#1565C0", textAlign: "center" }, FONT_OPTIONS.find(f => f.id === config.fontId)?.style as any]}>Nguyễn Văn A</ThemedText>
                                        </View>
                                        <View style={{ alignItems: "center", gap: 2 }}>
                                            {config?.infos?.includes("email") && <ThemedText style={styles.stampTextCenter}>nguyenvana@gmail.com</ThemedText>}
                                            {config?.infos?.includes("phone") && <ThemedText style={styles.stampTextCenter}>0987654321</ThemedText>}
                                            {config?.infos?.includes("date") && <ThemedText style={styles.stampTextCenter}>28/03/2026</ThemedText>}
                                        </View>
                                    </>
                                )}
                            </View>
                        )}
                    </View>
                </View>

                {/* Footer Actions */}
                <View style={[styles.footer, { backgroundColor: isDark ? "#1D3D47" : "#FFF" }]}>
                    <TouchableOpacity 
                        style={[styles.footerBtn, { backgroundColor: position ? "#2092EC" : (isDark ? "#2A4B56" : "#E2E8F0") }]} 
                        disabled={!position}
                        onPress={() => onConfirm(position!)}
                    >
                        <MaterialCommunityIcons name="check-circle" size={20} color={position ? "#FFF" : (isDark ? "#94A3B8" : "#94A3B8")} />
                        <ThemedText style={[styles.footerBtnText, { color: position ? "#FFF" : (isDark ? "#94A3B8" : "#94A3B8") }]}>
                            Xác nhận vị trí ký
                        </ThemedText>
                    </TouchableOpacity>
                </View>

            </SafeAreaView>
        </Modal>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        flexDirection: "row",
        alignItems: "center",
        padding: 16,
        paddingTop: Platform.OS === 'android' ? 45 : 16,
        borderBottomWidth: 1,
        borderBottomColor: "rgba(0,0,0,0.05)",
        gap: 12,
    },
    iconBtn: {
        width: 40, height: 40,
        borderRadius: 12,
        alignItems: "center", justifyContent: "center",
        backgroundColor: "rgba(0,0,0,0.03)",
    },
    headerTexts: {
        flex: 1,
    },
    headerTitle: {
        fontSize: 16,
        fontWeight: "700",
    },
    instructionText: {
        fontSize: 12,
        color: "#EF4444",
        fontWeight: "600",
        marginTop: 4,
    },
    viewerWrapper: {
        flex: 1,
        position: "relative",
    },
    webview: {
        flex: 1,
    },
    touchOverlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: "rgba(0,0,0,0.01)", // almost transparent to receive touches
        zIndex: 10,
    },
    signatureStamp: {
        position: "absolute",
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "rgba(255, 255, 255, 0.95)",
        borderWidth: 1.5,
        borderColor: "#2092EC",
        borderStyle: "dashed",
        borderRadius: 8,
        padding: 8,
        gap: 8,
        minWidth: 140,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 10,
        elevation: 8,
    },
    stampImage: {
        width: 60, height: 60,
    },
    stampInfos: {
        justifyContent: "center",
    },
    stampText: {
        fontSize: 9,
        fontWeight: "600",
        color: "#1E293B",
    },
    stampTextCenter: {
        fontSize: 9,
        fontWeight: "500",
        color: "#475569",
        textAlign: "center",
    },
    footer: {
        padding: 16,
        borderTopWidth: 1,
        borderTopColor: "rgba(0,0,0,0.05)",
    },
    footerBtn: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        gap: 8,
        paddingVertical: 14,
        borderRadius: 14,
    },
    footerBtnText: {
        fontSize: 15,
        fontWeight: "700",
    },
});
