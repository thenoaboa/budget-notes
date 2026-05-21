// Save as: src/components/BudgetSummaryBox.tsx

import { StyleSheet, Text, View } from "react-native";

import type { BudgetStatusStyle } from "../types/budgetEditor";

type Props = {
  subtotal: number;
  taxAmount: number;
  totalSpent: number;
  salesTaxEnabled: boolean;
  affirmingMessage: string;
  currentStyle: BudgetStatusStyle;
};

export function BudgetSummaryBox({
  subtotal,
  taxAmount,
  totalSpent,
  salesTaxEnabled,
  affirmingMessage,
  currentStyle,
}: Props) {
  return (
    <View style={styles.summaryBox}>
      <View style={styles.summaryRow}>
        <Text style={styles.summaryText}>Items</Text>
        <Text style={styles.summaryText}>${subtotal.toFixed(2)}</Text>
      </View>

      {salesTaxEnabled && (
        <View style={styles.summaryRow}>
          <Text style={styles.summaryText}>Estimated tax</Text>
          <Text style={styles.summaryText}>${taxAmount.toFixed(2)}</Text>
        </View>
      )}

      <View style={styles.summaryRow}>
        <Text style={styles.summaryTotal}>Planned total</Text>
        <Text style={styles.summaryTotal}>${totalSpent.toFixed(2)}</Text>
      </View>

      <View
        style={[
          styles.statusNote,
          {
            backgroundColor: currentStyle.backgroundColor,
            borderColor: currentStyle.borderColor,
          },
        ]}
      >
        <Text
          style={[styles.statusNoteText, { color: currentStyle.textColor }]}
        >
          {affirmingMessage}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  summaryBox: {
    backgroundColor: "#1B2633",
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: "#344657",
  },

  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },

  summaryText: {
    color: "#CAD3DD",
    fontSize: 15,
    fontWeight: "700",
  },

  summaryTotal: {
    color: "#FFFFFF",
    fontSize: 17,
    fontWeight: "900",
  },

  statusNote: {
    marginTop: 10,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 12,
    borderWidth: 1,
  },

  statusNoteText: {
    fontSize: 14,
    fontWeight: "800",
  },
});
