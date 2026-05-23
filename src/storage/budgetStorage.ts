import AsyncStorage from "@react-native-async-storage/async-storage";
import type { Budget } from "../types/budget";

const BUDGETS_STORAGE_KEY = "budgets";

export async function loadBudgets() {
  const savedBudgets = await AsyncStorage.getItem(BUDGETS_STORAGE_KEY);

  const parsedBudgets: Budget[] = savedBudgets ? JSON.parse(savedBudgets) : [];

  return parsedBudgets;
}

export async function saveBudgets(budgets: Budget[]) {
  await AsyncStorage.setItem(BUDGETS_STORAGE_KEY, JSON.stringify(budgets));
}

export async function deleteBudgetById(budgets: Budget[], budgetId: string) {
  const updatedBudgets = budgets.filter((budget) => budget.id !== budgetId);

  await saveBudgets(updatedBudgets);

  return updatedBudgets;
}

export async function renameBudgetById(
  budgets: Budget[],
  budgetId: string,
  newTitle: string,
) {
  const updatedBudgets = budgets.map((budget) =>
    budget.id === budgetId
      ? {
          ...budget,
          budgetName: newTitle.trim() || "Untitled",
          updatedAt: new Date().toISOString(),
        }
      : budget,
  );

  await saveBudgets(updatedBudgets);

  return updatedBudgets;
}
