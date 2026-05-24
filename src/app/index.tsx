import { useRouter } from "expo-router";
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

import { NoteCard } from "../components/NoteCard";
import { useBudgetNotes } from "../hooks/useBudgetNotes";

export default function HomeScreen() {
  const router = useRouter();

  const {
    visibleBudgets,
    searchVisible,
    searchQuery,
    setSearchVisible,
    setSearchQuery,
    confirmDeleteBudget,
    renameBudget,
  } = useBudgetNotes();

  function resetSearchInBackground() {
    setTimeout(() => {
      setSearchVisible(false);
      setSearchQuery("");
    }, 300);
  }

  function createNewBudget() {
    const id = Date.now().toString();

    router.push(`/budget/${id}` as any);
    resetSearchInBackground();
  }

  function openBudgetNote(id: string) {
    router.push(`/budget/${id}` as any);
    resetSearchInBackground();
  }

  function handleScroll(event: NativeSyntheticEvent<NativeScrollEvent>) {
    const yOffset = event.nativeEvent.contentOffset.y;

    if (yOffset < -24) {
      setSearchVisible(true);
    }
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      onScroll={handleScroll}
      scrollEventThrottle={16}
      alwaysBounceVertical
    >
      <View style={styles.simpleHeader}>
        <Text style={styles.simpleTitle}>Budget Note</Text>

        <Text style={styles.simpleSubtitle}>
          Plan today, spend confidently.
        </Text>
      </View>

      <Pressable style={styles.newButton} onPress={createNewBudget}>
        <Text style={styles.newButtonText}>+ New Note</Text>
      </Pressable>

      {searchVisible && (
        <TextInput
          style={styles.searchInput}
          placeholder="Search notes..."
          placeholderTextColor="#8A98A8"
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      )}

      {visibleBudgets.length === 0 && (
        <View style={styles.emptyCard}>
          <Text style={styles.emptyTitle}>
            {searchQuery.trim() ? "No matches found." : "Nothing here yet."}
          </Text>

          <Text style={styles.emptyText}>
            {searchQuery.trim()
              ? "Try searching by title, item, amount, or date."
              : "Start a note when you want a clearer picture before spending."}
          </Text>
        </View>
      )}

      {visibleBudgets.map((budget) => (
        <NoteCard
          key={budget.id}
          budget={budget}
          onPress={() => openBudgetNote(budget.id)}
          onDelete={() => confirmDeleteBudget(budget.id)}
          onRename={(newTitle) => renameBudget(budget.id, newTitle)}
        />
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
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

  simpleTitle: {
    color: "#FFFFFF",
    fontSize: 42,
    fontWeight: "900",
    letterSpacing: -1,
  },

  simpleSubtitle: {
    color: "#8A98A8",
    fontSize: 16,
    fontWeight: "700",
    marginTop: 6,
    lineHeight: 22,
  },

  newButton: {
    backgroundColor: "#2ECC71",
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
    borderColor: "#3B4D5F",
    marginBottom: 18,
  },

  emptyCard: {
    backgroundColor: "#1B2633",
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: "#344657",
    marginBottom: 14,
  },

  emptyTitle: {
    color: "#FFFFFF",
    fontSize: 20,
    fontWeight: "900",
    marginBottom: 6,
  },

  emptyText: {
    color: "#CAD3DD",
    fontSize: 15,
    fontWeight: "700",
    lineHeight: 21,
  },
});
