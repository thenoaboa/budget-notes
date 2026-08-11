import Ionicons from "@expo/vector-icons/Ionicons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFocusEffect, useRouter } from "expo-router";
import { usePostHog } from "posthog-react-native";
import { useCallback, useEffect, useState } from "react";
import {
  Alert,
  NativeScrollEvent,
  NativeSyntheticEvent,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

import { BillsCornerModal } from "../components/BillsCornerModal";
import { NoteCard } from "../components/NoteCard";
import { QuickShopModal } from "../components/QuickShopModal";
import { TutorialOverlay } from "../components/TutorialOverlay";
import { useBudgetNotes } from "../hooks/useBudgetNotes";
import {
  consumeQuickShopOpenRequest,
  createBudgetFromQuickShop,
  discardQuickShop,
  loadDeletedBudgets,
  quickShopDraftHasData,
  returnBudgetToQuickShopById,
} from "../storage/budgetStorage";

type HomeTutorialStep =
  | "hidden"
  | "billIntro"
  | "billMission"
  | "popup"
  | "highlightNewNote";

export default function SpendingScreen() {
  const router = useRouter();
  const posthog = usePostHog();

  const [homeTutorialStep, setHomeTutorialStep] =
    useState<HomeTutorialStep>("hidden");

  const [deletedCount, setDeletedCount] = useState(0);
  const [showBillsCornerModal, setShowBillsCornerModal] = useState(false);
  const [showQuickShopModal, setShowQuickShopModal] = useState(false);
  const [showCopiedMessage, setShowCopiedMessage] = useState(false);
  const [welcomeTutorialCompleted, setWelcomeTutorialCompleted] =
    useState(false);

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

      const isCompleted = completed === "true";

      setWelcomeTutorialCompleted(isCompleted);

      if (!completed) {
        setHomeTutorialStep("billIntro");
      }
    }

    void loadWelcomeTutorial();
  }, []);

  useFocusEffect(
    useCallback(() => {
      async function refreshHome() {
        const deletedBudgets = await loadDeletedBudgets();
        setDeletedCount(deletedBudgets.length);

        const shouldOpenQuickShop = await consumeQuickShopOpenRequest();

        if (shouldOpenQuickShop) {
          setShowQuickShopModal(true);
        }
      }

      void refreshHome();
    }, []),
  );

  async function completeWelcomeTutorial() {
    posthog?.capture("tutorial_completed", {
      tutorialVersion: "welcome_v1",
      source: "welcome_overlay",
    });

    await AsyncStorage.setItem("budget-note-welcome-tutorial-complete", "true");

    setWelcomeTutorialCompleted(true);
    setHomeTutorialStep("hidden");
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

  async function copyBudget(id: string) {
    await duplicateBudget(id);

    setShowCopiedMessage(true);

    setTimeout(() => {
      setShowCopiedMessage(false);
    }, 900);
  }

  async function finishReturnToQuickShop(
    budgetId: string,
    discardCurrentDraft: boolean,
  ) {
    const result = await returnBudgetToQuickShopById(
      budgetId,
      discardCurrentDraft,
    );

    if (!result.returned) {
      return;
    }

    posthog?.capture("budget_returned_to_quick_shop");

    router.replace("/" as any);
  }

  async function returnBudgetToQuickShop(budgetId: string) {
    const hasCurrentDraft = await quickShopDraftHasData();

    if (!hasCurrentDraft) {
      await finishReturnToQuickShop(budgetId, false);
      return;
    }

    const title = "Replace current Quick Shop?";
    const message =
      "You already have a Quick Shop in progress. Returning this budget will move your current Quick Shop to Recently Deleted.";

    if (Platform.OS === "web") {
      const confirmed = window.confirm(`${title}\n\n${message}`);

      if (confirmed) {
        await finishReturnToQuickShop(budgetId, true);
      }

      return;
    }

    Alert.alert(title, message, [
      {
        text: "Cancel",
        style: "cancel",
      },
      {
        text: "Replace & Return",
        onPress: () => {
          void finishReturnToQuickShop(budgetId, true);
        },
      },
    ]);
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
          <Text style={styles.simpleTitle}>BudgetNote</Text>

          <View style={styles.subtitleRow}>
            <Text style={styles.simpleSubtitle}>
              Plan today, spend confidently.
            </Text>

            <Pressable
              style={({ pressed }) => [
                styles.billHomeButton,
                pressed && styles.pressedButton,
              ]}
              onPress={() => setShowBillsCornerModal(true)}
              hitSlop={10}
              accessibilityRole="button"
              accessibilityLabel="Open Bill's Corner"
            >
              <Text style={styles.billIcon}>🐷</Text>
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
              {searchQuery.trim() ? "No matches found." : "No budgets yet."}
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
            onDuplicate={() => copyBudget(budget.id)}
            onReturnToQuickShop={
              budget.origin === "quickShop"
                ? () => returnBudgetToQuickShop(budget.id)
                : undefined
            }
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

      <Pressable
        style={({ pressed }) => [
          styles.quickShopButton,
          pressed && styles.pressedButton,
        ]}
        onPress={() => setShowQuickShopModal(true)}
        accessibilityRole="button"
        accessibilityLabel="Open Quick Shop"
      >
        <View style={styles.quickShopIconRow}>
          <Text style={styles.quickShopWind}>≋</Text>

          <Ionicons name="cart-outline" size={32} color="#B56CFF" />
        </View>
      </Pressable>

      {showCopiedMessage && (
        <View style={styles.copiedToast}>
          <Text style={styles.copiedToastText}>Budget Copied</Text>
        </View>
      )}

      <QuickShopModal
        visible={showQuickShopModal}
        onClose={() => setShowQuickShopModal(false)}
        onSave={async (prices) => {
          const newBudget = await createBudgetFromQuickShop(prices);

          setShowQuickShopModal(false);

          if (newBudget) {
            posthog?.capture("quick_shop_saved", {
              itemCount: prices.length,
            });

            router.push(`/budget/${newBudget.id}` as any);
          }
        }}
        onDiscard={async (prices) => {
          const discardedBudget = await discardQuickShop(prices);

          setShowQuickShopModal(false);

          if (discardedBudget) {
            posthog?.capture("quick_shop_discarded", {
              itemCount: prices.length,
            });

            const deletedBudgets = await loadDeletedBudgets();
            setDeletedCount(deletedBudgets.length);
          }
        }}
      />

      <BillsCornerModal
        visible={showBillsCornerModal}
        lessonOneCompleted={welcomeTutorialCompleted}
        onClose={() => setShowBillsCornerModal(false)}
        onStartTutorial={() => {
          setShowBillsCornerModal(false);
          setHomeTutorialStep("billIntro");

          posthog?.capture("welcome_tutorial_replayed");
        }}
        onOpenAbout={() => {
          setShowBillsCornerModal(false);
          router.push("/about" as any);
        }}
        onOpenContact={() => {
          setShowBillsCornerModal(false);
          router.push("/contact" as any);
        }}
        onOpenPrivacy={() => {
          setShowBillsCornerModal(false);
          router.push("/privacy" as any);
        }}
        onOpenTerms={() => {
          setShowBillsCornerModal(false);
          router.push("/terms" as any);
        }}
      />

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
    paddingBottom: 32,
    backgroundColor: "#101820",
  },

  simpleHeader: {
    position: "relative",
    marginBottom: 22,
  },

  subtitleRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 6,
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
  },

  billHomeButton: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: "#182638",
    borderWidth: 1,
    borderColor: "#344657",
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 3.5,
  },

  pressedButton: {
    opacity: 0.7,
  },

  billIcon: {
    fontSize: 20,
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
    backgroundColor: "#1b2738",
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: "#34495E",
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

  copiedToast: {
    position: "absolute",
    top: "45%",
    alignSelf: "center",
    backgroundColor: "rgba(0, 0, 0, 0.75)",
    paddingHorizontal: 26,
    paddingVertical: 14,
    borderRadius: 18,
    zIndex: 999,
  },

  copiedToastText: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "900",
  },

  quickShopButton: {
    position: "absolute",
    right: 18,
    bottom: 60,
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: "#243342",
    borderWidth: 2,
    borderColor: "#3B4D5F",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 100,
    elevation: 12,
    shadowColor: "#000000",
    shadowOpacity: 0.3,
    shadowRadius: 8,
    shadowOffset: {
      width: 0,
      height: 4,
    },
  },

  quickShopIconRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginLeft: -5,
  },

  quickShopWind: {
    color: "#B56CFF",
    fontSize: 28,
    fontWeight: "900",
    marginRight: -4,
    marginTop: -2,
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
