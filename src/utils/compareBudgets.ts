import type { Budget } from "../types/budget";

export function compareBudgets(
  currentBudgetItems: any[],
  comparedBudget: Budget,
) {
  const added: string[] = [];
  const removed: string[] = [];
  const increased: string[] = [];
  const decreased: string[] = [];

  const currentMap = new Map(
    currentBudgetItems.map((item) => [item.name.trim().toLowerCase(), item]),
  );

  const comparedMap = new Map(
    comparedBudget.spendingItems.map((item) => [
      item.name.trim().toLowerCase(),
      item,
    ]),
  );

  currentMap.forEach((currentItem, name) => {
    const oldItem = comparedMap.get(name);

    if (!oldItem) {
      const amount = parseFloat(currentItem.amount || "0");

      added.push(`+ ${currentItem.name} +$${amount.toFixed(2)}`);

      return;
    }

    const currentAmount = parseFloat(currentItem.amount || "0");
    const oldAmount = parseFloat(oldItem.amount || "0");

    const difference = currentAmount - oldAmount;

    if (difference > 0) {
      increased.push(`▲ ${currentItem.name} +$${difference.toFixed(2)}`);
    } else if (difference < 0) {
      decreased.push(
        `▼ ${currentItem.name} -$${Math.abs(difference).toFixed(2)}`,
      );
    }
  });

  comparedMap.forEach((oldItem, name) => {
    if (!currentMap.has(name)) {
      const amount = parseFloat(oldItem.amount || "0");

      removed.push(`- ${oldItem.name} -$${amount.toFixed(2)}`);
    }
  });

  return {
    added,
    removed,
    increased,
    decreased,
  };
}
