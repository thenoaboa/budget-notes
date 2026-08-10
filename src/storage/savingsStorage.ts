import AsyncStorage from "@react-native-async-storage/async-storage";

import type { SavingsNote } from "../types/savingsNote";

const SAVINGS_NOTES_STORAGE_KEY = "budget-note-savings-notes";
const DELETED_SAVINGS_NOTES_STORAGE_KEY = "budget-note-deleted-savings-notes";

function normalizeSavingsNote(note: SavingsNote): SavingsNote {
  return {
    ...note,
    name: (note.name || "").trim(),
    targetAmount: note.targetAmount || "",
    savedAmount: note.savedAmount || "",
  };
}

export async function loadSavingsNotes() {
  const savedNotes = await AsyncStorage.getItem(SAVINGS_NOTES_STORAGE_KEY);
  const parsedNotes: SavingsNote[] = savedNotes ? JSON.parse(savedNotes) : [];

  return parsedNotes.map(normalizeSavingsNote);
}

export async function loadDeletedSavingsNotes() {
  const savedNotes = await AsyncStorage.getItem(
    DELETED_SAVINGS_NOTES_STORAGE_KEY,
  );
  const parsedNotes: SavingsNote[] = savedNotes ? JSON.parse(savedNotes) : [];

  return parsedNotes.map(normalizeSavingsNote);
}

export async function saveSavingsNotes(notes: SavingsNote[]) {
  await AsyncStorage.setItem(SAVINGS_NOTES_STORAGE_KEY, JSON.stringify(notes));
}

export async function createSavingsNote(input: {
  name: string;
  targetAmount: string;
  savedAmount: string;
}) {
  const notes = await loadSavingsNotes();
  const now = new Date().toISOString();

  const newNote: SavingsNote = {
    id: Date.now().toString(),
    name: input.name.trim(),
    targetAmount: input.targetAmount,
    savedAmount: input.savedAmount,
    createdAt: now,
    updatedAt: now,
  };

  await saveSavingsNotes([newNote, ...notes]);

  return newNote;
}

export async function updateSavingsNoteById(
  noteId: string,
  updates: Partial<Pick<SavingsNote, "name" | "targetAmount" | "savedAmount">>,
) {
  const notes = await loadSavingsNotes();

  const updatedNotes = notes.map((note) =>
    note.id === noteId
      ? {
          ...note,
          ...updates,
          name: updates.name !== undefined ? updates.name.trim() : note.name,
          updatedAt: new Date().toISOString(),
        }
      : note,
  );

  await saveSavingsNotes(updatedNotes);

  return updatedNotes.find((note) => note.id === noteId) ?? null;
}

export async function deleteSavingsNoteById(
  notes: SavingsNote[],
  noteId: string,
) {
  const noteToDelete = notes.find((note) => note.id === noteId);
  if (!noteToDelete) return notes;

  const updatedNotes = notes.filter((note) => note.id !== noteId);
  const deletedNotes = await loadDeletedSavingsNotes();

  await AsyncStorage.setItem(
    DELETED_SAVINGS_NOTES_STORAGE_KEY,
    JSON.stringify([
      { ...noteToDelete, deletedAt: new Date().toISOString() },
      ...deletedNotes,
    ]),
  );

  await saveSavingsNotes(updatedNotes);
  return updatedNotes;
}

export async function renameSavingsNoteById(
  notes: SavingsNote[],
  noteId: string,
  newName: string,
) {
  const cleanedName = newName.trim();
  const updatedNotes = notes.map((note) =>
    note.id === noteId
      ? { ...note, name: cleanedName, updatedAt: new Date().toISOString() }
      : note,
  );

  await saveSavingsNotes(updatedNotes);
  return updatedNotes;
}

export async function duplicateSavingsNoteById(noteId: string) {
  const notes = await loadSavingsNotes();
  const originalNote = notes.find((note) => note.id === noteId);
  if (!originalNote) return null;

  const originalName = (originalNote.name || "").trim();
  const baseName = originalName ? `${originalName} Copy` : "Savings Copy";

  let duplicateName = baseName;
  let copyNumber = 1;

  while (notes.some((note) => note.name === duplicateName)) {
    duplicateName = `${baseName} ${copyNumber}`;
    copyNumber += 1;
  }

  const now = new Date().toISOString();
  const duplicatedNote: SavingsNote = {
    ...originalNote,
    id: Date.now().toString(),
    name: duplicateName,
    createdAt: now,
    updatedAt: now,
    deletedAt: undefined,
  };

  await saveSavingsNotes([duplicatedNote, ...notes]);
  return duplicatedNote;
}

export async function restoreDeletedSavingsNoteById(noteId: string) {
  const notes = await loadSavingsNotes();
  const deletedNotes = await loadDeletedSavingsNotes();
  const noteToRestore = deletedNotes.find((note) => note.id === noteId);

  if (!noteToRestore) return { notes, deletedNotes };

  const restoredNote: SavingsNote = {
    ...noteToRestore,
    deletedAt: undefined,
    updatedAt: new Date().toISOString(),
  };

  const updatedDeletedNotes = deletedNotes.filter((note) => note.id !== noteId);
  const updatedNotes = [restoredNote, ...notes];

  await saveSavingsNotes(updatedNotes);
  await AsyncStorage.setItem(
    DELETED_SAVINGS_NOTES_STORAGE_KEY,
    JSON.stringify(updatedDeletedNotes),
  );

  return { notes: updatedNotes, deletedNotes: updatedDeletedNotes };
}

export async function permanentlyDeleteSavingsNoteById(noteId: string) {
  const deletedNotes = await loadDeletedSavingsNotes();
  const updatedDeletedNotes = deletedNotes.filter((note) => note.id !== noteId);

  await AsyncStorage.setItem(
    DELETED_SAVINGS_NOTES_STORAGE_KEY,
    JSON.stringify(updatedDeletedNotes),
  );

  return updatedDeletedNotes;
}
