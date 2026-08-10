import type { SavingsNote } from "../types/savingsNote";

function getSortDate(note: SavingsNote) {
  return note.updatedAt || note.createdAt || "";
}

export function getVisibleSavingsNotes(
  notes: SavingsNote[],
  searchQuery: string,
) {
  const normalizedSearch = searchQuery.trim().toLowerCase();

  const sortedNotes = [...notes].sort((a, b) => {
    const aTime = new Date(getSortDate(a)).getTime() || 0;
    const bTime = new Date(getSortDate(b)).getTime() || 0;

    return bTime - aTime;
  });

  if (!normalizedSearch) return sortedNotes;

  return sortedNotes.filter((note) => {
    const contributionText = (note.contributions || [])
      .map((entry) => `${entry.amount} ${entry.note || ""}`)
      .join(" ");

    const searchableText = [
      note.name,
      note.targetAmount,
      note.savedAmount,
      note.notes,
      note.itemLink,
      contributionText,
      note.createdAt ? new Date(note.createdAt).toLocaleString() : "",
      note.updatedAt ? new Date(note.updatedAt).toLocaleString() : "",
    ]
      .join(" ")
      .toLowerCase();

    return searchableText.includes(normalizedSearch);
  });
}
