// Save as: src/components/SpendingItemCard.tsx

import type { MutableRefObject } from "react";
import {
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

import type { BudgetItem } from "../types/budgetEditor";

type Props = {
  item: BudgetItem;
  itemNameRefs: MutableRefObject<Record<number, TextInput | null>>;
  itemAmountRefs: MutableRefObject<Record<number, TextInput | null>>;
  updateItem: (id: number, field: "name" | "amount", value: string) => void;
  increaseQuantity: (id: number) => void;
  resetQuantity: (id: number) => void;
  toggleIncluded: (id: number) => void;
  deleteItem: (id: number) => void;
  focusNextItemOrAddCurrent: (id: number) => void;
  hideDeleteButton?: boolean;
};

export function SpendingItemRow({
  item,
  itemNameRefs,
  itemAmountRefs,
  updateItem,
  increaseQuantity,
  resetQuantity,
  toggleIncluded,
  deleteItem,
  focusNextItemOrAddCurrent,
  hideDeleteButton = false,
}: Props) {
  return (
    <View style={[styles.itemCard, !item.included && styles.itemExcluded]}>
      <View style={styles.itemControlsRow}>
        <TextInput
          ref={(ref) => {
            itemAmountRefs.current[item.id] = ref;
          }}
          style={styles.itemAmountInput}
          placeholder="$0"
          placeholderTextColor="#8A98A8"
          keyboardType="decimal-pad"
          returnKeyType="next"
          value={item.amount}
          blurOnSubmit={false}
          onChangeText={(text) => updateItem(item.id, "amount", text)}
          onSubmitEditing={() => itemNameRefs.current[item.id]?.focus()}
        />

        <TouchableOpacity
          style={styles.quantityButton}
          onPress={() => increaseQuantity(item.id)}
          onLongPress={() => resetQuantity(item.id)}
        >
          <Text style={styles.quantityButtonText}>x{item.quantity}</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.includeButton,
            !item.included && styles.includeButtonOff,
          ]}
          onPress={() => toggleIncluded(item.id)}
        >
          <Text
            style={[
              styles.includeButtonText,
              !item.included && styles.includeButtonTextOff,
            ]}
          >
            {item.included ? "In" : "Out"}
          </Text>
        </TouchableOpacity>

        {!hideDeleteButton && (
          <TouchableOpacity
            style={styles.deleteButton}
            onPress={() => deleteItem(item.id)}
          >
            <Text style={styles.deleteButtonText}>×</Text>
          </TouchableOpacity>
        )}
      </View>

      <TextInput
        ref={(ref) => {
          itemNameRefs.current[item.id] = ref;
        }}
        style={styles.itemNameInput}
        placeholder="Item name"
        placeholderTextColor="#8A98A8"
        value={item.name}
        returnKeyType="next"
        blurOnSubmit={false}
        onChangeText={(text) => updateItem(item.id, "name", text)}
        onSubmitEditing={() => focusNextItemOrAddCurrent(item.id)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  itemCard: {
    backgroundColor: "#1B2633",
    borderRadius: 16,
    padding: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: "#344657",
    gap: 8,
  },

  itemExcluded: {
    opacity: 0.45,
  },

  itemNameInput: {
    width: "100%",
    backgroundColor: "#2A3948",
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "800",
    paddingVertical: 13,
    paddingHorizontal: 12,
    borderRadius: 12,
  },

  itemControlsRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },

  itemAmountInput: {
    flex: 1,
    minWidth: 85,
    backgroundColor: "#2A3948",
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "800",
    paddingVertical: 12,
    paddingHorizontal: 10,
    borderRadius: 12,
  },

  quantityButton: {
    width: 50,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: "#2A3948",
    alignItems: "center",
    justifyContent: "center",
  },

  quantityButtonText: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "900",
  },

  includeButton: {
    width: 52,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: "#123527",
    alignItems: "center",
  },

  includeButtonOff: {
    backgroundColor: "#333D47",
  },

  includeButtonText: {
    color: "#2ECC71",
    fontSize: 13,
    fontWeight: "900",
  },

  includeButtonTextOff: {
    color: "#A7B1BD",
  },

  deleteButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: "#2A3948",
    alignItems: "center",
    justifyContent: "center",
  },

  deleteButtonText: {
    color: "#A7B1BD",
    fontSize: 24,
    lineHeight: 26,
  },
});
