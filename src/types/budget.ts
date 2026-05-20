export type SpendingItem = {
  id: string;
  amount: string;
  name: string;
  quantity: string;
  included: boolean;
};

export type Budget = {
  id: string;
  budgetName: string;
  amount: string;
  spendingItems: SpendingItem[];
  notes: string;
  createdAt?: string;
  updatedAt?: string;
};
