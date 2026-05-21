// Save as: src/components/BudgetHeaderCard.tsx

import { StyleSheet, Text, View } from "react-native";

import type { BudgetStatusStyle } from "../types/budgetEditor";

type Props = {
  affirmingMessage: string;
  safeToSpend: number;
  headerSubtext: string;
  currentStyle: BudgetStatusStyle;
  headerTextColor: string;
};

export function BudgetHeaderCard({
  affirmingMessage,
  safeToSpend,
  headerSubtext,
  currentStyle,
  headerTextColor,
}: Props) {
  return (
    <View
      style={[
        styles.headerCard,
        {
          backgroundColor: currentStyle.backgroundColor,
          borderColor: currentStyle.borderColor,
        },
      ]}
    >
      <Text style={[styles.headerMessage, { color: headerTextColor }]}>
        {affirmingMessage}
      </Text>

      <Text style={[styles.headerAmount, { color: headerTextColor }]}>
        ${safeToSpend.toFixed(2)}
      </Text>

      <Text style={[styles.headerSubtext, { color: headerTextColor }]}>
        {headerSubtext}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  headerCard: {
    paddingVertical: 18,
    paddingHorizontal: 18,
    borderRadius: 24,
    borderWidth: 1,
    marginBottom: 18,
  },

  headerMessage: {
    fontSize: 14,
    fontWeight: "700",
    marginBottom: 4,
  },

  headerAmount: {
    fontSize: 42,
    fontWeight: "900",
  },

  headerSubtext: {
    fontSize: 15,
    fontWeight: "700",
  },
});
