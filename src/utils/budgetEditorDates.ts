// Save as: src/utils/budgetEditorDates.ts

export function getCreatedDateFromId(idValue: string | undefined) {
  if (!idValue) return new Date().toISOString();

  const timestamp = Number(idValue);

  if (!Number.isNaN(timestamp)) {
    return new Date(timestamp).toISOString();
  }

  return new Date().toISOString();
}

export function formatBudgetEditorTime(
  createdDate: string,
  editedDate: string,
) {
  const dateToUse = editedDate || createdDate;

  if (!dateToUse) return "Not edited yet";

  const date = new Date(dateToUse);

  const formattedDate = date.toLocaleDateString();
  const formattedTime = date.toLocaleTimeString([], {
    hour: "numeric",
    minute: "2-digit",
  });

  if (editedDate) {
    return `Last edited ${formattedDate} at ${formattedTime}`;
  }

  return `Created ${formattedDate} at ${formattedTime}`;
}
