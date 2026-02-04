import { ThemedText } from "@/components/themed-text";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { ScrollView, StyleSheet, TouchableOpacity, View } from "react-native";

interface Contract {
  id: string;
  name: string;
  date: string;
  status: "pending" | "signed";
  type: string;
}

export default function ContractsScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const router = useRouter();

  // Mock data - in real app, fetch from backend
  const contracts: Contract[] = [
    {
      id: "1",
      name: "Hợp đồng Dịch vụ Tư vấn",
      date: "2025-02-03",
      status: "pending",
      type: "service",
    },
    {
      id: "2",
      name: "Hợp đồng Bảo mật Thông tin",
      date: "2025-02-02",
      status: "pending",
      type: "confidentiality",
    },
    {
      id: "3",
      name: "Hợp đồng Hợp tác Kinh doanh",
      date: "2025-01-30",
      status: "signed",
      type: "partnership",
    },
  ];

  const pendingContracts = contracts.filter((c) => c.status === "pending");
  const signedContracts = contracts.filter((c) => c.status === "signed");

  const handleSign = (contractId: string) => {
    // Navigate to certificate info page
    router.push({
      pathname: "/certificate-info",
      params: { contractId },
    });
  };

  const ContractCard = ({
    contract,
    isPending,
  }: {
    contract: Contract;
    isPending: boolean;
  }) => (
    <TouchableOpacity
      style={[
        styles.contractCard,
        {
          backgroundColor: isDark ? "#1D3D47" : "#F0F8FF",
          borderColor: isPending
            ? isDark
              ? "#FF6B6B"
              : "#FFE5E5"
            : isDark
              ? "#4CAF50"
              : "#E5F5E3",
        },
      ]}
      onPress={() => (isPending ? handleSign(contract.id) : null)}
    >
      <View style={styles.contractHeader}>
        <View style={styles.contractIconContainer}>
          <MaterialCommunityIcons
            name={
              contract.type === "service"
                ? "file-document"
                : contract.type === "confidentiality"
                  ? "lock-outline"
                  : "handshake"
            }
            size={28}
            color={isPending ? "#FF6B6B" : "#4CAF50"}
          />
        </View>
        <View style={{ flex: 1 }}>
          <ThemedText style={styles.contractName}>{contract.name}</ThemedText>
          <ThemedText style={styles.contractDate}>{contract.date}</ThemedText>
        </View>
        <View
          style={[
            styles.statusBadge,
            {
              backgroundColor: isPending ? "#FFE5E5" : "#E5F5E3",
            },
          ]}
        >
          <ThemedText
            style={[
              styles.statusText,
              { color: isPending ? "#FF6B6B" : "#4CAF50" },
            ]}
          >
            {isPending ? "Chờ Ký" : "Đã Ký"}
          </ThemedText>
        </View>
      </View>

      {isPending && (
        <TouchableOpacity
          style={[
            styles.signButton,
            { backgroundColor: isDark ? "#FF6B6B" : "#FF5252" },
          ]}
          onPress={() => handleSign(contract.id)}
        >
          <MaterialCommunityIcons
            name="pencil"
            size={20}
            color="white"
            style={{ marginRight: 8 }}
          />
          <ThemedText style={{ color: "white", fontWeight: "600" }}>
            Ký Ngay
          </ThemedText>
        </TouchableOpacity>
      )}
    </TouchableOpacity>
  );

  return (
    <ScrollView
      style={[
        styles.container,
        { backgroundColor: isDark ? "#0D1B23" : "#FFFFFF" },
      ]}
      showsVerticalScrollIndicator={false}
    >
      {pendingContracts.length > 0 && (
        <View style={styles.section}>
          <ThemedText type="subtitle" style={styles.sectionTitle}>
            Chờ Ký ({pendingContracts.length})
          </ThemedText>
          {pendingContracts.map((contract) => (
            <ContractCard
              key={contract.id}
              contract={contract}
              isPending={true}
            />
          ))}
        </View>
      )}

      {signedContracts.length > 0 && (
        <View style={styles.section}>
          <ThemedText type="subtitle" style={styles.sectionTitle}>
            Đã Ký ({signedContracts.length})
          </ThemedText>
          {signedContracts.map((contract) => (
            <ContractCard
              key={contract.id}
              contract={contract}
              isPending={false}
            />
          ))}
        </View>
      )}

      {contracts.length === 0 && (
        <View style={styles.emptyContainer}>
          <MaterialCommunityIcons
            name="file-document-outline"
            size={64}
            color={isDark ? "#38434D" : "#D0D5DD"}
          />
          <ThemedText style={styles.emptyText}>
            Không có hợp đồng nào
          </ThemedText>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 16,
  },
  topNav: {
    height: 56,
    paddingHorizontal: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  topNavTitle: {
    fontSize: 16,
    fontWeight: "700",
    letterSpacing: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 16,
    paddingTop: 24,
    marginBottom: 16,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    marginBottom: 12,
    fontSize: 18,
    fontWeight: "600",
  },
  contractCard: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    overflow: "hidden",
  },
  contractHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  contractIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(0,0,0,0.05)",
    marginRight: 12,
  },
  contractName: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 4,
  },
  contractDate: {
    fontSize: 12,
    opacity: 0.6,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  statusText: {
    fontSize: 11,
    fontWeight: "700",
  },
  signButton: {
    flexDirection: "row",
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 80,
  },
  emptyText: {
    marginTop: 16,
    fontSize: 16,
    opacity: 0.5,
  },
});
