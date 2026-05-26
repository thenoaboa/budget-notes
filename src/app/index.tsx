import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
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
import { TutorialOverlay } from "../components/TutorialOverlay";
import { useBudgetNotes } from "../hooks/useBudgetNotes";

type HomeTutorialStep = "hidden" | "popup" | "highlightNewNote";

export default function HomeScreen() {
  const router = useRouter();

  const [homeTutorialStep, setHomeTutorialStep] =
    useState<HomeTutorialStep>("hidden");

  const {
    visibleBudgets,
    searchVisible,
    searchQuery,
    setSearchVisible,
    setSearchQuery,
    confirmDeleteBudget,
    renameBudget,
  } = useBudgetNotes();

  useEffect(() => {
    async function loadWelcomeTutorial() {
      const completed = await AsyncStorage.getItem(
        "budget-note-welcome-tutorial-complete",
      );

      if (!completed) {
        setHomeTutorialStep("popup");
      }
    }

    loadWelcomeTutorial();
  }, []);

  async function completeWelcomeTutorial() {
    await AsyncStorage.setItem("budget-note-welcome-tutorial-complete", "true");

    setHomeTutorialStep("hidden");
  }

  function replayWelcomeTutorial() {
    setHomeTutorialStep("popup");
  }

  function resetSearchInBackground() {
    setTimeout(() => {
      setSearchVisible(false);
      setSearchQuery("");
    }, 300);
  }

  async function createNewBudget() {
    await completeWelcomeTutorial();

    await AsyncStorage.removeItem("budget-note-tutorial-complete-v2");

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
    <View style={styles.screen}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        alwaysBounceVertical
      >
        <View style={styles.simpleHeader}>
          <Text style={styles.simpleTitle}>Budget Note</Text>

          <View style={styles.subtitleRow}>
            <Text style={styles.simpleSubtitle}>
              Plan today, spend confidently.
            </Text>

            <Pressable
              style={styles.helpButton}
              onPress={replayWelcomeTutorial}
            >
              <Text style={styles.helpButtonText}>?</Text>
            </Pressable>
          </View>
        </View>

        <Pressable
          style={[
            styles.newButton,
            homeTutorialStep === "highlightNewNote" &&
              styles.highlightedNewButton,
          ]}
          onPress={createNewBudget}
        >
          <Text style={styles.newButtonText}>+ New Note</Text>
        </Pressable>

        {homeTutorialStep === "highlightNewNote" && (
          <Text style={styles.highlightText}>Tap here to continue</Text>
        )}

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

      {homeTutorialStep === "popup" && (
        <TutorialOverlay
          title="Hi, welcome to Budget Note."
          body="Tap “+ New Note” to start your first budget."
          buttonText="OK"
          onNext={() => setHomeTutorialStep("highlightNewNote")}
          onSkip={completeWelcomeTutorial}
        />
      )}
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

  simpleTitle: {
    color: "#FFFFFF",
    fontSize: 42,
    fontWeight: "900",
    letterSpacing: -1,
  },

  subtitleRow: {
    position: "relative",
    marginTop: 6,
    paddingRight: 52,
  },

  simpleSubtitle: {
    color: "#8A98A8",
    fontSize: 16,
    fontWeight: "700",
    lineHeight: 22,
  },
  helpButton: {
    position: "absolute",
    right: 0,
    top: 2,

    width: 26,
    height: 26,
    borderRadius: 13,

    backgroundColor: "#243342",
    borderWidth: 1,
    borderColor: "#3B4D5F",

    alignItems: "center",
    justifyContent: "center",
  },

  helpButtonText: {
    color: "#CAD3DD",
    fontSize: 15,
    fontWeight: "900",
    lineHeight: 16,
  },

  newButton: {
    backgroundColor: "#2ECC71",
    borderRadius: 16,
    paddingVertical: 15,
    alignItems: "center",
    marginBottom: 14,
  },

  highlightedNewButton: {
    borderWidth: 3,
    borderColor: "#FFFFFF",
    shadowColor: "#2ECC71",
    shadowOpacity: 0.9,
    shadowRadius: 18,
    shadowOffset: {
      width: 0,
      height: 0,
    },
    elevation: 12,
  },

  highlightText: {
    color: "#2ECC71",
    textAlign: "center",
    fontSize: 14,
    fontWeight: "900",
    marginBottom: 18,
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
