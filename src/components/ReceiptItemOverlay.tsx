import {
  Dimensions,
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";

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
  const isDesktopWeb =
    Platform.OS === "web" && Dimensions.get("window").width >= 768;

  if (!item) {
    return null;
  }

  function handleDesktopFinishOrNext(...args: any[]) {
    if (isDesktopWeb) {
      onClose();
      return;
    }

    focusNextItemOrAddCurrent(...args);
  }

  function handleDeleteFromOverlay(...args: any[]) {
    onClose();
    deleteItem(...args);
  }

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.overlay}>
        <Pressable style={styles.background} onPress={onClose} />

        <View style={styles.card}>
          <View style={styles.topRow}>
            <Text style={styles.title}>Edit Item</Text>

            <Pressable onPress={onClose}>
              <Text style={styles.close}>×</Text>
            </Pressable>
          </View>

          <SpendingItemRow
            item={item}
            itemNameRefs={itemNameRefs}
            itemAmountRefs={itemAmountRefs}
            updateItem={updateItem}
            increaseQuantity={increaseQuantity}
            resetQuantity={resetQuantity}
            toggleIncluded={toggleIncluded}
            deleteItem={handleDeleteFromOverlay}
            focusNextItemOrAddCurrent={handleDesktopFinishOrNext}
            hideDeleteButton
            showFoodControls
          />

          <Pressable style={styles.finishButton} onPress={onClose}>
            <Text style={styles.finishButtonText}>Finish</Text>
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

  finishButton: {
    marginTop: 8,
    backgroundColor: "#2ECC71",
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: "center",
  },

  finishButtonText: {
    color: "#101820",
    fontSize: 17,
    fontWeight: "900",
  },
});
