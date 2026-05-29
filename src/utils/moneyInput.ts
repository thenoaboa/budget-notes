// Save as: src/utils/moneyInput.ts

export function cleanMoneyInput(value: string) {
  return value.replace(/[^0-9.]/g, "").replace(/(\..*)\./g, "$1");
}

export function formatBudgetCardAmount(value: string) {
  const trimmedValue = value.trim();

  if (trimmedValue.length === 0) {
    return "$0.00";
  }

  return `$${trimmedValue}`;
}
