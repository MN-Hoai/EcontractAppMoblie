import { ThemedText } from "@/components/ui/themed-text";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import React, { useRef, useState, useEffect } from "react";
import { ActivityIndicator, Alert, Image, Modal, ScrollView, StyleSheet, TouchableOpacity, View } from "react-native";
import SignatureScreen from "react-native-signature-canvas";
import { useAuthStore } from "@/store/authStore";
import { getCertInfo } from "@/services/contractService";

export const FONT_OPTIONS = [
    { id: 'f1', name: 'Roboto (Mặc định)', style: { fontFamily: 'Roboto_400Regular' } },
    { id: 'f2', name: 'Roboto Đậm', style: { fontFamily: 'Roboto_700Bold' } },
    { id: 'f3', name: 'Arial (Arimo)', style: { fontFamily: 'Arimo_400Regular' } },
    { id: 'f4', name: 'Arial In Đậm', style: { fontFamily: 'Arimo_700Bold' } },
    { id: 'f5', name: 'Times New Roman (Tinos)', style: { fontFamily: 'Tinos_400Regular' } },
    { id: 'f6', name: 'Times New Roman Đậm', style: { fontFamily: 'Tinos_700Bold' } },
    { id: 'f7', name: 'Courier New (Cousine)', style: { fontFamily: 'Cousine_400Regular' } },
    { id: 'f8', name: 'Comic Sans (Comic Neue)', style: { fontFamily: 'ComicNeue_400Regular' } },
    { id: 'f9', name: 'Ký tay (Dancing Script)', style: { fontFamily: 'DancingScript_400Regular', fontSize: 28 } },
    { id: 'f10', name: 'Georgia / Lora', style: { fontFamily: 'Lora_400Regular' } },
];

type SignOptionsModalProps = {
    visible: boolean;
    onClose: () => void;
    onConfirm: (config: any) => void;
    loading?: boolean;
};

export function SignOptionsModal({ visible, onClose, onConfirm, loading }: SignOptionsModalProps) {
    const isDark = useColorScheme() === "dark";
    const [selectedSignature, setSelectedSignature] = useState("Chọn chứng thư số");
    const [showSignatureDropdown, setShowSignatureDropdown] = useState(false);
    const [signatureSetupType, setSignatureSetupType] = useState<number>(0);
    const [isDefaultSignature, setIsDefaultSignature] = useState(false);

    // --- Image Setup State ---
    const [isImageSetupVisible, setIsImageSetupVisible] = useState(false);
    const [uploadedImageUri, setUploadedImageUri] = useState<string | null>(null);
    const [uploadedImageBase64, setUploadedImageBase64] = useState<string | null>(null);
    const [isDefaultImage, setIsDefaultImage] = useState(false);
    const [selectedDisplayInfos, setSelectedDisplayInfos] = useState<string[]>([]);

    // --- Font Setup State ---
    const [isFontSetupVisible, setIsFontSetupVisible] = useState(false);
    const [selectedFontId, setSelectedFontId] = useState<string>("f1");
    const [isFontConfigured, setIsFontConfigured] = useState(false);
    const [showFontDropdown, setShowFontDropdown] = useState(false);

    // --- Hand Draw Setup State ---
    const [isHandDrawSetupVisible, setIsHandDrawSetupVisible] = useState(false);
    const [handDrawUri, setHandDrawUri] = useState<string | null>(null);
    const [penColor, setPenColor] = useState<string>("#1565C0"); // Mặc định xanh dương
    const [penWidth, setPenWidth] = useState<number>(3);
    const [isHandDrawConfigured, setIsHandDrawConfigured] = useState(false);
    const [scrollEnabled, setScrollEnabled] = useState(true);
    const signatureRef = useRef<any>(null);

    const handleClearDraw = () => {
        signatureRef.current?.clearSignature();
        setHandDrawUri(null);
        setIsHandDrawConfigured(false);
    };

    const handleSaveDraw = () => {
        // triggers onOK callback
        signatureRef.current?.readSignature();
    };

    const handleSignatureOK = (signature: string) => {
        setHandDrawUri(signature);
        setIsHandDrawConfigured(true);
        setIsHandDrawSetupVisible(false); // Only close after save completes
    };

    const infoOptions = [
        { id: "name", label: "Tên" },
        { id: "email", label: "Mail" },
        { id: "phone", label: "SĐT" },
        { id: "date", label: "Ngày ký" },
    ];

    const pickImage = async () => {
        let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            base64: true,
            quality: 1,
        });

        if (!result.canceled) {
            const asset = result.assets[0];
            if (asset.fileSize && asset.fileSize > 3 * 1024 * 1024) {
                Alert.alert("Dung lượng quá lớn", "Vui lòng chọn ảnh chữ ký có dung lượng dưới 3MB.");
                return;
            }
            setUploadedImageUri(asset.uri);
            setUploadedImageBase64(asset.base64 || null);
        }
    };

    const toggleInfo = (id: string) => {
        if (selectedDisplayInfos.includes(id)) {
            setSelectedDisplayInfos(selectedDisplayInfos.filter(item => item !== id));
        } else {
            setSelectedDisplayInfos([...selectedDisplayInfos, id]);
        }
    };

    const { user } = useAuthStore();
    const [signatures, setSignatures] = useState<string[]>([]);
    const [isLoadingCerts, setIsLoadingCerts] = useState(false);

    useEffect(() => {
        const loadCerts = async () => {
            if (!user?.id) return;
            setIsLoadingCerts(true);
            try {
                const res = await getCertInfo(user.id);
                const certData = res.data || res.Data || [];
                if (certData.length > 0) {
                    const certList = certData.map(c => c.credentialId || c.CredentialId || "Không có số chứng thư");
                    setSignatures(certList);
                    setSelectedSignature(certList[0]);
                } else {
                    setSelectedSignature("Không tìm thấy chứng thư");
                    setSignatures([]);
                }
            } catch (error) {
                console.log("Lỗi tải chứng thư", error);
                setSelectedSignature("Lỗi tải chứng thư");
                setSignatures([]);
            } finally {
                setIsLoadingCerts(false);
            }
        };
        
        if (visible) {
            loadCerts();
        }
    }, [visible, user?.id]);

    const setups = [
        { id: 0, title: "Ký số Viettel", icon: "shield-check" },
        { id: 1, title: "Chữ ký ảnh", icon: "image-outline", hasAction: true },
        { id: 2, title: "Chữ ký vẽ tay", icon: "draw", hasAction: true },
        { id: 3, title: "Kiểu chữ (Font)", icon: "format-text", hasAction: true },
    ];

    return (
        <Modal visible={visible} transparent animationType="slide">
            <View style={styles.overlay}>
                <TouchableOpacity style={styles.backdrop} activeOpacity={1} onPress={onClose} />
                <View style={[styles.container, { backgroundColor: isDark ? "#1D3D47" : "#FFF" }]}>

                    {isImageSetupVisible ? (
                        /* --- MÀN HÌNH THIẾT LẬP CHỮ KÝ ẢNH --- */
                        <>
                            <View style={styles.header}>
                                <TouchableOpacity onPress={() => setIsImageSetupVisible(false)} style={[styles.closeBtn, { backgroundColor: isDark ? "rgba(255,255,255,0.1)" : "#F1F5F9" }]}>
                                    <MaterialCommunityIcons name="arrow-left" size={22} color={isDark ? "#FFF" : "#333"} />
                                </TouchableOpacity>
                                <ThemedText style={[styles.title, { flex: 1, marginLeft: 16 }]}>Cài đặt chữ ký ảnh</ThemedText>
                            </View>

                            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
                                <View style={styles.section}>
                                    <ThemedText style={styles.sectionTitle}>Hình ảnh chữ ký</ThemedText>
                                    {uploadedImageUri ? (
                                        <View style={styles.imagePreviewContainer}>
                                            <Image source={{ uri: uploadedImageUri }} style={styles.previewImage} resizeMode="contain" />
                                            <View style={styles.previewInfos}>
                                                {selectedDisplayInfos.includes("name") && <ThemedText style={styles.previewText}>Nguyễn Văn A</ThemedText>}
                                                {selectedDisplayInfos.includes("email") && <ThemedText style={styles.previewText}>nguyenvana@gmail.com</ThemedText>}
                                                {selectedDisplayInfos.includes("phone") && <ThemedText style={styles.previewText}>0987654321</ThemedText>}
                                                {selectedDisplayInfos.includes("date") && <ThemedText style={styles.previewText}>28/03/2026</ThemedText>}
                                            </View>
                                            <TouchableOpacity style={styles.deleteImageBtn} onPress={() => setUploadedImageUri(null)}>
                                                <MaterialCommunityIcons name="delete-outline" size={20} color="#FFF" />
                                                <ThemedText style={{ color: "#FFF", fontSize: 13, fontWeight: "600", marginLeft: 4 }}>Xóa ảnh</ThemedText>
                                            </TouchableOpacity>
                                        </View>
                                    ) : (
                                        <TouchableOpacity style={[styles.uploadBox, { borderColor: isDark ? "rgba(255,255,255,0.15)" : "#CBD5E1", backgroundColor: isDark ? "rgba(255,255,255,0.02)" : "#F8FAFC" }]} onPress={pickImage}>
                                            <MaterialCommunityIcons name="cloud-upload-outline" size={32} color="#2092EC" />
                                            <ThemedText style={[styles.uploadText, { color: isDark ? "#A0AEC0" : "#64748B" }]}>Nhấn để tải ảnh lên (PNG, JPG)</ThemedText>
                                        </TouchableOpacity>
                                    )}
                                </View>

                                <View style={styles.section}>
                                    <TouchableOpacity style={styles.checkboxRow} onPress={() => setIsDefaultImage(!isDefaultImage)}>
                                        <MaterialCommunityIcons name={isDefaultImage ? "checkbox-marked" : "checkbox-blank-outline"} size={22} color={isDefaultImage ? "#2092EC" : (isDark ? "#A0AEC0" : "#94A3B8")} />
                                        <ThemedText style={[styles.checkboxLabel, { color: isDark ? "#E2E8F0" : "#475569" }]}>Đặt làm hình ảnh ký mặc định</ThemedText>
                                    </TouchableOpacity>
                                </View>

                                <View style={styles.section}>
                                    <ThemedText style={styles.sectionTitle}>Nội dung hiển thị (Kèm theo ảnh)</ThemedText>
                                    <View style={{ gap: 4 }}>
                                        {infoOptions.map(option => (
                                            <TouchableOpacity key={option.id} style={styles.checkboxRow} onPress={() => toggleInfo(option.id)}>
                                                <MaterialCommunityIcons name={selectedDisplayInfos.includes(option.id) ? "checkbox-marked" : "checkbox-blank-outline"} size={22} color={selectedDisplayInfos.includes(option.id) ? "#2092EC" : (isDark ? "#A0AEC0" : "#94A3B8")} />
                                                <ThemedText style={[styles.checkboxLabel, { color: isDark ? "#E2E8F0" : "#475569" }]}>{option.label}</ThemedText>
                                            </TouchableOpacity>
                                        ))}
                                    </View>
                                </View>
                            </ScrollView>

                            <View style={[styles.footer, { borderTopColor: isDark ? "rgba(255,255,255,0.1)" : "#F1F5F9" }]}>
                                <TouchableOpacity style={[styles.footerBtn, styles.cancelBtn, { backgroundColor: isDark ? "#2A4B56" : "#F1F5F9" }]} onPress={() => setIsImageSetupVisible(false)}>
                                    <ThemedText style={[styles.cancelBtnText, { color: isDark ? "#E2E8F0" : "#64748B" }]}>Hủy bỏ</ThemedText>
                                </TouchableOpacity>
                                <TouchableOpacity style={[styles.footerBtn, styles.confirmBtn]} onPress={() => setIsImageSetupVisible(false)}>
                                    <ThemedText style={styles.confirmBtnText}>Lưu thiết lập</ThemedText>
                                </TouchableOpacity>
                            </View>
                        </>
                    ) : isFontSetupVisible ? (
                        /* --- MÀN HÌNH THIẾT LẬP KIỂU CHỮ --- */
                        <>
                            <View style={styles.header}>
                                <TouchableOpacity onPress={() => setIsFontSetupVisible(false)} style={[styles.closeBtn, { backgroundColor: isDark ? "rgba(255,255,255,0.1)" : "#F1F5F9" }]}>
                                    <MaterialCommunityIcons name="arrow-left" size={22} color={isDark ? "#FFF" : "#333"} />
                                </TouchableOpacity>
                                <ThemedText style={[styles.title, { flex: 1, marginLeft: 16 }]}>Cài đặt kiểu chữ</ThemedText>
                            </View>

                            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
                                <View style={styles.section}>
                                    <ThemedText style={styles.sectionTitle}>Chọn kiểu chữ (Font)</ThemedText>

                                    <TouchableOpacity
                                        style={[styles.dropdownBtn, { borderColor: isDark ? "rgba(255,255,255,0.15)" : "#E2E8F0", backgroundColor: isDark ? "rgba(255,255,255,0.05)" : "#F8FAFC" }]}
                                        onPress={() => setShowFontDropdown(!showFontDropdown)}
                                    >
                                        <ThemedText style={[styles.dropdownText, { color: isDark ? "#FFF" : "#333" }, FONT_OPTIONS.find(f => f.id === selectedFontId)?.style as any]}>
                                            {FONT_OPTIONS.find(f => f.id === selectedFontId)?.name}
                                        </ThemedText>
                                        <MaterialCommunityIcons name={showFontDropdown ? "chevron-up" : "chevron-down"} size={22} color={isDark ? "#A0AEC0" : "#64748B"} />
                                    </TouchableOpacity>

                                    {showFontDropdown && (
                                        <View style={[styles.dropdownMenu, { backgroundColor: isDark ? "#2A4B56" : "#FFF", borderColor: isDark ? "rgba(255,255,255,0.1)" : "#E2E8F0", maxHeight: 200 }]}>
                                            <ScrollView nestedScrollEnabled showsVerticalScrollIndicator={false}>
                                                {FONT_OPTIONS.map((font, idx) => (
                                                    <TouchableOpacity
                                                        key={font.id}
                                                        style={[styles.dropdownItem, idx < FONT_OPTIONS.length - 1 && { borderBottomWidth: 1, borderBottomColor: isDark ? "rgba(255,255,255,0.05)" : "#F1F5F9" }]}
                                                        onPress={() => {
                                                            setSelectedFontId(font.id);
                                                            setShowFontDropdown(false);
                                                        }}
                                                    >
                                                        <ThemedText style={[{ color: selectedFontId === font.id ? "#2092EC" : (isDark ? "#FFF" : "#333"), fontWeight: selectedFontId === font.id ? "700" : "400", flex: 1, fontSize: 16 }, font.style as any]}>
                                                            {font.name}
                                                        </ThemedText>
                                                        {selectedFontId === font.id && <MaterialCommunityIcons name="check-circle" size={18} color="#2092EC" />}
                                                    </TouchableOpacity>
                                                ))}
                                            </ScrollView>
                                        </View>
                                    )}
                                </View>

                                <View style={styles.section}>
                                    <ThemedText style={styles.sectionTitle}>Xem trước chữ ký</ThemedText>
                                    <View style={styles.fontPreviewContainer}>
                                        <ThemedText style={[{ fontSize: 20, color: isDark ? "#2092EC" : "#1565C0", textAlign: 'center', marginBottom: 8 }, FONT_OPTIONS.find(f => f.id === selectedFontId)?.style as any]}>Nguyễn Văn A</ThemedText>

                                        <View style={styles.previewInfosVertical}>
                                            {selectedDisplayInfos.includes("name") && <ThemedText style={styles.previewTextCenter}>Nguyễn Văn A</ThemedText>}
                                            {selectedDisplayInfos.includes("email") && <ThemedText style={styles.previewTextCenter}>nguyenvana@gmail.com</ThemedText>}
                                            {selectedDisplayInfos.includes("phone") && <ThemedText style={styles.previewTextCenter}>0987654321</ThemedText>}
                                            {selectedDisplayInfos.includes("date") && <ThemedText style={styles.previewTextCenter}>28/03/2026</ThemedText>}
                                        </View>
                                    </View>
                                </View>

                                {/* Common fields */}
                                <View style={styles.section}>
                                    <TouchableOpacity style={styles.checkboxRow} onPress={() => setIsDefaultImage(!isDefaultImage)}>
                                        <MaterialCommunityIcons name={isDefaultImage ? "checkbox-marked" : "checkbox-blank-outline"} size={22} color={isDefaultImage ? "#2092EC" : (isDark ? "#A0AEC0" : "#94A3B8")} />
                                        <ThemedText style={[styles.checkboxLabel, { color: isDark ? "#E2E8F0" : "#475569" }]}>Đặt làm kiểu chữ mặc định</ThemedText>
                                    </TouchableOpacity>
                                </View>

                                <View style={styles.section}>
                                    <ThemedText style={styles.sectionTitle}>Nội dung hiển thị (Kèm theo)</ThemedText>
                                    <View style={{ gap: 4 }}>
                                        {infoOptions.filter(o => o.id !== "name").map(option => (
                                            <TouchableOpacity key={option.id} style={styles.checkboxRow} onPress={() => toggleInfo(option.id)}>
                                                <MaterialCommunityIcons name={selectedDisplayInfos.includes(option.id) ? "checkbox-marked" : "checkbox-blank-outline"} size={22} color={selectedDisplayInfos.includes(option.id) ? "#2092EC" : (isDark ? "#A0AEC0" : "#94A3B8")} />
                                                <ThemedText style={[styles.checkboxLabel, { color: isDark ? "#E2E8F0" : "#475569" }]}>{option.label}</ThemedText>
                                            </TouchableOpacity>
                                        ))}
                                    </View>
                                </View>
                            </ScrollView>

                            <View style={[styles.footer, { borderTopColor: isDark ? "rgba(255,255,255,0.1)" : "#F1F5F9" }]}>
                                <TouchableOpacity style={[styles.footerBtn, styles.cancelBtn, { backgroundColor: isDark ? "#2A4B56" : "#F1F5F9" }]} onPress={() => setIsFontSetupVisible(false)}>
                                    <ThemedText style={[styles.cancelBtnText, { color: isDark ? "#E2E8F0" : "#64748B" }]}>Hủy bỏ</ThemedText>
                                </TouchableOpacity>
                                <TouchableOpacity style={[styles.footerBtn, styles.confirmBtn]} onPress={() => { setIsFontConfigured(true); setIsFontSetupVisible(false); }}>
                                    <ThemedText style={styles.confirmBtnText}>Lưu thiết lập</ThemedText>
                                </TouchableOpacity>
                            </View>
                        </>
                    ) : isHandDrawSetupVisible ? (
                        /* --- MÀN HÌNH THIẾT LẬP VẼ CHỮ KÝ TAY --- */
                        <>
                            <View style={styles.header}>
                                <TouchableOpacity onPress={() => setIsHandDrawSetupVisible(false)} style={[styles.closeBtn, { backgroundColor: isDark ? "rgba(255,255,255,0.1)" : "#F1F5F9" }]}>
                                    <MaterialCommunityIcons name="arrow-left" size={22} color={isDark ? "#FFF" : "#333"} />
                                </TouchableOpacity>
                                <ThemedText style={[styles.title, { flex: 1, marginLeft: 16 }]}>Cài đặt chữ ký tay</ThemedText>
                            </View>

                            <ScrollView scrollEnabled={scrollEnabled} showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
                                <View style={styles.section}>
                                    <ThemedText style={styles.sectionTitle}>Khung vẽ chữ ký</ThemedText>
                                    <View style={{ borderWidth: 1, borderColor: isDark ? "rgba(255,255,255,0.15)" : "#E2E8F0", borderRadius: 14, overflow: 'hidden', backgroundColor: '#FFF' }}>
                                        <View style={{ height: 220 }}>
                                            <SignatureScreen
                                                ref={signatureRef}
                                                onBegin={() => setScrollEnabled(false)}
                                                onEnd={() => setScrollEnabled(true)}
                                                onOK={handleSignatureOK}
                                                penColor={penColor}
                                                minWidth={penWidth}
                                                maxWidth={penWidth + 1}
                                                descriptionText=""
                                                clearText="Xóa"
                                                confirmText="Lưu"
                                                webStyle={`
                                                    .m-signature-pad { box-shadow: none; border: none; margin: 0; padding: 0; }
                                                    .m-signature-pad--body { border: none; }
                                                    .m-signature-pad--footer { display: none; margin: 0px; }
                                                    body,html { width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; background-color: #FFF; padding: 0; margin: 0; }
                                                `}
                                            />
                                        </View>
                                        {selectedDisplayInfos.length > 0 && (
                                            <View style={{ paddingBottom: 16, paddingTop: 6, alignItems: 'center', gap: 2 }}>
                                                {selectedDisplayInfos.includes("name") && <ThemedText style={styles.previewTextCenter}>Nguyễn Văn A</ThemedText>}
                                                {selectedDisplayInfos.includes("email") && <ThemedText style={styles.previewTextCenter}>nguyenvana@gmail.com</ThemedText>}
                                                {selectedDisplayInfos.includes("phone") && <ThemedText style={styles.previewTextCenter}>0987654321</ThemedText>}
                                                {selectedDisplayInfos.includes("date") && <ThemedText style={styles.previewTextCenter}>28/03/2026</ThemedText>}
                                            </View>
                                        )}
                                    </View>
                                </View>

                                <View style={styles.section}>
                                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                                        <ThemedText style={styles.sectionTitle}>Màu & Nét bút</ThemedText>
                                        <TouchableOpacity onPress={handleClearDraw} style={{ flexDirection: 'row', alignItems: 'center' }}>
                                            <MaterialCommunityIcons name="eraser" size={16} color="#EF4444" />
                                            <ThemedText style={{ color: "#EF4444", fontSize: 13, fontWeight: "600", marginLeft: 4 }}>Xóa vẽ lại</ThemedText>
                                        </TouchableOpacity>
                                    </View>
                                    <View style={{ flexDirection: 'row', gap: 16 }}>
                                        {/* Colors */}
                                        <View style={{ flexDirection: 'row', gap: 10 }}>
                                            {[
                                                { id: "#1565C0", name: "Xanh" },
                                                { id: "#000000", name: "Đen" },
                                                { id: "#EF4444", name: "Đỏ" },
                                            ].map(color => (
                                                <TouchableOpacity key={color.id} onPress={() => setPenColor(color.id)} style={{ width: 32, height: 32, borderRadius: 16, backgroundColor: color.id, borderWidth: 3, borderColor: penColor === color.id ? "rgba(0,0,0,0.2)" : "transparent", alignItems: 'center', justifyContent: 'center' }}>
                                                    {penColor === color.id && <MaterialCommunityIcons name="check" size={16} color="#FFF" />}
                                                </TouchableOpacity>
                                            ))}
                                        </View>
                                        <View style={{ width: 1, backgroundColor: isDark ? "rgba(255,255,255,0.1)" : "#E2E8F0" }} />
                                        {/* Widths */}
                                        <View style={{ flexDirection: 'row', gap: 8, alignItems: 'center' }}>
                                            {[
                                                { width: 1, label: "Mảnh" },
                                                { width: 3, label: "Vừa" },
                                                { width: 6, label: "Đậm" },
                                            ].map(w => (
                                                <TouchableOpacity key={w.width} onPress={() => setPenWidth(w.width)} style={{ paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8, backgroundColor: penWidth === w.width ? "rgba(32, 146, 236, 0.15)" : (isDark ? "#2A4B56" : "#F1F5F9") }}>
                                                    <ThemedText style={{ color: penWidth === w.width ? "#2092EC" : (isDark ? "#FFF" : "#64748B"), fontSize: 13, fontWeight: "600" }}>{w.label}</ThemedText>
                                                </TouchableOpacity>
                                            ))}
                                        </View>
                                    </View>
                                </View>

                                {/* Common metadata */}
                                <View style={styles.section}>
                                    <TouchableOpacity style={styles.checkboxRow} onPress={() => setIsDefaultImage(!isDefaultImage)}>
                                        <MaterialCommunityIcons name={isDefaultImage ? "checkbox-marked" : "checkbox-blank-outline"} size={22} color={isDefaultImage ? "#2092EC" : (isDark ? "#A0AEC0" : "#94A3B8")} />
                                        <ThemedText style={[styles.checkboxLabel, { color: isDark ? "#E2E8F0" : "#475569" }]}>Đặt làm thiết lập tương lai</ThemedText>
                                    </TouchableOpacity>
                                </View>

                                <View style={styles.section}>
                                    <ThemedText style={styles.sectionTitle}>Nội dung hiển thị (Kèm theo)</ThemedText>
                                    <View style={{ gap: 4 }}>
                                        {infoOptions.map(option => (
                                            <TouchableOpacity key={option.id} style={styles.checkboxRow} onPress={() => toggleInfo(option.id)}>
                                                <MaterialCommunityIcons name={selectedDisplayInfos.includes(option.id) ? "checkbox-marked" : "checkbox-blank-outline"} size={22} color={selectedDisplayInfos.includes(option.id) ? "#2092EC" : (isDark ? "#A0AEC0" : "#94A3B8")} />
                                                <ThemedText style={[styles.checkboxLabel, { color: isDark ? "#E2E8F0" : "#475569" }]}>{option.label}</ThemedText>
                                            </TouchableOpacity>
                                        ))}
                                    </View>
                                </View>
                            </ScrollView>

                            <View style={[styles.footer, { borderTopColor: isDark ? "rgba(255,255,255,0.1)" : "#F1F5F9" }]}>
                                <TouchableOpacity style={[styles.footerBtn, styles.cancelBtn, { backgroundColor: isDark ? "#2A4B56" : "#F1F5F9" }]} onPress={() => setIsHandDrawSetupVisible(false)}>
                                    <ThemedText style={[styles.cancelBtnText, { color: isDark ? "#E2E8F0" : "#64748B" }]}>Hủy bỏ</ThemedText>
                                </TouchableOpacity>
                                <TouchableOpacity style={[styles.footerBtn, styles.confirmBtn]} onPress={handleSaveDraw}>
                                    <ThemedText style={styles.confirmBtnText}>Lưu thiết lập</ThemedText>
                                </TouchableOpacity>
                            </View>
                        </>
                    ) : (
                        /* --- MÀN HÌNH CHÍNH --- */
                        <>
                            <View style={styles.header}>
                                <ThemedText style={styles.title}>Thiết lập chữ ký</ThemedText>
                                <TouchableOpacity onPress={onClose} style={[styles.closeBtn, { backgroundColor: isDark ? "rgba(255,255,255,0.1)" : "#F1F5F9" }]}>
                                    <MaterialCommunityIcons name="close" size={22} color={isDark ? "#FFF" : "#333"} />
                                </TouchableOpacity>
                            </View>

                            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
                                {/* Phần 1: Chọn chữ ký số */}
                                <View style={styles.section}>
                                    <ThemedText style={styles.sectionTitle}>1. Chọn chứng thư số</ThemedText>
                                    <TouchableOpacity
                                        style={[styles.dropdownBtn, { borderColor: isDark ? "rgba(255,255,255,0.15)" : "#E2E8F0", backgroundColor: isDark ? "rgba(255,255,255,0.05)" : "#F8FAFC" }]}
                                        onPress={() => setShowSignatureDropdown(!showSignatureDropdown)}
                                        disabled={isLoadingCerts || signatures.length === 0}
                                    >
                                        <ThemedText style={[styles.dropdownText, { color: isDark ? "#FFF" : "#333" }]}>
                                            {isLoadingCerts ? "Đang tải chứng thư..." : selectedSignature}
                                        </ThemedText>
                                        {isLoadingCerts ? (
                                            <ActivityIndicator size="small" color="#2092EC" />
                                        ) : (
                                            <MaterialCommunityIcons name={showSignatureDropdown ? "chevron-up" : "chevron-down"} size={8} color={isDark ? "#A0AEC0" : "#64748B"} />
                                        )}
                                    </TouchableOpacity>

                                    {showSignatureDropdown && (
                                        <View style={[styles.dropdownMenu, { backgroundColor: isDark ? "#2A4B56" : "#FFF", borderColor: isDark ? "rgba(255,255,255,0.1)" : "#E2E8F0" }]}>
                                            {signatures.map((sig, idx) => (
                                                <TouchableOpacity
                                                    key={idx}
                                                    style={[styles.dropdownItem, idx < signatures.length - 1 && { borderBottomWidth: 1, borderBottomColor: isDark ? "rgba(255,255,255,0.05)" : "#F1F5F9" }]}
                                                    onPress={() => {
                                                        setSelectedSignature(sig);
                                                        setShowSignatureDropdown(false);
                                                    }}
                                                >
                                                    <ThemedText style={{ color: selectedSignature === sig ? "#2092EC" : (isDark ? "#FFF" : "#333"), fontWeight: selectedSignature === sig ? "700" : "400", flex: 1 }}>{sig}</ThemedText>
                                                    {selectedSignature === sig && <MaterialCommunityIcons name="check-circle" size={18} color="#2092EC" />}
                                                </TouchableOpacity>
                                            ))}
                                        </View>
                                    )}

                                    {/* Checkbox: Chọn làm mặc định */}
                                    <TouchableOpacity
                                        style={styles.checkboxRow}
                                        onPress={() => setIsDefaultSignature(!isDefaultSignature)}
                                    >
                                        <MaterialCommunityIcons
                                            name={isDefaultSignature ? "checkbox-marked" : "checkbox-blank-outline"}
                                            size={22}
                                            color={isDefaultSignature ? "#2092EC" : (isDark ? "#A0AEC0" : "#94A3B8")}
                                        />
                                        <ThemedText style={[styles.checkboxLabel, { color: isDark ? "#E2E8F0" : "#475569" }]}>Đặt làm chứng thư mặc định</ThemedText>
                                    </TouchableOpacity>
                                </View>

                                {/* Phần 2: Thiết lập chữ ký */}
                                <View style={styles.section}>
                                    <ThemedText style={styles.sectionTitle}>2. Phương thức ký</ThemedText>
                                    <View style={styles.setupGrid}>
                                        {setups.map((setup) => {
                                            const isSelected = signatureSetupType === setup.id;
                                            return (
                                                <TouchableOpacity
                                                    key={setup.id}
                                                    style={[
                                                        styles.setupItem,
                                                        { borderColor: isSelected ? "#2092EC" : (isDark ? "rgba(255,255,255,0.15)" : "#E2E8F0") },
                                                        isSelected && { backgroundColor: isDark ? "rgba(32, 146, 236, 0.15)" : "#F0F8FF" }
                                                    ]}
                                                    onPress={() => {
                                                        setSignatureSetupType(setup.id);
                                                        if (setup.id === 1) { // Mở form cài đặt ảnh nếu chọn ảnh chữ ký
                                                            setIsImageSetupVisible(true);
                                                        }
                                                        if (setup.id === 2) {
                                                            setIsHandDrawSetupVisible(true);
                                                        }
                                                        if (setup.id === 3) {
                                                            setIsFontSetupVisible(true);
                                                        }
                                                    }}
                                                >
                                                    <View style={styles.setupItemContent}>
                                                        <MaterialCommunityIcons name={setup.icon as any} size={28} color={isSelected ? "#2092EC" : (isDark ? "#A0AEC0" : "#64748B")} />
                                                        <ThemedText style={[styles.setupItemText, isSelected && { color: "#2092EC", fontWeight: "700" }, isDark && !isSelected && { color: "#E2E8F0" }]}>{setup.title}</ThemedText>

                                                        {setup.id === 1 && uploadedImageUri && (
                                                            <View style={styles.configuredBadge}>
                                                                <MaterialCommunityIcons name="check-circle" size={14} color="#4CAF50" />
                                                                <ThemedText style={{ fontSize: 11, color: "#4CAF50", fontWeight: '700' }}>Đã thiết lập ảnh</ThemedText>
                                                            </View>
                                                        )}
                                                        {setup.id === 2 && isHandDrawConfigured && (
                                                            <View style={styles.configuredBadge}>
                                                                <MaterialCommunityIcons name="check-circle" size={14} color="#4CAF50" />
                                                                <ThemedText style={{ fontSize: 11, color: "#4CAF50", fontWeight: '700' }}>Đã thiết lập nét vẽ</ThemedText>
                                                            </View>
                                                        )}
                                                        {setup.id === 3 && isFontConfigured && (
                                                            <View style={styles.configuredBadge}>
                                                                <MaterialCommunityIcons name="check-circle" size={14} color="#4CAF50" />
                                                                <ThemedText style={{ fontSize: 11, color: "#4CAF50", fontWeight: '700' }}>Đã thiết lập font</ThemedText>
                                                            </View>
                                                        )}
                                                    </View>
                                                    {setup.hasAction && (
                                                        <View style={styles.editIcon}>
                                                            <MaterialCommunityIcons name="cog-outline" size={18} color={isSelected ? "#2092EC" : (isDark ? "#A0AEC0" : "#94A3B8")} />
                                                        </View>
                                                    )}
                                                </TouchableOpacity>
                                            );
                                        })}
                                    </View>
                                </View>
                            </ScrollView>

                            <View style={[styles.footer, { borderTopColor: isDark ? "rgba(255,255,255,0.1)" : "#F1F5F9" }]}>
                                <TouchableOpacity style={[styles.footerBtn, styles.cancelBtn, { backgroundColor: isDark ? "#2A4B56" : "#F1F5F9" }]} onPress={onClose}>
                                    <ThemedText style={[styles.cancelBtnText, { color: isDark ? "#E2E8F0" : "#64748B" }]}>Hủy bỏ</ThemedText>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    style={[styles.footerBtn, styles.confirmBtn]}
                                    onPress={() => onConfirm({ 
                                        type: signatureSetupType, 
                                        selectedCertificate: selectedSignature,
                                        imageUri: signatureSetupType === 2 ? handDrawUri : uploadedImageUri, 
                                        imageBase64: signatureSetupType === 2 ? handDrawUri : uploadedImageBase64,
                                        fontId: selectedFontId, 
                                        infos: selectedDisplayInfos 
                                    })}
                                    disabled={loading}
                                >
                                    {loading ? (
                                        <ActivityIndicator size="small" color="#FFF" />
                                    ) : (
                                        <>
                                            <MaterialCommunityIcons name="pen" size={20} color="#FFF" />
                                            <ThemedText style={styles.confirmBtnText}>Xác nhận ký</ThemedText>
                                        </>
                                    )}
                                </TouchableOpacity>
                            </View>
                        </>
                    )}

                </View>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        justifyContent: "flex-end",
    },
    backdrop: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: "rgba(0,0,0,0.5)",
    },
    container: {
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        maxHeight: "85%",
        elevation: 20,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: -5 },
        shadowOpacity: 0.1,
        shadowRadius: 10,
    },
    header: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingHorizontal: 20,
        paddingTop: 20,
        paddingBottom: 15,
    },
    title: {
        fontSize: 18,
        fontWeight: "800",
    },
    closeBtn: {
        width: 36, height: 36,
        borderRadius: 18,
        alignItems: "center", justifyContent: "center",
    },
    content: {
        paddingHorizontal: 20,
        paddingBottom: 24,
    },
    section: {
        marginTop: 10,
        marginBottom: 20,
    },
    sectionTitle: {
        fontSize: 15,
        fontWeight: "700",
        marginBottom: 12,
        opacity: 0.8,
    },
    dropdownBtn: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        borderWidth: 1.5,
        borderRadius: 14,
        paddingHorizontal: 16,
        paddingVertical: 14,
    },
    dropdownText: {
        fontSize: 15,
        fontWeight: "500",
    },
    dropdownMenu: {
        marginTop: 8,
        borderWidth: 1,
        borderRadius: 14,
        overflow: "hidden",
        elevation: 3,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 6,
    },
    dropdownItem: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingHorizontal: 16,
        paddingVertical: 14,
    },
    checkboxRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
        marginTop: 14,
        paddingHorizontal: 4,
    },
    checkboxLabel: {
        fontSize: 14,
        fontWeight: "500",
    },
    setupGrid: {
        flexDirection: "row",
        flexWrap: "wrap",
        gap: 12,
    },
    setupItem: {
        width: "48%",
        borderWidth: 1.5,
        borderRadius: 14,
        paddingVertical: 16,
        paddingHorizontal: 12,
        alignItems: "center",
        justifyContent: "space-between",
    },
    setupItemContent: {
        alignItems: "center",
        justifyContent: "center",
        gap: 8,
    },
    setupItemText: {
        fontSize: 14,
        fontWeight: "600",
        textAlign: "center",
    },
    configuredBadge: {
        flexDirection: "row",
        alignItems: "center",
        gap: 4,
        backgroundColor: "rgba(76, 175, 80, 0.1)",
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
        marginTop: 4,
    },
    editIcon: {
        position: "absolute",
        top: 10,
        right: 10,
    },
    uploadBox: {
        borderWidth: 2,
        borderStyle: "dashed",
        borderRadius: 14,
        paddingVertical: 32,
        alignItems: "center",
        justifyContent: "center",
        gap: 12,
    },
    uploadText: {
        fontSize: 14,
        fontWeight: "500",
    },
    imagePreviewContainer: {
        width: "100%",
        padding: 16,
        paddingBottom: 45,
        borderRadius: 14,
        overflow: "hidden",
        backgroundColor: "#F1F5F9",
        flexDirection: "row",
        alignItems: "center",
        gap: 16,
        borderWidth: 1,
        borderColor: "rgba(0,0,0,0.05)",
        position: "relative",
    },
    previewImage: {
        width: 100,
        height: 100,
        backgroundColor: "#FFF",
        borderRadius: 8,
    },
    previewInfos: {
        flex: 1,
        justifyContent: "center",
        gap: 4,
    },
    previewText: {
        fontSize: 13,
        fontWeight: "600",
        color: "#334155",
    },
    fontPreviewContainer: {
        width: "100%",
        padding: 24,
        borderRadius: 14,
        backgroundColor: "#F1F5F9",
        alignItems: "center",
        justifyContent: "center",
        borderWidth: 1,
        borderColor: "rgba(0,0,0,0.05)",
    },
    previewInfosVertical: {
        alignItems: "center",
        gap: 4,
    },
    previewTextCenter: {
        fontSize: 12,
        fontWeight: "500",
        color: "#475569",
        textAlign: "center",
    },
    deleteImageBtn: {
        position: "absolute",
        bottom: 12,
        right: 12,
        backgroundColor: "rgba(239, 68, 68, 0.9)",
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 20,
    },
    footer: {
        flexDirection: "row",
        padding: 20,
        borderTopWidth: 1,
        gap: 12,
    },
    footerBtn: {
        flex: 1,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        gap: 8,
        paddingVertical: 14,
        borderRadius: 14,
    },
    cancelBtn: {
    },
    cancelBtnText: {
        fontSize: 15,
        fontWeight: "700",
    },
    confirmBtn: {
        backgroundColor: "#2092EC",
    },
    confirmBtnText: {
        color: "#FFF",
        fontSize: 15,
        fontWeight: "700",
    },
});
