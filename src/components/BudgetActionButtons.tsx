// Save as: src/components/BudgetActionButtons.tsx

import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

type Props = {
  onBackToMenu: () => void;
  onOpenReceipt: () => void;
};

export function BudgetActionButtons({ onBackToMenu, onOpenReceipt }: Props) {
  return (
    <View style={styles.bottomButtonRow}>
      <TouchableOpacity style={styles.backButton} onPress={onBackToMenu}>
        <Text style={styles.backButtonText}>← Menu</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.editReceiptButton}
        onPress={onOpenReceipt}
      >
        <Text style={styles.editReceiptButtonText}>Hidden →</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  bottomButtonRow: {
    flexDirection: "row",
    gap: 12,
    marginTop: 0,
  },

  backButton: {
    flex: 1,
    backgroundColor: "#123527",
    borderRadius: 14,
    paddingVertical: 13,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "rgba(46, 204, 113, 0.35)",
  },

  backButtonText: {
    color: "#2ECC71",
    fontSize: 15,
    fontWeight: "900",
    textAlign: "center",
  },

  editReceiptButton: {
    flex: 1,
    backgroundColor: "#243342",
    borderRadius: 14,
    paddingVertical: 13,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#3B4D5F",
  },

  editReceiptButtonText: {
    color: "#CAD3DD",
    fontSize: 15,
    fontWeight: "900",
    textAlign: "center",
  },
});
