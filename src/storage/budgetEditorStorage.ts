import AsyncStorage from "@react-native-async-storage/async-storage";

import type { Budget } from "../types/budget";
import type { BudgetItem } from "../types/budgetEditor";

const BUDGETS_STORAGE_KEY = "budgets";

type AutoSaveBudgetParams = {
  budgetId: string;
  noteTitle: string;
  startingMoney: string;
  items: BudgetItem[];
  createdAt: string;
  salesTaxEnabled: boolean;
  taxRate: string;
};

export async function loadBudgets() {
  const savedBudgets = await AsyncStorage.getItem(BUDGETS_STORAGE_KEY);
  const parsedBudgets: Budget[] = savedBudgets ? JSON.parse(savedBudgets) : [];

  return parsedBudgets;
}

export async function saveBudgets(budgets: Budget[]) {
  await AsyncStorage.setItem(BUDGETS_STORAGE_KEY, JSON.stringify(budgets));
}

export async function loadBudgetById(budgetId: string) {
  const budgets = await loadBudgets();

  return budgets.find((budget) => budget.id === budgetId);
}

export function mapStoredItemsToEditorItems(
  spendingItems: Budget["spendingItems"],
): BudgetItem[] {
  return spendingItems.map((item) => ({
    id: item.id,
    name: item.name,
    amount: item.amount,
    quantity: item.quantity ?? 1,
    included: item.included ?? true,
  }));
}

export async function autoSaveBudgetById({
  budgetId,
  noteTitle,
  startingMoney,
  items,
  createdAt,
  salesTaxEnabled,
  taxRate,
}: AutoSaveBudgetParams) {
  const budgets = await loadBudgets();

  const now = new Date().toISOString();

  const existingBudget = budgets.find((budget) => budget.id === budgetId);

  const savedBudget: Budget = {
    id: budgetId,
    budgetName: noteTitle.trim() || "Untitled",
    amount: startingMoney,
    spendingItems: items,
    createdAt: existingBudget?.createdAt || createdAt || now,
    updatedAt: now,
    salesTaxEnabled,
    taxRate,
  };

  const updatedBudgets = existingBudget
    ? budgets.map((budget) => (budget.id === budgetId ? savedBudget : budget))
    : [savedBudget, ...budgets];

  await saveBudgets(updatedBudgets);

  return {
    createdAt: savedBudget.createdAt,
    updatedAt: savedBudget.updatedAt,
  };
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
