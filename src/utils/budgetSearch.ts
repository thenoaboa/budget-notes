import type { Budget } from "../types/budget";
import { formatNoteDate, getSortDate } from "./budgetDates";

export function getVisibleBudgets(budgets: Budget[], searchQuery: string) {
  const normalizedSearch = searchQuery.trim().toLowerCase();

  const sortedBudgets = [...budgets].sort((a, b) => {
    const aTime = new Date(getSortDate(a)).getTime() || 0;
    const bTime = new Date(getSortDate(b)).getTime() || 0;

    return bTime - aTime;
  });

  if (!normalizedSearch) return sortedBudgets;

  return sortedBudgets.filter((budget) => {
    const createdDateText = budget.createdAt
      ? new Date(budget.createdAt).toLocaleString()
      : "";

    const updatedDateText = budget.updatedAt
      ? new Date(budget.updatedAt).toLocaleString()
      : "";

    const itemText = budget.spendingItems
      .map((item) => `${item.name} ${item.amount} x${item.quantity}`)
      .join(" ");

    const searchableText = [
      budget.budgetName,
      budget.amount,
      budget.notes,
      itemText,
      createdDateText,
      updatedDateText,
      formatNoteDate(budget),
    ]
      .join(" ")
      .toLowerCase();

    return searchableText.includes(normalizedSearch);
  });
}
