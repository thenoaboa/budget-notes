export type SavingsContribution = {
  id: string;
  amount: string;
  note?: string;
  createdAt: string;
};

export type SavingsNote = {
  id: string;
  name?: string;
  targetAmount: string;
  savedAmount: string;
  notes?: string;
  itemLink?: string;
  contributions?: SavingsContribution[];
  createdAt?: string;
  updatedAt?: string;
  deletedAt?: string;
};
