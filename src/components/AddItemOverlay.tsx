import { useRef } from "react";
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

import { MaterialCommunityIcons } from "@expo/vector-icons";

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

function cleanAmountInput(text: string) {
  const cleaned = text.replace(/[^0-9.]/g, "");
  const parts = cleaned.split(".");

  if (parts.length <= 2) {
    return cleaned;
  }

  return `${parts[0]}.${parts.slice(1).join("")}`;
}

export function AddItemOverlay({
  visible,
  draftItem,
  setDraftItem,
  onClose,
  onAdd,
}: Props) {
  const itemNameRef = useRef<TextInput>(null);
  const appleScale = useRef(new Animated.Value(1)).current;

  const amountValue = draftItem.amount ?? "";
  const showDollarSign = amountValue.length > 0;

  const isDesktopWeb =
    Platform.OS === "web" && Dimensions.get("window").width >= 768;

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
    if (!isDesktopWeb) {
      return;
    }

    if (event.nativeEvent.key === "Tab") {
      event.preventDefault?.();
      itemNameRef.current?.focus();
    }
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

            <Pressable onPress={onClose}>
              <Text selectable={false} style={styles.close}>
                ×
              </Text>
            </Pressable>
          </View>

          <View style={styles.amountRow}>
            <View style={styles.amountInputWrapper}>
              {showDollarSign && (
                <Text pointerEvents="none" style={styles.dollarSign}>
                  $
                </Text>
              )}

              <TextInput
                style={[
                  styles.amountInput,
                  showDollarSign ? styles.amountInputWithDollar : null,
                ]}
                placeholder="$0"
                placeholderTextColor="#8A98A8"
                keyboardType="decimal-pad"
                value={amountValue}
                blurOnSubmit={false}
                onKeyPress={handleAmountKeyPress}
                onChangeText={(text) =>
                  setDraftItem((prev) => ({
                    ...prev,
                    amount: cleanAmountInput(text),
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
});
