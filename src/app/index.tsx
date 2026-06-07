import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFocusEffect, useRouter } from "expo-router";
import { usePostHog } from "posthog-react-native";
import { useCallback, useEffect, useState } from "react";
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
import { loadDeletedBudgets } from "../storage/budgetStorage";

type HomeTutorialStep = "hidden" | "popup" | "highlightNewNote";

export default function HomeScreen() {
  const router = useRouter();
  const posthog = usePostHog();

  const [homeTutorialStep, setHomeTutorialStep] =
    useState<HomeTutorialStep>("hidden");

  const [deletedCount, setDeletedCount] = useState(0);

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

  useFocusEffect(
    useCallback(() => {
      async function refreshDeletedCount() {
        const deletedBudgets = await loadDeletedBudgets();

        setDeletedCount(deletedBudgets.length);
      }

      refreshDeletedCount();
    }, []),
  );

  async function completeWelcomeTutorial() {
    posthog?.capture("tutorial_completed", {
      tutorialVersion: "welcome_v1",
      source: "welcome_overlay",
    });

    await AsyncStorage.setItem("budget-note-welcome-tutorial-complete", "true");

    setHomeTutorialStep("hidden");
  }

  function replayWelcomeTutorial() {
    setHomeTutorialStep("popup");

    posthog?.capture("welcome_tutorial_replayed");
  }

  function resetSearchInBackground() {
    setTimeout(() => {
      setSearchVisible(false);
      setSearchQuery("");
    }, 300);
  }

  async function createNewBudget() {
    posthog?.capture("budget_created", {
      existingBudgetCount: visibleBudgets.length,
      source:
        homeTutorialStep === "highlightNewNote"
          ? "welcome_tutorial"
          : "main_menu",
    });

    await completeWelcomeTutorial();

    const id = Date.now().toString();

    router.push(`/budget/${id}` as any);

    resetSearchInBackground();
  }

  function openBudgetNote(id: string) {
    posthog?.capture("budget_opened", {
      existingBudgetCount: visibleBudgets.length,
    });

    router.push(`/budget/${id}` as any);

    resetSearchInBackground();
  }

  function handleScroll(event: NativeSyntheticEvent<NativeScrollEvent>) {
    const yOffset = event.nativeEvent.contentOffset.y;

    if (yOffset < -24 && !searchVisible) {
      posthog?.capture("search_used", {
        source: "main_menu_pull_down",
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
      >
        <View style={styles.simpleHeader}>
          <Text style={styles.simpleTitle}>Budget Note</Text>

          <View style={styles.subtitleRow}>
            <Text style={styles.simpleSubtitle} numberOfLines={1}>
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
          <Text style={styles.newButtonText}>+ New Budget</Text>
        </Pressable>

        {homeTutorialStep === "highlightNewNote" && (
          <Text style={styles.highlightText}>Tap here to continue</Text>
        )}

        {searchVisible && (
          <TextInput
            style={styles.searchInput}
            placeholder="Search budgets..."
            placeholderTextColor="#8A98A8"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        )}

        {visibleBudgets.length === 0 && (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyTitle}>
              {searchQuery.trim() ? "No matches found." : "No budgets yet."}
            </Text>

            <Text style={styles.emptyText}>
              {searchQuery.trim()
                ? "Try searching by title, item, amount, or total."
                : "Start a budget when you want a clearer picture before spending."}
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
        <Pressable
          style={styles.deletedButton}
          onPress={() => router.push("/deleted-budgets" as any)}
        >
          <Text style={styles.deletedButtonText}>
            {deletedCount > 0
              ? `Recently Deleted (${deletedCount})`
              : "Recently Deleted"}
          </Text>
        </Pressable>
      </ScrollView>

      {homeTutorialStep === "popup" && (
        <TutorialOverlay
          title="Hi, welcome to Budget Note."
          body="Tap “+ New Budget” to start your first budget."
          buttonText="OK"
          onNext={() => setHomeTutorialStep("highlightNewNote")}
          onSkip={() => {
            posthog?.capture("tutorial_skipped", {
              tutorialVersion: "welcome_v1",
              source: "welcome_overlay",
            });

            completeWelcomeTutorial();
          }}
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
    paddingRight: 34,
  },

  simpleSubtitle: {
    color: "#8A98A8",
    fontSize: 15,
    fontWeight: "700",
    lineHeight: 20,
    width: "100%",
  },

  helpButton: {
    position: "absolute",
    right: 0,
    top: 1,
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: "#243342",
    borderWidth: 1,
    borderColor: "#3B4D5F",
    alignItems: "center",
    justifyContent: "center",
  },

  helpButtonText: {
    color: "#CAD3DD",
    fontSize: 13,
    fontWeight: "900",
    lineHeight: 14,
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
