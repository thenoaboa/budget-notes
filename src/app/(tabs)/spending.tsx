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

import { NoteCard } from "../../components/NoteCard";
import { TutorialOverlay } from "../../components/TutorialOverlay";
import { useBudgetNotes } from "../../hooks/useBudgetNotes";
import { loadDeletedBudgets } from "../../storage/budgetStorage";

type HomeTutorialStep =
  | "hidden"
  | "billIntro"
  | "billMission"
  | "popup"
  | "highlightNewNote";

const SHOW_LEGACY_HELP_BUTTON = false;

export default function SpendingScreen() {
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
    duplicateBudget,
  } = useBudgetNotes();

  useEffect(() => {
    async function loadWelcomeTutorial() {
      const completed = await AsyncStorage.getItem(
        "budget-note-welcome-tutorial-complete",
      );

      if (!completed) {
        setHomeTutorialStep("billIntro");
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
    setHomeTutorialStep("billIntro");
    posthog?.capture("welcome_tutorial_replayed");
  }

  function goHome() {
    posthog?.capture("home_opened", {
      source: "spending_header_bill",
    });

    router.replace("/home" as any);
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

    const shouldStartBudgetTutorial = homeTutorialStep === "highlightNewNote";

    await completeWelcomeTutorial();

    if (shouldStartBudgetTutorial) {
      await AsyncStorage.removeItem("budget-note-tutorial-complete-v2");
    }

    const id = Date.now().toString();

    router.push(
      `/budget/${id}?showNamePrompt=1&startTutorial=${
        shouldStartBudgetTutorial ? "1" : "0"
      }` as any,
    );

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
          <View style={styles.headerRow}>
            <View style={styles.headerText}>
              <Text style={styles.simpleTitle}>Spending</Text>

              <Text style={styles.simpleSubtitle} numberOfLines={1}>
                Plan before you spend.
              </Text>
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

          {SHOW_LEGACY_HELP_BUTTON && (
            <Pressable
              style={styles.helpButton}
              onPress={replayWelcomeTutorial}
              accessibilityRole="button"
              accessibilityLabel="Replay welcome tutorial"
            >
              <Text style={styles.helpButtonText}>?</Text>
            </Pressable>
          )}
        </View>

        <Pressable
          style={[
            styles.newButton,
            homeTutorialStep === "highlightNewNote" &&
              styles.highlightedNewButton,
          ]}
          onPress={createNewBudget}
        >
          <Text style={styles.newButtonText}>+ New Spend Note</Text>
        </Pressable>

        {homeTutorialStep === "highlightNewNote" && (
          <Text style={styles.highlightText}>
            Tap + New Spend Note to continue
          </Text>
        )}

        {searchVisible && (
          <TextInput
            style={styles.searchInput}
            placeholder="Search spending notes..."
            placeholderTextColor="#8A98A8"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        )}

        {visibleBudgets.length === 0 && (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyTitle}>
              {searchQuery.trim()
                ? "No matches found."
                : "No spending notes yet."}
            </Text>

            <Text style={styles.emptyText}>
              {searchQuery.trim()
                ? "Try searching by title, item, amount, or total."
                : "Create a spending note when you want a clearer picture before spending."}
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
            onDuplicate={() => duplicateBudget(budget.id)}
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

      {homeTutorialStep === "billIntro" && (
        <TutorialOverlay
          title="Hi, I’m Bill."
          body="I’m your budget guide, and I’m here to help you plan before you spend."
          buttonText="Next"
          onNext={() => setHomeTutorialStep("billMission")}
          onSkip={async () => {
            posthog?.capture("tutorial_skipped", {
              tutorialVersion: "welcome_v1",
              source: "bill_intro",
            });

            await AsyncStorage.setItem(
              "budget-note-tutorial-complete-v2",
              "skipped",
            );

            await completeWelcomeTutorial();
          }}
        />
      )}

      {homeTutorialStep === "billMission" && (
        <TutorialOverlay
          title="One simple question"
          body="Whenever you’re thinking about spending money, I’ll help you answer: Can I afford this?"
          buttonText="Next"
          onNext={() => setHomeTutorialStep("popup")}
          onSkip={async () => {
            posthog?.capture("tutorial_skipped", {
              tutorialVersion: "welcome_v1",
              source: "bill_mission",
            });

            await AsyncStorage.setItem(
              "budget-note-tutorial-complete-v2",
              "skipped",
            );

            await completeWelcomeTutorial();
          }}
        />
      )}

      {homeTutorialStep === "popup" && (
        <TutorialOverlay
          title="Let’s build your first spending note"
          body="Press the “+ New Spend Note” button to get started."
          buttonText="Show Me"
          onNext={() => setHomeTutorialStep("highlightNewNote")}
          onSkip={async () => {
            posthog?.capture("tutorial_skipped", {
              tutorialVersion: "welcome_v1",
              source: "welcome_overlay",
            });

            await AsyncStorage.setItem(
              "budget-note-tutorial-complete-v2",
              "skipped",
            );

            await completeWelcomeTutorial();
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
    position: "relative",
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
    color: "#8A98A8",
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

  helpButton: {
    position: "absolute",
    right: 56,
    top: 15,
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
    backgroundColor: "#18261D",
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: "#2ecc71",
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
