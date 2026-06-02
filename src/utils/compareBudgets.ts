import type { Budget } from "../types/budget";

export function compareBudgets(
  currentBudgetItems: any[],
  comparedBudget: Budget,
) {
  const changes: string[] = [];

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
      changes.push(`+ ${currentItem.name}`);
      return;
    }

    const currentAmount = parseFloat(currentItem.amount || "0");
    const oldAmount = parseFloat(oldItem.amount || "0");

    const difference = currentAmount - oldAmount;

    if (difference > 0) {
      changes.push(`▲ ${currentItem.name} +$${difference.toFixed(2)}`);
    } else if (difference < 0) {
      changes.push(
        `▼ ${currentItem.name} -$${Math.abs(difference).toFixed(2)}`,
      );
    }
  });

  comparedMap.forEach((oldItem, name) => {
    if (!currentMap.has(name)) {
      changes.push(`- ${oldItem.name}`);
    }
  });

  return changes;
}
