import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Clipboard from "expo-clipboard";
import { useLocalSearchParams, useRouter } from "expo-router";
import { usePostHog } from "posthog-react-native";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  Keyboard,
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
  | "nameBudget"
  | "budgetPopup"
  | "budgetHighlight"
  | "addItemPopup"
  | "addItemHighlight"
  | "donePopup"
  | "savedPopup"
  | "finishPopup";

type ShareOption = "itemsOnly" | "notes" | "links" | "notesAndLinks";

function parseBudgetItemsFromText(text: string): BudgetItem[] {
  const lines = text.split("\n");
  const parsedItems: BudgetItem[] = [];
  let currentItem: BudgetItem | null = null;

  function pushCurrentItem() {
    if (currentItem && currentItem.name.trim().length > 0) {
      parsedItems.push(currentItem);
    }

    currentItem = null;
  }

  for (const rawLine of lines) {
    const line = rawLine.trim();

    if (!line) {
      pushCurrentItem();
      continue;
    }

    const lowerLine = line.toLowerCase();

    if (
      lowerLine === "budget note" ||
      lowerLine === "items:" ||
      lowerLine.startsWith("money available:") ||
      lowerLine.startsWith("estimated tax:") ||
      lowerLine.startsWith("planned total:") ||
      lowerLine.startsWith("left after spending:")
    ) {
      continue;
    }

    if (lowerLine.startsWith("note:")) {
      if (currentItem) {
        currentItem.note = line.replace(/^note:\s*/i, "").trim();
      }

      continue;
    }

    if (lowerLine.startsWith("link:")) {
      if (currentItem) {
        currentItem.link = line.replace(/^link:\s*/i, "").trim();
      }

      continue;
    }

    if (/^https?:\/\//i.test(line)) {
      if (currentItem) {
        currentItem.link = line;
      }

      continue;
    }

    pushCurrentItem();

    const cleanedLine = line.replace(/^[-•*]\s*/, "").trim();

    const quantityAtEndMatch = cleanedLine.match(
      /^(.*?)\s*(?:[:,-]\s*)?\$?(\d+(?:\.\d{1,2})?)\s+x(\d+)$/i,
    );

    if (quantityAtEndMatch) {
      const totalAmount = parseFloat(quantityAtEndMatch[2]);
      const quantity = Number(quantityAtEndMatch[3]);

      currentItem = {
        id: Date.now() + Math.random(),
        name: quantityAtEndMatch[1].trim(),
        amount: (totalAmount / quantity).toFixed(2),
        quantity,
        included: true,
        isFood: false,
        note: "",
        link: "",
        inCart: false,
      };

      continue;
    }

    const quantityBeforeAmountMatch = cleanedLine.match(
      /^(.*?)\s+x(\d+)\s*[:,-]?\s*\$?(\d+(?:\.\d{1,2})?)$/i,
    );

    if (quantityBeforeAmountMatch) {
      const totalAmount = parseFloat(quantityBeforeAmountMatch[3]);
      const quantity = Number(quantityBeforeAmountMatch[2]);

      currentItem = {
        id: Date.now() + Math.random(),
        name: quantityBeforeAmountMatch[1].trim(),
        amount: (totalAmount / quantity).toFixed(2),
        quantity,
        included: true,
        isFood: false,
        note: "",
        link: "",
        inCart: false,
      };

      continue;
    }

    const amountMatch = cleanedLine.match(
      /^(.+?)\s*[:,-]?\s*\$?(\d+(?:\.\d{1,2})?)$/,
    );

    if (amountMatch) {
      currentItem = {
        id: Date.now() + Math.random(),
        name: amountMatch[1].trim(),
        amount: amountMatch[2].trim(),
        quantity: 1,
        included: true,
        isFood: false,
        note: "",
        link: "",
        inCart: false,
      };

      continue;
    }

    // Price only, such as "4.99" or "$4.99"
    const priceOnlyMatch = cleanedLine.match(/^\$?(\d+(?:\.\d{1,2})?)$/);

    if (priceOnlyMatch) {
      currentItem = {
        id: Date.now() + Math.random(),
        name: "",
        amount: priceOnlyMatch[1],
        quantity: 1,
        included: true,
        isFood: false,
        note: "",
        link: "",
        inCart: false,
      };

      continue;
    }

    currentItem = {
      id: Date.now() + Math.random(),
      name: cleanedLine,
      amount: "",
      quantity: 1,
      included: true,
      isFood: false,
      note: "",
      link: "",
      inCart: false,
    };
  }

  if (currentItem) {
    parsedItems.push(currentItem);
  }

  return parsedItems;
}

export default function BudgetDashboardScreen() {
  const router = useRouter();
  const posthog = usePostHog();
  const { id, showNamePrompt, startTutorial } = useLocalSearchParams();

  const budgetId = Array.isArray(id) ? id[0] : id;

  const shouldShowNamePrompt = Array.isArray(showNamePrompt)
    ? showNamePrompt[0]
    : showNamePrompt;

  const shouldStartTutorial = Array.isArray(startTutorial)
    ? startTutorial[0] === "1"
    : startTutorial === "1";

  const editor = useBudgetEditor(budgetId);

  const exportRef = useRef<View>(null);
  const hasHandledNamePromptRef = useRef(false);
  const namePromptInputRef = useRef<TextInput>(null);
  const planSearchInputRef = useRef<TextInput>(null);

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
  const [showShareOptionsModal, setShowShareOptionsModal] = useState(false);
  const [shareOption, setShareOption] = useState<ShareOption>("itemsOnly");
  const [importText, setImportText] = useState("");
  const [showNamePromptModal, setShowNamePromptModal] = useState(false);
  const [namePromptFromTutorial, setNamePromptFromTutorial] = useState(false);
  const [budgetNameDraft, setBudgetNameDraft] = useState("");
  const [namePromptMode, setNamePromptMode] = useState<"create" | "rename">(
    "create",
  );

  const [keyboardVisible, setKeyboardVisible] = useState(false);
  const [isPlanSearchOpen, setIsPlanSearchOpen] = useState(false);
  const [planSearchQuery, setPlanSearchQuery] = useState("");

  const receiptItems = useMemo(() => {
    return [...editor.items].reverse();
  }, [editor.items]);

  const plannedSearchResults = useMemo(() => {
    const normalizedQuery = planSearchQuery.trim().toLowerCase();

    if (!normalizedQuery) {
      return [];
    }

    let remainingQuery = normalizedQuery;

    // Find quantity anywhere in the search.
    // Examples:
    // x2
    // milk x2
    // x3 milk 4.89
    const quantityMatch = remainingQuery.match(/\bx\s*(\d+)\b/i);

    const searchedQuantity = quantityMatch ? Number(quantityMatch[1]) : null;

    if (quantityMatch) {
      remainingQuery = remainingQuery
        .replace(quantityMatch[0], " ")
        .replace(/\s+/g, " ")
        .trim();
    }

    // Find a price anywhere that is left.
    // Examples:
    // milk 4.99
    // milk $4.99
    // milk 5 x2
    const priceMatch = remainingQuery.match(/\$?(\d+(?:\.\d{1,2})?)/);

    const searchedPrice = priceMatch ? parseFloat(priceMatch[1]) : null;

    if (priceMatch) {
      remainingQuery = remainingQuery
        .replace(priceMatch[0], " ")
        .replace(/[:,-]/g, " ")
        .replace(/\s+/g, " ")
        .trim();
    }

    const searchedName = remainingQuery.trim();

    return receiptItems.filter((item) => {
      if (!item.included) {
        return false;
      }

      const itemName = item.name.trim().toLowerCase();

      const itemTotal = (parseFloat(item.amount) || 0) * item.quantity;

      const nameMatches =
        searchedName === "" || itemName.includes(searchedName);

      const priceMatches =
        searchedPrice === null || Math.abs(itemTotal - searchedPrice) < 0.005;

      const quantityMatches =
        searchedQuantity === null || item.quantity === searchedQuantity;

      return nameMatches && priceMatches && quantityMatches;
    });
  }, [planSearchQuery, receiptItems]);

  const comparisonResults = comparedBudget
    ? compareBudgets(editor.items, comparedBudget)
    : {
        added: [],
        removed: [],
        increased: [],
        decreased: [],
      };

  useEffect(() => {
    const showEvent =
      Platform.OS === "ios" ? "keyboardWillShow" : "keyboardDidShow";

    const hideEvent =
      Platform.OS === "ios" ? "keyboardWillHide" : "keyboardDidHide";

    const showSubscription = Keyboard.addListener(showEvent, () => {
      setKeyboardVisible(true);
    });

    const hideSubscription = Keyboard.addListener(hideEvent, () => {
      setKeyboardVisible(false);
    });

    return () => {
      showSubscription.remove();
      hideSubscription.remove();
    };
  }, []);

  function capture(eventName: string, properties?: any) {
    posthog?.capture(eventName, properties);
  }

  function showToast(message: string) {
    setToastMessage(message);
    setShowCopiedMessage(true);

    setTimeout(() => {
      setShowCopiedMessage(false);
    }, 900);
  }

  function moveItemToHidden(itemId: number) {
    editor.toggleIncluded(itemId);
    editor.closeReceiptItemOverlay();
    showToast("Item moved to Hidden");
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

  async function saveBudgetNameFromPrompt() {
    const trimmedName = budgetNameDraft.trim();

    if (trimmedName) {
      editor.setNoteTitle(trimmedName);
      await editor.saveBudgetNow(trimmedName);
    }

    setShowNamePromptModal(false);

    if (namePromptFromTutorial) {
      setNamePromptFromTutorial(false);
      setTutorialStep("budgetPopup");
    }
  }

  useEffect(() => {
    async function loadTutorial() {
      if (hasHandledNamePromptRef.current) {
        return;
      }

      const completed = await AsyncStorage.getItem(
        "budget-note-tutorial-complete-v2",
      );

      console.log("budget tutorial value:", completed, "budget id:", budgetId);

      const needsName =
        shouldShowNamePrompt === "1" && !editor.noteTitle.trim();

      if (needsName) {
        hasHandledNamePromptRef.current = true;
        setNamePromptMode("create");
        setBudgetNameDraft("");
      }

      const tutorialIsIncomplete =
        completed !== "true" && completed !== "skipped";

      if (shouldStartTutorial && tutorialIsIncomplete) {
        capture("tutorial_started", {
          tutorialVersion: "budget_v2",
          source: "budget_screen",
        });

        if (needsName) {
          setTutorialStep("nameBudget");
        } else {
          setTutorialStep("budgetPopup");
        }

        return;
      }

      if (needsName) {
        setShowNamePromptModal(true);
      }
    }

    loadTutorial();
  }, [shouldStartTutorial, shouldShowNamePrompt, editor.noteTitle, budgetId]);

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

  async function openReceiptPage() {
    trackReceiptEdited(capture, {
      itemCount: editor.items.length,
      salesTaxEnabled: editor.salesTaxEnabled,
      totalSpent: editor.totalSpent,
    });

    await editor.saveBudgetNow();

    router.push(`/budget/${budgetId}/items` as any);
  }

  async function handleAddItemPress() {
    if (tutorialStep === "addItemHighlight") {
      trackTutorialStepCompleted(capture, "add_item_highlight");

      await editor.saveBudgetNow();

      setTutorialStep("donePopup");
      return;
    }

    setShowAddItemsChoiceModal(true);
  }
  function importItemsFromText() {
    const importedItems = parseBudgetItemsFromText(importText);

    if (importedItems.length === 0) {
      return;
    }

    editor.setItems((currentItems) => [...importedItems, ...currentItems]);

    setImportText("");
    setShowImportModal(false);

    showToast("Items added");
  }

  function togglePlanSearch() {
    setIsPlanSearchOpen((previous) => {
      const nextValue = !previous;

      if (!nextValue) {
        setPlanSearchQuery("");
        Keyboard.dismiss();
      }

      capture("plan_search_toggled", {
        open: nextValue,
        itemCount: editor.items.length,
      });

      return nextValue;
    });
  }

  function openMatchedPlannedItem(itemId: number) {
    capture("plan_search_result_opened", {
      query: planSearchQuery.trim(),
      itemId,
    });

    openReceiptItemOverlayWithAnalytics(itemId);
  }

  function addSearchedItem() {
    const searchedValue = planSearchQuery.trim();

    const parsedItems = parseBudgetItemsFromText(searchedValue);

    const parsedItem = parsedItems[0];

    capture("plan_search_add_item_pressed", {
      query: searchedValue,
      parsedName: parsedItem?.name ?? "",
      parsedAmount: parsedItem?.amount ?? "",
      parsedQuantity: parsedItem?.quantity ?? 1,
    });

    setIsPlanSearchOpen(false);
    setPlanSearchQuery("");
    Keyboard.dismiss();

    editor.openAddItemOverlay();

    setTimeout(() => {
      editor.setDraftItem((currentDraft) => ({
        ...currentDraft,
        name: parsedItem?.name ?? searchedValue,
        amount: parsedItem?.amount ?? "",
        quantity: parsedItem?.quantity ?? 1,
        note: parsedItem?.note ?? "",
        link: parsedItem?.link ?? "",
      }));
    }, 50);
  }

  async function copyBudgetWithSelectedOptions() {
    const visibleItems = receiptItems.filter((item) => item.included);

    const includeNotes =
      shareOption === "notes" || shareOption === "notesAndLinks";

    const includeLinks =
      shareOption === "links" || shareOption === "notesAndLinks";

    const itemsText =
      visibleItems.length > 0
        ? visibleItems
            .map((item) => {
              const amount = (parseFloat(item.amount) || 0) * item.quantity;

              const quantityText =
                item.quantity > 1 ? ` x${item.quantity}` : "";

              const itemLines = [
                `- ${item.name || "Unnamed item"}: $${amount.toFixed(2)}${quantityText}`,
              ];

              if (includeNotes && item.note?.trim()) {
                itemLines.push(`Note: ${item.note.trim()}`);
              }

              if (includeLinks && item.link?.trim()) {
                itemLines.push(`Link: ${item.link.trim()}`);
              }

              return itemLines.join("\n");
            })
            .join("\n\n")
        : "- No items added";

    const header = editor.noteTitle.trim() || "Budget Note";

    const hasBudget =
      editor.startingMoney.trim() !== "" &&
      !Number.isNaN(parseFloat(editor.startingMoney));

    const summaryText = `${header}

${hasBudget ? `Money available: $${parseFloat(editor.startingMoney).toFixed(2)}\n\n` : ""}Items:
${itemsText}

${
  editor.salesTaxEnabled
    ? `Estimated tax: $${editor.taxAmount.toFixed(2)}
`
    : ""
}Planned total: $${editor.totalSpent.toFixed(2)}
${hasBudget ? `Left after spending: $${editor.safeToSpend.toFixed(2)}` : ""}`;

    await Clipboard.setStringAsync(summaryText);

    setShowShareOptionsModal(false);
    showToast("Copied to Clipboard");
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
            plannedTotal={editor.totalSpent}
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

              showToast("Budget Copied");

              setTimeout(() => {
                router.replace(`/budget/${duplicatedBudget.id}` as any);
              }, 900);
            }}
            onShareBudget={() => {
              setShowMenu(false);
              setShareOption("itemsOnly");
              setShowShareOptionsModal(true);
            }}
            onImportList={() => {
              setShowMenu(false);
              setNamePromptFromTutorial(false);
              setNamePromptMode("rename");
              setBudgetNameDraft(editor.noteTitle.trim());
              setShowNamePromptModal(true);
            }}
          />

          <ScrollView
            style={styles.scroll}
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
            alwaysBounceVertical
            bounces
            onTouchStart={() => {
              if (showMenu) {
                setShowMenu(false);
              }
            }}
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

            <View style={styles.planSearchSection}>
              <Pressable
                style={[
                  styles.planSearchToggle,
                  isPlanSearchOpen && styles.planSearchToggleOpen,
                ]}
                onPress={togglePlanSearch}
                accessibilityRole="button"
                accessibilityLabel={
                  isPlanSearchOpen
                    ? "Close Check Before You Spend"
                    : "Open Check Before You Spend"
                }
              >
                <Text style={styles.planSearchTogglePig}>🐷</Text>

                <Text style={styles.planSearchToggleText}>Quick Check</Text>

                <Text
                  style={[
                    styles.planSearchToggleArrow,
                    isPlanSearchOpen
                      ? styles.planSearchToggleArrowOpen
                      : styles.planSearchToggleArrowClosed,
                  ]}
                >
                  {isPlanSearchOpen ? "⌃" : "⌄"}
                </Text>
              </Pressable>

              {isPlanSearchOpen && (
                <View style={styles.planSearchPanel}>
                  <View style={styles.planSearchInputRow}>
                    <Text style={styles.planSearchIcon}>⌕</Text>

                    <TextInput
                      ref={planSearchInputRef}
                      style={styles.planSearchInput}
                      value={planSearchQuery}
                      onChangeText={setPlanSearchQuery}
                      placeholder="Search this note..."
                      placeholderTextColor="#7F8E9E"
                      autoCapitalize="none"
                      autoCorrect={false}
                      returnKeyType="search"
                    />

                    {planSearchQuery.length > 0 && (
                      <Pressable
                        style={styles.planSearchClearButton}
                        onPress={() => setPlanSearchQuery("")}
                        accessibilityRole="button"
                        accessibilityLabel="Clear search"
                      >
                        <Text style={styles.planSearchClearText}>×</Text>
                      </Pressable>
                    )}
                  </View>

                  {planSearchQuery.trim().length === 0 ? (
                    <Text style={styles.planSearchHint}>
                      See if it's already in your plan.
                    </Text>
                  ) : plannedSearchResults.length > 0 ? (
                    <View style={styles.planSearchResults}>
                      <View style={styles.planSearchMessageRow}>
                        <Text style={styles.planSearchStatusIcon}>✓</Text>
                        <Text style={styles.planSearchPlannedText}>
                          Planned in this note
                        </Text>
                      </View>

                      {plannedSearchResults.map((item) => {
                        const itemTotal =
                          (parseFloat(item.amount) || 0) * item.quantity;

                        return (
                          <Pressable
                            key={item.id}
                            style={styles.planSearchResultCard}
                            onPress={() => openMatchedPlannedItem(item.id)}
                          >
                            <View style={styles.planSearchResultDetails}>
                              <Text
                                style={styles.planSearchResultName}
                                numberOfLines={1}
                              >
                                {item.name || "Unnamed item"}
                              </Text>

                              {item.quantity > 1 && (
                                <Text style={styles.planSearchResultQuantity}>
                                  Quantity: {item.quantity}
                                </Text>
                              )}
                            </View>

                            <Text style={styles.planSearchResultAmount}>
                              ${itemTotal.toFixed(2)}
                            </Text>
                          </Pressable>
                        );
                      })}
                    </View>
                  ) : (
                    <View style={styles.planSearchNotPlanned}>
                      <View style={styles.planSearchMessageRow}>
                        <Text style={styles.planSearchNotPlannedIcon}>×</Text>
                        <View style={styles.planSearchMessageText}>
                          <Text style={styles.planSearchNotPlannedTitle}>
                            Not planned
                          </Text>
                          <Text style={styles.planSearchNotPlannedBody}>
                            I couldn’t find “{planSearchQuery.trim()}” in this
                            note.
                          </Text>
                        </View>
                      </View>

                      <Pressable
                        style={styles.planSearchAddButton}
                        onPress={addSearchedItem}
                      >
                        <Text style={styles.planSearchAddButtonText}>
                          + Add Item
                        </Text>
                      </Pressable>
                    </View>
                  )}
                </View>
              )}
            </View>

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
                onToggleInCart={editor.toggleInCart}
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

          {/*
{!keyboardVisible && (
  <View style={styles.bannerContainer}>
    <View style={styles.bannerPlaceholder}>
      <Text style={styles.bannerLabel}>ADVERTISEMENT</Text>
      <Text style={styles.bannerText}>Banner ad goes here</Text>
    </View>
  </View>
)}
*/}

          {showCopiedMessage && (
            <View style={styles.copiedToast}>
              <Text style={styles.copiedToastText}>{toastMessage}</Text>
            </View>
          )}
          {!tutorialDismissed && tutorialStep === "nameBudget" && (
            <TutorialOverlay
              title="Let’s name your budget"
              body="Give this budget a name so you can easily find it again later."
              buttonText="Name Budget"
              onNext={() => {
                setNamePromptFromTutorial(true);
                setTutorialStep("hidden");

                setTimeout(() => {
                  setShowNamePromptModal(true);
                }, 150);
              }}
              onSkip={skipTutorial}
            />
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
              buttonText="Next"
              onNext={() => setTutorialStep("savedPopup")}
              onSkip={skipTutorial}
            />
          )}
          {!tutorialDismissed && tutorialStep === "savedPopup" && (
            <TutorialOverlay
              title="Your budget is saved"
              body="Budget Note saves your changes automatically, so you can come back and keep planning anytime."
              buttonText="Next"
              onNext={() => setTutorialStep("finishPopup")}
              onSkip={skipTutorial}
            />
          )}
          {!tutorialDismissed && tutorialStep === "finishPopup" && (
            <TutorialOverlay
              title="Now it’s your turn"
              body={
                "You know how to name a budget, set your spending limit, and add what you’re thinking about buying.\n\nWhenever you’re wondering, “Can I afford this?” I’ll be here to help."
              }
              buttonText="Start Planning"
              onNext={completeTutorial}
              onSkip={skipTutorial}
            />
          )}

          <Modal
            visible={showNamePromptModal}
            transparent
            animationType="fade"
            onRequestClose={() => {
              setShowNamePromptModal(false);

              if (namePromptFromTutorial) {
                setNamePromptFromTutorial(false);
                setTutorialStep("budgetPopup");
              }
            }}
            onShow={() => {
              setTimeout(() => {
                namePromptInputRef.current?.focus();
              }, 150);
            }}
          >
            <View style={styles.modalBackdrop}>
              <View style={styles.compareModal}>
                <Text style={styles.modalTitle}>
                  {namePromptMode === "rename"
                    ? "Rename budget"
                    : "Name this budget?"}
                </Text>

                <TextInput
                  ref={namePromptInputRef}
                  style={styles.namePromptInput}
                  value={budgetNameDraft}
                  onChangeText={setBudgetNameDraft}
                  placeholder="Weekly groceries"
                  placeholderTextColor="#AAB7C4"
                  returnKeyType="done"
                  onSubmitEditing={saveBudgetNameFromPrompt}
                />

                <Pressable
                  style={styles.budgetOption}
                  onPress={saveBudgetNameFromPrompt}
                >
                  <Text style={styles.budgetOptionText}>Save</Text>
                </Pressable>

                <Pressable
                  style={styles.cancelButton}
                  onPress={() => {
                    setBudgetNameDraft("");
                    setShowNamePromptModal(false);

                    if (namePromptFromTutorial) {
                      setNamePromptFromTutorial(false);
                      setTutorialStep("budgetPopup");
                    }
                  }}
                >
                  <Text style={styles.cancelButtonText}>
                    {namePromptMode === "rename" ? "Cancel" : "Skip for Now"}
                  </Text>
                </Pressable>
              </View>
            </View>
          </Modal>
          <Modal
            visible={showShareOptionsModal}
            transparent
            animationType="fade"
            onRequestClose={() => setShowShareOptionsModal(false)}
          >
            <View style={styles.modalBackdrop}>
              <View style={styles.compareModal}>
                <Text style={styles.modalTitle}>What should be included?</Text>

                {[
                  {
                    value: "itemsOnly",
                    label: "Item names and prices only",
                  },
                  {
                    value: "notes",
                    label: "Include notes",
                  },
                  {
                    value: "links",
                    label: "Include links",
                  },
                  {
                    value: "notesAndLinks",
                    label: "Include notes and links",
                  },
                ].map((option) => {
                  const selected = shareOption === option.value;

                  return (
                    <Pressable
                      key={option.value}
                      style={[
                        styles.shareOption,
                        selected && styles.shareOptionSelected,
                      ]}
                      onPress={() =>
                        setShareOption(option.value as ShareOption)
                      }
                    >
                      <View
                        style={[
                          styles.radioOuter,
                          selected && styles.radioOuterSelected,
                        ]}
                      >
                        {selected && <View style={styles.radioInner} />}
                      </View>

                      <Text style={styles.shareOptionText}>{option.label}</Text>
                    </Pressable>
                  );
                })}

                <Pressable
                  style={styles.budgetOption}
                  onPress={copyBudgetWithSelectedOptions}
                >
                  <Text style={styles.budgetOptionText}>Copy to Clipboard</Text>
                </Pressable>

                <Pressable
                  style={styles.cancelButton}
                  onPress={() => setShowShareOptionsModal(false)}
                >
                  <Text style={styles.cancelButtonText}>Cancel</Text>
                </Pressable>
              </View>
            </View>
          </Modal>

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
                  placeholder={
                    "Milk - 4.99\nNote: Get whole milk\nLink: https://example.com\n\nEggs x2: $7.00"
                  }
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
            toggleIncluded={moveItemToHidden}
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
    paddingBottom: 16,
    backgroundColor: "#101820",
  },

  planSearchSection: {
    marginBottom: 12,
  },

  planSearchToggle: {
    minHeight: 46,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#1B2633",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#344657",
    paddingHorizontal: 14,
    paddingVertical: 10,
  },

  planSearchToggleOpen: {
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
    borderBottomWidth: 0,
  },

  planSearchTogglePig: {
    fontSize: 19,
    marginRight: 9,
  },

  planSearchToggleText: {
    flex: 1,
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "900",
  },

  planSearchToggleArrow: {
    color: "#AAB7C4",
    fontSize: 20,
    fontWeight: "900",
    marginLeft: 10,
  },

  planSearchToggleArrowClosed: {
    transform: [{ translateY: -5 }],
  },

  planSearchToggleArrowOpen: {
    transform: [{ translateY: 0 }],
  },

  planSearchPanel: {
    backgroundColor: "#1B2633",
    borderWidth: 1,
    borderTopWidth: 0,
    borderColor: "#344657",
    borderBottomLeftRadius: 16,
    borderBottomRightRadius: 16,
    paddingHorizontal: 12,
    paddingBottom: 12,
  },

  planSearchInputRow: {
    minHeight: 46,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#101820",
    borderWidth: 1,
    borderColor: "#344657",
    borderRadius: 14,
    paddingHorizontal: 12,
  },

  planSearchIcon: {
    color: "#AAB7C4",
    fontSize: 22,
    fontWeight: "900",
    marginRight: 8,
    transform: [{ rotate: "-20deg" }],
  },

  planSearchInput: {
    flex: 1,
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
    paddingVertical: 11,
  },

  planSearchClearButton: {
    width: 30,
    height: 30,
    alignItems: "center",
    justifyContent: "center",
  },

  planSearchClearText: {
    color: "#AAB7C4",
    fontSize: 24,
    lineHeight: 26,
    fontWeight: "600",
  },

  planSearchHint: {
    color: "#AAB7C4",
    fontSize: 13,
    fontWeight: "600",
    paddingHorizontal: 4,
    paddingTop: 10,
  },

  planSearchResults: {
    paddingTop: 10,
  },

  planSearchMessageRow: {
    flexDirection: "row",
    alignItems: "flex-start",
  },

  planSearchStatusIcon: {
    width: 24,
    color: "#2ECC71",
    fontSize: 19,
    fontWeight: "900",
  },

  planSearchPlannedText: {
    flex: 1,
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "900",
    paddingTop: 2,
  },

  planSearchResultCard: {
    minHeight: 50,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#101820",
    borderRadius: 13,
    borderWidth: 1,
    borderColor: "#2D4562",
    marginTop: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },

  planSearchResultDetails: {
    flex: 1,
    paddingRight: 10,
  },

  planSearchResultName: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "800",
  },

  planSearchResultQuantity: {
    color: "#AAB7C4",
    fontSize: 12,
    fontWeight: "600",
    marginTop: 2,
  },

  planSearchResultAmount: {
    color: "#2ECC71",
    fontSize: 15,
    fontWeight: "900",
  },

  planSearchNotPlanned: {
    paddingTop: 10,
  },

  planSearchNotPlannedIcon: {
    width: 24,
    color: "#FF7A7A",
    fontSize: 20,
    fontWeight: "900",
  },

  planSearchMessageText: {
    flex: 1,
  },

  planSearchNotPlannedTitle: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "900",
  },

  planSearchNotPlannedBody: {
    color: "#AAB7C4",
    fontSize: 13,
    fontWeight: "600",
    lineHeight: 18,
    marginTop: 2,
  },

  planSearchAddButton: {
    alignSelf: "flex-start",
    backgroundColor: "#2ECC71",
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    marginTop: 10,
    marginLeft: 24,
  },

  planSearchAddButtonText: {
    color: "#101820",
    fontSize: 14,
    fontWeight: "900",
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

  shareOption: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#182638",
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#2D4562",
  },

  shareOptionSelected: {
    borderColor: "#2ECC71",
  },

  shareOptionText: {
    flex: 1,
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
  },

  radioOuter: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: "#AAB7C4",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },

  radioOuterSelected: {
    borderColor: "#2ECC71",
  },

  radioInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: "#2ECC71",
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

  bannerContainer: {
    backgroundColor: "#101820",
    paddingHorizontal: 10,
    paddingTop: 6,
    paddingBottom: 6,
  },

  bannerPlaceholder: {
    height: 52,
    backgroundColor: "#1B2633",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#344657",
    alignItems: "center",
    justifyContent: "center",
  },

  bannerLabel: {
    color: "#738191",
    fontSize: 9,
    fontWeight: "800",
    letterSpacing: 1,
    marginBottom: 2,
  },

  bannerText: {
    color: "#CAD3DD",
    fontSize: 14,
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
  namePromptInput: {
    backgroundColor: "#182638",
    color: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#2D4562",
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 13,
    fontSize: 16,
    fontWeight: "800",
    marginBottom: 12,
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
