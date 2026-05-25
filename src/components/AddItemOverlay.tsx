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

          <TextInput
            style={styles.input}
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
