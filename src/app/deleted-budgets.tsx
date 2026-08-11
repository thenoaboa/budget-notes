import { useFocusEffect, useRouter } from "expo-router";
import { useCallback, useState } from "react";
import {
  Alert,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

import {
  loadDeletedBudgets,
  permanentlyDeleteBudgetById,
  quickShopDraftHasData,
  restoreDeletedBudgetById,
  restoreDeletedQuickShopById,
} from "../storage/budgetStorage";
import type { Budget } from "../types/budget";

type DeletedBudget = Budget & {
  deletedAt?: string;
  source?: "quickShop";
};

export default function DeletedBudgetsScreen() {
  const router = useRouter();
  const [deletedBudgets, setDeletedBudgets] = useState<DeletedBudget[]>([]);

  useFocusEffect(
    useCallback(() => {
      async function refreshDeletedBudgets() {
        const loadedDeletedBudgets = await loadDeletedBudgets();
        setDeletedBudgets(loadedDeletedBudgets);
      }

      void refreshDeletedBudgets();
    }, []),
  );

  async function restoreNormalBudget(budgetId: string) {
    const result = await restoreDeletedBudgetById(budgetId);
    setDeletedBudgets(result.deletedBudgets);
  }

  async function finishQuickShopRestore(
    budgetId: string,
    discardCurrentDraft: boolean,
  ) {
    const result = await restoreDeletedQuickShopById(
      budgetId,
      discardCurrentDraft,
    );

    if (!result.restored) {
      return;
    }

    setDeletedBudgets(result.deletedBudgets);

    router.replace("/" as any);
  }

  async function restoreQuickShop(budgetId: string) {
    const hasCurrentDraft = await quickShopDraftHasData();

    if (!hasCurrentDraft) {
      await finishQuickShopRestore(budgetId, false);
      return;
    }

    const title = "Replace current Quick Shop?";
    const message =
      "You already have a Quick Shop in progress. Restoring this one will move your current Quick Shop to Recently Deleted.";

    if (Platform.OS === "web") {
      const confirmed = window.confirm(`${title}\n\n${message}`);

      if (confirmed) {
        await finishQuickShopRestore(budgetId, true);
      }

      return;
    }

    Alert.alert(title, message, [
      {
        text: "Cancel",
        style: "cancel",
      },
      {
        text: "Replace & Restore",
        onPress: () => {
          void finishQuickShopRestore(budgetId, true);
        },
      },
    ]);
  }

  async function restoreBudget(budget: DeletedBudget) {
    if (budget.source === "quickShop") {
      await restoreQuickShop(budget.id);
      return;
    }

    await restoreNormalBudget(budget.id);
  }

  async function deleteForever(budgetId: string) {
    const updatedDeletedBudgets = await permanentlyDeleteBudgetById(budgetId);
    setDeletedBudgets(updatedDeletedBudgets);
  }

  function confirmDeleteForever(budgetId: string) {
    if (Platform.OS === "web") {
      const confirmed = window.confirm("Delete this budget forever?");

      if (confirmed) {
        void deleteForever(budgetId);
      }

      return;
    }

    Alert.alert("Delete forever?", "This cannot be undone.", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete Forever",
        style: "destructive",
        onPress: () => {
          void deleteForever(budgetId);
        },
      },
    ]);
  }

  return (
    <View style={styles.screen}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
      >
        <Pressable style={styles.backButton} onPress={() => router.back()}>
          <Text style={styles.backButtonText}>← Back</Text>
        </Pressable>

        <Text style={styles.title}>Recently Deleted</Text>

        {deletedBudgets.length === 0 && (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyTitle}>Nothing deleted.</Text>
            <Text style={styles.emptyText}>
              Deleted budgets and Quick Shops will show up here.
            </Text>
          </View>
        )}

        {deletedBudgets.map((budget) => {
          const isQuickShop = budget.source === "quickShop";

          return (
            <View key={budget.id} style={styles.card}>
              <View style={styles.cardTitleRow}>
                <Text style={styles.cardTitle}>
                  {isQuickShop
                    ? "Quick Shop"
                    : budget.budgetName || "Untitled Budget"}
                </Text>

                {isQuickShop ? (
                  <View style={styles.quickShopBadge}>
                    <Text style={styles.quickShopBadgeText}>QUICK SHOP</Text>
                  </View>
                ) : (
                  <View style={styles.budgetBadge}>
                    <Text style={styles.budgetBadgeText}>BUDGET</Text>
                  </View>
                )}
              </View>

              <Text style={styles.deletedDate}>
                {budget.deletedAt
                  ? `Deleted ${new Date(budget.deletedAt).toLocaleDateString()}`
                  : "Deleted recently"}
              </Text>

              <View style={styles.buttonRow}>
                <Pressable
                  style={[
                    styles.actionButton,
                    isQuickShop
                      ? styles.quickShopRestoreButton
                      : styles.restoreButton,
                  ]}
                  onPress={() => {
                    void restoreBudget(budget);
                  }}
                >
                  <Text
                    style={[
                      styles.restoreButtonText,
                      isQuickShop && styles.quickShopRestoreButtonText,
                    ]}
                  >
                    Restore
                  </Text>
                </Pressable>

                <Pressable
                  style={[styles.actionButton, styles.deleteButton]}
                  onPress={() => confirmDeleteForever(budget.id)}
                >
                  <Text style={styles.deleteButtonText}>Delete Forever</Text>
                </Pressable>
              </View>
            </View>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#101820",
  },

  container: {
    flex: 1,
    backgroundColor: "#101820",
  },

  content: {
    paddingHorizontal: 16,
    paddingTop: 58,
    paddingBottom: 120,
  },

  backButton: {
    marginBottom: 18,
  },

  backButtonText: {
    color: "#8A98A8",
    fontSize: 16,
    fontWeight: "900",
  },

  title: {
    color: "#FFFFFF",
    fontSize: 34,
    fontWeight: "900",
    marginBottom: 18,
  },

  emptyCard: {
    backgroundColor: "#1B2633",
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: "#344657",
  },

  emptyTitle: {
    color: "#FFFFFF",
    fontSize: 20,
    fontWeight: "900",
    marginBottom: 6,
  },

  emptyText: {
    color: "#CAD3DD",
    fontSize: 15,
    fontWeight: "700",
  },

  card: {
    backgroundColor: "#1B2633",
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: "#344657",
    marginBottom: 14,
  },

  cardTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 6,
  },

  cardTitle: {
    color: "#FFFFFF",
    fontSize: 20,
    fontWeight: "900",
  },

  quickShopBadge: {
    backgroundColor: "#342347",
    borderWidth: 1,
    borderColor: "#6F35B5",
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },

  quickShopBadgeText: {
    color: "#B56CFF",
    fontSize: 10,
    fontWeight: "900",
    letterSpacing: 0.6,
  },

  budgetBadge: {
    backgroundColor: "#183A2A",
    borderWidth: 1,
    borderColor: "#2ECC71",
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },

  budgetBadgeText: {
    color: "#2ECC71",
    fontSize: 10,
    fontWeight: "900",
    letterSpacing: 0.6,
  },

  deletedDate: {
    color: "#8A98A8",
    fontSize: 14,
    fontWeight: "700",
    marginBottom: 14,
  },

  buttonRow: {
    flexDirection: "row",
    gap: 10,
  },

  actionButton: {
    flex: 1,
    borderRadius: 14,
    paddingVertical: 12,
    alignItems: "center",
  },

  restoreButton: {
    backgroundColor: "#2ECC71",
  },

  quickShopRestoreButton: {
    backgroundColor: "#9B5DE5",
  },

  restoreButtonText: {
    color: "#101820",
    fontSize: 14,
    fontWeight: "900",
  },

  quickShopRestoreButtonText: {
    color: "#FFFFFF",
  },

  deleteButton: {
    backgroundColor: "#3A1F24",
    borderWidth: 1,
    borderColor: "#7A2E38",
  },

  deleteButtonText: {
    color: "#FFB4BE",
    fontSize: 14,
    fontWeight: "900",
  },
});
