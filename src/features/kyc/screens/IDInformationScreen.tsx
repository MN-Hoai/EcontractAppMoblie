import { useKycStore } from "@/store/kycStore";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import axios from "axios";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { useRef, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    KeyboardAvoidingView,
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

const HARDCODED_ACCOUNT_ID = "3f2a9c4e-8d7b-4c91-a2f1-6e5b8a0d9c21";

const parseDate = (dateStr: string): string | null => {
    if (!dateStr) return null;
    const parts = dateStr.split("/");
    if (parts.length === 3) return `${parts[2]}-${parts[1]}-${parts[0]}`;
    return null;
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
}: {
    label: string;
    icon: string;
    value: string;
    isEditing: boolean;
    onEdit: () => void;
    onChange: (t: string) => void;
    onBlur: () => void;
    hasError?: boolean;
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
    const reset = useKycStore((s) => s.reset);

    const [idInfo, setIdInfo] = useState<IDInfo>({
        fullName: "LÊ KHANH ĐẠT",
        dateOfBirth: "21/12/1993",
        gender: "Nam",
        idNumber: "040093016268",
        issueDate: "21/12/2022",
        placeOfIssue: "CỤC CẢNH SÁT QUẢN LÝ HÀNH CHÍNH VỀ TRẬT TỰ CÔNG CỘNG",
        address: "TỐ 5, PHƯỜNG NAM ĐỊNH, NINH BÌNH",
        phoneNumber: "0348741193",
        email: "datik.93t@gmail.com",
    });

    const [editingField, setEditingField] = useState<keyof IDInfo | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [errors, setErrors] = useState<Partial<Record<keyof IDInfo, boolean>>>({});
    const [isErrorModalVisible, setIsErrorModalVisible] = useState(false);

    const handleSubmit = async () => {
        // Validation: Check for empty fields
        const newErrors: Partial<Record<keyof IDInfo, boolean>> = {};
        let hasAnyError = false;

        for (const field of Object.keys(idInfo) as (keyof IDInfo)[]) {
            if (!idInfo[field] || idInfo[field].trim() === "") {
                newErrors[field] = true;
                hasAnyError = true;
            }
        }

        if (hasAnyError) {
            setErrors(newErrors);
            setIsErrorModalVisible(true);
            return;
        }

        setErrors({});
        setIsSubmitting(true);
        try {
            const model = {
                IdNumber: idInfo.idNumber,
                FullName: idInfo.fullName,
                DateOfBirth: parseDate(idInfo.dateOfBirth),
                Gender: idInfo.gender,
                IssueDate: parseDate(idInfo.issueDate),
                IssuePlace: idInfo.placeOfIssue,
                PermanentAddress: idInfo.address,
                PhoneNumber: idInfo.phoneNumber,
                Email: idInfo.email,
            };

            const url = `http://192.168.1.72:5000/api/infoid?accountId=${HARDCODED_ACCOUNT_ID}`;
            const response = await axios.post(url, model);

            if (response.status === 200) {
                router.push("/sign-contract");
            } else {
                throw new Error("Status " + response.status);
            }
        } catch (error: any) {
            let msg = "Không thể gửi thông tin. Vui lòng thử lại.";
            if (error.message === "Network Error") {
                msg = "Lỗi kết nối mạng. Kiểm tra IP/Port và Firewall server.";
            } else if (error.response) {
                msg = `Lỗi ${error.response.status}: ${error.response.data?.message ?? "Unknown"
                    }`;
            }
            Alert.alert("Lỗi", msg);
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
                                    onEdit={() => setEditingField(field)}
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
                                    onEdit={() => setEditingField(field)}
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
                        {isSubmitting ? (
                            <ActivityIndicator size="small" color="#FFF" />
                        ) : (
                            <MaterialCommunityIcons name="shield-check" size={20} color="#FFF" />
                        )}
                        <Text style={styles.submitBtnText}>
                            {isSubmitting ? "Đang gửi..." : "Xác thực"}
                        </Text>
                        {!isSubmitting && (
                            <MaterialCommunityIcons name="arrow-right" size={20} color="#FFF" />
                        )}
                    </TouchableOpacity>
                </View>
            </View>

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
                        <Text style={styles.errorModalTitle}>Thông tin chưa đầy đủ</Text>
                        <Text style={styles.errorModalDesc}>
                            Vui lòng kiểm tra và điền đầy đủ các trường thông tin được đánh dấu màu đỏ để tiếp tục.
                        </Text>
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
});
