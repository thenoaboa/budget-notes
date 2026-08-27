import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useEffect, useState } from "react";
import {
  Dimensions,
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
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
  const [draftItem, setDraftItem] = useState<BudgetItem | null>(null);

  const [showLinkModal, setShowLinkModal] = useState(false);
  const [linkDraft, setLinkDraft] = useState("");
  const [showNoteModal, setShowNoteModal] = useState(false);
  const [noteDraft, setNoteDraft] = useState("");

  const isDesktopWeb =
    Platform.OS === "web" && Dimensions.get("window").width >= 768;

  useEffect(() => {
    if (!visible || !item) {
      return;
    }

    setDraftItem({ ...item });
    setLinkDraft(item.link ?? "");
    setNoteDraft(item.note ?? "");
    setShowLinkModal(false);
    setShowNoteModal(false);
  }, [visible, item?.id]);

  if (!item || !draftItem || draftItem.id !== item.id) {
    return null;
  }

  const hasLink = Boolean(draftItem.link?.trim());
  const hasNote = Boolean(draftItem.note?.trim());

  function handleCancel() {
    setShowLinkModal(false);
    setShowNoteModal(false);
    onClose();
  }

  function updateDraftItem(
    id: number,
    field: "name" | "amount" | "isFood" | "note" | "link",
    value: string | boolean,
  ) {
    setDraftItem((current) => {
      if (!current || current.id !== id) {
        return current;
      }

      return {
        ...current,
        [field]: value,
      };
    });
  }

  function increaseDraftQuantity(id: number) {
    setDraftItem((current) => {
      if (!current || current.id !== id) {
        return current;
      }

      return {
        ...current,
        quantity: current.quantity + 1,
      };
    });
  }

  function resetDraftQuantity(id: number) {
    setDraftItem((current) => {
      if (!current || current.id !== id) {
        return current;
      }

      return {
        ...current,
        quantity: 1,
      };
    });
  }

  function toggleDraftIncluded(id: number) {
    setDraftItem((current) => {
      if (!current || current.id !== id) {
        return current;
      }

      return {
        ...current,
        included: !current.included,
      };
    });
  }

  function handleFinish() {
    if (!item || !draftItem) {
      onClose();
      return;
    }

    if (draftItem.name !== item.name) {
      updateItem(item.id, "name", draftItem.name);
    }

    if (draftItem.amount !== item.amount) {
      updateItem(item.id, "amount", draftItem.amount);
    }

    if (draftItem.isFood !== item.isFood) {
      updateItem(item.id, "isFood", draftItem.isFood ?? false);
    }

    if ((draftItem.note ?? "") !== (item.note ?? "")) {
      updateItem(item.id, "note", draftItem.note ?? "");
    }

    if ((draftItem.link ?? "") !== (item.link ?? "")) {
      updateItem(item.id, "link", draftItem.link ?? "");
    }

    if (draftItem.quantity !== item.quantity) {
      if (draftItem.quantity < item.quantity) {
        resetQuantity(item.id);

        for (let quantity = 1; quantity < draftItem.quantity; quantity += 1) {
          increaseQuantity(item.id);
        }
      } else {
        for (
          let quantity = item.quantity;
          quantity < draftItem.quantity;
          quantity += 1
        ) {
          increaseQuantity(item.id);
        }
      }
    }

    if (draftItem.included !== item.included) {
      toggleIncluded(item.id);
    }

    setShowLinkModal(false);
    setShowNoteModal(false);
    onClose();
  }

  function handleDesktopFinishOrNext(...args: any[]) {
    if (isDesktopWeb) {
      handleFinish();
      return;
    }

    focusNextItemOrAddCurrent(...args);
  }

  function handleDeleteFromOverlay(...args: any[]) {
    onClose();
    deleteItem(...args);
  }

  function openLinkModal() {
    if (!draftItem) return;

    setLinkDraft(draftItem.link ?? "");
    setShowLinkModal(true);
  }

  function cancelLink() {
    if (!draftItem) return;

    setLinkDraft(draftItem.link ?? "");
    setShowLinkModal(false);
  }

  function saveLink() {
    if (!draftItem) return;

    updateDraftItem(draftItem.id, "link", linkDraft.trim());
    setShowLinkModal(false);
  }

  function openNoteModal() {
    if (!draftItem) return;

    setNoteDraft(draftItem.note ?? "");
    setShowNoteModal(true);
  }

  function cancelNote() {
    if (!draftItem) return;

    setNoteDraft(draftItem.note ?? "");
    setShowNoteModal(false);
  }

  function saveNote() {
    if (!draftItem) return;

    updateDraftItem(draftItem.id, "note", noteDraft.trim());
    setShowNoteModal(false);
  }

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={handleCancel}
    >
      <View style={styles.overlay}>
        <Pressable style={styles.background} onPress={handleCancel} />

        <View style={styles.card}>
          <View style={styles.topRow}>
            <Text style={styles.title}>Edit Item</Text>

            <View style={styles.topActions}>
              <Pressable
                style={styles.linkButton}
                onPress={openLinkModal}
                hitSlop={10}
              >
                <MaterialCommunityIcons
                  name="link-variant"
                  size={24}
                  color={hasLink ? "#4A90E2" : "#A7B1BD"}
                />
              </Pressable>

              <Pressable
                style={styles.noteButton}
                onPress={openNoteModal}
                hitSlop={10}
              >
                <MaterialCommunityIcons
                  name="note-outline"
                  size={23}
                  color={hasNote ? "#2ECC71" : "#A7B1BD"}
                />
              </Pressable>

              <Pressable onPress={handleCancel}>
                <Text style={styles.close}>×</Text>
              </Pressable>
            </View>
          </View>

          <SpendingItemRow
            item={draftItem}
            itemNameRefs={itemNameRefs}
            itemAmountRefs={itemAmountRefs}
            updateItem={updateDraftItem}
            increaseQuantity={increaseDraftQuantity}
            resetQuantity={resetDraftQuantity}
            toggleIncluded={toggleDraftIncluded}
            deleteItem={handleDeleteFromOverlay}
            focusNextItemOrAddCurrent={handleDesktopFinishOrNext}
            hideDeleteButton
            showFoodControls
          />

          <Pressable style={styles.finishButton} onPress={handleFinish}>
            <Text style={styles.finishButtonText}>Finish</Text>
          </Pressable>
        </View>

        <Modal
          visible={showLinkModal}
          transparent
          animationType="fade"
          onRequestClose={cancelLink}
        >
          <View style={styles.noteModalBackdrop}>
            <View style={styles.noteModalCard}>
              <Text style={styles.noteModalTitle}>Product Link</Text>

              <TextInput
                style={styles.noteInput}
                value={linkDraft}
                onChangeText={setLinkDraft}
                placeholder="https://example.com/product"
                placeholderTextColor="#8A98A8"
                autoCapitalize="none"
                autoCorrect={false}
                keyboardType="url"
              />

              <View style={styles.noteActions}>
                <Pressable style={styles.noteCancelButton} onPress={cancelLink}>
                  <Text style={styles.noteCancelText}>Cancel</Text>
                </Pressable>

                <Pressable style={styles.noteSaveButton} onPress={saveLink}>
                  <Text style={styles.noteSaveText}>Save</Text>
                </Pressable>
              </View>
            </View>
          </View>
        </Modal>

        <Modal
          visible={showNoteModal}
          transparent
          animationType="fade"
          onRequestClose={cancelNote}
        >
          <View style={styles.noteModalBackdrop}>
            <View style={styles.noteModalCard}>
              <Text style={styles.noteModalTitle}>Item Note</Text>

              <TextInput
                style={styles.noteInput}
                value={noteDraft}
                onChangeText={setNoteDraft}
                multiline
                placeholder="Add a note..."
                placeholderTextColor="#8A98A8"
                textAlignVertical="top"
              />

              <View style={styles.noteActions}>
                <Pressable style={styles.noteCancelButton} onPress={cancelNote}>
                  <Text style={styles.noteCancelText}>Cancel</Text>
                </Pressable>

                <Pressable style={styles.noteSaveButton} onPress={saveNote}>
                  <Text style={styles.noteSaveText}>Save</Text>
                </Pressable>
              </View>
            </View>
          </View>
        </Modal>
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

  topActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
  },

  linkButton: {
    width: 30,
    height: 30,
    alignItems: "center",
    justifyContent: "center",
  },

  noteButton: {
    width: 30,
    height: 30,
    alignItems: "center",
    justifyContent: "center",
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

  noteModalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.65)",
    justifyContent: "center",
    paddingHorizontal: 22,
  },

  noteModalCard: {
    backgroundColor: "#101820",
    borderRadius: 22,
    padding: 16,
    borderWidth: 1,
    borderColor: "#2D4562",
  },

  noteModalTitle: {
    color: "#FFFFFF",
    fontSize: 20,
    fontWeight: "900",
    marginBottom: 12,
  },

  noteInput: {
    minHeight: 130,
    backgroundColor: "#182638",
    color: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#2D4562",
    borderRadius: 16,
    padding: 12,
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 14,
  },

  noteActions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 10,
  },

  noteCancelButton: {
    paddingVertical: 12,
    paddingHorizontal: 14,
  },

  noteCancelText: {
    color: "#AAB7C4",
    fontSize: 15,
    fontWeight: "800",
  },

  noteSaveButton: {
    backgroundColor: "#2ECC71",
    borderRadius: 14,
    paddingVertical: 12,
    paddingHorizontal: 18,
  },

  noteSaveText: {
    color: "#101820",
    fontSize: 15,
    fontWeight: "900",
  },
});
