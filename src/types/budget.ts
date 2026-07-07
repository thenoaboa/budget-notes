export type StoredBudgetItem = {
  id: number;
  name: string;
  amount: string;
  quantity?: number;
  included?: boolean;
  isFood?: boolean;
  note?: string;
};

export type Budget = {
  id: string;

  // Optional on purpose: budget cards should be identified by money/status first.
  // A title is just metadata for users who want one.
  budgetName?: string;

  amount: string;

  receiptNote?: string;

  spendingItems: StoredBudgetItem[];

  createdAt?: string;
  updatedAt?: string;

  salesTaxEnabled?: boolean;
  taxRate?: string;
};
