import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useRef, useState } from "react";
import {
  Animated,
  Dimensions,
  Modal,
  Platform,
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

function formatMoneyInput(text: string) {
  const digits = text.replace(/\D/g, "");

  if (!digits) return "";

  return (Number(digits) / 100).toFixed(2);
}

function getVisibleAmountValue(amount: string) {
  return amount === "0.00" ? "" : amount;
}

function amountLooksEmpty(amount: string) {
  return amount === "" || amount === "0.00";
}

export function AddItemOverlay({
  visible,
  draftItem,
  setDraftItem,
  onClose,
  onAdd,
}: Props) {
  const itemNameRef = useRef<TextInput>(null);
  const amountInputRef = useRef<TextInput>(null);
  const appleScale = useRef(new Animated.Value(1)).current;

  const [showLinkModal, setShowLinkModal] = useState(false);
  const [linkDraft, setLinkDraft] = useState("");
  const [showNoteModal, setShowNoteModal] = useState(false);
  const [noteDraft, setNoteDraft] = useState("");

  const amountValue = draftItem.amount ?? "";
  const amountIsEmpty = amountLooksEmpty(amountValue);
  const visibleAmountValue = getVisibleAmountValue(amountValue);
  const hasLink = Boolean(draftItem.link?.trim());
  const hasNote = Boolean(draftItem.note?.trim());

  const isDesktopWeb =
    Platform.OS === "web" && Dimensions.get("window").width >= 768;

  function handleAmountFocus() {
    if (!amountIsEmpty) return;

    requestAnimationFrame(() => {
      amountInputRef.current?.setNativeProps({
        selection: { start: 4, end: 4 },
      });
    });
  }

  function animateApple() {
    Animated.sequence([
      Animated.timing(appleScale, {
        toValue: 0.88,
        duration: 60,
        useNativeDriver: true,
      }),
      Animated.spring(appleScale, {
        toValue: 1.15,
        friction: 4,
        tension: 180,
        useNativeDriver: true,
      }),
      Animated.spring(appleScale, {
        toValue: 1,
        friction: 5,
        tension: 180,
        useNativeDriver: true,
      }),
    ]).start();
  }

  function toggleFood() {
    animateApple();

    setDraftItem((prev) => ({
      ...prev,
      isFood: !prev.isFood,
    }));
  }

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

  function handleNameSubmit() {
    if (isDesktopWeb) {
      onAdd();
    }
  }

  function handleAmountKeyPress(event: any) {
    if (!isDesktopWeb) return;

    if (event.nativeEvent.key === "Tab") {
      event.preventDefault?.();
      itemNameRef.current?.focus();
    }
  }

  function openLinkModal() {
    setLinkDraft(draftItem.link ?? "");
    setShowLinkModal(true);
  }

  function saveLink() {
    setDraftItem((prev) => ({
      ...prev,
      link: linkDraft.trim(),
    }));

    setShowLinkModal(false);
  }

  function cancelLink() {
    setLinkDraft(draftItem.link ?? "");
    setShowLinkModal(false);
  }

  function openNoteModal() {
    setNoteDraft(draftItem.note ?? "");
    setShowNoteModal(true);
  }

  function saveNote() {
    setDraftItem((prev) => ({
      ...prev,
      note: noteDraft.trim(),
    }));

    setShowNoteModal(false);
  }

  function cancelNote() {
    setNoteDraft(draftItem.note ?? "");
    setShowNoteModal(false);
  }

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.overlay}>
        <Pressable style={styles.background} onPress={onClose} />

        <View style={styles.card}>
          <View style={styles.topRow}>
            <Text selectable={false} style={styles.title}>
              New Item
            </Text>

            <View style={styles.topActions}>
              <Pressable
                style={styles.linkButton}
                onPress={openLinkModal}
                hitSlop={10}
              >
                <MaterialCommunityIcons
                  name="link-variant"
                  size={23}
                  color={hasLink ? "#2ECC71" : "#A7B1BD"}
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

              <Pressable onPress={onClose}>
                <Text selectable={false} style={styles.close}>
                  ×
                </Text>
              </Pressable>
            </View>
          </View>

          <View style={styles.amountRow}>
            <View style={styles.amountInputWrapper}>
              <Text
                pointerEvents="none"
                style={[
                  styles.dollarSign,
                  amountIsEmpty && styles.placeholderDollarSign,
                ]}
              >
                $
              </Text>

              <TextInput
                ref={amountInputRef}
                style={[styles.amountInput, styles.amountInputWithDollar]}
                placeholder="0.00"
                placeholderTextColor="#8A98A8"
                keyboardType="number-pad"
                value={visibleAmountValue}
                blurOnSubmit={false}
                onFocus={handleAmountFocus}
                onKeyPress={handleAmountKeyPress}
                onChangeText={(text) =>
                  setDraftItem((prev) => ({
                    ...prev,
                    amount: formatMoneyInput(text),
                  }))
                }
              />
            </View>

            <Pressable
              style={styles.quantityButton}
              onPress={increaseQuantity}
              onLongPress={resetQuantity}
            >
              <Text selectable={false} style={styles.quantityButtonText}>
                x{draftItem.quantity}
              </Text>
            </Pressable>
          </View>

          <View style={styles.inputWrapper}>
            <TextInput
              ref={itemNameRef}
              style={[styles.input, styles.inputWithFoodButton]}
              placeholder="Item name"
              placeholderTextColor="#8A98A8"
              value={draftItem.name}
              returnKeyType={isDesktopWeb ? "done" : "default"}
              onSubmitEditing={handleNameSubmit}
              onChangeText={(text) =>
                setDraftItem((prev) => ({
                  ...prev,
                  name: text,
                }))
              }
            />

            <Pressable
              style={styles.foodButton}
              onPress={toggleFood}
              hitSlop={10}
            >
              <Animated.View style={{ transform: [{ scale: appleScale }] }}>
                <MaterialCommunityIcons
                  name={draftItem.isFood ? "food-apple" : "food-apple-outline"}
                  size={20}
                  color="#2ECC71"
                />
              </Animated.View>
            </Pressable>
          </View>

          {draftItem.isFood && (
            <Text selectable={false} style={styles.foodHelpText}>
              Food · Excluded from sales tax
            </Text>
          )}

          <Pressable style={styles.addButton} onPress={onAdd}>
            <Text selectable={false} style={styles.addButtonText}>
              Add To Receipt
            </Text>
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
              <Text selectable={false} style={styles.noteModalTitle}>
                Product Link
              </Text>

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
                  <Text selectable={false} style={styles.noteCancelText}>
                    Cancel
                  </Text>
                </Pressable>

                <Pressable style={styles.noteSaveButton} onPress={saveLink}>
                  <Text selectable={false} style={styles.noteSaveText}>
                    Save
                  </Text>
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
              <Text selectable={false} style={styles.noteModalTitle}>
                Item Note
              </Text>

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
                  <Text selectable={false} style={styles.noteCancelText}>
                    Cancel
                  </Text>
                </Pressable>

                <Pressable style={styles.noteSaveButton} onPress={saveNote}>
                  <Text selectable={false} style={styles.noteSaveText}>
                    Save
                  </Text>
                </Pressable>
              </View>
            </View>
          </View>
        </Modal>
      </View>
    </Modal>
  );
}

const nonSelectableText = {
  userSelect: "none",
  WebkitUserSelect: "none",
  WebkitTouchCallout: "none",
} as any;

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
    ...nonSelectableText,
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
    ...nonSelectableText,
  },

  amountRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 10,
  },

  amountInputWrapper: {
    flex: 1,
    minWidth: 0,
    position: "relative",
    justifyContent: "center",
  },

  dollarSign: {
    position: "absolute",
    left: 14,
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "800",
    zIndex: 1,
  },

  placeholderDollarSign: {
    color: "#8A98A8",
  },

  amountInput: {
    width: "100%",
    backgroundColor: "#2A3948",
    color: "#FFFFFF",
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 14,
    fontSize: 18,
    fontWeight: "800",
  },

  amountInputWithDollar: {
    paddingLeft: 26,
  },

  quantityButton: {
    width: 54,
    marginLeft: 2,
    paddingVertical: 14,
    borderRadius: 14,
    backgroundColor: "#2A3948",
    alignItems: "center",
    justifyContent: "center",
    ...nonSelectableText,
  },

  quantityButtonText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "900",
    ...nonSelectableText,
  },

  inputWrapper: {
    position: "relative",
    marginBottom: 10,
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

  inputWithFoodButton: {
    paddingRight: 48,
    marginBottom: 0,
  },

  foodButton: {
    position: "absolute",
    right: 12,
    top: 0,
    bottom: 0,
    width: 28,
    alignItems: "center",
    justifyContent: "center",
  },

  foodHelpText: {
    color: "#2ECC71",
    fontSize: 13,
    fontWeight: "800",
    marginTop: -5,
    marginBottom: 10,
    marginLeft: 4,
    ...nonSelectableText,
  },

  addButton: {
    marginTop: 6,
    backgroundColor: "#2ECC71",
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: "center",
    ...nonSelectableText,
  },

  addButtonText: {
    color: "#101820",
    fontSize: 17,
    fontWeight: "900",
    ...nonSelectableText,
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
    ...nonSelectableText,
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
    ...nonSelectableText,
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
    ...nonSelectableText,
  },
});
