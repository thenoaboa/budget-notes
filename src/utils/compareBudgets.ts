import type { Budget } from "../types/budget";

function cleanName(name?: string) {
  return (name || "").trim();
}

function getAmount(amount?: string) {
  return parseFloat(amount || "0") || 0;
}

export function compareBudgets(
  currentBudgetItems: any[],
  comparedBudget: Budget,
) {
  const added: string[] = [];
  const removed: string[] = [];
  const increased: string[] = [];
  const decreased: string[] = [];

  const currentItems = currentBudgetItems.filter(
    (item) => cleanName(item.name) !== "",
  );

  const comparedItems = comparedBudget.spendingItems.filter(
    (item) => cleanName(item.name) !== "",
  );

  const currentMap = new Map(
    currentItems.map((item) => [cleanName(item.name).toLowerCase(), item]),
  );

  const comparedMap = new Map(
    comparedItems.map((item) => [cleanName(item.name).toLowerCase(), item]),
  );

  currentMap.forEach((currentItem, name) => {
    const oldItem = comparedMap.get(name);
    const currentAmount = getAmount(currentItem.amount);

    if (!oldItem) {
      added.push(
        `+ ${cleanName(currentItem.name)} +$${currentAmount.toFixed(2)}`,
      );
      return;
    }

    const oldAmount = getAmount(oldItem.amount);
    const difference = currentAmount - oldAmount;

    if (difference > 0) {
      increased.push(
        `▲ ${cleanName(currentItem.name)} +$${difference.toFixed(2)}`,
      );
    } else if (difference < 0) {
      decreased.push(
        `▼ ${cleanName(currentItem.name)} -$${Math.abs(difference).toFixed(2)}`,
      );
    }
  });

  comparedMap.forEach((oldItem, name) => {
    if (!currentMap.has(name)) {
      const amount = getAmount(oldItem.amount);
      removed.push(`- ${cleanName(oldItem.name)} -$${amount.toFixed(2)}`);
    }
  });

  return {
    added,
    removed,
    increased,
    decreased,
  };
}
