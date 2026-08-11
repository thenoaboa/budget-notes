import AsyncStorage from "@react-native-async-storage/async-storage";
import type { Budget } from "../types/budget";

const BUDGETS_STORAGE_KEY = "budgets";
const DELETED_BUDGETS_STORAGE_KEY = "deletedBudgets";

export const QUICK_SHOP_DRAFT_KEY = "quick-shop-draft";
const QUICK_SHOP_OPEN_ON_HOME_KEY = "quick-shop-open-on-home";

export type QuickShopDraft = {
  prices: string[];
  currentDigits: string;
};

type DeletedBudget = Budget & {
  deletedAt?: string;
  source?: "quickShop";
};

function normalizeBudget<T extends Budget>(budget: T): T {
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

function digitsToAmount(digits: string) {
  if (!digits) {
    return null;
  }

  const numericValue = Number(digits) / 100;

  if (!Number.isFinite(numericValue)) {
    return null;
  }

  return numericValue.toFixed(2);
}

function quickShopDraftToPrices(draft: QuickShopDraft) {
  const prices = Array.isArray(draft.prices) ? [...draft.prices] : [];
  const currentAmount = digitsToAmount(draft.currentDigits);

  if (currentAmount) {
    prices.push(currentAmount);
  }

  return prices;
}

function buildQuickShopDeletedBudget(
  prices: string[],
  deletedAt = new Date().toISOString(),
): DeletedBudget {
  const baseId = Date.now();

  const spendingItems = prices
    .map((price, index) => ({
      id: baseId + index,
      name: `Item ${index + 1}`,
      amount: price,
      quantity: 1,
      included: true,
    }))
    .reverse();

  return {
    id: `${baseId}-${Math.random().toString(36).slice(2, 8)}`,
    budgetName: "Quick Shop",
    amount: "",
    receiptNote: "",
    spendingItems,
    salesTaxEnabled: false,
    taxRate: "8.25",
    createdAt: deletedAt,
    updatedAt: deletedAt,
    deletedAt,
    source: "quickShop",
  };
}

export async function loadBudgets() {
  const savedBudgets = await AsyncStorage.getItem(BUDGETS_STORAGE_KEY);

  const parsedBudgets: Budget[] = savedBudgets ? JSON.parse(savedBudgets) : [];

  return parsedBudgets.map(normalizeBudget);
}

export async function loadDeletedBudgets(): Promise<DeletedBudget[]> {
  const savedDeletedBudgets = await AsyncStorage.getItem(
    DELETED_BUDGETS_STORAGE_KEY,
  );

  const parsedDeletedBudgets: DeletedBudget[] = savedDeletedBudgets
    ? JSON.parse(savedDeletedBudgets)
    : [];

  return parsedDeletedBudgets.map(normalizeBudget);
}

export async function saveBudgets(budgets: Budget[]) {
  await AsyncStorage.setItem(BUDGETS_STORAGE_KEY, JSON.stringify(budgets));
}

export async function loadQuickShopDraft(): Promise<QuickShopDraft> {
  const savedDraft = await AsyncStorage.getItem(QUICK_SHOP_DRAFT_KEY);

  if (!savedDraft) {
    return {
      prices: [],
      currentDigits: "",
    };
  }

  try {
    const parsedDraft = JSON.parse(savedDraft);

    return {
      prices: Array.isArray(parsedDraft.prices) ? parsedDraft.prices : [],
      currentDigits:
        typeof parsedDraft.currentDigits === "string"
          ? parsedDraft.currentDigits
          : "",
    };
  } catch {
    await AsyncStorage.removeItem(QUICK_SHOP_DRAFT_KEY);

    return {
      prices: [],
      currentDigits: "",
    };
  }
}

export async function saveQuickShopDraft(draft: QuickShopDraft) {
  await AsyncStorage.setItem(QUICK_SHOP_DRAFT_KEY, JSON.stringify(draft));
}

export async function clearQuickShopDraft() {
  await AsyncStorage.removeItem(QUICK_SHOP_DRAFT_KEY);
}

export async function quickShopDraftHasData() {
  const draft = await loadQuickShopDraft();

  return quickShopDraftToPrices(draft).length > 0;
}

export async function requestQuickShopOpenOnHome() {
  await AsyncStorage.setItem(QUICK_SHOP_OPEN_ON_HOME_KEY, "true");
}

export async function consumeQuickShopOpenRequest() {
  const shouldOpen = await AsyncStorage.getItem(QUICK_SHOP_OPEN_ON_HOME_KEY);

  if (shouldOpen === "true") {
    await AsyncStorage.removeItem(QUICK_SHOP_OPEN_ON_HOME_KEY);
    return true;
  }

  return false;
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
    (budget) => budget.id === budgetId,
  );

  if (!budgetToRestore) {
    return {
      budgets,
      deletedBudgets,
    };
  }

  const {
    deletedAt: _deletedAt,
    source: _source,
    ...budgetWithoutDeletedMeta
  } = budgetToRestore;

  const restoredBudget: Budget = {
    ...budgetWithoutDeletedMeta,
    updatedAt: new Date().toISOString(),
  };

  const updatedDeletedBudgets = deletedBudgets.filter(
    (budget) => budget.id !== budgetId,
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

export async function restoreDeletedQuickShopById(
  budgetId: string,
  discardCurrentDraft: boolean,
) {
  const deletedBudgets = await loadDeletedBudgets();

  const quickShopToRestore = deletedBudgets.find(
    (budget) => budget.id === budgetId && budget.source === "quickShop",
  );

  if (!quickShopToRestore) {
    return {
      restored: false,
      deletedBudgets,
    };
  }

  let updatedDeletedBudgets = deletedBudgets.filter(
    (budget) => budget.id !== budgetId,
  );

  if (discardCurrentDraft) {
    const currentDraft = await loadQuickShopDraft();
    const currentPrices = quickShopDraftToPrices(currentDraft);

    if (currentPrices.length > 0) {
      const discardedCurrentQuickShop =
        buildQuickShopDeletedBudget(currentPrices);

      updatedDeletedBudgets = [
        discardedCurrentQuickShop,
        ...updatedDeletedBudgets,
      ];
    }
  }

  const restoredPrices = [...quickShopToRestore.spendingItems]
    .reverse()
    .map((item) => item.amount)
    .filter((amount) => typeof amount === "string" && amount.length > 0);

  await saveQuickShopDraft({
    prices: restoredPrices,
    currentDigits: "",
  });

  await AsyncStorage.setItem(
    DELETED_BUDGETS_STORAGE_KEY,
    JSON.stringify(updatedDeletedBudgets),
  );

  await requestQuickShopOpenOnHome();

  return {
    restored: true,
    deletedBudgets: updatedDeletedBudgets,
  };
}

export async function permanentlyDeleteBudgetById(budgetId: string) {
  const deletedBudgets = await loadDeletedBudgets();

  const updatedDeletedBudgets = deletedBudgets.filter(
    (budget) => budget.id !== budgetId,
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

  const budgetName = importedItems.length > 0 ? "Imported Budget" : "";

  const newBudget = {
    id: Date.now().toString(),
    budgetName,
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

export async function createBudgetFromQuickShop(prices: string[]) {
  if (prices.length === 0) {
    return null;
  }

  const budgets = await loadBudgets();
  const now = new Date().toISOString();
  const budgetId = Date.now().toString();
  const baseItemId = Date.now();

  const spendingItems = prices
    .map((price, index) => ({
      id: baseItemId + index,
      name: `Item ${index + 1}`,
      amount: price,
      quantity: 1,
      included: true,
    }))
    .reverse();

  const newBudget: Budget = {
    id: budgetId,
    budgetName: "",
    amount: "",
    receiptNote: "",
    spendingItems,
    salesTaxEnabled: false,
    taxRate: "8.25",
    createdAt: now,
    updatedAt: now,
  };

  await saveBudgets([newBudget, ...budgets]);

  return newBudget;
}

export async function discardQuickShop(prices: string[]) {
  if (prices.length === 0) {
    return null;
  }

  const deletedBudgets = await loadDeletedBudgets();
  const discardedBudget = buildQuickShopDeletedBudget(prices);

  await AsyncStorage.setItem(
    DELETED_BUDGETS_STORAGE_KEY,
    JSON.stringify([discardedBudget, ...deletedBudgets]),
  );

  return discardedBudget;
}
