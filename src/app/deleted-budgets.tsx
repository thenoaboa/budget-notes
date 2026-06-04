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
  restoreDeletedBudgetById,
} from "../storage/budgetStorage";
import type { Budget } from "../types/budget";

type DeletedBudget = Budget & {
  deletedAt?: string;
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

      refreshDeletedBudgets();
    }, []),
  );

  async function restoreBudget(budgetId: string) {
    const result = await restoreDeletedBudgetById(budgetId);
    setDeletedBudgets(result.deletedBudgets);
  }

  async function deleteForever(budgetId: string) {
    const updatedDeletedBudgets = await permanentlyDeleteBudgetById(budgetId);
    setDeletedBudgets(updatedDeletedBudgets);
  }

  function confirmDeleteForever(budgetId: string) {
    if (Platform.OS === "web") {
      const confirmed = window.confirm("Delete this budget forever?");

      if (confirmed) {
        deleteForever(budgetId);
      }

      return;
    }

    Alert.alert("Delete forever?", "This cannot be undone.", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete Forever",
        style: "destructive",
        onPress: () => deleteForever(budgetId),
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

        <Text style={styles.title} numberOfLines={1} adjustsFontSizeToFit>
          Recently Deleted
        </Text>

        {deletedBudgets.length === 0 && (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyTitle}>Nothing deleted.</Text>
            <Text style={styles.emptyText}>
              Deleted budgets will show up here.
            </Text>
          </View>
        )}

        {deletedBudgets.map((budget) => (
          <View key={budget.id} style={styles.card}>
            <Text style={styles.cardTitle}>
              {budget.budgetName || "Untitled Budget"}
            </Text>

            <Text style={styles.deletedDate}>
              {budget.deletedAt
                ? `Deleted ${new Date(budget.deletedAt).toLocaleDateString()}`
                : "Deleted recently"}
            </Text>

            <View style={styles.buttonRow}>
              <Pressable
                style={[styles.actionButton, styles.restoreButton]}
                onPress={() => restoreBudget(budget.id)}
              >
                <Text style={styles.restoreButtonText}>Restore</Text>
              </Pressable>

              <Pressable
                style={[styles.actionButton, styles.deleteButton]}
                onPress={() => confirmDeleteForever(budget.id)}
              >
                <Text style={styles.deleteButtonText}>Delete Forever</Text>
              </Pressable>
            </View>
          </View>
        ))}
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
    fontSize: 30,
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

  cardTitle: {
    color: "#FFFFFF",
    fontSize: 20,
    fontWeight: "900",
    marginBottom: 6,
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

  restoreButtonText: {
    color: "#101820",
    fontSize: 14,
    fontWeight: "900",
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
