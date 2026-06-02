// Save as: src/components/BudgetHeaderCard.tsx

import { RefObject, useState } from "react";

import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";

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
  highlightBudgetAmount?: boolean;
  onBudgetAmountTutorialFocus?: () => void;
  showMenu?: boolean;
  onMenuPress?: () => void;
  onCompareBudgets?: () => void;
};

export function BudgetHeaderCard({
  affirmingMessage,
  safeToSpend,
  startingMoney,
  setStartingMoney,
  startingMoneyRef,
  headerSubtext,
  currentStyle,
  headerTextColor,
  hasEnteredItems,
  highlightBudgetAmount,
  onBudgetAmountTutorialFocus,
  showMenu,
  onMenuPress,
  onCompareBudgets,
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

  function handleAmountFocus() {
    setIsEditingAmount(true);
  }

  return (
    <Pressable
      onPress={() => {
        if (highlightBudgetAmount) {
          onBudgetAmountTutorialFocus?.();
        }
      }}
      style={[
        styles.headerCard,
        {
          backgroundColor: currentStyle.backgroundColor,
          borderColor: currentStyle.borderColor,
        },
        highlightBudgetAmount && styles.highlightedHeaderCard,
      ]}
    >
      <Pressable style={styles.menuButton} onPress={onMenuPress}>
        <Text style={styles.menuDots}>•••</Text>
      </Pressable>

      {showMenu && (
        <View style={styles.dropdownMenu}>
          <View style={styles.dropdownArrow} />

          <Pressable style={styles.dropdownButton} onPress={onCompareBudgets}>
            <Text style={styles.dropdownText}>Compare Budgets</Text>
          </Pressable>
        </View>
      )}

      <Text style={styles.headerMessage}>{affirmingMessage}</Text>

      <TextInput
        ref={startingMoneyRef}
        style={[
          styles.headerAmount,
          highlightBudgetAmount && styles.highlightedAmountInput,
        ]}
        value={inputValue}
        onChangeText={handleAmountChange}
        onFocus={() => {
          if (!highlightBudgetAmount) {
            handleAmountFocus();
          }
        }}
        onBlur={() => setIsEditingAmount(false)}
        placeholder="$0.00"
        placeholderTextColor="#FFFFFF"
        keyboardType="decimal-pad"
        returnKeyType="done"
        selectTextOnFocus
        editable={!highlightBudgetAmount}
      />

      <Text style={styles.headerSubtext}>
        {startingMoney.trim() === "" ? "Tap amount to edit" : headerSubtext}
      </Text>

      {highlightBudgetAmount && (
        <Text style={styles.highlightText}>Tap the amount to continue</Text>
      )}
    </Pressable>
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

  menuButton: {
    position: "absolute",
    top: 12,
    right: 14,
    zIndex: 20,
  },

  menuDots: {
    color: "#FFFFFF",
    fontSize: 22,
    fontWeight: "900",
  },

  dropdownMenu: {
    position: "absolute",
    top: 40,
    right: -60,
    zIndex: 25,
  },

  dropdownArrow: {
    alignSelf: "flex-end",
    marginRight: 34,
    width: 0,
    height: 0,
    borderLeftWidth: 9,
    borderRightWidth: 9,
    borderBottomWidth: 10,
    borderLeftColor: "transparent",
    borderRightColor: "transparent",
    borderBottomColor: "#182638",
  },

  dropdownButton: {
    backgroundColor: "#182638",
    borderRadius: 18,
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: "#2D4562",
  },

  dropdownText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
  },

  highlightedHeaderCard: {
    borderWidth: 3,
    borderColor: "#FFFFFF",
    shadowColor: "#2ECC71",
    shadowOpacity: 0.95,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 0 },
    elevation: 14,
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

  highlightedAmountInput: {
    textShadowColor: "#2ECC71",
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 10,
  },

  headerSubtext: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "700",
  },

  highlightText: {
    color: "#2ECC71",
    fontSize: 14,
    fontWeight: "900",
    marginTop: 8,
  },
});
