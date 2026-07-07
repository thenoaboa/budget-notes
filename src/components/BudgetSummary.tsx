// Save as: src/components/BudgetSummary.tsx

import { MaterialCommunityIcons } from "@expo/vector-icons";
import { RefObject, useState } from "react";
import {
  Dimensions,
  Linking,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { Swipeable } from "react-native-gesture-handler";

import type { BudgetStatusStyle } from "../types/budgetEditor";
import { MoneyAvailableSection } from "./MoneyAvailable";

type AccessoryType = "link" | "note";

type SummaryItem = {
  id: number;
  name: string;
  amount: string;
  included?: boolean;
  quantity?: number;
  isFood?: boolean;
  note?: string;
  link?: string;
};

type Props = {
  items: SummaryItem[];
  subtotal: number;
  taxAmount: number;
  totalSpent: number;
  startingMoney: string;
  salesTaxEnabled: boolean;
  setSalesTaxEnabled: (
    value: boolean | ((previous: boolean) => boolean),
  ) => void;
  taxRate: string;
  setTaxRate: (value: string) => void;
  startingMoneyRef: RefObject<TextInput | null>;
  taxRateRef: RefObject<TextInput | null>;
  affirmingMessage: string;
  currentStyle: BudgetStatusStyle;
  highlightAddButton?: boolean;
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

function normalizeUrl(value: string) {
  const trimmedValue = value.trim();

  if (!trimmedValue) return "";

  if (/^https?:\/\//i.test(trimmedValue)) {
    return trimmedValue;
  }

  return `https://${trimmedValue}`;
}

export function BudgetSummaryBox({
  items,
  subtotal,
  taxAmount,
  totalSpent,
  startingMoney,
  salesTaxEnabled,
  setSalesTaxEnabled,
  taxRate,
  setTaxRate,
  startingMoneyRef,
  taxRateRef,
  affirmingMessage,
  currentStyle,
  highlightAddButton,
  onAddItem,
  onPressItem,
  onDeleteItem,
}: Props) {
  const [hoveredDeleteId, setHoveredDeleteId] = useState<number | null>(null);
  const [expandedAccessory, setExpandedAccessory] = useState<{
    itemId: number;
    type: AccessoryType;
  } | null>(null);

  const isDesktopWeb =
    Platform.OS === "web" && Dimensions.get("window").width >= 768;

  const availableAmount = parseMoney(startingMoney);

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

  function handleDeleteItem(itemId: number) {
    onDeleteItem?.(itemId);
  }

  function renderRightActions(itemId: number) {
    return (
      <Pressable
        style={styles.deleteAction}
        onPressIn={() => handleDeleteItem(itemId)}
      >
        <Text style={styles.deleteActionText}>Delete</Text>
      </Pressable>
    );
  }

  function toggleAccessory(itemId: number, type: AccessoryType) {
    setExpandedAccessory((current) => {
      if (current?.itemId === itemId && current.type === type) {
        return null;
      }

      return {
        itemId,
        type,
      };
    });
  }

  async function openProductLink(link: string) {
    const normalizedUrl = normalizeUrl(link);

    if (!normalizedUrl) return;

    try {
      await Linking.openURL(normalizedUrl);
    } catch (error) {
      console.log("Open product link failed:", error);
    }
  }

  function renderAccessoryDropdown(item: SummaryItem) {
    if (expandedAccessory?.itemId !== item.id) {
      return null;
    }

    if (expandedAccessory.type === "note") {
      if (!item.note?.trim()) {
        return null;
      }

      return (
        <View style={styles.accessoryDropdown}>
          <Text style={styles.accessoryDropdownTitle}>Note</Text>
          <Text style={styles.accessoryDropdownText}>{item.note}</Text>
        </View>
      );
    }

    if (!item.link?.trim()) {
      return null;
    }

    return (
      <View style={styles.accessoryDropdown}>
        <Text style={styles.accessoryDropdownTitle}>Product Link</Text>

        <Pressable
          style={styles.openLinkButton}
          onPress={() => openProductLink(item.link ?? "")}
        >
          <Text style={styles.openLinkButtonText}>Open Product →</Text>
        </Pressable>
      </View>
    );
  }

  function renderItemRow(
    itemId: number,
    itemName: string,
    quantity: number,
    lineTotal: number,
    isFood?: boolean,
    note?: string,
    link?: string,
  ) {
    const shouldHighlightFoodAmount = salesTaxEnabled && isFood;
    const hasNote = Boolean(note?.trim());
    const hasLink = Boolean(link?.trim());
    const label = quantity > 1 ? `${itemName} x${quantity}:` : `${itemName}:`;

    return (
      <Pressable style={styles.itemRow} onPress={() => onPressItem?.(itemId)}>
        <View style={styles.itemLabelRow}>
          <Text style={styles.itemText}>{label}</Text>

          {hasLink && (
            <Pressable
              onPress={(event) => {
                event.stopPropagation();
                toggleAccessory(itemId, "link");
              }}
              hitSlop={8}
            >
              <MaterialCommunityIcons
                name="link-variant"
                size={15}
                color="#2ECC71"
                style={styles.linkIcon}
              />
            </Pressable>
          )}

          {hasNote && (
            <Pressable
              onPress={(event) => {
                event.stopPropagation();
                toggleAccessory(itemId, "note");
              }}
              hitSlop={8}
            >
              <MaterialCommunityIcons
                name="note-outline"
                size={15}
                color="#2ECC71"
                style={styles.noteIcon}
              />
            </Pressable>
          )}
        </View>

        <Text
          style={[
            styles.itemAmount,
            shouldHighlightFoodAmount && styles.foodItemAmount,
          ]}
        >
          {formatMoney(lineTotal)}
        </Text>
      </Pressable>
    );
  }

  return (
    <View style={styles.summaryBox}>
      {!hasEnteredAnyItem ? (
        <>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryText}>Available</Text>
            <Text style={styles.summaryText}>
              {formatMoney(availableAmount)}
            </Text>
          </View>

          <View style={styles.summaryRow}>
            <Text style={styles.summaryTotal}>Planned total</Text>
            <Text style={styles.summaryTotal}>{formatMoney(totalSpent)}</Text>
          </View>
        </>
      ) : (
        <>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryHeaderText}>Available:</Text>
            <Text style={styles.summaryHeaderText}>
              {formatMoney(availableAmount)}
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

            const isHovered = hoveredDeleteId === item.id;

            if (isDesktopWeb) {
              return (
                <View key={item.id} style={styles.webItemRow}>
                  <View style={styles.webItemContent}>
                    {renderItemRow(
                      item.id,
                      itemName,
                      quantity,
                      lineTotal,
                      item.isFood,
                      item.note,
                      item.link,
                    )}

                    {renderAccessoryDropdown(item)}
                  </View>

                  <Pressable
                    style={[
                      styles.webDeleteButton,
                      isHovered && styles.webDeleteButtonHovered,
                    ]}
                    onHoverIn={() => setHoveredDeleteId(item.id)}
                    onHoverOut={() => setHoveredDeleteId(null)}
                    onPress={() => handleDeleteItem(item.id)}
                  >
                    <Text
                      style={[
                        styles.webDeleteText,
                        isHovered && styles.webDeleteTextHovered,
                      ]}
                    >
                      Delete
                    </Text>
                  </Pressable>
                </View>
              );
            }

            return (
              <Swipeable
                key={`${item.id}-${item.included}`}
                renderRightActions={() => renderRightActions(item.id)}
                overshootRight={false}
              >
                <View>
                  {renderItemRow(
                    item.id,
                    itemName,
                    quantity,
                    lineTotal,
                    item.isFood,
                    item.note,
                    item.link,
                  )}

                  {renderAccessoryDropdown(item)}
                </View>
              </Swipeable>
            );
          })}

          {salesTaxEnabled && (
            <>
              <View style={styles.divider} />

              <View style={styles.itemRow}>
                <Text style={styles.itemText}>Sales tax:</Text>
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

      <Pressable
        style={[
          styles.inlineAddButton,
          highlightAddButton && styles.highlightedAddButton,
        ]}
        onPress={onAddItem}
      >
        <Text style={styles.inlineAddButtonText}>+ Add Item</Text>
      </Pressable>

      {highlightAddButton && (
        <Text style={styles.highlightText}>Tap here to add an item</Text>
      )}

      <View style={styles.inlineTaxSection}>
        <MoneyAvailableSection
          startingMoney=""
          setStartingMoney={() => {}}
          salesTaxEnabled={salesTaxEnabled}
          setSalesTaxEnabled={setSalesTaxEnabled}
          taxRate={taxRate}
          setTaxRate={setTaxRate}
          startingMoneyRef={startingMoneyRef}
          taxRateRef={taxRateRef}
        />
      </View>
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

  webItemRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 8,
  },

  webItemContent: {
    flex: 1,
  },

  webDeleteButton: {
    marginLeft: 8,
    backgroundColor: "#243342",
    borderColor: "#3B4D5F",
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },

  webDeleteButtonHovered: {
    backgroundColor: "#3A1C1C",
    borderColor: "#FF6B6B",
  },

  webDeleteText: {
    color: "#8A98A8",
    fontWeight: "900",
  },

  webDeleteTextHovered: {
    color: "#FF6B6B",
  },

  itemRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 4,
    paddingRight: 10,
    backgroundColor: "#1B2633",
  },

  itemLabelRow: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    paddingRight: 12,
  },

  itemText: {
    color: "#CAD3DD",
    fontSize: 15,
    fontWeight: "700",
  },

  linkIcon: {
    marginLeft: 5,
    marginTop: 1,
  },

  noteIcon: {
    marginLeft: 5,
    marginTop: 1,
  },

  accessoryDropdown: {
    backgroundColor: "#14251E",
    borderWidth: 1,
    borderColor: "#24533A",
    borderRadius: 14,
    padding: 12,
    marginTop: 4,
    marginBottom: 8,
  },

  accessoryDropdownTitle: {
    color: "#2ECC71",
    fontSize: 13,
    fontWeight: "900",
    marginBottom: 4,
  },

  accessoryDropdownText: {
    color: "#CAD3DD",
    fontSize: 14,
    fontWeight: "700",
    lineHeight: 20,
  },

  openLinkButton: {
    alignSelf: "flex-start",
    marginTop: 4,
  },

  openLinkButtonText: {
    color: "#2ECC71",
    fontSize: 14,
    fontWeight: "900",
    textDecorationLine: "underline",
  },

  itemAmount: {
    width: 100,
    color: "#CAD3DD",
    fontSize: 15,
    fontWeight: "800",
    textAlign: "right",
  },

  foodItemAmount: {
    color: "#2ECC71",
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

  highlightedAddButton: {
    borderWidth: 3,
    borderColor: "#FFFFFF",
    shadowColor: "#2ECC71",
    shadowOpacity: 0.95,
    shadowRadius: 18,
    shadowOffset: {
      width: 0,
      height: 0,
    },
    elevation: 14,
  },

  highlightText: {
    color: "#2ECC71",
    textAlign: "center",
    fontSize: 14,
    fontWeight: "900",
    marginTop: 8,
  },

  inlineTaxSection: {
    marginTop: 10,
  },

  inlineAddButtonText: {
    color: "#101820",
    fontSize: 18,
    fontWeight: "900",
  },
});
