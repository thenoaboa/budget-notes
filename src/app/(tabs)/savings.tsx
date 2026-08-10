// Save as: src/app/(tabs)/savings.tsx

import { useFocusEffect, useRouter } from "expo-router";
import { usePostHog } from "posthog-react-native";
import { useCallback, useState } from "react";
import {
  NativeScrollEvent,
  NativeSyntheticEvent,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

import { SavingsNotesCard } from "../../components/SavingsNotesCard";
import { useSavingsNotes } from "../../hooks/useSavingsNotes";
import {
  createSavingsNote,
  loadDeletedSavingsNotes,
} from "../../storage/savingsStorage";

const SAVINGS_BLUE = "#4EA8FF";
const SAVINGS_BLUE_LIGHT = "#A9D3FF";
const SAVINGS_CARD = "#1C2A3F";

export default function SavingsScreen() {
  const router = useRouter();
  const posthog = usePostHog();

  const [deletedCount, setDeletedCount] = useState(0);

  const {
    visibleSavingsNotes,
    searchVisible,
    searchQuery,
    setSearchVisible,
    setSearchQuery,
    confirmDeleteSavingsNote,
    renameSavingsNote,
    duplicateSavingsNote,
  } = useSavingsNotes();

  useFocusEffect(
    useCallback(() => {
      async function refreshDeletedCount() {
        const deletedSavingsNotes = await loadDeletedSavingsNotes();
        setDeletedCount(deletedSavingsNotes.length);
      }

      void refreshDeletedCount();
    }, []),
  );

  function goHome() {
    posthog?.capture("home_opened", {
      source: "savings_header_bill",
    });

    router.replace("/home" as any);
  }

  function resetSearchInBackground() {
    setTimeout(() => {
      setSearchVisible(false);
      setSearchQuery("");
    }, 300);
  }

  async function createNewSavingsNote() {
    posthog?.capture("savings_note_created", {
      existingSavingsNoteCount: visibleSavingsNotes.length,
      source: "savings_menu",
    });

    const newNote = await createSavingsNote({
      name: "",
      targetAmount: "",
      savedAmount: "",
    });

    router.push(`/savings-note/${newNote.id}?showNamePrompt=1` as any);

    resetSearchInBackground();
  }

  function openSavingsNote(id: string) {
    posthog?.capture("savings_note_opened", {
      existingSavingsNoteCount: visibleSavingsNotes.length,
    });

    router.push(`/savings-note/${id}` as any);
    resetSearchInBackground();
  }

  function handleScroll(event: NativeSyntheticEvent<NativeScrollEvent>) {
    const yOffset = event.nativeEvent.contentOffset.y;

    if (yOffset < -24 && !searchVisible) {
      posthog?.capture("savings_search_used", {
        source: "savings_menu_pull_down",
      });

      setSearchVisible(true);
    }
  }

  return (
    <View style={styles.screen}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        alwaysBounceVertical
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.simpleHeader}>
          <View style={styles.headerRow}>
            <View style={styles.headerText}>
              <Text style={styles.simpleTitle}>Savings</Text>

              <Text style={styles.simpleSubtitle}>Plan and track savings.</Text>
            </View>

            <Pressable
              style={({ pressed }) => [
                styles.billHomeButton,
                pressed && styles.pressedButton,
              ]}
              onPress={goHome}
              hitSlop={10}
              accessibilityRole="button"
              accessibilityLabel="Go to Budget Note home"
            >
              <Text style={styles.billIcon}>🐷</Text>
            </Pressable>
          </View>
        </View>

        <Pressable
          style={({ pressed }) => [
            styles.newButton,
            pressed && styles.pressedButton,
          ]}
          onPress={createNewSavingsNote}
          accessibilityRole="button"
          accessibilityLabel="Create a new savings note"
        >
          <Text style={styles.newButtonText}>+ New Savings Note</Text>
        </Pressable>

        {searchVisible && (
          <TextInput
            style={styles.searchInput}
            placeholder="Search savings notes..."
            placeholderTextColor="#6F89A6"
            value={searchQuery}
            onChangeText={setSearchQuery}
            autoCapitalize="none"
            autoCorrect={false}
            returnKeyType="search"
          />
        )}

        {visibleSavingsNotes.length === 0 && (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyTitle}>
              {searchQuery.trim()
                ? "No matches found."
                : "No savings notes yet."}
            </Text>

            <Text style={styles.emptyText}>
              {searchQuery.trim()
                ? "Try searching by goal name, amount saved, or target amount."
                : "Create a savings note when you're ready to start working toward a goal."}
            </Text>
          </View>
        )}

        {visibleSavingsNotes.map((note) => (
          <SavingsNotesCard
            key={note.id}
            note={note}
            onPress={() => openSavingsNote(note.id)}
            onDelete={() => confirmDeleteSavingsNote(note.id)}
            onRename={(newName) => renameSavingsNote(note.id, newName)}
            onDuplicate={() => duplicateSavingsNote(note.id)}
          />
        ))}

        <Pressable
          style={({ pressed }) => [
            styles.deletedButton,
            pressed && styles.pressedButton,
          ]}
          onPress={() => router.push("/deleted-savings-notes" as any)}
          accessibilityRole="button"
          accessibilityLabel="Open recently deleted savings notes"
        >
          <Text style={styles.deletedButtonText}>
            {deletedCount > 0
              ? `Recently Deleted (${deletedCount})`
              : "Recently Deleted"}
          </Text>
        </Pressable>
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
    backgroundColor: "#101820",
  },

  simpleHeader: {
    marginBottom: 22,
  },

  headerRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
  },

  headerText: {
    flex: 1,
    paddingRight: 14,
  },

  simpleTitle: {
    color: "#FFFFFF",
    fontSize: 42,
    fontWeight: "900",
    letterSpacing: -1,
  },

  simpleSubtitle: {
    color: SAVINGS_BLUE_LIGHT,
    fontSize: 15,
    fontWeight: "700",
    lineHeight: 20,
    marginTop: 6,
  },

  billHomeButton: {
    width: 48,
    height: 48,
    borderRadius: 16,
    backgroundColor: "#1B2633",
    borderWidth: 1,
    borderColor: "#344657",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 2,
  },

  pressedButton: {
    opacity: 0.7,
  },

  billIcon: {
    fontSize: 27,
  },

  newButton: {
    backgroundColor: SAVINGS_BLUE,
    borderRadius: 16,
    paddingVertical: 15,
    alignItems: "center",
    marginBottom: 14,
  },

  newButtonText: {
    color: "#101820",
    fontSize: 17,
    fontWeight: "900",
  },

  searchInput: {
    backgroundColor: "#243342",
    color: "#FFFFFF",
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    fontWeight: "800",
    borderWidth: 1,
    borderColor: "#3B5F82",
    marginBottom: 18,
  },

  emptyCard: {
    backgroundColor: SAVINGS_CARD,
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: SAVINGS_BLUE,
    marginBottom: 14,
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
    lineHeight: 21,
  },

  deletedButton: {
    marginTop: 10,
    backgroundColor: "#1B2633",
    borderRadius: 16,
    paddingVertical: 14,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#344657",
  },

  deletedButtonText: {
    color: "#CAD3DD",
    fontSize: 15,
    fontWeight: "900",
  },
});
