// Save as: src/storage/budgetEditorStorage.ts

import AsyncStorage from "@react-native-async-storage/async-storage";

import type { BudgetItem, StoredBudget } from "../types/budgetEditor";
import { getCreatedDateFromId } from "../utils/budgetEditorDates";

const BUDGETS_STORAGE_KEY = "budgets";

export async function loadStoredBudgets() {
  const savedBudgets = await AsyncStorage.getItem(BUDGETS_STORAGE_KEY);

  const parsedBudgets: StoredBudget[] = savedBudgets
    ? JSON.parse(savedBudgets)
    : [];

  return parsedBudgets;
}

export async function saveStoredBudgets(budgets: StoredBudget[]) {
  await AsyncStorage.setItem(BUDGETS_STORAGE_KEY, JSON.stringify(budgets));
}

export function mapStoredItemsToEditorItems(
  spendingItems: StoredBudget["spendingItems"],
): BudgetItem[] {
  return spendingItems.map((item, index) => ({
    id: Number(item.id) || Date.now() + index,
    name: item.name || "",
    amount: item.amount || "",
    quantity: Number(item.quantity) || 1,
    included: item.included ?? true,
  }));
}

export function mapEditorItemsToStoredItems(items: BudgetItem[]) {
  return items.map((item) => ({
    id: item.id.toString(),
    amount: item.amount,
    name: item.name,
    quantity: item.quantity.toString(),
    included: item.included,
  }));
}

export async function loadBudgetById(budgetId: string) {
  const parsedBudgets = await loadStoredBudgets();

  return parsedBudgets.find((budget) => budget.id === budgetId);
}

type SaveBudgetInput = {
  budgetId: string;
  noteTitle: string;
  startingMoney: string;
  items: BudgetItem[];
  createdAt: string;
  salesTaxEnabled: boolean;
  taxRate: string;
};

export async function autoSaveBudgetById({
  budgetId,
  noteTitle,
  startingMoney,
  items,
  createdAt,
  salesTaxEnabled,
  taxRate,
}: SaveBudgetInput) {
  const parsedBudgets = await loadStoredBudgets();

  const hasContent =
    noteTitle.trim() !== "" ||
    startingMoney.trim() !== "" ||
    items.some((item) => item.name.trim() !== "" || item.amount.trim() !== "");

  if (!hasContent) {
    const filteredBudgets = parsedBudgets.filter(
      (budget) => budget.id !== budgetId,
    );

    await saveStoredBudgets(filteredBudgets);

    return {
      createdAt: createdAt || getCreatedDateFromId(budgetId),
      updatedAt: "",
    };
  }

  const existingBudget = parsedBudgets.find((budget) => budget.id === budgetId);

  const newCreatedAt =
    existingBudget?.createdAt || createdAt || getCreatedDateFromId(budgetId);

  const newUpdatedAt = existingBudget ? new Date().toISOString() : "";

  const budgetToSave: StoredBudget = {
    id: budgetId,
    budgetName: noteTitle.trim() || "Untitled",
    amount: startingMoney,
    spendingItems: mapEditorItemsToStoredItems(items),
    notes: "",
    createdAt: newCreatedAt,
    updatedAt: newUpdatedAt,
    salesTaxEnabled,
    taxRate,
  };

  const existingIndex = parsedBudgets.findIndex(
    (budget) => budget.id === budgetId,
  );

  const updatedBudgets = [...parsedBudgets];

  if (existingIndex >= 0) {
    updatedBudgets[existingIndex] = budgetToSave;
  } else {
    updatedBudgets.unshift(budgetToSave);
  }

  await saveStoredBudgets(updatedBudgets);

  return {
    createdAt: newCreatedAt,
    updatedAt: newUpdatedAt,
  };
}
