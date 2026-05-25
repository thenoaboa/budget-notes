import {
    Modal,
    Pressable,
    StyleSheet,
    Text,
    TextInput,
    View,
} from "react-native";

import type { BudgetItem } from "../types/budgetEditor";

type Props = {
  visible: boolean;
  draftItem: BudgetItem;
  setDraftItem: (
    value: BudgetItem | ((prev: BudgetItem) => BudgetItem),
  ) => void;
  onClose: () => void;
  onAdd: () => void;
};

export function AddItemOverlay({
  visible,
  draftItem,
  setDraftItem,
  onClose,
  onAdd,
}: Props) {
  function increaseQuantity() {
    setDraftItem((prev) => ({
      ...prev,
      quantity: prev.quantity + 1,
    }));
  }

  function resetQuantity() {
    setDraftItem((prev) => ({
      ...prev,
      quantity: 1,
    }));
  }

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.overlay}>
        <Pressable style={styles.background} onPress={onClose} />

        <View style={styles.card}>
          <View style={styles.topRow}>
            <Text style={styles.title}>New Item</Text>

            <Pressable onPress={onClose}>
              <Text style={styles.close}>×</Text>
            </Pressable>
          </View>

          <View style={styles.amountRow}>
            <TextInput
              style={styles.amountInput}
              placeholder="$0"
              placeholderTextColor="#8A98A8"
              keyboardType="decimal-pad"
              value={draftItem.amount}
              onChangeText={(text) =>
                setDraftItem((prev) => ({
                  ...prev,
                  amount: text,
                }))
              }
            />

            <Pressable
              style={styles.quantityButton}
              onPress={increaseQuantity}
              onLongPress={resetQuantity}
            >
              <Text style={styles.quantityButtonText}>
                x{draftItem.quantity}
              </Text>
            </Pressable>
          </View>

          <TextInput
            style={styles.input}
            placeholder="Item name"
            placeholderTextColor="#8A98A8"
            value={draftItem.name}
            onChangeText={(text) =>
              setDraftItem((prev) => ({
                ...prev,
                name: text,
              }))
            }
          />

          <Pressable style={styles.addButton} onPress={onAdd}>
            <Text style={styles.addButtonText}>Add To Receipt</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },

  background: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.6)",
  },

  card: {
    width: "88%",
    backgroundColor: "#1B2633",
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: "#344657",
  },

  topRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 14,
  },

  title: {
    color: "#FFFFFF",
    fontSize: 22,
    fontWeight: "900",
  },

  close: {
    color: "#A7B1BD",
    fontSize: 28,
    fontWeight: "800",
  },

  amountRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 10,
  },

  amountInput: {
    flex: 1,
    minWidth: 0,
    backgroundColor: "#2A3948",
    color: "#FFFFFF",
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 14,
    fontSize: 18,
    fontWeight: "800",
  },

  quantityButton: {
    width: 54,
    height: 54,
    marginLeft: 2,
    paddingVertical: 14,
    borderRadius: 14,
    backgroundColor: "#2A3948",
    alignItems: "center",
    justifyContent: "center",
  },

  quantityButtonText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "900",
  },

  input: {
    backgroundColor: "#2A3948",
    color: "#FFFFFF",
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 14,
    fontSize: 18,
    fontWeight: "800",
    marginBottom: 10,
  },

  addButton: {
    marginTop: 6,
    backgroundColor: "#2ECC71",
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: "center",
  },

  addButtonText: {
    color: "#101820",
    fontSize: 17,
    fontWeight: "900",
  },
});
