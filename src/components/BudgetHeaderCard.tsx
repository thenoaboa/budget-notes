// Save as: src/components/BudgetHeaderCard.tsx

import { StyleSheet, Text, View } from "react-native";

import type { BudgetStatusStyle } from "../types/budgetEditor";

type Props = {
  affirmingMessage: string;
  safeToSpend: number;
  headerSubtext: string;
  currentStyle: BudgetStatusStyle;
  headerTextColor: string;
  hasEnteredMoney: boolean;
};

export function BudgetHeaderCard({
  affirmingMessage,
  safeToSpend,
  headerSubtext,
  currentStyle,
  headerTextColor,
  hasEnteredMoney,
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
      {!hasEnteredMoney && (
        <Text style={[styles.headerMessage, { color: headerTextColor }]}>
          {affirmingMessage}
        </Text>
      )}

      <Text style={styles.headerAmount}>${safeToSpend.toFixed(2)}</Text>

      {!hasEnteredMoney && (
        <Text style={[styles.headerSubtext, { color: headerTextColor }]}>
          {headerSubtext}
        </Text>
      )}
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
    color: "#FFFFFF",
    fontSize: 42,
    fontWeight: "900",
  },

  headerSubtext: {
    fontSize: 15,
    fontWeight: "700",
  },
});
