import AsyncStorage from "@react-native-async-storage/async-storage";
import type { Budget } from "../types/budget";

const BUDGETS_STORAGE_KEY = "budgets";
const DELETED_BUDGETS_STORAGE_KEY = "deletedBudgets";

function normalizeBudget(budget: Budget): Budget {
  const cleanedName = (budget.budgetName || "").trim();
  const shouldClearOldPlaceholder = [
    "Untitled",
    "Untitled Note",
    "Untitled Budget",
  ].includes(cleanedName);

  return {
    ...budget,
    budgetName: shouldClearOldPlaceholder ? "" : cleanedName,
    spendingItems: budget.spendingItems || [],
  };
}

export async function loadBudgets() {
  const savedBudgets = await AsyncStorage.getItem(BUDGETS_STORAGE_KEY);

  const parsedBudgets: Budget[] = savedBudgets ? JSON.parse(savedBudgets) : [];

  return parsedBudgets.map(normalizeBudget);
}

export async function loadDeletedBudgets() {
  const savedDeletedBudgets = await AsyncStorage.getItem(
    DELETED_BUDGETS_STORAGE_KEY,
  );

  const parsedDeletedBudgets = savedDeletedBudgets
    ? JSON.parse(savedDeletedBudgets)
    : [];

  return parsedDeletedBudgets.map(normalizeBudget);
}

export async function saveBudgets(budgets: Budget[]) {
  await AsyncStorage.setItem(BUDGETS_STORAGE_KEY, JSON.stringify(budgets));
}

export async function deleteBudgetById(budgets: Budget[], budgetId: string) {
  const budgetToDelete = budgets.find((budget) => budget.id === budgetId);

  if (!budgetToDelete) {
    return budgets;
  }

  const updatedBudgets = budgets.filter((budget) => budget.id !== budgetId);

  const deletedBudgets = await loadDeletedBudgets();

  await AsyncStorage.setItem(
    DELETED_BUDGETS_STORAGE_KEY,
    JSON.stringify([
      {
        ...budgetToDelete,
        deletedAt: new Date().toISOString(),
      },
      ...deletedBudgets,
    ]),
  );

  await saveBudgets(updatedBudgets);

  return updatedBudgets;
}
export async function restoreDeletedBudgetById(budgetId: string) {
  const budgets = await loadBudgets();
  const deletedBudgets = await loadDeletedBudgets();

  const budgetToRestore = deletedBudgets.find(
    (budget: Budget & { deletedAt?: string }) => budget.id === budgetId,
  );

  if (!budgetToRestore) {
    return {
      budgets,
      deletedBudgets,
    };
  }

  const restoredBudget = {
    ...budgetToRestore,
    deletedAt: undefined,
    updatedAt: new Date().toISOString(),
  };

  const updatedDeletedBudgets = deletedBudgets.filter(
    (budget: Budget) => budget.id !== budgetId,
  );

  const updatedBudgets = [restoredBudget, ...budgets];

  await saveBudgets(updatedBudgets);

  await AsyncStorage.setItem(
    DELETED_BUDGETS_STORAGE_KEY,
    JSON.stringify(updatedDeletedBudgets),
  );

  return {
    budgets: updatedBudgets,
    deletedBudgets: updatedDeletedBudgets,
  };
}
export async function permanentlyDeleteBudgetById(budgetId: string) {
  const deletedBudgets = await loadDeletedBudgets();

  const updatedDeletedBudgets = deletedBudgets.filter(
    (budget: Budget) => budget.id !== budgetId,
  );

  await AsyncStorage.setItem(
    DELETED_BUDGETS_STORAGE_KEY,
    JSON.stringify(updatedDeletedBudgets),
  );

  return updatedDeletedBudgets;
}

export async function renameBudgetById(
  budgets: Budget[],
  budgetId: string,
  newTitle: string,
) {
  const cleanedTitle = newTitle.trim();

  const updatedBudgets = budgets.map((budget) =>
    budget.id === budgetId
      ? {
          ...budget,
          budgetName: cleanedTitle,
          updatedAt: new Date().toISOString(),
        }
      : budget,
  );

  await saveBudgets(updatedBudgets);

  return updatedBudgets;
}
export async function duplicateBudgetById(budgetId: string) {
  const budgets = await loadBudgets();

  const originalBudget = budgets.find((budget) => budget.id === budgetId);

  if (!originalBudget) {
    return null;
  }

  const originalName = (originalBudget.budgetName || "").trim();

  const baseName = originalName.length > 0 ? `${originalName} Copy` : "Copy";

  let duplicateName = baseName;
  let copyNumber = 1;

  while (budgets.some((budget) => budget.budgetName === duplicateName)) {
    duplicateName = `${baseName} ${copyNumber}`;
    copyNumber++;
  }

  const duplicatedBudget = {
    ...originalBudget,
    id: Date.now().toString(),
    budgetName: duplicateName,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  const updatedBudgets = [duplicatedBudget, ...budgets];

  await saveBudgets(updatedBudgets);

  return duplicatedBudget;
}
export async function createBudgetFromImportedItems(importedItems: any[]) {
  const budgets = await loadBudgets();

  const newBudget = {
    id: Date.now().toString(),
    budgetName: "Imported Budget",
    amount: "",
    receiptNote: "",
    spendingItems: importedItems,
    salesTaxEnabled: false,
    taxRate: "8.25",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  const updatedBudgets = [newBudget, ...budgets];

  await saveBudgets(updatedBudgets);

  return newBudget;
}
