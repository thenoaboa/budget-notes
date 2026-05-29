import { useFocusEffect } from "expo-router";
import { useCallback, useMemo, useState } from "react";
import { Alert, Platform } from "react-native";

import {
  deleteBudgetById,
  loadBudgets,
  renameBudgetById,
} from "../storage/budgetStorage";
import type { Budget } from "../types/budget";
import { getVisibleBudgets } from "../utils/budgetSearch";

export function useBudgetNotes() {
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [searchVisible, setSearchVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  useFocusEffect(
    useCallback(() => {
      async function refreshBudgets() {
        const loadedBudgets = await loadBudgets();
        setBudgets(loadedBudgets);
      }

      refreshBudgets();
    }, []),
  );

  async function deleteBudget(budgetId: string) {
    const updatedBudgets = await deleteBudgetById(budgets, budgetId);

    setBudgets(updatedBudgets);
  }

  async function renameBudget(budgetId: string, newTitle: string) {
    const updatedBudgets = await renameBudgetById(budgets, budgetId, newTitle);

    setBudgets(updatedBudgets);
  }

  function confirmDeleteBudget(budgetId: string) {
    if (Platform.OS === "web") {
      const confirmed = window.confirm("Are you sure you want to delete this?");

      if (confirmed) {
        deleteBudget(budgetId);
      }

      return;
    }

    Alert.alert("Delete budget?", "Are you sure you want to delete this?", [
      {
        text: "No",
        style: "cancel",
      },
      {
        text: "Yes",
        style: "destructive",
        onPress: () => deleteBudget(budgetId),
      },
    ]);
  }

  const visibleBudgets = useMemo(() => {
    return getVisibleBudgets(budgets, searchQuery);
  }, [budgets, searchQuery]);

  return {
    budgets,
    visibleBudgets,
    searchVisible,
    searchQuery,
    setSearchVisible,
    setSearchQuery,
    deleteBudget,
    renameBudget,
    confirmDeleteBudget,
  };
}
