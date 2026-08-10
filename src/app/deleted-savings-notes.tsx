import { useFocusEffect, useRouter } from "expo-router";
import { useCallback, useState } from "react";
import {
    Alert,
    Platform,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    View,
} from "react-native";

import {
    loadDeletedSavingsNotes,
    permanentlyDeleteSavingsNoteById,
    restoreDeletedSavingsNoteById,
} from "../storage/savingsStorage";
import type { SavingsNote } from "../types/savingsNote";

type DeletedSavingsNote = SavingsNote & {
  deletedAt?: string;
};

export default function DeletedSavingsNotesScreen() {
  const router = useRouter();
  const [deletedNotes, setDeletedNotes] = useState<DeletedSavingsNote[]>([]);

  useFocusEffect(
    useCallback(() => {
      async function refreshDeletedNotes() {
        const loadedNotes = await loadDeletedSavingsNotes();
        setDeletedNotes(loadedNotes);
      }

      refreshDeletedNotes();
    }, []),
  );

  async function restoreNote(noteId: string) {
    const result = await restoreDeletedSavingsNoteById(noteId);
    setDeletedNotes(result.deletedNotes);
  }

  async function deleteForever(noteId: string) {
    const updatedNotes = await permanentlyDeleteSavingsNoteById(noteId);
    setDeletedNotes(updatedNotes);
  }

  function confirmDeleteForever(noteId: string) {
    if (Platform.OS === "web") {
      const confirmed = window.confirm("Delete this savings note forever?");

      if (confirmed) {
        deleteForever(noteId);
      }

      return;
    }

    Alert.alert("Delete forever?", "This cannot be undone.", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete Forever",
        style: "destructive",
        onPress: () => deleteForever(noteId),
      },
    ]);
  }

  return (
    <View style={styles.screen}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
      >
        <Pressable style={styles.backButton} onPress={() => router.back()}>
          <Text style={styles.backButtonText}>← Back</Text>
        </Pressable>

        <Text style={styles.title}>Recently Deleted</Text>

        {deletedNotes.length === 0 && (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyTitle}>Nothing deleted.</Text>
            <Text style={styles.emptyText}>
              Deleted savings notes will show up here.
            </Text>
          </View>
        )}

        {deletedNotes.map((note) => (
          <View key={note.id} style={styles.card}>
            <Text style={styles.cardTitle}>
              {(note.name || "").trim() || "Untitled Savings Goal"}
            </Text>

            <Text style={styles.deletedDate}>
              {note.deletedAt
                ? `Deleted ${new Date(note.deletedAt).toLocaleDateString()}`
                : "Deleted recently"}
            </Text>

            <View style={styles.buttonRow}>
              <Pressable
                style={[styles.actionButton, styles.restoreButton]}
                onPress={() => restoreNote(note.id)}
              >
                <Text style={styles.restoreButtonText}>Restore</Text>
              </Pressable>

              <Pressable
                style={[styles.actionButton, styles.deleteButton]}
                onPress={() => confirmDeleteForever(note.id)}
              >
                <Text style={styles.deleteButtonText}>Delete Forever</Text>
              </Pressable>
            </View>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#101820",
  },

  container: {
    flex: 1,
    backgroundColor: "#101820",
  },

  content: {
    paddingHorizontal: 16,
    paddingTop: 58,
    paddingBottom: 120,
  },

  backButton: {
    marginBottom: 18,
  },

  backButtonText: {
    color: "#A9D3FF",
    fontSize: 16,
    fontWeight: "900",
  },

  title: {
    color: "#FFFFFF",
    fontSize: 34,
    fontWeight: "900",
    marginBottom: 18,
  },

  emptyCard: {
    backgroundColor: "#1C2A3F",
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: "#2E5F8F",
  },

  emptyTitle: {
    color: "#FFFFFF",
    fontSize: 20,
    fontWeight: "900",
    marginBottom: 6,
  },

  emptyText: {
    color: "#D7EBFF",
    fontSize: 15,
    fontWeight: "700",
  },

  card: {
    backgroundColor: "#1C2A3F",
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: "#2E5F8F",
    marginBottom: 14,
  },

  cardTitle: {
    color: "#FFFFFF",
    fontSize: 20,
    fontWeight: "900",
    marginBottom: 6,
  },

  deletedDate: {
    color: "#8A98A8",
    fontSize: 14,
    fontWeight: "700",
    marginBottom: 14,
  },

  buttonRow: {
    flexDirection: "row",
    gap: 10,
  },

  actionButton: {
    flex: 1,
    borderRadius: 14,
    paddingVertical: 12,
    alignItems: "center",
  },

  restoreButton: {
    backgroundColor: "#4EA8FF",
  },

  restoreButtonText: {
    color: "#101820",
    fontSize: 14,
    fontWeight: "900",
  },

  deleteButton: {
    backgroundColor: "#3A1F24",
    borderWidth: 1,
    borderColor: "#7A2E38",
  },

  deleteButtonText: {
    color: "#FFB4BE",
    fontSize: 14,
    fontWeight: "900",
  },
});
