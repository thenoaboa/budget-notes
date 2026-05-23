// Save as: src/components/MoneyAvailableSection.tsx

import { RefObject } from "react";
import {
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

type Props = {
  startingMoney: string;
  setStartingMoney: (value: string) => void;
  salesTaxEnabled: boolean;
  setSalesTaxEnabled: (
    value: boolean | ((previous: boolean) => boolean),
  ) => void;
  taxRate: string;
  setTaxRate: (value: string) => void;
  startingMoneyRef: RefObject<TextInput | null>;
  taxRateRef: RefObject<TextInput | null>;
};

export function MoneyAvailableSection({
  startingMoney,
  setStartingMoney,
  salesTaxEnabled,
  setSalesTaxEnabled,
  taxRate,
  setTaxRate,
  startingMoneyRef,
  taxRateRef,
}: Props) {
  return (
    <>
      {false && (
        <>
          <Text style={styles.label}>Money available</Text>

          <TextInput
            ref={startingMoneyRef}
            style={styles.mainInput}
            placeholder="$0.00"
            placeholderTextColor="#8A98A8"
            keyboardType="decimal-pad"
            returnKeyType={salesTaxEnabled ? "next" : "done"}
            value={startingMoney}
            onChangeText={setStartingMoney}
            onSubmitEditing={() => {
              if (salesTaxEnabled) {
                taxRateRef.current?.focus();
              }
            }}
          />
        </>
      )}

      <View style={styles.taxRow}>
        <TouchableOpacity
          style={[styles.taxToggle, salesTaxEnabled && styles.taxToggleActive]}
          onPress={() => setSalesTaxEnabled((prev) => !prev)}
        >
          <Text
            style={[
              styles.taxToggleText,
              salesTaxEnabled && styles.taxToggleTextActive,
            ]}
          >
            Sales tax {salesTaxEnabled ? "on" : "off"}
          </Text>
        </TouchableOpacity>

        {salesTaxEnabled && (
          <TextInput
            ref={taxRateRef}
            style={styles.taxInput}
            placeholder="8.25"
            placeholderTextColor="#8A98A8"
            keyboardType="decimal-pad"
            returnKeyType="done"
            value={taxRate}
            onChangeText={setTaxRate}
          />
        )}
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  label: {
    color: "#F4F7FA",
    fontSize: 15,
    fontWeight: "800",
    marginBottom: 8,
  },

  mainInput: {
    backgroundColor: "#243342",
    color: "#FFFFFF",
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 22,
    fontWeight: "800",
    borderWidth: 1,
    borderColor: "#3B4D5F",
    marginBottom: 14,
  },

  taxRow: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 18,
  },

  taxToggle: {
    flex: 1,
    backgroundColor: "#243342",
    borderRadius: 14,
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: "#3B4D5F",
  },

  taxToggleActive: {
    backgroundColor: "#123527",
    borderColor: "#2ECC71",
  },

  taxToggleText: {
    color: "#CAD3DD",
    fontSize: 15,
    fontWeight: "800",
  },

  taxToggleTextActive: {
    color: "#2ECC71",
  },

  taxInput: {
    width: 80,
    backgroundColor: "#243342",
    color: "#FFFFFF",
    borderRadius: 14,
    paddingVertical: 12,
    paddingHorizontal: 12,
    fontSize: 15,
    fontWeight: "800",
    borderWidth: 1,
    borderColor: "#3B4D5F",
    textAlign: "center",
  },
});
