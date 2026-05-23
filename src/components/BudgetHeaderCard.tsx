// Save as: src/components/BudgetHeaderCard.tsx

import { RefObject, useState } from "react";
import { StyleSheet, Text, TextInput, View } from "react-native";

import type { BudgetStatusStyle } from "../types/budgetEditor";

type Props = {
  affirmingMessage: string;
  safeToSpend: number;
  startingMoney: string;
  setStartingMoney: (value: string) => void;
  startingMoneyRef: RefObject<TextInput | null>;
  headerSubtext: string;
  currentStyle: BudgetStatusStyle;
  headerTextColor: string;
  hasEnteredItems: boolean;
};

export function BudgetHeaderCard({
  affirmingMessage,
  safeToSpend,
  startingMoney,
  setStartingMoney,
  startingMoneyRef,
  headerSubtext,
  currentStyle,
  hasEnteredItems,
}: Props) {
  const [isEditingAmount, setIsEditingAmount] = useState(false);

  const startingAmount = parseFloat(startingMoney) || 0;
  const displayAmount = hasEnteredItems ? safeToSpend : startingAmount;

  const inputValue = isEditingAmount
    ? startingMoney
    : `$${displayAmount.toFixed(2)}`;

  function handleAmountChange(value: string) {
    const cleanedValue = value.replace(/[^0-9.]/g, "");
    setStartingMoney(cleanedValue);
  }

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
      <Text style={styles.headerMessage}>{affirmingMessage}</Text>

      <TextInput
        ref={startingMoneyRef}
        style={styles.headerAmount}
        value={inputValue}
        onChangeText={handleAmountChange}
        onFocus={() => setIsEditingAmount(true)}
        onBlur={() => setIsEditingAmount(false)}
        placeholder="$0.00"
        placeholderTextColor="#FFFFFF"
        keyboardType="decimal-pad"
        returnKeyType="done"
        selectTextOnFocus
      />

      <Text style={styles.headerSubtext}>{headerSubtext}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  headerCard: {
    paddingVertical: 18,
    paddingHorizontal: 18,
    borderRadius: 24,
    borderWidth: 1,
    marginTop: 12,
    marginBottom: 12,
  },

  headerMessage: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "700",
    marginBottom: 4,
  },

  headerAmount: {
    color: "#FFFFFF",
    fontSize: 42,
    fontWeight: "900",
    padding: 0,
  },

  headerSubtext: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "700",
  },
});
