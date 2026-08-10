export type BudgetItem = {
  id: number;
  name: string;
  amount: string;
  quantity: number;
  included: boolean;
  isFood?: boolean;
  note?: string;
  link?: string;
  inCart?: boolean;
};

export type StoredSpendingItem = {
  id: string;
  amount: string;
  name: string;
  quantity: string;
  included: boolean;
  isFood?: boolean;
  note?: string;
  link?: string;
  inCart?: boolean;
};

export type StoredBudget = {
  id: string;
  budgetName: string;
  amount: string;
  spendingItems: StoredSpendingItem[];
  notes: string;
  createdAt?: string;
  updatedAt?: string;
  salesTaxEnabled?: boolean;
  taxRate?: string;
};

export type BudgetStatus = "green" | "yellow" | "red";

export type BudgetStatusStyle = {
  backgroundColor: string;
  borderColor: string;
  textColor: string;
};
