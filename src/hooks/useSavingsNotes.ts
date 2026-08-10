import { useFocusEffect } from "expo-router";
import { useCallback, useMemo, useState } from "react";
import { Alert, Platform } from "react-native";

import {
  deleteSavingsNoteById,
  duplicateSavingsNoteById,
  loadSavingsNotes,
  renameSavingsNoteById,
} from "../storage/savingsStorage";
import type { SavingsNote } from "../types/savingsNote";
import { getVisibleSavingsNotes } from "../utils/savingsSearch";

export function useSavingsNotes() {
  const [notes, setNotes] = useState<SavingsNote[]>([]);
  const [searchVisible, setSearchVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const refreshNotes = useCallback(async () => {
    const loadedNotes = await loadSavingsNotes();
    setNotes(loadedNotes);
  }, []);

  useFocusEffect(
    useCallback(() => {
      refreshNotes();
    }, [refreshNotes]),
  );

  async function deleteSavingsNote(noteId: string) {
    const updatedNotes = await deleteSavingsNoteById(notes, noteId);
    setNotes(updatedNotes);
  }

  async function renameSavingsNote(noteId: string, newName: string) {
    const updatedNotes = await renameSavingsNoteById(notes, noteId, newName);
    setNotes(updatedNotes);
  }

  async function duplicateSavingsNote(noteId: string) {
    await duplicateSavingsNoteById(noteId);
    await refreshNotes();
  }

  function confirmDeleteSavingsNote(noteId: string) {
    if (Platform.OS === "web") {
      const confirmed = window.confirm(
        "Are you sure you want to delete this savings note?",
      );

      if (confirmed) deleteSavingsNote(noteId);
      return;
    }

    Alert.alert(
      "Delete savings note?",
      "Are you sure you want to delete this savings note?",
      [
        { text: "No", style: "cancel" },
        {
          text: "Yes",
          style: "destructive",
          onPress: () => deleteSavingsNote(noteId),
        },
      ],
    );
  }

  const visibleSavingsNotes = useMemo(
    () => getVisibleSavingsNotes(notes, searchQuery),
    [notes, searchQuery],
  );

  return {
    notes,
    visibleSavingsNotes,
    searchVisible,
    searchQuery,
    setSearchVisible,
    setSearchQuery,
    refreshNotes,
    deleteSavingsNote,
    renameSavingsNote,
    duplicateSavingsNote,
    confirmDeleteSavingsNote,
  };
}
