// Save as: src/utils/budgetEditorCalculations.ts

import type {
  BudgetItem,
  BudgetStatus,
  BudgetStatusStyle,
} from "../types/budgetEditor";

export function getSubtotal(items: BudgetItem[]) {
  return items.reduce((total, item) => {
    if (!item.included) return total;

    const amount = parseFloat(item.amount) || 0;
    return total + amount * item.quantity;
  }, 0);
}

export function getTaxAmount(
  subtotal: number,
  salesTaxEnabled: boolean,
  taxRate: string,
) {
  if (!salesTaxEnabled) return 0;

  return subtotal * ((parseFloat(taxRate) || 0) / 100);
}

export function getBudgetStatus(
  safeToSpend: number,
  moneyAvailableIsEmpty: boolean,
): BudgetStatus {
  if (moneyAvailableIsEmpty) return "green";
  if (safeToSpend < 0) return "red";
  if (safeToSpend <= 50) return "yellow";

  return "green";
}

export function getAffirmingMessage(
  safeToSpend: number,
  status: BudgetStatus,
  moneyAvailableIsEmpty: boolean,
) {
  if (moneyAvailableIsEmpty) {
    return "Make your money go further";
  }

  const greenMessages = [
    "You’re still okay.",
    "You’ve got enough.",
    "You still have room.",
    "There’s still breathing room.",
    "You’re in a good spot.",
  ];

  const yellowMessages = [
    "Things are tightening up.",
    "Keep an eye on spending.",
    "Might be smart to slow down.",
    "You still have options.",
    "Small choices help here.",
  ];

  const redMessages = [
    "Over budget.",
    "Spending exceeds available funds.",
    "This budget needs adjustment.",
    "More is planned than available.",
    "Reduce spending or increase available funds.",
  ];

  const pool =
    status === "red"
      ? redMessages
      : status === "yellow"
        ? yellowMessages
        : greenMessages;

  const index = Math.abs(Math.round(safeToSpend)) % pool.length;
  return pool[index];
}

export const budgetStatusStyles: Record<BudgetStatus, BudgetStatusStyle> = {
  green: {
    backgroundColor: "#123527",
    borderColor: "#2ECC71",
    textColor: "#2ECC71",
  },
  yellow: {
    backgroundColor: "#3A3114",
    borderColor: "#F1C40F",
    textColor: "#F1C40F",
  },
  red: {
    backgroundColor: "#3A1C1C",
    borderColor: "#FF6B6B",
    textColor: "#FF6B6B",
  },
};
