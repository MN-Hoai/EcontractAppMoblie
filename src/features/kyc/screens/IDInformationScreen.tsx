import { getOrderInfo, normalizeAddress, orderCA, submitKycInfo } from "@/services/contractService";
import { useAuthStore } from "@/store/authStore";
import { useKycStore } from "@/store/kycStore";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { useEffect, useRef, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    KeyboardAvoidingView,
    KeyboardTypeOptions,
    Modal,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from "react-native";

/* ─── Types ─────────────────────────────────────────────────── */
interface IDInfo {
    fullName: string;
    dateOfBirth: string;
    gender: string;
    idNumber: string;
    issueDate: string;
    placeOfIssue: string;
    address: string;
    phoneNumber: string;
    email: string;
}

const FIELD_LABELS: Record<keyof IDInfo, string> = {
    fullName: "Họ và tên",
    dateOfBirth: "Ngày sinh",
    gender: "Giới tính",
    idNumber: "Số CCCD",
    issueDate: "Ngày cấp",
    placeOfIssue: "Nơi cấp",
    address: "Địa chỉ thường trú",
    phoneNumber: "Số điện thoại",
    email: "Email",
};

const FIELD_ICONS: Record<keyof IDInfo, string> = {
    fullName: "account-outline",
    dateOfBirth: "calendar-outline",
    gender: "gender-male-female",
    idNumber: "card-account-details-outline",
    issueDate: "calendar-check-outline",
    placeOfIssue: "office-building-outline",
    address: "map-marker-outline",
    phoneNumber: "phone-outline",
    email: "email-outline",
};

// const HARDCODED_ACCOUNT_ID = "86EBC12D-DCB0-45DA-B7D5-FAA04F9E9DD9";

/**
 * Validate chuỗi ngày dd/MM/yyyy rồi trả về ISO 8601 (YYYY-MM-DD).
 * Backend C# nhận kiểu `DateTime` — .NET JSON deserializer yêu cầu ISO 8601.
 * Throw Error nếu format không hợp lệ.
 */
const parseDateSafe = (dateStr: string, fieldLabel: string): string => {
    if (!dateStr || dateStr.trim() === "")
        throw new Error(`Trường "${fieldLabel}" không được để trống.`);
    const parts = dateStr.trim().split("/");
    if (parts.length !== 3)
        throw new Error(`Trường "${fieldLabel}" phải có định dạng dd/MM/yyyy.`);
    const [dd, mm, yyyy] = parts;
    if (!dd || !mm || !yyyy || yyyy.length !== 4)
        throw new Error(`Trường "${fieldLabel}" phải có định dạng dd/MM/yyyy.`);
    const iso = `${yyyy}-${mm.padStart(2, "0")}-${dd.padStart(2, "0")}`;
    if (isNaN(Date.parse(iso)))
        throw new Error(`Trường "${fieldLabel}" không phải ngày hợp lệ.`);
    return iso;  // YYYY-MM-DD — .NET DateTime binding
};



/* ─── Editable row component ────────────────────────────────── */
function InfoRow({
    label,
    icon,
    value,
    isEditing,
    onEdit,
    onChange,
    onBlur,
    hasError,
    keyboardType,
}: {
    label: string;
    icon: string;
    value: string;
    isEditing: boolean;
    onEdit: () => void;
    onChange: (t: string) => void;
    onBlur: () => void;
    hasError?: boolean;
    keyboardType?: KeyboardTypeOptions;
}) {
    const inputRef = useRef<TextInput>(null);

    return (
        <TouchableOpacity
            style={[styles.row, hasError && styles.rowError]}
            onPress={onEdit}
            activeOpacity={0.7}
        >
            <View style={[styles.rowIcon, hasError && styles.rowIconError]}>
                <MaterialCommunityIcons
                    name={icon as any}
                    size={18}
                    color={hasError ? "#D32F2F" : "#2092EC"}
                />
            </View>

            <View style={styles.rowContent}>
                <Text style={[styles.rowLabel, hasError && styles.rowLabelError]}>{label}</Text>
                {isEditing ? (
                    <TextInput
                        ref={inputRef}
                        value={value}
                        onChangeText={onChange}
                        onBlur={onBlur}
                        autoFocus
                        style={styles.rowInput}
                        selectionColor="#2092EC"
                        placeholder={`Nhập ${label.toLowerCase()}`}
                        placeholderTextColor="#94A3B8"
                        keyboardType={keyboardType}
                    />
                ) : (
                    <Text
                        style={[styles.rowValue, hasError && styles.rowValueError]}
                        numberOfLines={2}
                    >
                        {value || "Chưa nhập thông tin"}
                    </Text>
                )}
            </View>

            <MaterialCommunityIcons
                name={hasError ? "alert-circle" : (isEditing ? "check" : "pencil-outline")}
                size={16}
                color={hasError ? "#D32F2F" : (isEditing ? "#4CAF50" : "#BBBEC7")}
            />
        </TouchableOpacity>
    );
}

/* ─── Main Screen ───────────────────────────────────────────── */
export default function IDInformationScreen() {
    const router = useRouter();
    const { requestId } = useAuthStore();
    const reset = useKycStore((s) => s.reset);

    const [idInfo, setIdInfo] = useState<IDInfo>({
        fullName: "",
        dateOfBirth: "",
        gender: "",
        idNumber: "",
        issueDate: "",
        placeOfIssue: "",
        address: "",
        phoneNumber: "",
        email: "",
    });

    const [editingField, setEditingField] = useState<keyof IDInfo | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [countdown, setCountdown] = useState(80);
    const [errors, setErrors] = useState<Partial<Record<keyof IDInfo, boolean>>>({});
    const [isErrorModalVisible, setIsErrorModalVisible] = useState(false);
    const [errorModalTitle, setErrorModalTitle] = useState("Thông tin chưa đầy đủ");
    const [errorModalDesc, setErrorModalDesc] = useState("Vui lòng kiểm tra và điền đầy đủ các trường thông tin được đánh dấu màu đỏ để tiếp tục.");

    // --- Xử lý đếm ngược khi đang submit ---
    useEffect(() => {
        if (!isSubmitting) {
            setCountdown(80);
            return;
        }
        if (countdown === 0) return;

        const t = setTimeout(() => setCountdown((c) => c - 1), 1000);
        return () => clearTimeout(t);
    }, [isSubmitting, countdown]);

    const showErrorModal = (title: string, desc: string) => {
        setErrorModalTitle(title);
        setErrorModalDesc(desc);
        setIsErrorModalVisible(true);
    };

    const handleSubmit = async () => {
        // ── Bước 1: Kiểm tra trường trống ──────────────────────────
        const newErrors: Partial<Record<keyof IDInfo, boolean>> = {};
        let hasEmptyField = false;

        for (const field of Object.keys(idInfo) as (keyof IDInfo)[]) {
            if (!idInfo[field] || idInfo[field].trim() === "") {
                newErrors[field] = true;
                hasEmptyField = true;
            }
        }

        if (hasEmptyField) {
            setErrors(newErrors);
            showErrorModal(
                "Thông tin chưa đầy đủ",
                "Vui lòng kiểm tra và điền đầy đủ các trường được đánh dấu màu đỏ để tiếp tục."
            );
            return;
        }

        // ── Bước 2: Validate định dạng ngày (không throw) ──────────
        const dateErrors: Partial<Record<keyof IDInfo, boolean>> = {};
        let dateOfBirthStr: string | null = null;
        let issueDateStr: string | null = null;

        try { dateOfBirthStr = parseDateSafe(idInfo.dateOfBirth, "Ngày sinh"); }
        catch { dateErrors.dateOfBirth = true; }

        try { issueDateStr = parseDateSafe(idInfo.issueDate, "Ngày cấp"); }
        catch { dateErrors.issueDate = true; }

        if (Object.keys(dateErrors).length > 0) {
            setErrors(dateErrors);
            showErrorModal(
                "Định dạng ngày không hợp lệ",
                "Vui lòng nhập ngày theo định dạng dd/MM/yyyy.\nVí dụ: 15/01/1990"
            );
            return;
        }

        // ── Bước 3: Gọi API ─────────────────────────────────────────
        setErrors({});
        setCountdown(80);
        setIsSubmitting(true);
        try {
            const model = {
                IdNumber: idInfo.idNumber,
                FullName: idInfo.fullName,
                DateOfBirth: dateOfBirthStr!,   // dd/MM/yyyy
                Gender: idInfo.gender,
                IssueDate: issueDateStr!,        // dd/MM/yyyy
                IssuePlace: idInfo.placeOfIssue,
                PermanentAddress: idInfo.address,
                PhoneNumber: idInfo.phoneNumber,
                Email: idInfo.email,
            };

            console.log("▶ [submitKycInfo] model:", JSON.stringify(model, null, 2));

            const serviceResponse = await submitKycInfo(requestId || "", model) as any;
            const isSuccess = serviceResponse.success ?? serviceResponse.Success;
            const rawMessage = serviceResponse.message ?? serviceResponse.Message;
            const friendlyMessage = rawMessage?.replace("Lỗi hệ thống: ", "") || "Thông tin không hợp lệ hoặc lỗi xác thực. Vui lòng thử lại.";

            if (!isSuccess) {
                Alert.alert(
                    "Thông báo",
                    friendlyMessage,
                    [{ text: "Đóng", style: "cancel" }]
                );
                return;
            }

            // ── Bước 4: Chuẩn hóa địa chỉ ─────────────────────────
            const addressResponse = await normalizeAddress(requestId || "");
            const addressSuccess = addressResponse.success ?? addressResponse.Success;
            const addressMessage = addressResponse.message ?? addressResponse.Message;

            if (!addressSuccess) {
                Alert.alert(
                    "Thông báo",
                    addressMessage?.replace("Lỗi hệ thống: ", "") || "Không thể chuẩn hóa địa chỉ. Vui lòng thử lại."
                );
                return;
            }

            // ── Bước 5: Tạo đơn hàng CA ──────────────────────────
            const orderResponse = await orderCA(requestId || "");
            const orderSuccess = orderResponse.success ?? orderResponse.Success;
            const orderMessage = orderResponse.message ?? orderResponse.Message;

            if (!orderSuccess) {
                Alert.alert(
                    "Thông báo",
                    (orderMessage || "Không thể tạo đơn hàng CA. Vui lòng thử lại.")
                        .replace("Lỗi hệ thống: ", "").replace("Lỗi nội bộ: ", ""),
                    [{ text: "Đóng", style: "cancel" }]
                );
                return;
            }

            // ── Bước 6: Lấy thông tin đơn hàng để hiển thị ───────
            // Non-fatal: nếu API này lỗi thì vẫn navigate, chỉ thiếu data hiển thị
            let infoData = null;
            try {
                const infoResponse = await getOrderInfo(requestId || "");
                infoData = infoResponse.data ?? infoResponse.Data ?? null;
            } catch (infoErr: any) {
                console.warn("getOrderInfo lỗi, navigate với data rỗng:", infoErr?.response?.status ?? infoErr?.message);
            }

            router.push({
                pathname: "/sign-contract",
                params: {
                    fullName: infoData?.FullName ?? infoData?.fullName ?? "",
                    dateOfBirth: infoData?.DateOfBirth ?? infoData?.dateOfBirth ?? "",
                    gender: infoData?.Gender ?? infoData?.gender ?? "",
                    permanentAddress: infoData?.PermanentAddress ?? infoData?.permanentAddress ?? "",
                    orderId: infoData?.OrderID ?? infoData?.orderId ?? "",
                },
            });

        } catch (error: any) {
            // Log nội bộ để debug, không dùng console.error để tránh hiện LogBox trên màn hình người dùng
            console.log("✖ [submitKycInfo]:", error.response?.data ?? error.message);

            let title = "Thông báo";
            let desc = "Không thể gửi thông tin. Vui lòng thử lại.";

            if (error.message === "Network Error") {
                title = "Lỗi kết nối";
                desc = "Không thể kết nối đến máy chủ. Kiểm tra lại mạng và thử lại.";
            } else if (error.response) {
                const sData = error.response.data;
                if (sData?.Message || sData?.message) {
                    desc = (sData.Message || sData.message).replace("Lỗi hệ thống: ", "");
                } else if (sData?.errors) {
                    desc = Object.entries(sData.errors as Record<string, string[]>)
                        .map(([f, msgs]) => `${f}: ${msgs.join(", ")}`)
                        .join("\n");
                } else {
                    desc = `Lỗi máy chủ (${error.response.status}). Vui lòng thử lại.`;
                }
            }

            if (error.response && error.response.status !== 500 && error.message !== "Network Error") {
                Alert.alert(
                    title,
                    desc,
                    [{ text: "Đóng", style: "cancel" }]
                );
                return;
            }
            Alert.alert(title, desc);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleRetake = () => {
        reset();
        router.replace("/id-camera-front");
    };

    return (
        <KeyboardAvoidingView
            style={{ flex: 1 }}
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}
        >
            <View style={styles.container}>
                {/* ── Gradient Header ── */}
                <LinearGradient
                    colors={["#1565C0", "#2092EC"]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.header}
                >
                    <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
                        <MaterialCommunityIcons name="arrow-left" size={24} color="#FFF" />
                    </TouchableOpacity>

                    <View style={styles.headerCenter}>
                        <Text style={styles.headerTitle}>Xác thực thông tin</Text>
                        <Text style={styles.headerSub}>Kiểm tra dữ liệu định danh</Text>
                    </View>

                    <View style={{ width: 40 }} />
                </LinearGradient>



                <ScrollView
                    contentContainerStyle={styles.scrollContent}
                    keyboardShouldPersistTaps="handled"
                    showsVerticalScrollIndicator={false}
                >
                    {/* ── Banner ── */}
                    <View style={styles.banner}>
                        <MaterialCommunityIcons
                            name="alert-circle-outline"
                            size={22}
                            color="#FFB300"
                        />
                        <View style={{ flex: 1 }}>
                            <Text style={styles.bannerTitle}>Kiểm tra dữ liệu</Text>
                            <Text style={styles.bannerSub}>
                                Dữ liệu được trích xuất tự động. Quý khách vui lòng kiểm tra lại thông tin. Đảm bảo thông tin đầy đủ và chính xác.
                            </Text>
                        </View>
                    </View>

                    {/* ── Info section: CCCD ── */}
                    <View style={styles.card}>
                        <View style={styles.cardHeader}>
                            <MaterialCommunityIcons
                                name="card-account-details-outline"
                                size={16}
                                color="#1565C0"
                            />
                            <Text style={styles.cardHeaderText}>THÔNG TIN CÁ NHÂN</Text>
                        </View>

                        {(
                            [
                                "fullName",
                                "dateOfBirth",
                                "gender",
                                "idNumber",
                                "issueDate",
                                "placeOfIssue",
                                "address",
                            ] as (keyof IDInfo)[]
                        ).map((field, idx, arr) => (
                            <View key={field}>
                                <InfoRow
                                    label={FIELD_LABELS[field]}
                                    icon={FIELD_ICONS[field]}
                                    value={idInfo[field]}
                                    isEditing={editingField === field}
                                    hasError={errors[field]}
                                    onEdit={() => {
                                        setEditingField(field);
                                        if (errors[field]) {
                                            setIdInfo((p) => ({ ...p, [field]: "" }));
                                        }
                                    }}
                                    onChange={(t) => {
                                        setIdInfo((p) => ({ ...p, [field]: t }));
                                        if (errors[field]) setErrors(prev => ({ ...prev, [field]: false }));
                                    }}
                                    onBlur={() => setEditingField(null)}
                                />
                                {idx < arr.length - 1 && <View style={styles.divider} />}
                            </View>
                        ))}
                    </View>

                    {/* ── Info section: Liên hệ ── */}
                    <View style={styles.card}>
                        <View style={styles.cardHeader}>
                            <MaterialCommunityIcons
                                name="contacts-outline"
                                size={16}
                                color="#1565C0"
                            />
                            <Text style={styles.cardHeaderText}>LIÊN HỆ</Text>
                        </View>

                        {(["phoneNumber", "email"] as (keyof IDInfo)[]).map((field, idx, arr) => (
                            <View key={field}>
                                <InfoRow
                                    label={FIELD_LABELS[field]}
                                    icon={FIELD_ICONS[field]}
                                    value={idInfo[field]}
                                    isEditing={editingField === field}
                                    hasError={errors[field]}
                                    onEdit={() => {
                                        setEditingField(field);
                                        if (errors[field]) {
                                            setIdInfo((p) => ({ ...p, [field]: "" }));
                                        }
                                    }}
                                    onChange={(t) => {
                                        setIdInfo((p) => ({ ...p, [field]: t }));
                                        if (errors[field]) setErrors(prev => ({ ...prev, [field]: false }));
                                    }}
                                    onBlur={() => setEditingField(null)}
                                />
                                {idx < arr.length - 1 && <View style={styles.divider} />}
                            </View>
                        ))}
                    </View>

                    {/* ── Privacy Note ── */}
                    <View style={styles.noteBox}>
                        <MaterialCommunityIcons
                            name="lock-outline"
                            size={16}
                            color="#1565C0"
                        />
                        <Text style={styles.noteText}>
                            Dữ liệu của bạn được bảo mật tuyệt đối và chỉ dùng cho mục đích xác thực tài khoản.
                        </Text>
                    </View>
                </ScrollView>

                {/* ── Bottom actions ── */}
                <View style={styles.bottomBar}>
                    <TouchableOpacity style={styles.retakeBtn} onPress={handleRetake}>
                        <MaterialCommunityIcons name="camera-retake" size={18} color="#666" />
                        <Text style={styles.retakeBtnText}>Chụp lại</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[styles.submitBtn, isSubmitting && { opacity: 0.7 }]}
                        onPress={handleSubmit}
                        disabled={isSubmitting}
                        activeOpacity={0.85}
                    >
                        <MaterialCommunityIcons name="shield-check" size={20} color="#FFF" />
                        <Text style={styles.submitBtnText}>Xác thực</Text>
                        <MaterialCommunityIcons name="arrow-right" size={20} color="#FFF" />
                    </TouchableOpacity>
                </View>
            </View>

            {/* ── Submit Loading Overlay ── */}
            <Modal visible={isSubmitting} transparent animationType="fade" statusBarTranslucent>
                <View style={styles.loadingOverlay}>
                    <View style={styles.loadingCard}>

                        {/* Icon đếm ngược gradient tròn */}
                        <LinearGradient
                            colors={["#1565C0", "#2092EC"]}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 1 }}
                            style={styles.loadingIconCircle}
                        >
                            <Text style={{ color: "#FFF", fontSize: 28, fontWeight: "800" }}>
                                {countdown}s
                            </Text>
                        </LinearGradient>

                        <Text style={styles.loadingTitle}>Đang tạo đơn hàng</Text>
                        <Text style={styles.loadingDesc}>
                            Đang liên hệ đối tác tạo đơn hàng. Vui lòng không thoát ứng dụng trong quá trình xử lý.
                        </Text>

                        {/* Spinner bar */}
                        <View style={styles.loadingBarWrap}>
                            <ActivityIndicator size="small" color="#2092EC" />
                            <View style={styles.loadingBar} />
                        </View>

                    </View>
                </View>
            </Modal>


            {/* ── Custom Error Modal ── */}
            <Modal
                visible={isErrorModalVisible}
                transparent
                animationType="fade"
                onRequestClose={() => setIsErrorModalVisible(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.errorModal}>
                        <View style={styles.errorIconCircle}>
                            <MaterialCommunityIcons name="alert-outline" size={32} color="#D32F2F" />
                        </View>
                        <Text style={styles.errorModalTitle}>{errorModalTitle}</Text>
                        <Text style={styles.errorModalDesc}>{errorModalDesc}</Text>
                        <TouchableOpacity
                            style={styles.errorModalBtn}
                            onPress={() => setIsErrorModalVisible(false)}
                        >
                            <Text style={styles.errorModalBtnText}>Đã hiểu</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: "#F0F4F8" },

    /* Header */
    header: {
        flexDirection: "row",
        alignItems: "center",
        paddingTop: 15,
        paddingBottom: 24,
        paddingHorizontal: 15,
        gap: 12,
    },
    backBtn: {
        width: 40,
        height: 40,
        borderRadius: 12,
        backgroundColor: "rgba(255,255,255,0.18)",
        alignItems: "center",
        justifyContent: "center",
    },
    headerCenter: { flex: 1 },
    headerTitle: { color: "#FFF", fontSize: 17, fontWeight: "700" },
    headerSub: { color: "rgba(255,255,255,0.65)", fontSize: 12, marginTop: 2 },

    /* Stepper */
    stepperWrap: {
        backgroundColor: "#FFF",
        paddingBottom: 16,
        borderBottomLeftRadius: 24,
        borderBottomRightRadius: 24,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.05,
        shadowRadius: 10,
        elevation: 3,
    },
    stepperContainer: {
        flexDirection: "row",
        paddingHorizontal: 32,
        alignItems: "flex-start",
    },
    stepItem: { alignItems: "center", flex: 1, position: "relative" },
    stepLine: {
        position: "absolute",
        top: 14,
        right: "50%",
        width: "100%",
        height: 2,
        backgroundColor: "#E2E8F0",
        zIndex: 0,
    },
    stepLineActive: { backgroundColor: "#2092EC" },
    stepCircle: {
        width: 28,
        height: 28,
        borderRadius: 10,
        backgroundColor: "#F1F5F9",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 1,
        marginBottom: 6,
    },
    stepCircleActive: {
        backgroundColor: "#2092EC",
        shadowColor: "#2092EC",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
    },
    stepCircleDone: { backgroundColor: "#4CAF50" },
    stepNum: { fontSize: 12, fontWeight: "800", color: "#94A3B8" },
    stepLabel: { fontSize: 11, color: "#94A3B8", fontWeight: "600" },
    stepLabelActive: { color: "#2092EC", fontWeight: "800" },

    scrollContent: { padding: 16, paddingBottom: 24 },

    banner: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#FFF8E1",
        padding: 14,
        borderRadius: 16,
        borderLeftWidth: 4,
        borderLeftColor: "#FFC107",
        marginBottom: 20,
        gap: 12,
    },
    bannerTitle: { fontSize: 13, fontWeight: "800", color: "#FFB300" },
    bannerSub: { fontSize: 12, color: "#FFB300", marginTop: 2, lineHeight: 18 },

    /* Card */
    card: {
        backgroundColor: "#FFF",
        borderRadius: 20,
        marginBottom: 16,
        overflow: "hidden",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.04,
        shadowRadius: 12,
        elevation: 2,
    },
    cardHeader: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#F8FAFF",
        paddingHorizontal: 16,
        paddingVertical: 12,
        gap: 8,
        borderBottomWidth: 1,
        borderBottomColor: "#F1F5F9",
    },
    cardHeaderText: {
        fontSize: 11,
        fontWeight: "700",
        color: "#64748B",
        letterSpacing: 0.8,
    },

    /* Info Row */
    row: {
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: 16,
        paddingVertical: 14,
        gap: 12,
    },
    rowIcon: {
        width: 36,
        height: 36,
        borderRadius: 10,
        backgroundColor: "#F1F5F9",
        alignItems: "center",
        justifyContent: "center",
    },
    rowContent: { flex: 1 },
    rowLabel: { fontSize: 11, color: "#94A3B8", fontWeight: "600", marginBottom: 4 },
    rowValue: { fontSize: 14, color: "#1E293B", fontWeight: "700", lineHeight: 20 },
    rowInput: {
        fontSize: 14,
        color: "#1E293B",
        fontWeight: "700",
        borderBottomWidth: 1.5,
        borderBottomColor: "#2092EC",
        paddingBottom: 2,
        paddingTop: 0,
    },
    divider: { height: 1, backgroundColor: "#F1F5F9", marginLeft: 64 },

    /* Error Styles */
    rowError: {
        backgroundColor: "#FFF5F5",
    },
    rowIconError: {
        backgroundColor: "#FFEAEA",
    },
    rowLabelError: {
        color: "#D32F2F",
    },
    rowValueError: {
        color: "#D32F2F",
        opacity: 0.8,
    },

    noteBox: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#cce4fc",
        padding: 14,
        borderRadius: 14,
        gap: 10,
    },
    noteText: { flex: 1, fontSize: 12, color: "#4b85d7", lineHeight: 18 },

    /* Bottom Actions */
    bottomBar: {
        flexDirection: "row",
        padding: 16,
        paddingBottom: Platform.OS === "ios" ? 34 : 20,
        backgroundColor: "#FFF",
        borderTopWidth: 1,
        borderTopColor: "#EDF2F7",
        gap: 12,
    },
    retakeBtn: {
        flex: 1,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        paddingVertical: 16,
        borderRadius: 16,
        borderWidth: 1.5,
        borderColor: "#E2E8F0",
        gap: 8,
    },
    retakeBtnText: { color: "#64748B", fontWeight: "700", fontSize: 15 },
    submitBtn: {
        flex: 2,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#1565C0",
        borderRadius: 16,
        paddingVertical: 16,
        gap: 10,
    },
    submitBtnText: { color: "#FFF", fontWeight: "700", fontSize: 16 },

    /* Error Modal Styles */
    modalOverlay: {
        flex: 1,
        backgroundColor: "rgba(15, 23, 42, 0.6)",
        justifyContent: "center",
        alignItems: "center",
    },
    errorModal: {
        backgroundColor: "#FFF",
        borderRadius: 24,
        padding: 24,
        width: "85%",
        alignItems: "center",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.1,
        shadowRadius: 20,
        elevation: 10,
    },
    errorIconCircle: {
        width: 64,
        height: 64,
        borderRadius: 32,
        backgroundColor: "#FFEBEE",
        alignItems: "center",
        justifyContent: "center",
        marginBottom: 16,
    },
    errorModalTitle: {
        fontSize: 18,
        fontWeight: "800",
        color: "#1E293B",
        marginBottom: 8,
    },
    errorModalDesc: {
        fontSize: 14,
        color: "#64748B",
        textAlign: "center",
        lineHeight: 22,
        marginBottom: 24,
    },
    errorModalBtn: {
        backgroundColor: "#1565C0",
        paddingVertical: 14,
        paddingHorizontal: 32,
        borderRadius: 14,
        width: "100%",
        alignItems: "center",
    },
    errorModalBtnText: {
        color: "#FFF",
        fontWeight: "700",
        fontSize: 15,
    },

    /* ── Submit Loading Overlay (light/blue theme) ── */
    loadingOverlay: {
        flex: 1,
        backgroundColor: "rgba(15,30,60,0.55)",
        justifyContent: "center",
        alignItems: "center",
        paddingHorizontal: 28,
    },
    loadingCard: {
        backgroundColor: "#FFFFFF",
        borderRadius: 24,
        padding: 28,
        width: "100%",
        alignItems: "center",
        shadowColor: "#1565C0",
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.12,
        shadowRadius: 24,
        elevation: 12,
    },
    loadingIconCircle: {
        width: 80,
        height: 80,
        borderRadius: 40,
        alignItems: "center",
        justifyContent: "center",
        marginBottom: 20,
    },
    loadingTitle: {
        color: "#1E293B",
        fontSize: 18,
        fontWeight: "700",
        marginBottom: 6,
        textAlign: "center",
    },
    loadingDesc: {
        color: "#94A3B8",
        fontSize: 13,
        textAlign: "center",
        lineHeight: 20,
        marginBottom: 24,
    },
    loadingBarWrap: {
        flexDirection: "row",
        alignItems: "center",
        gap: 10,
    },
    loadingBar: {
        flex: 1,
        height: 3,
        borderRadius: 2,
        backgroundColor: "#E2E8F0",
        overflow: "hidden",
    },
});



