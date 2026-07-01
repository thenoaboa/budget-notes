import { useMemo, useRef, useState } from "react";
import {
  Dimensions,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { Swipeable } from "react-native-gesture-handler";

import type { Budget, StoredBudgetItem } from "../types/budget";

type Props = {
  budget: Budget;
  onPress: () => void;
  onDelete: () => void;
  onRename: (newTitle: string) => void;
  onDuplicate: () => void;
};

type BudgetCardStats = {
  title: string;
  hasTitle: boolean;
  budgetAmount: number;
  spentAmount: number;
  remainingAmount: number;
  usedPercent: number;
  barPercent: number;
  isOverBudget: boolean;
  isComplete: boolean;
};

function parseMoney(value?: string) {
  const cleanedValue = (value || "").replace(/[^0-9.-]/g, "");
  const parsedValue = Number.parseFloat(cleanedValue);

  return Number.isFinite(parsedValue) ? parsedValue : 0;
}

function formatMoney(value: number) {
  const absoluteValue = Math.abs(value);
  const formattedValue = absoluteValue.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  return value < 0 ? `-$${formattedValue}` : `$${formattedValue}`;
}

function getItemTotal(item: StoredBudgetItem) {
  if (item.included === false) return 0;

  const amount = parseMoney(item.amount);
  const quantity = item.quantity || 1;

  return amount * quantity;
}

function getMeaningfulTitle(title?: string) {
  const cleanedTitle = (title || "").trim();

  if (
    !cleanedTitle ||
    cleanedTitle === "Untitled" ||
    cleanedTitle === "Untitled Note" ||
    cleanedTitle === "Untitled Budget"
  ) {
    return "";
  }

  return cleanedTitle;
}

function getBudgetStats(budget: Budget): BudgetCardStats {
  const title = getMeaningfulTitle(budget.budgetName);
  const budgetAmount = parseMoney(budget.amount);
  const subtotal = (budget.spendingItems || []).reduce(
    (sum, item) => sum + getItemTotal(item),
    0,
  );
  const taxRate = parseMoney(budget.taxRate);
  const taxAmount = budget.salesTaxEnabled ? subtotal * (taxRate / 100) : 0;
  const spentAmount = subtotal + taxAmount;
  const remainingAmount = budgetAmount - spentAmount;
  const usedPercent = budgetAmount > 0 ? (spentAmount / budgetAmount) * 100 : 0;
  const roundedUsedPercent = Math.round(usedPercent);
  const isOverBudget = remainingAmount < 0;
  const isComplete = budgetAmount > 0 && !isOverBudget && remainingAmount === 0;

  return {
    title,
    hasTitle: title.length > 0,
    budgetAmount,
    spentAmount,
    remainingAmount,
    usedPercent: roundedUsedPercent > 100 ? 100 : roundedUsedPercent,
    barPercent: Math.min(Math.max(usedPercent, 0), 100),
    isOverBudget,
    isComplete,
  };
}

export function NoteCard({
  budget,
  onPress,
  onDelete,
  onRename,
  onDuplicate,
}: Props) {
  const swipeableRef = useRef<Swipeable>(null);

  const stats = useMemo(() => getBudgetStats(budget), [budget]);

  const [isEditing, setIsEditing] = useState(false);
  const [deleteHovered, setDeleteHovered] = useState(false);
  const [draftTitle, setDraftTitle] = useState("");
  const [showMenu, setShowMenu] = useState(false);
  const [showCopyConfirm, setShowCopyConfirm] = useState(false);

  const isDesktopWeb =
    Platform.OS === "web" && Dimensions.get("window").width >= 768;

  function handleDelete() {
    swipeableRef.current?.close();
    onDelete();
  }

  function handlePress() {
    if (isEditing) return;

    swipeableRef.current?.close();
    onPress();
  }

  function startEditing() {
    swipeableRef.current?.close();
    setDraftTitle(stats.title);
    setIsEditing(true);
  }
  function handleRenameFromMenu() {
    setShowMenu(false);
    startEditing();
  }

  function handleCopyFromMenu() {
    setShowMenu(false);
    setShowCopyConfirm(true);
  }

  function confirmDuplicate() {
    setShowCopyConfirm(false);
    onDuplicate();
  }

  function saveTitle() {
    const cleanedTitle = draftTitle.trim();

    setDraftTitle(cleanedTitle);
    setIsEditing(false);
    onRename(cleanedTitle);
  }

  function renderCardContent() {
    const amountText = formatMoney(stats.remainingAmount);
    const amountLabel = stats.isOverBudget ? "over budget" : "remaining";

    return (
      <Pressable style={styles.card} onPress={handlePress}>
        <View style={styles.topRow}>
          <View style={styles.titleArea}>
            {isEditing ? (
              <TextInput
                style={styles.cardTitleInput}
                value={draftTitle}
                onChangeText={setDraftTitle}
                onBlur={saveTitle}
                onSubmitEditing={saveTitle}
                autoFocus
                selectTextOnFocus
                returnKeyType="done"
                placeholder="Add title"
                placeholderTextColor="#5F6E7E"
              />
            ) : stats.hasTitle ? (
              <Text style={styles.cardTitle} numberOfLines={1}>
                {stats.title}
              </Text>
            ) : null}
          </View>

          <Pressable
            style={styles.menuButton}
            onPress={(event) => {
              event.stopPropagation();
              setShowMenu(true);
            }}
          >
            <Text style={styles.menuButtonText}>⋮</Text>
          </Pressable>

          {showMenu && (
            <View style={styles.cardMenu}>
              <Pressable
                style={styles.cardMenuItem}
                onPress={handleRenameFromMenu}
              >
                <Text style={styles.cardMenuItemText}>Rename</Text>
              </Pressable>

              <Pressable
                style={styles.cardMenuItem}
                onPress={handleCopyFromMenu}
              >
                <Text style={styles.cardMenuItemText}>Copy Budget</Text>
              </Pressable>
            </View>
          )}
        </View>

        <View
          style={[styles.amountRow, !stats.hasTitle && styles.noTitleAmountRow]}
        >
          <View style={styles.remainingColumn}>
            <Text
              style={[
                styles.remainingAmount,
                stats.isOverBudget && styles.negativeAmount,
              ]}
              numberOfLines={1}
              adjustsFontSizeToFit
              minimumFontScale={0.65}
            >
              {amountText}
            </Text>

            <Text style={styles.remainingLabel}>{amountLabel}</Text>
          </View>

          <View style={styles.totalColumn}>
            <Text style={styles.totalText}>
              <Text style={styles.totalMuted}>of </Text>
              {formatMoney(stats.budgetAmount)}
            </Text>
            <Text style={styles.totalLabel}>total</Text>
          </View>
        </View>

        <View style={styles.progressTrack}>
          <View
            style={[
              styles.progressFill,
              { width: `${stats.barPercent}%` },
              stats.isOverBudget && styles.negativeProgressFill,
            ]}
          />
        </View>

        <View style={styles.footerRow}>
          <Text style={styles.footerText}>{stats.usedPercent}% used</Text>

          {stats.isComplete ? (
            <Text style={styles.completeText}>✓ Budget complete</Text>
          ) : (
            <Text style={styles.footerText}>
              {formatMoney(stats.spentAmount)} spent
            </Text>
          )}
        </View>
      </Pressable>
    );
  }

  if (isDesktopWeb) {
    return (
      <View style={styles.webContainer}>
        <View style={{ flex: 1 }}>{renderCardContent()}</View>

        <Pressable
          style={[
            styles.webDeleteButton,
            deleteHovered && styles.webDeleteButtonHovered,
          ]}
          onHoverIn={() => setDeleteHovered(true)}
          onHoverOut={() => setDeleteHovered(false)}
          onPress={handleDelete}
        >
          <Text
            style={[
              styles.webDeleteText,
              deleteHovered && styles.webDeleteTextHovered,
            ]}
          >
            Delete
          </Text>
        </Pressable>
        {showCopyConfirm && (
          <View style={styles.copyConfirmBox}>
            <Text style={styles.copyConfirmTitle}>Copy budget?</Text>

            <Text style={styles.copyConfirmText}>
              Are you sure you want to copy this budget?
            </Text>

            <View style={styles.copyConfirmButtons}>
              <Pressable onPress={() => setShowCopyConfirm(false)}>
                <Text style={styles.copyCancelText}>Cancel</Text>
              </Pressable>

              <Pressable onPress={confirmDuplicate}>
                <Text style={styles.copyConfirmButtonText}>Copy</Text>
              </Pressable>
            </View>
          </View>
        )}
      </View>
    );
  }

  return (
    <Swipeable
      ref={swipeableRef}
      renderRightActions={() => (
        <View style={styles.deleteActionWrapper}>
          <Pressable style={styles.deleteAction} onPress={handleDelete}>
            <Text style={styles.deleteActionText}>Delete</Text>
          </Pressable>
        </View>
      )}
      overshootRight={false}
    >
      {renderCardContent()}
    </Swipeable>
  );
}

const styles = StyleSheet.create({
  webContainer: {
    flexDirection: "row",
    alignItems: "stretch",
  },

  webDeleteButton: {
    marginLeft: 8,
    backgroundColor: "#243342",
    borderColor: "#3B4D5F",
    borderWidth: 1,
    borderRadius: 18,
    paddingHorizontal: 12,
    marginBottom: 14,
    justifyContent: "center",
    alignItems: "center",
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

  card: {
    backgroundColor: "#1B2633",
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: "#26394C",
    marginBottom: 14,
  },

  topRow: {
    flexDirection: "row",
    alignItems: "center",
    minHeight: 24,
  },

  titleArea: {
    flex: 1,
    minWidth: 0,
  },

  cardTitle: {
    color: "#FFFFFF",
    fontSize: 17,
    fontWeight: "900",
    paddingRight: 10,
  },

  cardTitleInput: {
    color: "#FFFFFF",
    fontSize: 17,
    fontWeight: "900",
    padding: 0,
    paddingRight: 10,
  },

  menuButton: {
    width: 30,
    height: 30,
    alignItems: "flex-end",
    justifyContent: "center",
    marginLeft: 8,
  },

  menuButtonText: {
    color: "#8A98A8",
    fontSize: 24,
    fontWeight: "900",
    lineHeight: 24,
  },

  amountRow: {
    marginTop: 18,
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: 8,
  },

  noTitleAmountRow: {
    marginTop: 8,
  },

  remainingColumn: {
    flex: 1,
    minWidth: 0,
    justifyContent: "flex-start",
  },

  remainingAmount: {
    color: "#2ECC71",
    fontSize: 25,
    fontWeight: "900",
    letterSpacing: -0.7,
    lineHeight: 29,
  },

  negativeAmount: {
    color: "#FF5A52",
  },

  remainingLabel: {
    color: "#CAD3DD",
    fontSize: 16,
    fontWeight: "800",
    marginTop: 2,
  },

  totalColumn: {
    alignItems: "flex-end",
    flexShrink: 0,
    maxWidth: 150,
  },

  totalText: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "900",
  },

  totalMuted: {
    color: "#CAD3DD",
    fontSize: 15,
    fontWeight: "800",
  },

  totalLabel: {
    color: "#CAD3DD",
    fontSize: 14,
    fontWeight: "800",
    marginTop: 1,
  },

  progressTrack: {
    height: 7,
    borderRadius: 999,
    backgroundColor: "#2C3945",
    overflow: "hidden",
    marginTop: 14,
  },

  progressFill: {
    height: "100%",
    borderRadius: 999,
    backgroundColor: "#2ECC71",
  },

  negativeProgressFill: {
    backgroundColor: "#FF5A52",
  },

  footerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 10,
    gap: 12,
  },

  footerText: {
    color: "#CAD3DD",
    fontSize: 13,
    fontWeight: "700",
  },

  completeText: {
    color: "#2ECC71",
    fontSize: 14,
    fontWeight: "900",
  },

  deleteActionWrapper: {
    paddingLeft: 12,
    marginBottom: 14,
  },

  deleteAction: {
    backgroundColor: "#3A1C1C",
    borderColor: "#FF6B6B",
    borderWidth: 1,
    justifyContent: "center",
    alignItems: "center",
    width: 90,
    height: "100%",
    borderRadius: 18,
  },

  deleteActionText: {
    color: "#FF6B6B",
    fontWeight: "900",
  },
  cardMenu: {
    position: "absolute",
    top: 44,
    right: 16,
    backgroundColor: "#243342",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#3B4D5F",
    overflow: "hidden",
    zIndex: 20,
    elevation: 20,
  },

  cardMenuItem: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    minWidth: 150,
  },

  cardMenuItemText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "900",
  },

  copyConfirmBox: {
    marginTop: 14,
    backgroundColor: "#243342",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#3B4D5F",
    padding: 14,
  },

  copyConfirmTitle: {
    color: "#FFFFFF",
    fontSize: 17,
    fontWeight: "900",
    marginBottom: 6,
  },

  copyConfirmText: {
    color: "#CAD3DD",
    fontSize: 14,
    fontWeight: "700",
    lineHeight: 20,
    marginBottom: 14,
  },

  copyConfirmButtons: {
    flexDirection: "row",
    justifyContent: "flex-end",
    alignItems: "center",
    gap: 18,
  },

  copyCancelText: {
    color: "#CAD3DD",
    fontSize: 15,
    fontWeight: "900",
  },

  copyConfirmButtonText: {
    color: "#2ECC71",
    fontSize: 15,
    fontWeight: "900",
  },
});
