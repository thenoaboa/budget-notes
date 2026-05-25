// Save as: src/components/BudgetSummary.tsx

import { Pressable, StyleSheet, Text, View } from "react-native";
import { Swipeable } from "react-native-gesture-handler";

import type { BudgetStatusStyle } from "../types/budgetEditor";

type SummaryItem = {
  id: number;
  name: string;
  amount: string;
  included?: boolean;
  quantity?: number;
};

type Props = {
  items: SummaryItem[];
  subtotal: number;
  taxAmount: number;
  totalSpent: number;
  salesTaxEnabled: boolean;
  affirmingMessage: string;
  currentStyle: BudgetStatusStyle;
  onAddItem?: () => void;
  onPressItem?: (itemId: number) => void;
  onDeleteItem?: (itemId: number) => void;
};

function parseMoney(value: unknown) {
  if (typeof value === "number") {
    return Number.isFinite(value) ? value : 0;
  }

  if (typeof value !== "string") {
    return 0;
  }

  const cleaned = value.replace(/[^0-9.]/g, "");
  const parsed = Number(cleaned);

  return Number.isFinite(parsed) ? parsed : 0;
}

function formatMoney(value: number) {
  return `$${value.toFixed(2)}`;
}

export function BudgetSummaryBox({
  items,
  subtotal,
  taxAmount,
  totalSpent,
  salesTaxEnabled,
  affirmingMessage,
  currentStyle,
  onAddItem,
  onPressItem,
  onDeleteItem,
}: Props) {
  const hasEnteredAnyItem = items.some((item) => {
    const name = item.name.trim();
    const amount = parseMoney(item.amount);

    return name !== "" || amount > 0;
  });

  const visibleItems = items.filter((item) => {
    const name = item.name.trim();
    const amount = parseMoney(item.amount);
    const isIncluded = item.included !== false;

    return isIncluded && (name !== "" || amount > 0);
  });

  function renderRightActions(itemId: number) {
    return (
      <Pressable
        style={styles.deleteAction}
        onPress={() => onDeleteItem?.(itemId)}
      >
        <Text style={styles.deleteActionText}>Delete</Text>
      </Pressable>
    );
  }

  return (
    <View style={styles.summaryBox}>
      {!hasEnteredAnyItem ? (
        <>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryText}>Items</Text>
            <Text style={styles.summaryText}>{formatMoney(subtotal)}</Text>
          </View>

          <View style={styles.summaryRow}>
            <Text style={styles.summaryTotal}>Planned total</Text>
            <Text style={styles.summaryTotal}>{formatMoney(totalSpent)}</Text>
          </View>
        </>
      ) : (
        <>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryHeaderText}>Items:</Text>
            <Text style={styles.summaryHeaderText}>
              {formatMoney(subtotal)}
            </Text>
          </View>

          <View style={styles.divider} />

          {visibleItems.map((item) => {
            const amount = parseMoney(item.amount);

            const quantity =
              Number.isFinite(item.quantity) &&
              item.quantity &&
              item.quantity > 0
                ? item.quantity
                : 1;

            const itemName = item.name.trim() || "Unnamed item";
            const lineTotal = amount * quantity;

            return (
              <Swipeable
                key={item.id}
                renderRightActions={() => renderRightActions(item.id)}
                overshootRight={false}
              >
                <Pressable
                  style={styles.itemRow}
                  onPress={() => onPressItem?.(item.id)}
                >
                  <Text style={styles.itemText} numberOfLines={1}>
                    {quantity > 1
                      ? `${itemName} x${quantity}:`
                      : `${itemName}:`}
                  </Text>

                  <Text style={styles.itemAmount}>
                    {formatMoney(lineTotal)}
                  </Text>
                </Pressable>
              </Swipeable>
            );
          })}

          {salesTaxEnabled && (
            <>
              <View style={styles.divider} />

              <View style={styles.itemRow}>
                <Text style={styles.itemText}>Estimated tax:</Text>
                <Text style={styles.itemAmount}>{formatMoney(taxAmount)}</Text>
              </View>
            </>
          )}

          <View style={styles.divider} />

          <View style={styles.summaryRow}>
            <Text style={styles.summaryTotal}>Planned total:</Text>
            <Text style={styles.summaryTotal}>{formatMoney(totalSpent)}</Text>
          </View>
        </>
      )}

      {false && (
        <View
          style={[
            styles.statusNote,
            {
              backgroundColor: currentStyle.backgroundColor,
              borderColor: currentStyle.borderColor,
            },
          ]}
        >
          <Text
            style={[styles.statusNoteText, { color: currentStyle.textColor }]}
          >
            {affirmingMessage}
          </Text>
        </View>
      )}

      <Pressable style={styles.inlineAddButton} onPress={onAddItem}>
        <Text style={styles.inlineAddButtonText}>+ Add Item</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  summaryBox: {
    backgroundColor: "#1B2633",
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: "#344657",
    marginBottom: 18,
  },

  summaryRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 8,
  },

  summaryText: {
    color: "#CAD3DD",
    fontSize: 15,
    fontWeight: "700",
  },

  summaryHeaderText: {
    color: "#CAD3DD",
    fontSize: 17,
    fontWeight: "900",
  },

  itemRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 4,
    backgroundColor: "#1B2633",
  },

  itemText: {
    flex: 1,
    color: "#CAD3DD",
    fontSize: 15,
    fontWeight: "700",
    paddingRight: 12,
  },

  itemAmount: {
    width: 90,
    color: "#CAD3DD",
    fontSize: 15,
    fontWeight: "800",
    textAlign: "right",
  },

  deleteAction: {
    backgroundColor: "#3A1C1C",
    borderColor: "#FF6B6B",
    borderWidth: 1,
    justifyContent: "center",
    alignItems: "center",
    width: 90,
    borderRadius: 12,
    marginVertical: 2,
  },

  deleteActionText: {
    color: "#FF6B6B",
    fontWeight: "900",
  },

  summaryTotal: {
    color: "#FFFFFF",
    fontSize: 17,
    fontWeight: "900",
  },

  divider: {
    height: 1,
    backgroundColor: "#344657",
    marginVertical: 6,
  },

  statusNote: {
    marginTop: 10,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 12,
    borderWidth: 1,
  },

  statusNoteText: {
    fontSize: 14,
    fontWeight: "800",
    textAlign: "center",
  },

  inlineAddButton: {
    marginTop: 10,
    backgroundColor: "#2ECC71",
    borderRadius: 14,
    paddingVertical: 12,
    alignItems: "center",
    justifyContent: "center",
  },

  inlineAddButtonText: {
    color: "#101820",
    fontSize: 18,
    fontWeight: "900",
  },
});
