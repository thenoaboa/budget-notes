import { MaterialCommunityIcons } from "@expo/vector-icons";
import type { MutableRefObject } from "react";
import { useRef } from "react";
import {
  Animated,
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
  updateItem: (
    id: number,
    field: "name" | "amount" | "isFood",
    value: string | boolean,
  ) => void;
  increaseQuantity: (id: number) => void;
  resetQuantity: (id: number) => void;
  toggleIncluded: (id: number) => void;
  deleteItem: (id: number) => void;
  focusNextItemOrAddCurrent: (id: number) => void;
  hideDeleteButton?: boolean;
  onDragItem?: () => void;
  isDragging?: boolean;
  showFoodControls?: boolean;
};

function cleanAmountInput(text: string) {
  const cleaned = text.replace(/[^0-9.]/g, "");
  const parts = cleaned.split(".");

  if (parts.length <= 2) {
    return cleaned;
  }

  return `${parts[0]}.${parts.slice(1).join("")}`;
}

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
  onDragItem,
  isDragging = false,
  showFoodControls = false,
}: Props) {
  const amountValue = item.amount ?? "";
  const showDollarSign = amountValue.length > 0;

  const appleScale = useRef(new Animated.Value(1)).current;

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
    updateItem(item.id, "isFood", !item.isFood);
  }

  return (
    <View
      style={[
        styles.itemCard,
        !item.included && styles.itemExcluded,
        isDragging && styles.itemCardDragging,
      ]}
    >
      <View style={styles.itemControlsRow}>
        <View style={styles.itemAmountInputWrapper}>
          {showDollarSign && (
            <Text
              pointerEvents="none"
              style={[
                styles.dollarSign,
                !item.included && styles.excludedField,
              ]}
            >
              $
            </Text>
          )}

          <TextInput
            ref={(ref) => {
              itemAmountRefs.current[item.id] = ref;
            }}
            style={[
              styles.itemAmountInput,
              showDollarSign ? styles.itemAmountInputWithDollar : null,
              !item.included && styles.excludedField,
            ]}
            placeholder="$0"
            placeholderTextColor="#8A98A8"
            keyboardType="decimal-pad"
            returnKeyType="next"
            value={amountValue}
            blurOnSubmit={false}
            onChangeText={(text) =>
              updateItem(item.id, "amount", cleanAmountInput(text))
            }
            onSubmitEditing={() => itemNameRefs.current[item.id]?.focus()}
          />
        </View>

        <TouchableOpacity
          style={[
            styles.quantityButton,
            !item.included && styles.excludedField,
          ]}
          onPress={() => increaseQuantity(item.id)}
          onLongPress={() => resetQuantity(item.id)}
        >
          <Text
            style={[
              styles.quantityButtonText,
              !item.included && styles.excludedText,
            ]}
          >
            x{item.quantity}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.includeButton}
          onPress={() => toggleIncluded(item.id)}
        >
          <Text style={styles.includeButtonText}>
            {item.included ? "On" : "Off"}
          </Text>
        </TouchableOpacity>

        {!hideDeleteButton && (
          <TouchableOpacity
            style={[
              styles.deleteButton,
              !item.included && styles.excludedField,
              isDragging && styles.deleteButtonDragging,
            ]}
            onPress={() => deleteItem(item.id)}
            onLongPress={onDragItem}
            delayLongPress={250}
          >
            <Text style={styles.deleteButtonText}>×</Text>
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.itemNameWrapper}>
        <TextInput
          ref={(ref) => {
            itemNameRefs.current[item.id] = ref;
          }}
          style={[
            styles.itemNameInput,
            showFoodControls && styles.itemNameInputWithFoodButton,
            !item.included && styles.excludedField,
          ]}
          placeholder="Item name"
          placeholderTextColor="#8A98A8"
          value={item.name}
          returnKeyType="next"
          blurOnSubmit={false}
          onChangeText={(text) => updateItem(item.id, "name", text)}
          onSubmitEditing={() => focusNextItemOrAddCurrent(item.id)}
        />

        {showFoodControls && (
          <TouchableOpacity
            style={styles.foodButton}
            activeOpacity={0.8}
            onPress={toggleFood}
          >
            <Animated.View style={{ transform: [{ scale: appleScale }] }}>
              <MaterialCommunityIcons
                name={item.isFood ? "food-apple" : "food-apple-outline"}
                size={21}
                color={item.isFood ? "#123527" : "#2ECC71"}
              />
            </Animated.View>
          </TouchableOpacity>
        )}
      </View>

      {showFoodControls && item.isFood && (
        <Text style={styles.foodHelpText}>Food · Excluded from sales tax</Text>
      )}
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

  itemCardDragging: {
    borderColor: "#2ECC71",
    shadowColor: "#2ECC71",
    shadowOpacity: 0.35,
    shadowRadius: 12,
    shadowOffset: {
      width: 0,
      height: 0,
    },
    elevation: 8,
    transform: [{ scale: 1.01 }],
  },

  itemExcluded: {
    backgroundColor: "#141D27",
    borderColor: "#273340",
  },

  excludedField: {
    opacity: 0.45,
  },

  excludedText: {
    opacity: 0.65,
  },

  itemNameWrapper: {
    position: "relative",
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

  itemNameInputWithFoodButton: {
    paddingRight: 48,
  },

  foodButton: {
    position: "absolute",
    right: 12,
    top: 0,
    bottom: 0,
    width: 30,
    alignItems: "center",
    justifyContent: "center",
  },

  foodHelpText: {
    color: "#2ECC71",
    fontSize: 13,
    fontWeight: "800",
    marginTop: -3,
    marginLeft: 4,
    marginBottom: 1,
  },

  itemControlsRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },

  itemAmountInputWrapper: {
    flex: 1,
    minWidth: 85,
    position: "relative",
    justifyContent: "center",
  },

  dollarSign: {
    position: "absolute",
    left: 10,
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "800",
    zIndex: 1,
  },

  itemAmountInput: {
    width: "100%",
    backgroundColor: "#2A3948",
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "800",
    paddingVertical: 12,
    paddingHorizontal: 10,
    borderRadius: 12,
  },

  itemAmountInputWithDollar: {
    paddingLeft: 24,
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

  includeButtonText: {
    color: "#2ECC71",
    fontSize: 13,
    fontWeight: "900",
  },

  deleteButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: "#2A3948",
    alignItems: "center",
    justifyContent: "center",
  },

  deleteButtonDragging: {
    backgroundColor: "#123527",
  },

  deleteButtonText: {
    color: "#A7B1BD",
    fontSize: 24,
    lineHeight: 26,
  },
});
