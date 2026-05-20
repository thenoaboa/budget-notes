import type { Budget } from "../types/budget";

export function getFallbackDateFromId(id: string) {
  const timestamp = Number(id);

  if (!Number.isNaN(timestamp)) {
    return new Date(timestamp).toISOString();
  }

  return "";
}

export function getSortDate(budget: Budget) {
  return (
    budget.updatedAt || budget.createdAt || getFallbackDateFromId(budget.id)
  );
}

export function formatNoteDate(budget: Budget) {
  const editedDate = budget.updatedAt;
  const createdDate = budget.createdAt || getFallbackDateFromId(budget.id);
  const dateToUse = editedDate || createdDate;

  if (!dateToUse) return "No date yet";

  const date = new Date(dateToUse);

  const formattedDate = date.toLocaleDateString([], {
    month: "short",
    day: "numeric",
  });

  const formattedTime = date.toLocaleTimeString([], {
    hour: "numeric",
    minute: "2-digit",
  });

  if (editedDate) {
    return `Edited ${formattedDate} • ${formattedTime}`;
  }

  return `Created ${formattedDate} • ${formattedTime}`;
}
