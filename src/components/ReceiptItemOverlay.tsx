import { Modal, Pressable, StyleSheet, View } from "react-native";

import { SpendingItemRow } from "./SpendingItemCard";

import type { BudgetItem } from "../types/budgetEditor";

type Props = {
  visible: boolean;
  item: BudgetItem | null;

  itemNameRefs: any;
  itemAmountRefs: any;

  updateItem: any;
  increaseQuantity: any;
  resetQuantity: any;
  toggleIncluded: any;
  deleteItem: any;
  focusNextItemOrAddCurrent: any;

  onClose: () => void;
};

export function ReceiptItemOverlay({
  visible,
  item,

  itemNameRefs,
  itemAmountRefs,

  updateItem,
  increaseQuantity,
  resetQuantity,
  toggleIncluded,
  deleteItem,
  focusNextItemOrAddCurrent,

  onClose,
}: Props) {
  if (!item) {
    return null;
  }

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.overlay}>
        <Pressable style={styles.background} onPress={onClose} />

        <View style={styles.card}>
          <SpendingItemRow
            item={item}
            itemNameRefs={itemNameRefs}
            itemAmountRefs={itemAmountRefs}
            updateItem={updateItem}
            increaseQuantity={increaseQuantity}
            resetQuantity={resetQuantity}
            toggleIncluded={toggleIncluded}
            deleteItem={deleteItem}
            focusNextItemOrAddCurrent={focusNextItemOrAddCurrent}
          />
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
    width: "92%",
  },
});
