// Save as: src/app/budget/[id]/index.tsx

import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Clipboard from "expo-clipboard";
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
  TextInput,
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
  createBudgetFromImportedItems,
  duplicateBudgetById,
  loadBudgets,
} from "../../../storage/budgetStorage";
import type { Budget } from "../../../types/budget";
import type { BudgetItem } from "../../../types/budgetEditor";
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
  const [tutorialDismissed, setTutorialDismissed] = useState(false);
  const tutorialStoppedRef = useRef(false);
  const tutorialTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [isDeletingItem, setIsDeletingItem] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [showCompareModal, setShowCompareModal] = useState(false);
  const [showCopiedMessage, setShowCopiedMessage] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [allBudgets, setAllBudgets] = useState<Budget[]>([]);
  const [comparedBudget, setComparedBudget] = useState<Budget | null>(null);
  const [showCompareCardMenu, setShowCompareCardMenu] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [showAddItemsChoiceModal, setShowAddItemsChoiceModal] = useState(false);
  const [importText, setImportText] = useState("");
  const [showImportChoiceModal, setShowImportChoiceModal] = useState(false);
  const [pendingImportedItems, setPendingImportedItems] = useState<
    BudgetItem[]
  >([]);

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

      console.log("budget tutorial value:", completed, "budget id:", budgetId);

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
    setTutorialDismissed(true);

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

    setShowAddItemsChoiceModal(true);
  }
  function importItemsFromText() {
    const importedItems = importText
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean)
      .filter((line) => {
        const lowerLine = line.toLowerCase();

        if (lowerLine === "budget note") return false;
        if (lowerLine === "items:") return false;
        if (lowerLine.startsWith("money available:")) return false;
        if (lowerLine.startsWith("estimated tax:")) return false;
        if (lowerLine.startsWith("planned total:")) return false;
        if (lowerLine.startsWith("left after spending:")) return false;

        return true;
      })
      .map((line) => {
        const cleanedLine = line.replace(/^[-•*]\s*/, "").trim();

        const quantityAtEndMatch = cleanedLine.match(
          /^(.*?)\s*(?:[:,-]\s*)?\$?(\d+(?:\.\d{1,2})?)\s+x(\d+)$/i,
        );

        if (quantityAtEndMatch) {
          const totalAmount = parseFloat(quantityAtEndMatch[2]);
          const quantity = Number(quantityAtEndMatch[3]);
          const singleAmount = totalAmount / quantity;

          return {
            id: Date.now() + Math.random(),
            name: quantityAtEndMatch[1].trim(),
            amount: singleAmount.toFixed(2),
            quantity,
            included: true,
          };
        }

        const quantityBeforeAmountMatch = cleanedLine.match(
          /^(.*?)\s+x(\d+)\s*[:,-]\s*\$?(\d+(?:\.\d{1,2})?)$/i,
        );

        if (quantityBeforeAmountMatch) {
          const totalAmount = parseFloat(quantityBeforeAmountMatch[3]);
          const quantity = Number(quantityBeforeAmountMatch[2]);
          const singleAmount = totalAmount / quantity;

          return {
            id: Date.now() + Math.random(),
            name: quantityBeforeAmountMatch[1].trim(),
            amount: singleAmount.toFixed(2),
            quantity,
            included: true,
          };
        }

        const amountMatch = cleanedLine.match(
          /^(.+?)\s*[:,-]?\s*\$?(\d+(?:\.\d{1,2})?)$/,
        );

        if (amountMatch) {
          return {
            id: Date.now() + Math.random(),
            name: amountMatch[1].trim(),
            amount: amountMatch[2].trim(),
            quantity: 1,
            included: true,
          };
        }

        return {
          id: Date.now() + Math.random(),
          name: cleanedLine,
          amount: "",
          quantity: 1,
          included: true,
        };
      })
      .filter((item): item is BudgetItem => item.name.trim().length > 0);

    if (importedItems.length === 0) return;

    setPendingImportedItems(importedItems);
    setShowImportModal(false);
    setShowImportChoiceModal(true);
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

              setToastMessage("Budget Copied");
              setShowCopiedMessage(true);

              setTimeout(() => {
                setShowCopiedMessage(false);
                router.replace(`/budget/${duplicatedBudget.id}` as any);
              }, 900);
            }}
            onShareBudget={async () => {
              setShowMenu(false);

              const itemsText =
                receiptItems.length > 0
                  ? receiptItems
                      .map((item) => {
                        const amount =
                          (parseFloat(item.amount) || 0) * item.quantity;
                        const quantityText =
                          item.quantity > 1 ? ` x${item.quantity}` : "";

                        return `- ${item.name || "Unnamed item"}: $${amount.toFixed(2)}${quantityText}`;
                      })
                      .join("\n")
                  : "- No items added";

              const summaryText = `Budget Note

Money available: $${(parseFloat(editor.startingMoney) || 0).toFixed(2)}

Items:
${itemsText}

${
  editor.salesTaxEnabled
    ? `Estimated tax: $${editor.taxAmount.toFixed(2)}
`
    : ""
}Planned total: $${editor.totalSpent.toFixed(2)}
Left after spending: $${editor.safeToSpend.toFixed(2)}`;

              await Clipboard.setStringAsync(summaryText);

              setToastMessage("Copied to Clipboard");
              setShowCopiedMessage(true);
              setTimeout(() => {
                setShowCopiedMessage(false);
              }, 900);
            }}
            onImportList={() => {
              setShowMenu(false);
              setShowImportModal(true);
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
              <Text style={styles.copiedToastText}>{toastMessage}</Text>
            </View>
          )}
          {!tutorialDismissed && tutorialStep === "budgetPopup" && (
            <TutorialOverlay
              title="Set your budget"
              body="Start with the amount you want to spend before adding purchases."
              buttonText="OK"
              onNext={() => advanceTutorialAfterTap("budgetHighlight")}
              onSkip={skipTutorial}
            />
          )}

          {!tutorialDismissed && tutorialStep === "addItemPopup" && (
            <TutorialOverlay
              title="Add purchases"
              body="Use the Add Item button to quickly enter purchases while shopping or planning."
              buttonText="OK"
              onNext={() => advanceTutorialAfterTap("addItemHighlight")}
              onSkip={skipTutorial}
            />
          )}

          {!tutorialDismissed && tutorialStep === "donePopup" && (
            <TutorialOverlay
              title="Track what’s left"
              body="Your remaining balance updates automatically with every purchase you add."
              buttonText="Start"
              onNext={completeTutorial}
              onSkip={skipTutorial}
            />
          )}
          <Modal
            visible={showAddItemsChoiceModal}
            transparent
            animationType="fade"
            onRequestClose={() => setShowAddItemsChoiceModal(false)}
          >
            <View style={styles.modalBackdrop}>
              <View style={styles.compareModal}>
                <Text style={styles.modalTitle}>Add Items</Text>

                <Pressable
                  style={styles.budgetOption}
                  onPress={() => {
                    setShowAddItemsChoiceModal(false);
                    editor.openAddItemOverlay();
                  }}
                >
                  <Text style={styles.budgetOptionText}>One Item</Text>
                </Pressable>

                <Pressable
                  style={styles.budgetOption}
                  onPress={() => {
                    setShowAddItemsChoiceModal(false);
                    setShowImportModal(true);
                  }}
                >
                  <Text style={styles.budgetOptionText}>Quick Add</Text>
                </Pressable>

                <Pressable
                  style={styles.cancelButton}
                  onPress={() => setShowAddItemsChoiceModal(false)}
                >
                  <Text style={styles.cancelButtonText}>Cancel</Text>
                </Pressable>
              </View>
            </View>
          </Modal>
          <Modal visible={showImportModal} transparent animationType="fade">
            <View style={styles.modalBackdrop}>
              <View style={styles.compareModal}>
                <Text style={styles.modalTitle}>Quick Add</Text>

                <TextInput
                  style={styles.importInput}
                  value={importText}
                  onChangeText={setImportText}
                  multiline
                  placeholder={"Milk - 4.99\nEggs x2: $7.00\nBread"}
                  placeholderTextColor="#AAB7C4"
                />

                <Pressable
                  style={styles.budgetOption}
                  onPress={importItemsFromText}
                >
                  <Text style={styles.budgetOptionText}>Add Items</Text>
                </Pressable>

                <Pressable
                  style={styles.cancelButton}
                  onPress={() => {
                    setImportText("");
                    setShowImportModal(false);
                  }}
                >
                  <Text style={styles.cancelButtonText}>Cancel</Text>
                </Pressable>
              </View>
            </View>
          </Modal>
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

          <Modal
            visible={showImportChoiceModal}
            transparent
            animationType="fade"
          >
            <View style={styles.modalBackdrop}>
              <View style={styles.compareModal}>
                <Text style={styles.modalTitle}>Import Where?</Text>

                <Pressable
                  style={styles.budgetOption}
                  onPress={() => {
                    editor.setItems((currentItems) => [
                      ...pendingImportedItems,
                      ...currentItems,
                    ]);

                    setToastMessage("Items added to list");
                    setShowCopiedMessage(true);

                    setTimeout(() => {
                      setShowCopiedMessage(false);
                    }, 900);

                    setPendingImportedItems([]);
                    setImportText("");
                    setShowImportChoiceModal(false);
                  }}
                >
                  <Text style={styles.budgetOptionText}>Current Budget</Text>
                </Pressable>

                <Pressable
                  style={styles.budgetOption}
                  onPress={async () => {
                    const newBudget =
                      await createBudgetFromImportedItems(pendingImportedItems);

                    setPendingImportedItems([]);
                    setImportText("");
                    setShowImportChoiceModal(false);

                    setToastMessage("New list imported");
                    setShowCopiedMessage(true);

                    setTimeout(() => {
                      setShowCopiedMessage(false);
                      router.replace(`/budget/${newBudget.id}` as any);
                    }, 900);
                  }}
                >
                  <Text style={styles.budgetOptionText}>New Budget</Text>
                </Pressable>

                <Pressable
                  style={styles.cancelButton}
                  onPress={() => {
                    setPendingImportedItems([]);
                    setShowImportChoiceModal(false);
                  }}
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
  importInput: {
    minHeight: 160,
    color: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#2D4562",
    borderRadius: 16,
    padding: 12,
    marginBottom: 12,
    textAlignVertical: "top",
  },
});
