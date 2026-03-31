import { ThemedText } from "@/components/ui/themed-text";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { CertificateItem, getCertificates } from "@/services/contractService";
import { useAuthStore } from "@/store/authStore";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import React, { useEffect, useRef, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    Image,
    Modal,
    ScrollView,
    StyleSheet,
    Switch,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import SignatureScreen from "react-native-signature-canvas";
import ViewShot, { captureRef } from "react-native-view-shot";

export const FONT_OPTIONS = [
    { id: 'f1', name: 'Roboto', style: { fontFamily: 'Roboto_400Regular' } },
    { id: 'f2', name: 'Roboto Đậm', style: { fontFamily: 'Roboto_700Bold' } },
    { id: 'f3', name: 'Arial', style: { fontFamily: 'Arimo_400Regular' } },
    { id: 'f4', name: 'Arial Đậm', style: { fontFamily: 'Arimo_700Bold' } },
    { id: 'f5', name: 'Times New Roman', style: { fontFamily: 'Tinos_400Regular' } },
    { id: 'f6', name: 'Times Đậm', style: { fontFamily: 'Tinos_700Bold' } },
    { id: 'f7', name: 'Courier New', style: { fontFamily: 'Cousine_400Regular' } },
    { id: 'f8', name: 'Comic Sans', style: { fontFamily: 'ComicNeue_400Regular' } },
    { id: 'f9', name: 'Ký tay', style: { fontFamily: 'DancingScript_400Regular' } },
    { id: 'f10', name: 'Georgia', style: { fontFamily: 'Lora_400Regular' } },
];

const PEN_COLORS = [
    { id: "#1565C0", name: "Xanh" },
    { id: "#111827", name: "Đen" },
    { id: "#C62828", name: "Đỏ" },
];

const PEN_WIDTHS = [
    { width: 1, label: "Mảnh" },
    { width: 3, label: "Vừa" },
    { width: 6, label: "Đậm" },
];

type SignOptionsModalProps = {
    visible: boolean;
    onClose: () => void;
    onConfirm: (config: any) => void;
    loading?: boolean;
};

const ALL_INFO_OPTIONS = [
    { id: "name", labelVi: "Tên khách hàng", labelEn: "Customer name", authKey: "fullname" },
    { id: "idNumber", labelVi: "Số giấy tờ", labelEn: "ID number", authKey: null },
    { id: "email", labelVi: "Email", labelEn: "Email", authKey: "email" },
    { id: "phone", labelVi: "Số điện thoại", labelEn: "Phone number", authKey: "phone" },
    { id: "date", labelVi: "Ngày ký", labelEn: "Signing date", authKey: "signing_date" },
    { id: "dept", labelVi: "Phòng ban", labelEn: "Department", authKey: null },
    { id: "position", labelVi: "Chức vụ", labelEn: "Position", authKey: null },
];

export function SignOptionsModal({ visible, onClose, onConfirm, loading }: SignOptionsModalProps) {
    const isDark = useColorScheme() === "dark";
    const { user, phoneNumber } = useAuthStore();

    // --- Certificate ---
    const [selectedSignature, setSelectedSignature] = useState<CertificateItem | null>(null);
    const [showSignatureDropdown, setShowSignatureDropdown] = useState(false);
    const [signatureSetupType, setSignatureSetupType] = useState<number>(0);
    const [isDefaultSignature, setIsDefaultSignature] = useState(false);
    const [signatures, setSignatures] = useState<CertificateItem[]>([]);
    const [isLoadingCerts, setIsLoadingCerts] = useState(false);

    // --- Screen visibility ---
    const [activeScreen, setActiveScreen] = useState<"main" | "image" | "font" | "draw">("main");

    // --- Image ---
    const [uploadedImageUri, setUploadedImageUri] = useState<string | null>(null);
    const [uploadedImageBase64, setUploadedImageBase64] = useState<string | null>(null);
    const [isDefaultImage, setIsDefaultImage] = useState(false);

    // --- Font ---
    const [selectedFontId, setSelectedFontId] = useState<string>("f9");
    const [isFontConfigured, setIsFontConfigured] = useState(false);
    const [customSignName, setCustomSignName] = useState<string>("");

    // --- Hand Draw ---
    const [handDrawUri, setHandDrawUri] = useState<string | null>(null);
    const [penColor, setPenColor] = useState<string>("#1565C0");
    const [penWidth, setPenWidth] = useState<number>(3);
    const [isHandDrawConfigured, setIsHandDrawConfigured] = useState(false);
    const [scrollEnabled, setScrollEnabled] = useState(true);
    const signatureRef = useRef<any>(null);
    const signatureCaptureRef = useRef<any>(null);

    // --- Display content ---
    const [selectedDisplayInfos, setSelectedDisplayInfos] = useState<string[]>(["name"]);
    const [signatureLanguage, setSignatureLanguage] = useState<"vi" | "en">("vi");
    const [customFieldValues, setCustomFieldValues] = useState<Record<string, string>>({});

    // --- Derived values ---
    const getAuthValue = (id: string): string | null => {
        switch (id) {
            case "name": {
                const fullName = [user?.first_name, user?.last_name].filter(Boolean).join(" ").trim();
                return fullName || null;
            }
            case "email": return user?.email || null;
            case "phone": return phoneNumber || null;
            case "date": return new Date().toLocaleDateString("vi-VN");
            default: return null;
        }
    };
    const hasAuthValue = (id: string) => getAuthValue(id) !== null;
    const getDisplayValue = (id: string): string => {
        const a = getAuthValue(id);
        return a !== null ? a : (customFieldValues[id] || "");
    };

    const sigName = (customSignName ||
        [user?.first_name, user?.last_name].filter(Boolean).join(" ") ||
        "Nguyễn Văn A") + " ";

    const bgCard = isDark ? "rgba(255,255,255,0.05)" : "#F8FAFC";
    const border = isDark ? "rgba(255,255,255,0.10)" : "#E5E7EB";
    const textPrimary = { color: isDark ? "#F1F5F9" : "#111827" };
    const textSecondary = { color: isDark ? "#94A3B8" : "#6B7280" };

    // --- Load certs ---
    useEffect(() => {
        if (!visible || !user?.id) return;
        setIsLoadingCerts(true);
        getCertificates(user.id)
            .then(res => {
                const d = res.data || res.Data || [];
                setSignatures(d);
                setSelectedSignature(d[0] || null);
            })
            .catch(() => { setSignatures([]); setSelectedSignature(null); })
            .finally(() => setIsLoadingCerts(false));
    }, [visible, user?.id]);

    // Auto-fill name from auth
    useEffect(() => {
        if (user && !customSignName) {
            const n = [user.first_name, user.last_name].filter(Boolean).join(" ");
            if (n) setCustomSignName(n);
        }
    }, [user]);

    // --- Actions ---
    const handleConfirm = async () => {
        let finalBase64 = uploadedImageBase64;
        if (signatureSetupType !== 0 && signatureCaptureRef.current) {
            try { finalBase64 = await captureRef(signatureCaptureRef, { format: "png", quality: 1, result: "base64" }); }
            catch (e) { console.log("capture err", e); }
        } else if (signatureSetupType === 0) finalBase64 = "";
        else if (signatureSetupType === 2) finalBase64 = handDrawUri;

        onConfirm({
            type: signatureSetupType,
            selectedCertificate: selectedSignature?.CredentialId || selectedSignature?.credentialId,
            certificateData: selectedSignature?.CertificateData || selectedSignature?.certificateData,
            imageUri: signatureSetupType === 2 ? handDrawUri : uploadedImageUri,
            imageBase64: finalBase64,
            fontId: selectedFontId,
            signName: sigName,
            infos: selectedDisplayInfos,
            language: signatureLanguage,
            fieldValues: ALL_INFO_OPTIONS.reduce((a, o) => { a[o.id] = getDisplayValue(o.id); return a; }, {} as Record<string, string>),
        });
    };

    const handleClearDraw = () => { signatureRef.current?.clearSignature(); setHandDrawUri(null); setIsHandDrawConfigured(false); };
    const handleSaveDraw = () => signatureRef.current?.readSignature();
    const handleSignatureOK = (sig: string) => { setHandDrawUri(sig); setIsHandDrawConfigured(true); setActiveScreen("main"); };
    const toggleInfo = (id: string) =>
        setSelectedDisplayInfos(p => p.includes(id) ? p.filter(x => x !== id) : [...p, id]);
    const pickImage = async () => {
        const r = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ImagePicker.MediaTypeOptions.Images, base64: true, quality: 1 });
        if (!r.canceled) {
            const asset = r.assets[0];
            if (asset.fileSize && asset.fileSize > 3 * 1024 * 1024) { Alert.alert("Dung lượng quá lớn", "Vui lòng chọn ảnh dưới 3MB."); return; }
            setUploadedImageUri(asset.uri);
            setUploadedImageBase64(asset.base64 || null);
        }
    };

    // ─── Shared render helpers ────────────────────────────────────────────────

    const renderPreviewLines = () => {
        return selectedDisplayInfos.map(id => {
            const opt = ALL_INFO_OPTIONS.find(o => o.id === id)!;
            const label = signatureLanguage === "vi" ? opt.labelVi : (opt.labelEn || "");
            return { label, value: getDisplayValue(id), id };
        }).filter(Boolean) as { label: string; value: string; id: string }[];
    };

    /** Unified preview stamp card */
    const renderPreviewStamp = () => {
        const lines = renderPreviewLines();
        const hasContent = lines.length > 0;

        return (
            <View style={[S.stamp, { backgroundColor: isDark ? "rgba(255,255,255,0.04)" : "#F0F4FF", borderColor: isDark ? "rgba(255,255,255,0.10)" : "#D1D9F0" }]}>
                {/* Left column */}
                <View style={S.stampLeft}>
                    {activeScreen === "image" && uploadedImageUri ? (
                        <Image source={{ uri: uploadedImageUri }} style={S.stampSig} resizeMode="contain" />
                    ) : activeScreen === "font" ? (
                        <ThemedText style={[S.stampFont, { color: "#1565C0" }, FONT_OPTIONS.find(f => f.id === selectedFontId)?.style as any]} numberOfLines={2}>
                            {sigName}
                        </ThemedText>
                    ) : activeScreen === "draw" && handDrawUri ? (
                        <Image source={{ uri: handDrawUri }} style={S.stampSig} resizeMode="contain" />
                    ) : (
                        <View style={S.stampEmpty}>
                            <MaterialCommunityIcons name={activeScreen === "image" ? "image-outline" : activeScreen === "draw" ? "draw" : "format-text"} size={32} color={isDark ? "#4A5568" : "#C0CAE0"} />
                        </View>
                    )}
                    {activeScreen !== "font" && (
                        <ThemedText style={[S.stampName, textSecondary]}>{sigName}</ThemedText>
                    )}
                </View>

                {/* Divider */}
                {hasContent && <View style={[S.stampDivider, { backgroundColor: isDark ? "rgba(255,255,255,0.12)" : "#C8D4F0" }]} />}

                {/* Right column */}
                {hasContent && (
                    <View style={S.stampRight}>
                        {lines.filter(l => l.id === "name").map((l, i) => (
                            <ThemedText key={`title-${i}`} style={[S.stampTitle, textPrimary]}>
                                {l.value}
                            </ThemedText>
                        ))}
                        {lines.filter(l => l.id !== "name").map((l, i) => (
                            <View key={i} style={S.stampRow}>
                                <ThemedText style={[S.stampLabel, textSecondary]}>{l.label}: </ThemedText>
                                <ThemedText style={[S.stampValue, textPrimary]}>{l.value}</ThemedText>
                            </View>
                        ))}
                    </View>
                )}
            </View>
        );
    };

    /** Chips for "Nội dung hiển thị" section */
    const renderContentChips = () => {
        const pending = selectedDisplayInfos.filter(id => !hasAuthValue(id) && id !== "date");
        return (
            <View style={S.section}>
                <ThemedText style={S.sectionLabel}>Nội dung hiển thị</ThemedText>
                <View style={S.chipWrap}>
                    {ALL_INFO_OPTIONS.map(opt => {
                        const sel = selectedDisplayInfos.includes(opt.id);
                        const label = signatureLanguage === "en" ? opt.labelEn : opt.labelVi;
                        return (
                            <TouchableOpacity
                                key={opt.id}
                                style={[S.chip, sel ? S.chipOn : { borderColor: border, backgroundColor: bgCard }]}
                                onPress={() => toggleInfo(opt.id)}
                                activeOpacity={0.75}
                            >
                                {sel && <MaterialCommunityIcons name="check" size={12} color="#B91C1C" />}
                                <ThemedText style={[S.chipTxt, sel ? S.chipTxtOn : textSecondary]}>{label}</ThemedText>
                            </TouchableOpacity>
                        );
                    })}
                </View>
                {pending.length > 0 && (
                    <View style={{ marginTop: 12, gap: 8 }}>
                        {pending.map(id => {
                            const opt = ALL_INFO_OPTIONS.find(o => o.id === id)!;
                            return (
                                <View key={id} style={[S.inputRow, { borderColor: border, backgroundColor: bgCard }]}>
                                    <ThemedText style={[S.inputRowLabel, textSecondary]}>
                                        {signatureLanguage === "en" ? opt.labelEn : opt.labelVi}
                                    </ThemedText>
                                    <TextInput
                                        value={customFieldValues[id] || ""}
                                        onChangeText={t => setCustomFieldValues(p => ({ ...p, [id]: t }))}
                                        placeholder={`Nhập ${opt.labelVi.toLowerCase()}...`}
                                        placeholderTextColor={isDark ? "#4B5563" : "#CBD5E1"}
                                        style={[S.inputField, textPrimary]}
                                    />
                                </View>
                            );
                        })}
                    </View>
                )}
            </View>
        );
    };

    /** Language radio */
    const renderLanguage = () => (
        <View style={S.section}>
            <ThemedText style={S.sectionLabel}>Ngôn ngữ chữ ký</ThemedText>
            <View style={{ flexDirection: "row", gap: 24 }}>
                {(["vi", "en"] as const).map(lang => (
                    <TouchableOpacity key={lang} style={S.radioRow} onPress={() => setSignatureLanguage(lang)} activeOpacity={0.7}>
                        <View style={[S.radioOuter, { borderColor: signatureLanguage === lang ? "#B91C1C" : border }]}>
                            {signatureLanguage === lang && <View style={S.radioInner} />}
                        </View>
                        <ThemedText style={[S.radioLabel, textPrimary]}>{lang === "vi" ? "Tiếng Việt" : "Tiếng Anh"}</ThemedText>
                    </TouchableOpacity>
                ))}
            </View>
        </View>
    );

    /** Default toggle */
    const renderDefaultToggle = (label: string) => (
        <View style={[S.toggleRow, { borderColor: border }]}>
            <ThemedText style={[S.toggleLabel, textPrimary]}>{label}</ThemedText>
            <Switch
                value={isDefaultImage}
                onValueChange={setIsDefaultImage}
                trackColor={{ false: isDark ? "#374151" : "#D1D5DB", true: "#B91C1C" }}
                thumbColor="#FFF"
                ios_backgroundColor={isDark ? "#374151" : "#D1D5DB"}
            />
        </View>
    );

    /** Sub-screen header */
    const renderSubHeader = (title: string, onBack: () => void) => (
        <View style={S.header}>
            <TouchableOpacity onPress={onBack} style={[S.headerBtn, { backgroundColor: bgCard, borderColor: border }]}>
                <MaterialCommunityIcons name="arrow-left" size={20} color={isDark ? "#E2E8F0" : "#374151"} />
            </TouchableOpacity>
            <ThemedText style={[S.headerTitle, textPrimary]}>{title}</ThemedText>
            <View style={{ width: 38 }} />
        </View>
    );

    /** Sub-screen footer */
    const renderSubFooter = (onSave: () => void, saveLabel = "Lưu thiết lập") => (
        <View style={[S.footer, { borderColor: border }]}>
            <TouchableOpacity style={[S.footerCancel, { backgroundColor: bgCard, borderColor: border }]} onPress={() => setActiveScreen("main")}>
                <ThemedText style={[S.footerCancelTxt, textSecondary]}>Hủy</ThemedText>
            </TouchableOpacity>
            <TouchableOpacity style={S.footerSave} onPress={onSave}>
                <MaterialCommunityIcons name="check" size={18} color="#FFF" />
                <ThemedText style={S.footerSaveTxt}>{saveLabel}</ThemedText>
            </TouchableOpacity>
        </View>
    );

    // ─── SCREENS ──────────────────────────────────────────────────────────────

    const screenImage = () => (
        <>
            {renderSubHeader("Chữ ký ảnh", () => setActiveScreen("main"))}
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={S.content}>

                {/* Upload zone */}
                <View style={S.section}>
                    <ThemedText style={S.sectionLabel}>Hình ảnh chữ ký</ThemedText>
                    {uploadedImageUri ? (
                        <View style={[S.imgBox, { backgroundColor: bgCard, borderColor: border }]}>
                            <Image source={{ uri: uploadedImageUri }} style={S.imgPreview} resizeMode="contain" />
                            <TouchableOpacity style={S.imgDeleteBtn} onPress={() => setUploadedImageUri(null)}>
                                <MaterialCommunityIcons name="trash-can-outline" size={16} color="#FFF" />
                                <ThemedText style={{ color: "#FFF", fontSize: 12, fontWeight: "600" }}>Xóa</ThemedText>
                            </TouchableOpacity>
                        </View>
                    ) : (
                        <TouchableOpacity style={[S.uploadZone, { borderColor: isDark ? "#3B4E6B" : "#B8C5E0", backgroundColor: bgCard }]} onPress={pickImage} activeOpacity={0.8}>
                            <View style={[S.uploadIconWrap, { backgroundColor: isDark ? "rgba(32,146,236,0.12)" : "#EFF6FF" }]}>
                                <MaterialCommunityIcons name="image-plus" size={28} color="#2092EC" />
                            </View>
                            <ThemedText style={[S.uploadTitle, textPrimary]}>Tải ảnh chữ ký</ThemedText>
                            <ThemedText style={[S.uploadHint, textSecondary]}>PNG, JPG · Tối đa 3MB</ThemedText>
                        </TouchableOpacity>
                    )}
                </View>

                {/* Preview stamp */}
                <View style={S.section}>
                    <ThemedText style={S.sectionLabel}>Xem trước con dấu</ThemedText>
                    {renderPreviewStamp()}
                </View>

                {renderDefaultToggle("Đặt làm chữ ký mặc định")}
                {renderContentChips()}
                {renderLanguage()}
            </ScrollView>
            {renderSubFooter(() => setActiveScreen("main"))}
        </>
    );

    const screenFont = () => (
        <>
            {renderSubHeader("Kiểu chữ (Font)", () => setActiveScreen("main"))}
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={S.content}>

                {/* Name input */}
                <View style={S.section}>
                    <ThemedText style={S.sectionLabel}>Tên ký</ThemedText>
                    <View style={[S.inputRow, { borderColor: border, backgroundColor: bgCard }]}>
                        <MaterialCommunityIcons name="account-edit-outline" size={18} color={isDark ? "#64748B" : "#9CA3AF"} />
                        <TextInput
                            value={customSignName}
                            onChangeText={setCustomSignName}
                            placeholder="Nhập tên muốn ký..."
                            placeholderTextColor={isDark ? "#4B5563" : "#CBD5E1"}
                            style={[S.inputField, textPrimary, { fontSize: 16, fontWeight: "600" }]}
                        />
                    </View>
                </View>

                {/* Font grid */}
                <View style={S.section}>
                    <ThemedText style={S.sectionLabel}>Chọn kiểu chữ</ThemedText>
                    <View style={S.fontGrid}>
                        {FONT_OPTIONS.map(font => {
                            const sel = selectedFontId === font.id;
                            return (
                                <TouchableOpacity
                                    key={font.id}
                                    style={[S.fontCard, sel ? S.fontCardOn : { borderColor: border, backgroundColor: bgCard }]}
                                    onPress={() => setSelectedFontId(font.id)}
                                    activeOpacity={0.8}
                                >
                                    <ThemedText style={[S.fontCardName, sel ? { color: "#1565C0" } : textSecondary, font.style as any]} numberOfLines={1}>
                                        {sigName || "Ký tên"}
                                    </ThemedText>
                                    <ThemedText style={[{ fontSize: 10, marginTop: 4 }, sel ? { color: "#2092EC" } : textSecondary]}>{font.name}</ThemedText>
                                    {sel && (
                                        <View style={S.fontCardCheck}>
                                            <MaterialCommunityIcons name="check-circle" size={16} color="#1565C0" />
                                        </View>
                                    )}
                                </TouchableOpacity>
                            );
                        })}
                    </View>
                </View>

                {/* Preview stamp */}
                <View style={S.section}>
                    <ThemedText style={S.sectionLabel}>Xem trước con dấu</ThemedText>
                    {renderPreviewStamp()}
                </View>

                {renderDefaultToggle("Đặt làm kiểu chữ mặc định")}
                {renderContentChips()}
                {renderLanguage()}
            </ScrollView>
            {renderSubFooter(() => { setIsFontConfigured(true); setActiveScreen("main"); })}
        </>
    );

    const screenDraw = () => (
        <>
            {renderSubHeader("Chữ ký vẽ tay", () => setActiveScreen("main"))}
            <ScrollView scrollEnabled={scrollEnabled} showsVerticalScrollIndicator={false} contentContainerStyle={S.content}>

                {/* Canvas */}
                <View style={S.section}>
                    <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                        <ThemedText style={S.sectionLabel}>Vùng vẽ chữ ký</ThemedText>
                        <TouchableOpacity onPress={handleClearDraw} style={[S.clearBtn, { backgroundColor: isDark ? "rgba(239,68,68,0.12)" : "#FEE2E2" }]}>
                            <MaterialCommunityIcons name="eraser" size={14} color="#DC2626" />
                            <ThemedText style={{ fontSize: 12, color: "#DC2626", fontWeight: "600", marginLeft: 4 }}>Xóa lại</ThemedText>
                        </TouchableOpacity>
                    </View>
                    <View style={[S.canvas, { borderColor: isDark ? "#3B4E6B" : "#B8C5E0" }]}>
                        <View style={{ height: 200 }}>
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
                                backgroundColor="transparent"
                                webStyle={`
                                    .m-signature-pad{box-shadow:none;border:none;margin:0;padding:0;}
                                    .m-signature-pad--body{border:none;}
                                    .m-signature-pad--footer{display:none;}
                                    body,html{background:transparent;width:100%;height:100%;margin:0;padding:0;}
                                `}
                            />
                        </View>
                    </View>
                    {handDrawUri && (
                        <View style={[S.drawSavedBadge, { backgroundColor: isDark ? "rgba(34,197,94,0.10)" : "#F0FDF4" }]}>
                            <MaterialCommunityIcons name="check-circle" size={14} color="#16A34A" />
                            <ThemedText style={{ fontSize: 12, color: "#16A34A", fontWeight: "600", marginLeft: 6 }}>
                                Chữ ký đã được lưu — nhấn "Lưu thiết lập" để hoàn tất
                            </ThemedText>
                        </View>
                    )}
                </View>

                {/* Pen toolbar */}
                <View style={S.section}>
                    <ThemedText style={[S.sectionLabel, { marginBottom: 10 }]}>Bút vẽ</ThemedText>
                    <View style={[S.penToolbar, { backgroundColor: bgCard, borderColor: border }]}>
                        {/* Colors */}
                        <View style={S.penColors}>
                            {PEN_COLORS.map(c => (
                                <TouchableOpacity key={c.id} onPress={() => setPenColor(c.id)} style={[S.colorDot, { backgroundColor: c.id }, penColor === c.id && S.colorDotActive]}>
                                    {penColor === c.id && <MaterialCommunityIcons name="check" size={13} color="#FFF" />}
                                </TouchableOpacity>
                            ))}
                        </View>
                        <View style={[S.penDivider, { backgroundColor: border }]} />
                        {/* Widths */}
                        <View style={S.penWidths}>
                            {PEN_WIDTHS.map(w => (
                                <TouchableOpacity
                                    key={w.width}
                                    onPress={() => setPenWidth(w.width)}
                                    style={[S.widthBtn, penWidth === w.width ? S.widthBtnOn : { backgroundColor: isDark ? "#1F2937" : "#F3F4F6" }]}
                                >
                                    <ThemedText style={{ fontSize: 12, fontWeight: "600", color: penWidth === w.width ? "#2092EC" : (isDark ? "#9CA3AF" : "#6B7280") }}>
                                        {w.label}
                                    </ThemedText>
                                </TouchableOpacity>
                            ))}
                        </View>
                    </View>
                </View>

                {/* Preview stamp */}
                <View style={S.section}>
                    <ThemedText style={S.sectionLabel}>Xem trước con dấu</ThemedText>
                    {renderPreviewStamp()}
                </View>

                {renderDefaultToggle("Đặt làm chữ ký mặc định")}
                {renderContentChips()}
                {renderLanguage()}
            </ScrollView>
            {renderSubFooter(handleSaveDraw, handDrawUri ? "Lưu thiết lập" : "Lưu chữ ký")}
        </>
    );

    const screenMain = () => {
        const setups = [
            { id: 0, label: "Ký số", sub: "Viettel CA", icon: "shield-check-outline", color: "#1565C0", bg: "#EFF6FF" },
            { id: 1, label: "Chữ ký ảnh", sub: "Tải ảnh lên", icon: "image-outline", color: "#1565C0", bg: "#EFF6FF" },
            { id: 2, label: "Vẽ tay", sub: "Dùng ngón tay", icon: "draw", color: "#1565C0", bg: "#EFF6FF" },
            { id: 3, label: "Kiểu chữ", sub: "Chọn font chữ", icon: "format-text", color: "#1565C0", bg: "#EFF6FF" },
        ];
        const configuredLabel: Record<number, string | null> = {
            0: null,
            1: uploadedImageUri ? "Đã có ảnh" : null,
            2: isHandDrawConfigured ? "Đã vẽ xong" : null,
            3: isFontConfigured ? "Đã chọn font" : null,
        };

        return (
            <>
                <View style={S.header}>
                    <View style={{ flex: 1 }}>
                        <ThemedText style={[S.headerTitle, textPrimary]}>Thiết lập chữ ký</ThemedText>
                        <ThemedText style={[S.headerSub, textSecondary]}>Chọn phương thức ký hợp đồng</ThemedText>
                    </View>
                    <TouchableOpacity onPress={onClose} style={[S.headerBtn, { backgroundColor: bgCard, borderColor: border }]}>
                        <MaterialCommunityIcons name="close" size={20} color={isDark ? "#E2E8F0" : "#374151"} />
                    </TouchableOpacity>
                </View>

                <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={S.content}>

                    {/* Certificate picker */}
                    <View style={S.section}>
                        <ThemedText style={S.sectionLabel}>Chứng thư số</ThemedText>
                        <TouchableOpacity
                            style={[S.certPicker, { backgroundColor: bgCard, borderColor: border }]}
                            onPress={() => setShowSignatureDropdown(p => !p)}
                            disabled={isLoadingCerts || signatures.length === 0}
                            activeOpacity={0.8}
                        >
                            <MaterialCommunityIcons name="certificate-outline" size={20} color="#2092EC" />
                            <ThemedText style={[S.certPickerTxt, textPrimary, { flex: 1, marginHorizontal: 10 }]} numberOfLines={1}>
                                {isLoadingCerts ? "Đang tải..." : (selectedSignature?.CredentialId || selectedSignature?.credentialId || "Không tìm thấy chứng thư")}
                            </ThemedText>
                            {isLoadingCerts ? <ActivityIndicator size="small" color="#2092EC" /> : <MaterialCommunityIcons name={showSignatureDropdown ? "chevron-up" : "chevron-down"} size={18} color={isDark ? "#94A3B8" : "#9CA3AF"} />}
                        </TouchableOpacity>
                        {showSignatureDropdown && (
                            <View style={[S.dropdown, { backgroundColor: isDark ? "#1E3A4A" : "#FFF", borderColor: border }]}>
                                {signatures.map((sig, i) => {
                                    const id = sig.CredentialId || sig.credentialId || "Không rõ";
                                    const sel = id === (selectedSignature?.CredentialId || selectedSignature?.credentialId);
                                    return (
                                        <TouchableOpacity key={i} style={[S.dropdownItem, i < signatures.length - 1 && { borderBottomWidth: 1, borderBottomColor: border }]}
                                            onPress={() => { setSelectedSignature(sig); setShowSignatureDropdown(false); }}>
                                            <ThemedText style={{ color: sel ? "#2092EC" : (isDark ? "#F1F5F9" : "#111827"), fontWeight: sel ? "700" : "400", flex: 1 }}>{id}</ThemedText>
                                            {sel && <MaterialCommunityIcons name="check-circle" size={16} color="#2092EC" />}
                                        </TouchableOpacity>
                                    );
                                })}
                            </View>
                        )}
                        <View style={[S.toggleRow, { borderColor: "transparent", paddingHorizontal: 0, marginTop: 6 }]}>
                            <ThemedText style={[S.toggleLabel, textSecondary, { fontSize: 13 }]}>Đặt làm chứng thư mặc định</ThemedText>
                            <Switch value={isDefaultSignature} onValueChange={setIsDefaultSignature}
                                trackColor={{ false: isDark ? "#374151" : "#D1D5DB", true: "#B91C1C" }}
                                thumbColor="#FFF" ios_backgroundColor={isDark ? "#374151" : "#D1D5DB"} />
                        </View>
                    </View>

                    {/* Method grid */}
                    <View style={S.section}>
                        <ThemedText style={S.sectionLabel}>Phương thức ký</ThemedText>
                        <View style={S.methodGrid}>
                            {setups.map(s => {
                                const isSel = signatureSetupType === s.id;
                                const configured = configuredLabel[s.id];
                                return (
                                    <TouchableOpacity
                                        key={s.id}
                                        style={[S.methodCard, isSel ? { borderColor: s.color, backgroundColor: isDark ? `${s.color}22` : s.bg } : { borderColor: border, backgroundColor: bgCard }]}
                                        onPress={() => {
                                            setSignatureSetupType(s.id);
                                            if (s.id === 1) setActiveScreen("image");
                                            if (s.id === 2) setActiveScreen("draw");
                                            if (s.id === 3) setActiveScreen("font");
                                        }}
                                        activeOpacity={0.8}
                                    >
                                        <View style={[S.methodIcon, { backgroundColor: isSel ? s.color : (isDark ? "#1F2937" : "#F3F4F6") }]}>
                                            <MaterialCommunityIcons name={s.icon as any} size={22} color={isSel ? "#FFF" : (isDark ? "#94A3B8" : "#6B7280")} />
                                        </View>
                                        <ThemedText style={[S.methodLabel, { color: isSel ? s.color : (isDark ? "#E2E8F0" : "#1F2937") }]}>{s.label}</ThemedText>
                                        <ThemedText style={[S.methodSub, textSecondary]}>{s.sub}</ThemedText>
                                        {configured && (
                                            <View style={[S.methodBadge, { backgroundColor: isDark ? "rgba(34,197,94,0.15)" : "#F0FDF4" }]}>
                                                <MaterialCommunityIcons name="check-circle" size={11} color="#16A34A" />
                                                <ThemedText style={{ fontSize: 10, color: "#16A34A", fontWeight: "700", marginLeft: 3 }}>{configured}</ThemedText>
                                            </View>
                                        )}
                                        {s.id > 0 && (
                                            <View style={S.methodEdit}>
                                                <MaterialCommunityIcons name="chevron-right" size={16} color={isSel ? s.color : (isDark ? "#4B5563" : "#D1D5DB")} />
                                            </View>
                                        )}
                                    </TouchableOpacity>
                                );
                            })}
                        </View>
                    </View>

                    {/* ViewShot capture zone */}
                    {signatureSetupType !== 0 && (
                        <View style={S.section}>
                            <ThemedText style={S.sectionLabel}>Xem trước con dấu cuối cùng</ThemedText>
                            <View style={{
                                borderRadius: 12,
                                borderWidth: 1,
                                borderStyle: "dashed",
                                borderColor: isDark ? "#3B4E6B" : "#C0CAE0",
                                width: "100%",
                                overflow: "hidden"
                            }}>
                                <ViewShot ref={signatureCaptureRef} options={{ format: "png", quality: 1.0, result: "base64" }}
                                    style={{
                                        backgroundColor: "transparent",
                                        flexDirection: renderPreviewLines().filter(l => l.id !== "name").length > 0 ? "row" : "column",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        padding: 20,
                                        width: "100%",
                                        minHeight: 120
                                    }}>

                                    {/* Content Wrapper */}
                                    {renderPreviewLines().filter(l => l.id !== "name").length > 0 ? (
                                        <>
                                            {/* Split Layout: Signature + Name on Left, Others on Right */}
                                            <View style={S.stampLeft}>
                                                {signatureSetupType === 1 && uploadedImageUri ? (
                                                    <Image source={{ uri: uploadedImageUri }} style={S.stampSig} resizeMode="contain" />
                                                ) : signatureSetupType === 2 && handDrawUri ? (
                                                    <Image source={{ uri: handDrawUri }} style={S.stampSig} resizeMode="contain" />
                                                ) : signatureSetupType === 3 ? (
                                                    <ThemedText style={[S.stampFont, { color: "#1565C0" }, FONT_OPTIONS.find(f => f.id === selectedFontId)?.style as any]} numberOfLines={2}>
                                                        {sigName}
                                                    </ThemedText>
                                                ) : (
                                                    <View style={S.stampEmpty}>
                                                        <MaterialCommunityIcons name={signatureSetupType === 1 ? "image-outline" : signatureSetupType === 2 ? "draw" : "format-text"} size={32} color={isDark ? "#4A5568" : "#C0CAE0"} />
                                                    </View>
                                                )}

                                                <ThemedText style={[S.stampName, textSecondary, { fontSize: 14, opacity: 0.8 }]}>
                                                    {sigName}
                                                </ThemedText>
                                            </View>

                                            <View style={[S.stampDivider, { backgroundColor: isDark ? "rgba(255,255,255,0.12)" : "#C8D4F0" }]} />

                                            <View style={S.stampRight}>
                                                {renderPreviewLines().filter(l => l.id !== "name").map((l, i) => (
                                                    <View key={i} style={S.stampRow}>
                                                        <ThemedText style={[S.stampLabel, textSecondary]}>{l.label}: </ThemedText>
                                                        <ThemedText style={[S.stampValue, textPrimary]}>{l.value}</ThemedText>
                                                    </View>
                                                ))}
                                            </View>
                                        </>
                                    ) : (
                                        /* Single Column Layout: Centered Signature + Name */
                                        <View style={{ alignItems: "center" }}>
                                            {signatureSetupType === 1 && uploadedImageUri ? (
                                                <Image source={{ uri: uploadedImageUri }} style={{ width: 140, height: 90 }} resizeMode="contain" />
                                            ) : signatureSetupType === 2 && handDrawUri ? (
                                                <Image source={{ uri: handDrawUri }} style={{ width: 140, height: 90 }} resizeMode="contain" />
                                            ) : signatureSetupType === 3 ? (
                                                <ThemedText style={[{ fontSize: 32, color: "#1565C0", textAlign: "center" }, FONT_OPTIONS.find(f => f.id === selectedFontId)?.style as any]} numberOfLines={2}>
                                                    {sigName}
                                                </ThemedText>
                                            ) : (
                                                <View style={{ width: 140, height: 90, alignItems: "center", justifyContent: "center" }}>
                                                    <MaterialCommunityIcons name={signatureSetupType === 1 ? "image-outline" : signatureSetupType === 2 ? "draw" : "format-text"} size={48} color={isDark ? "#4A5568" : "#C0CAE0"} />
                                                </View>
                                            )}

                                            <ThemedText style={[S.stampName, textSecondary, { fontSize: 16, marginTop: 12, opacity: 0.8 }]}>
                                                {sigName}
                                            </ThemedText>
                                        </View>
                                    )}
                                </ViewShot>
                            </View>
                        </View>
                    )}
                </ScrollView>

                {/* Footer */}
                <View style={[S.footer, { borderColor: border }]}>
                    <TouchableOpacity style={[S.footerCancel, { backgroundColor: bgCard, borderColor: border }]} onPress={onClose}>
                        <ThemedText style={[S.footerCancelTxt, textSecondary]}>Hủy bỏ</ThemedText>
                    </TouchableOpacity>
                    <TouchableOpacity style={S.footerConfirm} onPress={handleConfirm} disabled={loading} activeOpacity={0.85}>
                        {loading ? (
                            <ActivityIndicator size="small" color="#FFF" />
                        ) : (
                            <>
                                <MaterialCommunityIcons name="pen" size={18} color="#FFF" />
                                <ThemedText style={S.footerConfirmTxt}>Xác nhận ký</ThemedText>
                            </>
                        )}
                    </TouchableOpacity>
                </View>
            </>
        );
    };

    // ─── Root ─────────────────────────────────────────────────────────────────
    return (
        <Modal visible={visible} transparent animationType="slide" statusBarTranslucent>
            <View style={S.overlay}>
                <TouchableOpacity style={S.backdrop} activeOpacity={1} onPress={onClose} />
                <View style={[S.sheet, { backgroundColor: isDark ? "#111C27" : "#FFFFFF" }]}>
                    {activeScreen === "image" ? screenImage()
                        : activeScreen === "font" ? screenFont()
                            : activeScreen === "draw" ? screenDraw()
                                : screenMain()}
                </View>
            </View>
        </Modal>
    );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const S = StyleSheet.create({
    overlay: { flex: 1, justifyContent: "flex-end" },
    backdrop: { ...StyleSheet.absoluteFillObject, backgroundColor: "rgba(0,0,0,0.55)" },
    sheet: {
        borderTopLeftRadius: 28, borderTopRightRadius: 28,
        maxHeight: "92%",
        elevation: 24,
        shadowColor: "#000", shadowOffset: { width: 0, height: -6 }, shadowOpacity: 0.15, shadowRadius: 16,
    },

    // Header
    header: {
        flexDirection: "row", alignItems: "center",
        paddingHorizontal: 20, paddingTop: 20, paddingBottom: 14,
        gap: 12,
    },
    headerBtn: {
        width: 38, height: 38, borderRadius: 19,
        alignItems: "center", justifyContent: "center",
        borderWidth: 1,
    },
    headerTitle: { fontSize: 17, fontWeight: "800" },
    headerSub: { fontSize: 12, marginTop: 2 },

    // Content
    content: { paddingHorizontal: 20, paddingBottom: 28 },
    section: { marginBottom: 20 },
    sectionLabel: { fontSize: 13, fontWeight: "700", marginBottom: 10, opacity: 0.7, textTransform: "uppercase", letterSpacing: 0.5 },

    // Certificate picker
    certPicker: {
        flexDirection: "row", alignItems: "center",
        borderWidth: 1.5, borderRadius: 14,
        paddingHorizontal: 14, paddingVertical: 13,
    },
    certPickerTxt: { fontSize: 14, fontWeight: "600" },
    dropdown: {
        marginTop: 6, borderWidth: 1, borderRadius: 12,
        overflow: "hidden", elevation: 4,
        shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.08, shadowRadius: 8,
    },
    dropdownItem: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 16, paddingVertical: 13 },

    // Method grid
    methodGrid: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
    methodCard: {
        width: "48%", borderWidth: 1.5, borderRadius: 16,
        paddingVertical: 14, paddingHorizontal: 12,
        alignItems: "center", gap: 6, position: "relative",
    },
    methodIcon: { width: 44, height: 44, borderRadius: 22, alignItems: "center", justifyContent: "center" },
    methodLabel: { fontSize: 14, fontWeight: "700", textAlign: "center" },
    methodSub: { fontSize: 11, textAlign: "center" },
    methodBadge: {
        flexDirection: "row", alignItems: "center",
        paddingHorizontal: 8, paddingVertical: 3, borderRadius: 10, marginTop: 2,
    },
    methodEdit: { position: "absolute", bottom: 8, right: 10 },

    // Upload zone
    uploadZone: {
        borderWidth: 2, borderStyle: "dashed", borderRadius: 16,
        paddingVertical: 28, alignItems: "center", gap: 8,
    },
    uploadIconWrap: { width: 56, height: 56, borderRadius: 28, alignItems: "center", justifyContent: "center" },
    uploadTitle: { fontSize: 15, fontWeight: "700" },
    uploadHint: { fontSize: 12 },
    imgBox: {
        borderRadius: 14, borderWidth: 1,
        overflow: "hidden", position: "relative",
        alignItems: "center", paddingVertical: 16,
    },
    imgPreview: { width: "70%", height: 100, borderRadius: 8 },
    imgDeleteBtn: {
        position: "absolute", bottom: 10, right: 10,
        flexDirection: "row", alignItems: "center", gap: 4,
        backgroundColor: "rgba(220,38,38,0.85)", paddingHorizontal: 10, paddingVertical: 5, borderRadius: 20,
    },

    // Font grid
    fontGrid: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
    fontCard: {
        width: "48%", borderWidth: 1.5, borderRadius: 12,
        paddingHorizontal: 12, paddingVertical: 12,
        alignItems: "center", position: "relative",
    },
    fontCardOn: { borderColor: "#1565C0", backgroundColor: "#EFF6FF" },
    fontCardName: { fontSize: 18, textAlign: "center" },
    fontCardCheck: { position: "absolute", top: 6, right: 6 },

    // Canvas
    canvas: {
        borderWidth: 1.5, borderRadius: 14, overflow: "hidden",
        backgroundColor: "#FFFFFF",
    },
    drawSavedBadge: {
        flexDirection: "row", alignItems: "center",
        marginTop: 10, paddingHorizontal: 12, paddingVertical: 8,
        borderRadius: 10,
    },
    clearBtn: { flexDirection: "row", alignItems: "center", paddingHorizontal: 10, paddingVertical: 6, borderRadius: 20 },

    // Pen toolbar
    penToolbar: { flexDirection: "row", alignItems: "center", borderWidth: 1, borderRadius: 14, paddingHorizontal: 14, paddingVertical: 10, gap: 12 },
    penColors: { flexDirection: "row", gap: 10 },
    colorDot: { width: 30, height: 30, borderRadius: 15, alignItems: "center", justifyContent: "center" },
    colorDotActive: { borderWidth: 3, borderColor: "rgba(0,0,0,0.25)" },
    penDivider: { width: 1, height: 28 },
    penWidths: { flexDirection: "row", gap: 6 },
    widthBtn: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8 },
    widthBtnOn: { backgroundColor: "rgba(32,146,236,0.13)" },

    // Preview stamp
    stamp: { borderRadius: 18, borderWidth: 1.5, borderStyle: "dashed", flexDirection: "row", padding: 16, minHeight: 120, overflow: "hidden" },
    stampLeft: { width: 130, alignItems: "center", justifyContent: "center", paddingRight: 10 },
    stampSig: { width: 110, height: 75, backgroundColor: "transparent" },
    stampEmpty: { width: 110, height: 75, alignItems: "center", justifyContent: "center" },
    stampFont: { fontSize: 24, lineHeight: 30, textAlign: "center" },
    stampName: { fontSize: 13, fontWeight: "500", marginTop: 8, textAlign: "center" },
    stampDivider: { width: 1, height: "80%", marginHorizontal: 12, borderRadius: 1, alignSelf: "center" },
    stampRight: { flex: 1, justifyContent: "center", paddingLeft: 8, gap: 4 },
    stampTitle: { fontSize: 18, fontWeight: "800", marginBottom: 6 },
    stampRow: { flexDirection: "row", flexWrap: "wrap", alignItems: "center", marginBottom: 2 },
    stampLabel: { fontSize: 13, fontWeight: "400" },
    stampValue: { fontSize: 13, fontWeight: "600" },

    // Toggle / switch row
    toggleRow: {
        flexDirection: "row", alignItems: "center", justifyContent: "space-between",
        paddingVertical: 12, paddingHorizontal: 4,
        borderTopWidth: 1, borderBottomWidth: 1, marginVertical: 4,
    },
    toggleLabel: { fontSize: 14, fontWeight: "600", flex: 1, marginRight: 10 },

    // Chips
    chipWrap: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
    chip: { flexDirection: "row", alignItems: "center", gap: 5, paddingHorizontal: 13, paddingVertical: 8, borderRadius: 20, borderWidth: 1.5 },
    chipOn: { borderColor: "#1565C0", backgroundColor: "rgba(21,101,192,0.06)" },
    chipTxt: { fontSize: 13, fontWeight: "500" },
    chipTxtOn: { color: "#1565C0", fontWeight: "700" },

    // Input rows
    inputRow: { flexDirection: "row", alignItems: "center", borderWidth: 1.5, borderRadius: 12, paddingHorizontal: 14, paddingVertical: 10, gap: 8 },
    inputRowLabel: { fontSize: 12, fontWeight: "600", minWidth: 82 },
    inputField: { flex: 1, fontSize: 14, fontWeight: "500", paddingVertical: 2 },

    // Radio
    radioRow: { flexDirection: "row", alignItems: "center", gap: 10 },
    radioOuter: { width: 22, height: 22, borderRadius: 11, borderWidth: 2, alignItems: "center", justifyContent: "center" },
    radioInner: { width: 10, height: 10, borderRadius: 5, backgroundColor: "#1565C0" },
    radioLabel: { fontSize: 14, fontWeight: "500" },

    // Footer
    footer: { flexDirection: "row", paddingHorizontal: 20, paddingVertical: 16, gap: 10, borderTopWidth: 1 },
    footerCancel: {
        flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center",
        paddingVertical: 13, borderRadius: 14, borderWidth: 1,
    },
    footerCancelTxt: { fontSize: 14, fontWeight: "700" },
    footerSave: {
        flex: 2, flexDirection: "row", alignItems: "center", justifyContent: "center",
        paddingVertical: 13, borderRadius: 14, gap: 6,
        backgroundColor: "#1565C0",
    },
    footerSaveTxt: { color: "#FFF", fontSize: 14, fontWeight: "700" },
    footerConfirm: {
        flex: 2, flexDirection: "row", alignItems: "center", justifyContent: "center",
        paddingVertical: 13, borderRadius: 14, gap: 8,
        backgroundColor: "#1565C0",
    },
    footerConfirmTxt: { color: "#FFF", fontSize: 14, fontWeight: "700" },
});
