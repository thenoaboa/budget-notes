// Save as: src/app/budget/[id]/index.tsx

import AsyncStorage from "@react-native-async-storage/async-storage";
import { useLocalSearchParams, useRouter } from "expo-router";
import { usePostHog } from "posthog-react-native";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { AddItemOverlay } from "../../../components/AddItemOverlay";
import { BudgetActionButtons } from "../../../components/BudgetActionButtons";
import { BudgetHeaderCard } from "../../../components/BudgetHeaderCard";
import { BudgetNotesCard } from "../../../components/BudgetNotesCard";
import { BudgetSummaryBox } from "../../../components/BudgetSummary";
import { ReceiptItemOverlay } from "../../../components/ReceiptItemOverlay";
import { TutorialOverlay } from "../../../components/TutorialOverlay";
import { useBudgetEditor } from "../../../hooks/usebudgetEditor";
import {
  duplicateBudgetById,
  loadBudgets,
} from "../../../storage/budgetStorage";
import type { Budget } from "../../../types/budget";
import {
  trackItemAdded,
  trackItemDeleted,
  trackItemEdited,
  trackReceiptEdited,
  trackTutorialStepCompleted,
} from "../../../utils/budgetAnalytics";
import { compareBudgets } from "../../../utils/compareBudgets";

type TutorialStep =
  | "hidden"
  | "budgetPopup"
  | "budgetHighlight"
  | "addItemPopup"
  | "addItemHighlight"
  | "donePopup";

export default function BudgetDashboardScreen() {
  const router = useRouter();
  const posthog = usePostHog();
  const { id } = useLocalSearchParams();

  const budgetId = Array.isArray(id) ? id[0] : id;
  const editor = useBudgetEditor(budgetId);

  const exportRef = useRef<View>(null);

  const [tutorialStep, setTutorialStep] = useState<TutorialStep>("hidden");
  const tutorialStoppedRef = useRef(false);
  const tutorialTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [isDeletingItem, setIsDeletingItem] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [showCompareModal, setShowCompareModal] = useState(false);
  const [showCopiedMessage, setShowCopiedMessage] = useState(false);
  const [allBudgets, setAllBudgets] = useState<Budget[]>([]);
  const [comparedBudget, setComparedBudget] = useState<Budget | null>(null);
  const [showCompareCardMenu, setShowCompareCardMenu] = useState(false);

  const receiptItems = useMemo(() => {
    return [...editor.items].reverse();
  }, [editor.items]);

  const comparisonResults = comparedBudget
    ? compareBudgets(editor.items, comparedBudget)
    : {
        added: [],
        removed: [],
        increased: [],
        decreased: [],
      };

  function capture(eventName: string, properties?: any) {
    posthog?.capture(eventName, properties);
  }

  function advanceTutorialAfterTap(nextStep: TutorialStep) {
    if (tutorialTimeoutRef.current) {
      clearTimeout(tutorialTimeoutRef.current);
    }

    tutorialTimeoutRef.current = setTimeout(() => {
      if (tutorialStoppedRef.current) {
        return;
      }

      setTutorialStep(nextStep);
    }, 150);
  }

  useEffect(() => {
    async function loadTutorial() {
      const completed = await AsyncStorage.getItem(
        "budget-note-tutorial-complete-v2",
      );

      console.log("Tutorial completed value:", completed);

      if (completed !== "true" && completed !== "skipped") {
        capture("tutorial_started", {
          tutorialVersion: "budget_v2",
          source: "budget_screen",
        });

        setTutorialStep("budgetPopup");
      }
    }

    loadTutorial();
  }, []);

  async function completeTutorial() {
    tutorialStoppedRef.current = true;

    if (tutorialTimeoutRef.current) {
      clearTimeout(tutorialTimeoutRef.current);
    }
    capture("tutorial_completed", {
      tutorialVersion: "budget_v2",
      itemCount: editor.items.length,
      salesTaxEnabled: editor.salesTaxEnabled,
    });

    await AsyncStorage.setItem("budget-note-tutorial-complete-v2", "true");

    setTutorialStep("hidden");
  }

  async function skipTutorial() {
    tutorialStoppedRef.current = true;

    if (tutorialTimeoutRef.current) {
      clearTimeout(tutorialTimeoutRef.current);
    }
    capture("tutorial_skipped", {
      tutorialVersion: "budget_v2",
      step: tutorialStep,
      itemCount: editor.items.length,
      salesTaxEnabled: editor.salesTaxEnabled,
    });

    await AsyncStorage.setItem("budget-note-tutorial-complete-v2", "skipped");

    setTutorialStep("hidden");
  }

  function addItemFromDraftWithAnalytics() {
    trackItemAdded(capture, {
      existingItems: editor.items.length,
      salesTaxEnabled: editor.salesTaxEnabled,
      hasName: editor.draftItem.name.trim().length > 0,
      hasAmount: editor.draftItem.amount.trim().length > 0,
      quantity: editor.draftItem.quantity,
    });

    editor.addItemFromDraft();
  }

  function deleteItemWithAnalytics(itemId: number) {
    setIsDeletingItem(true);

    editor.closeReceiptItemOverlay();

    trackItemDeleted(capture, {
      itemCountBeforeDelete: editor.items.length,
      itemCountAfterDelete: Math.max(editor.items.length - 1, 0),
      salesTaxEnabled: editor.salesTaxEnabled,
    });

    setTimeout(() => {
      editor.deleteItem(itemId);

      setTimeout(() => {
        setIsDeletingItem(false);
      }, 250);
    }, 0);
  }

  function openReceiptItemOverlayWithAnalytics(itemId: number) {
    if (isDeletingItem) {
      return;
    }

    trackItemEdited(capture, {
      itemCount: editor.items.length,
      source: "receipt_card",
    });

    editor.openReceiptItemOverlay(itemId);
  }

  function openReceiptPage() {
    trackReceiptEdited(capture, {
      itemCount: editor.items.length,
      salesTaxEnabled: editor.salesTaxEnabled,
      totalSpent: editor.totalSpent,
    });

    router.push(`/budget/${budgetId}/items` as any);
  }

  function handleAddItemPress() {
    if (tutorialStep === "addItemHighlight") {
      trackTutorialStepCompleted(capture, "add_item_highlight");

      setTutorialStep("donePopup");
      return;
    }

    editor.openAddItemOverlay();
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        keyboardVerticalOffset={20}
      >
        <View style={styles.page}>
          <BudgetHeaderCard
            affirmingMessage={editor.affirmingMessage}
            safeToSpend={editor.safeToSpend}
            startingMoney={editor.startingMoney}
            setStartingMoney={editor.setStartingMoney}
            startingMoneyRef={editor.startingMoneyRef}
            headerSubtext={editor.headerSubtext}
            currentStyle={editor.currentStyle}
            headerTextColor={editor.headerTextColor}
            hasEnteredItems={editor.items.some(
              (item) => item.amount.trim() !== "",
            )}
            highlightBudgetAmount={tutorialStep === "budgetHighlight"}
            onBudgetAmountTutorialFocus={() => {
              if (tutorialStep === "budgetHighlight") {
                setTutorialStep("addItemPopup");
              }
            }}
            showMenu={showMenu}
            onMenuPress={() => {
              setShowMenu((previous) => !previous);
            }}
            onCompareBudgets={async () => {
              setShowMenu(false);

              const budgets = await loadBudgets();

              setAllBudgets(budgets.filter((budget) => budget.id !== budgetId));

              setShowCompareModal(true);
            }}
            onDuplicateBudget={async () => {
              if (!budgetId) {
                return;
              }

              setShowMenu(false);

              const duplicatedBudget = await duplicateBudgetById(budgetId);

              if (!duplicatedBudget) {
                return;
              }

              setShowCopiedMessage(true);

              setTimeout(() => {
                setShowCopiedMessage(false);
                router.replace(`/budget/${duplicatedBudget.id}` as any);
              }, 900);
            }}
          />

          <ScrollView
            style={styles.scroll}
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
            alwaysBounceVertical
            bounces
          >
            {comparedBudget && (
              <View style={styles.compareCard}>
                <Pressable
                  style={styles.compareCardMenuButton}
                  onPress={() =>
                    setShowCompareCardMenu((previous) => !previous)
                  }
                >
                  <Text style={styles.compareCardMenuDots}>⋮</Text>
                </Pressable>

                {showCompareCardMenu && (
                  <View style={styles.compareCardDropdown}>
                    <Pressable
                      style={styles.compareCardDropdownButton}
                      onPress={() => {
                        setComparedBudget(null);
                        setShowCompareCardMenu(false);
                      }}
                    >
                      <Text style={styles.compareCardDropdownText}>Close</Text>
                    </Pressable>
                  </View>
                )}
                <Text style={styles.compareLabel}>Compared to:</Text>

                <Text style={styles.compareTitle}>
                  {comparedBudget.budgetName || "Untitled Budget"}
                </Text>

                {comparisonResults.increased.length > 0 && (
                  <>
                    <Text style={styles.compareSectionTitle}>Increased:</Text>

                    {comparisonResults.increased.map((change, index) => (
                      <Text
                        key={`increased-${index}`}
                        style={styles.compareChangeText}
                      >
                        {change}
                      </Text>
                    ))}
                  </>
                )}

                {comparisonResults.decreased.length > 0 && (
                  <>
                    <Text style={styles.compareSectionTitle}>Decreased:</Text>

                    {comparisonResults.decreased.map((change, index) => (
                      <Text
                        key={`decreased-${index}`}
                        style={styles.compareChangeText}
                      >
                        {change}
                      </Text>
                    ))}
                  </>
                )}

                {comparisonResults.added.length > 0 && (
                  <>
                    <Text style={styles.compareSectionTitle}>Added:</Text>

                    {comparisonResults.added.map((change, index) => (
                      <Text
                        key={`added-${index}`}
                        style={styles.compareChangeText}
                      >
                        {change}
                      </Text>
                    ))}
                  </>
                )}

                {comparisonResults.removed.length > 0 && (
                  <>
                    <Text style={styles.compareSectionTitle}>Removed:</Text>

                    {comparisonResults.removed.map((change, index) => (
                      <Text
                        key={`removed-${index}`}
                        style={styles.compareChangeText}
                      >
                        {change}
                      </Text>
                    ))}
                  </>
                )}
              </View>
            )}

            <View id="receipt-export" ref={exportRef}>
              <BudgetSummaryBox
                items={receiptItems}
                subtotal={editor.subtotal}
                taxAmount={editor.taxAmount}
                totalSpent={editor.totalSpent}
                startingMoney={editor.startingMoney}
                salesTaxEnabled={editor.salesTaxEnabled}
                setSalesTaxEnabled={editor.setSalesTaxEnabled}
                taxRate={editor.taxRate}
                setTaxRate={editor.setTaxRate}
                startingMoneyRef={editor.startingMoneyRef}
                taxRateRef={editor.taxRateRef}
                affirmingMessage={editor.affirmingMessage}
                currentStyle={editor.currentStyle}
                highlightAddButton={tutorialStep === "addItemHighlight"}
                onAddItem={handleAddItemPress}
                onPressItem={openReceiptItemOverlayWithAnalytics}
                onDeleteItem={deleteItemWithAnalytics}
              />
            </View>

            <BudgetActionButtons
              onBackToMenu={() => router.push("/" as any)}
              onOpenReceipt={openReceiptPage}
            />

            <BudgetNotesCard
              receiptNote={editor.receiptNote}
              setReceiptNote={editor.setReceiptNote}
            />
          </ScrollView>
          {showCopiedMessage && (
            <View style={styles.copiedToast}>
              <Text style={styles.copiedToastText}>BUdgetCopied</Text>
            </View>
          )}
          {tutorialStep === "budgetPopup" && (
            <TutorialOverlay
              title="Set your budget"
              body="Start with the amount you want to spend before adding purchases."
              buttonText="OK"
              onNext={() => advanceTutorialAfterTap("budgetHighlight")}
              onSkip={skipTutorial}
            />
          )}

          {tutorialStep === "addItemPopup" && (
            <TutorialOverlay
              title="Add purchases"
              body="Use the Add Item button to quickly enter purchases while shopping or planning."
              buttonText="OK"
              onNext={() => advanceTutorialAfterTap("addItemHighlight")}
              onSkip={skipTutorial}
            />
          )}

          {tutorialStep === "donePopup" && (
            <TutorialOverlay
              title="Track what’s left"
              body="Your remaining balance updates automatically with every purchase you add."
              buttonText="Start"
              onNext={completeTutorial}
              onSkip={skipTutorial}
            />
          )}

          <Modal
            visible={showCompareModal}
            transparent
            animationType="fade"
            onRequestClose={() => setShowCompareModal(false)}
          >
            <View style={styles.modalBackdrop}>
              <View style={styles.compareModal}>
                <Text style={styles.modalTitle}>Compare Budget</Text>

                {allBudgets.map((budget) => (
                  <Pressable
                    key={budget.id}
                    style={styles.budgetOption}
                    onPress={() => {
                      setComparedBudget(budget);
                      setShowCompareCardMenu(false);
                      setShowCompareModal(false);
                    }}
                  >
                    <Text style={styles.budgetOptionText}>
                      {budget.budgetName || "Untitled Budget"}
                    </Text>
                  </Pressable>
                ))}

                <Pressable
                  style={styles.cancelButton}
                  onPress={() => setShowCompareModal(false)}
                >
                  <Text style={styles.cancelButtonText}>Cancel</Text>
                </Pressable>
              </View>
            </View>
          </Modal>

          <AddItemOverlay
            visible={editor.showAddItemOverlay}
            draftItem={editor.draftItem}
            setDraftItem={editor.setDraftItem}
            onClose={editor.closeAddItemOverlay}
            onAdd={addItemFromDraftWithAnalytics}
          />

          <ReceiptItemOverlay
            visible={editor.selectedReceiptItemId !== null && !isDeletingItem}
            item={editor.selectedReceiptItem}
            itemNameRefs={editor.itemNameRefs}
            itemAmountRefs={editor.itemAmountRefs}
            updateItem={editor.updateItem}
            increaseQuantity={editor.increaseQuantity}
            resetQuantity={editor.resetQuantity}
            toggleIncluded={editor.toggleIncluded}
            deleteItem={deleteItemWithAnalytics}
            focusNextItemOrAddCurrent={editor.focusNextItemOrAddCurrent}
            onClose={editor.closeReceiptItemOverlay}
          />
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#101820",
  },

  keyboardView: {
    flex: 1,
  },

  page: {
    flex: 1,
    backgroundColor: "#101820",
    paddingHorizontal: 16,
  },

  scroll: {
    flex: 1,
    backgroundColor: "#101820",
  },

  scrollContent: {
    paddingBottom: 80,
    backgroundColor: "#101820",
  },

  compareCard: {
    backgroundColor: "#182638",
    borderRadius: 18,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#2D4562",
  },

  compareTitle: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "900",
    paddingRight: 32,
    marginBottom: 8,
  },
  compareLabel: {
    color: "#AAB7C4",
    fontSize: 13,
    fontWeight: "800",
    marginBottom: 2,
  },

  compareSectionTitle: {
    color: "#AAB7C4",
    fontSize: 13,
    fontWeight: "900",
    marginTop: 12,
    marginBottom: 2,
    textTransform: "uppercase",
  },

  compareChangeText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "600",
    marginTop: 6,
  },

  compareCardMenuButton: {
    position: "absolute",
    top: 12,
    right: 14,
    zIndex: 20,
  },

  compareCardMenuDots: {
    color: "#FFFFFF",
    fontSize: 24,
    fontWeight: "900",
  },

  compareCardDropdown: {
    position: "absolute",
    top: 42,
    right: 12,
    zIndex: 25,
  },

  compareCardDropdownButton: {
    backgroundColor: "#182638",
    borderRadius: 16,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: "#2D4562",
  },

  compareCardDropdownText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "800",
  },

  modalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.55)",
    justifyContent: "center",
    paddingHorizontal: 20,
  },

  compareModal: {
    backgroundColor: "#101820",
    borderRadius: 24,
    padding: 18,
    borderWidth: 1,
    borderColor: "#2D4562",
  },

  modalTitle: {
    color: "#FFFFFF",
    fontSize: 20,
    fontWeight: "900",
    marginBottom: 14,
  },

  budgetOption: {
    backgroundColor: "#182638",
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 14,
    marginBottom: 10,
  },

  budgetOptionText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
  },

  cancelButton: {
    paddingVertical: 12,
    alignItems: "center",
  },

  cancelButtonText: {
    color: "#AAB7C4",
    fontSize: 15,
    fontWeight: "700",
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
});
