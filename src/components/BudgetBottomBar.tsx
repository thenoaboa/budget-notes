// Save as: src/components/BudgetBottomBar.tsx

import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

import type { BudgetItem } from "../types/budgetEditor";

type Props = {
  noteTitle: string;
  setNoteTitle: (value: string) => void;
  lastEditedText: string;
  onBack: () => void;
  onCreateNewNote: () => void;

  items: BudgetItem[];
  plannedTotal: number;
  estimatedTax: number;
  taxEnabled: boolean;
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

export function BudgetBottomBar({
  noteTitle,
  setNoteTitle,
  lastEditedText,
  onBack,
  onCreateNewNote,
  items,
  plannedTotal,
  estimatedTax,
  taxEnabled,
}: Props) {
  const visibleItems = items.filter((item) => {
    const amount = parseMoney(item.amount);
    const isIncluded = item.included !== false;

    return isIncluded && (item.name.trim() !== "" || amount > 0);
  });

  return (
    <View style={styles.bottomSection}>
      <View style={styles.bottomTopRow}>
        <Pressable style={styles.bottomIconButton} onPress={onBack}>
          <Text style={styles.bottomIconText}>‹</Text>
        </Pressable>

        <View style={styles.bottomTitleWrap}>
          <TextInput
            style={styles.bottomTitleInput}
            placeholder="Untitled"
            placeholderTextColor="#5F6B78"
            value={noteTitle}
            onChangeText={setNoteTitle}
            textAlign="center"
            numberOfLines={1}
            multiline={false}
          />
        </View>

        <Pressable style={styles.bottomIconButton} onPress={onCreateNewNote}>
          <Text style={styles.bottomIconText}>+</Text>
        </Pressable>
      </View>

      <View style={styles.receiptBox}>
        <Text style={styles.receiptTitle}>Items:</Text>

        {visibleItems.length > 0 ? (
          <ScrollView
            style={styles.itemsList}
            showsVerticalScrollIndicator={false}
          >
            {visibleItems.map((item) => {
              const amount = parseMoney(item.amount);
              const rawQuantity = Number(
                (item as { quantity?: number }).quantity ?? 1,
              );
              const quantity =
                Number.isFinite(rawQuantity) && rawQuantity > 0
                  ? rawQuantity
                  : 1;

              const itemName = item.name.trim() || "Unnamed item";
              const lineTotal = amount * quantity;

              return (
                <View key={item.id} style={styles.receiptRow}>
                  <Text style={styles.receiptLabel} numberOfLines={1}>
                    {quantity > 1
                      ? `${itemName} x${quantity}:`
                      : `${itemName}:`}
                  </Text>

                  <Text style={styles.receiptAmount}>
                    {formatMoney(lineTotal)}
                  </Text>
                </View>
              );
            })}
          </ScrollView>
        ) : (
          <Text style={styles.emptyItemsText}>No items entered yet.</Text>
        )}

        {taxEnabled && (
          <View style={styles.receiptRow}>
            <Text style={styles.receiptLabel}>Estimated tax:</Text>
            <Text style={styles.receiptAmount}>
              {formatMoney(estimatedTax)}
            </Text>
          </View>
        )}

        <View style={styles.plannedTotalRow}>
          <Text style={styles.plannedTotalLabel}>Planned total:</Text>
          <Text style={styles.plannedTotalAmount}>
            {formatMoney(plannedTotal)}
          </Text>
        </View>
      </View>

      <Text style={styles.lastEditedText}>{lastEditedText}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  bottomSection: {
    marginTop: 24,
    marginBottom: 40,
  },

  bottomTopRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    width: "100%",
    gap: 12,
  },

  bottomTitleWrap: {
    flex: 1,
    minWidth: 0,
    alignItems: "center",
  },

  bottomTitleInput: {
    width: "100%",
    maxWidth: "100%",
    color: "#FFFFFF",
    fontSize: 30,
    fontWeight: "900",
    letterSpacing: -0.7,
    paddingHorizontal: 10,
    paddingVertical: 8,
    textAlign: "center",
    flexShrink: 1,
  },

  bottomIconButton: {
    width: 42,
    height: 42,
    borderRadius: 14,
    backgroundColor: "#2A3948",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },

  bottomIconText: {
    color: "#2ECC71",
    fontSize: 30,
    fontWeight: "900",
    lineHeight: 32,
  },

  receiptBox: {
    marginTop: 22,
    paddingTop: 14,
    borderTopWidth: 1,
    borderTopColor: "#263442",
  },

  receiptTitle: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "900",
    marginBottom: 8,
  },

  itemsList: {
    maxHeight: 150,
    marginBottom: 4,
  },

  receiptRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 4,
  },

  receiptLabel: {
    flex: 1,
    color: "#D7DEE8",
    fontSize: 15,
    fontWeight: "700",
    paddingRight: 12,
  },

  receiptAmount: {
    width: 96,
    color: "#D7DEE8",
    fontSize: 15,
    fontWeight: "800",
    textAlign: "right",
  },

  emptyItemsText: {
    color: "#6F7D8C",
    fontSize: 14,
    fontWeight: "700",
    marginBottom: 6,
  },

  plannedTotalRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderTopWidth: 1,
    borderTopColor: "#263442",
    marginTop: 8,
    paddingTop: 10,
  },

  plannedTotalLabel: {
    flex: 1,
    color: "#FFFFFF",
    fontSize: 17,
    fontWeight: "900",
    paddingRight: 12,
  },

  plannedTotalAmount: {
    width: 96,
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "900",
    textAlign: "right",
  },

  lastEditedText: {
    color: "#8A98A8",
    fontSize: 12,
    fontWeight: "700",
    textAlign: "center",
    marginTop: 10,
  },
});
