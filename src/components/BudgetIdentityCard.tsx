// Save as: src/components/BudgetIdentityCard.tsx

import { StyleSheet, TextInput, View } from "react-native";

type Props = {
  noteTitle: string;
  setNoteTitle: (value: string) => void;
  startingMoney: string;
  setStartingMoney: (value: string) => void;
  onBudgetAmountFocus?: () => void;
  onBudgetAmountBlur?: () => void;
  cleanMoneyInput: (value: string) => string;
};

export function BudgetIdentityCard({
  noteTitle,
  setNoteTitle,
  startingMoney,
  setStartingMoney,
  onBudgetAmountFocus,
  onBudgetAmountBlur,
  cleanMoneyInput,
}: Props) {
  return (
    <View style={styles.budgetIdentityCard}>
      <TextInput
        style={styles.budgetIdentityTitleInput}
        value={noteTitle}
        onChangeText={setNoteTitle}
        placeholder="Untitled Budget"
        placeholderTextColor="#9EADBD"
        textAlign="center"
        selectionColor="#2ECC71"
        underlineColorAndroid="transparent"
      />

      <TextInput
        style={styles.budgetIdentityAmountInput}
        value={startingMoney.trim().length === 0 ? "$" : `$${startingMoney}`}
        onChangeText={(value) => {
          setStartingMoney(cleanMoneyInput(value));
        }}
        onFocus={onBudgetAmountFocus}
        onBlur={onBudgetAmountBlur}
        keyboardType="decimal-pad"
        placeholder="$0.00"
        placeholderTextColor="#2ECC71"
        textAlign="center"
        selectionColor="#2ECC71"
        underlineColorAndroid="transparent"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  budgetIdentityCard: {
    marginBottom: 8,
    backgroundColor: "#17232F",
    borderRadius: 22,
    borderWidth: 1,
    borderColor: "#2D3D4D",
    paddingHorizontal: 16,
    paddingTop: 20,
    paddingBottom: 18,
    alignItems: "center",
    justifyContent: "center",
  },

  budgetIdentityTitleInput: {
    width: "100%",
    color: "#9EADBD",
    fontSize: 26,
    fontWeight: "900",
    textAlign: "center",
    padding: 0,
    borderWidth: 0,
    outlineStyle: "none" as any,
  },

  budgetIdentityAmountInput: {
    width: "100%",
    marginTop: 8,
    color: "#2ECC71",
    fontSize: 21,
    fontWeight: "900",
    textAlign: "center",
    padding: 0,
    borderWidth: 0,
    outlineStyle: "none" as any,
  },
});
