export type StoredBudgetItem = {
  id: number;
  name: string;
  amount: string;
  quantity?: number;
  included?: boolean;
};

export type Budget = {
  id: string;
  budgetName: string;
  amount: string;
  spendingItems: StoredBudgetItem[];

  createdAt?: string;
  updatedAt?: string;

  salesTaxEnabled?: boolean;
  taxRate?: string;
};
