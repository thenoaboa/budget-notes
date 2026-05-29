// Save as: src/app/budget/[id]/index.tsx

import { useLocalSearchParams, useRouter } from "expo-router";
import { usePostHog } from "posthog-react-native";
import { useMemo, useRef, useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";

import { AddItemOverlay } from "../../../components/AddItemOverlay";
import { BudgetActionButtons } from "../../../components/BudgetActionButtons";
import { BudgetHeaderCard } from "../../../components/BudgetHeaderCard";
import { BudgetIdentityCard } from "../../../components/BudgetIdentityCard";
import { BudgetNotesCard } from "../../../components/BudgetNotesCard";
import { BudgetSummaryBox } from "../../../components/BudgetSummary";
import { MoneyAvailableSection } from "../../../components/MoneyAvailable";
import { ReceiptItemOverlay } from "../../../components/ReceiptItemOverlay";
import { TutorialOverlay } from "../../../components/TutorialOverlay";
import { useBudgetEditor } from "../../../hooks/usebudgetEditor";
import { useBudgetTutorial } from "../../../hooks/useBudgetTutorial";
import {
  trackItemAdded,
  trackItemDeleted,
  trackItemEdited,
  trackReceiptEdited,
  trackSalesTaxChanged,
  trackTutorialStepCompleted,
} from "../../../utils/budgetAnalytics";
import { cleanMoneyInput } from "../../../utils/moneyInput";

export default function BudgetDashboardScreen() {
  const router = useRouter();
  const posthog = usePostHog();
  const { id } = useLocalSearchParams();

  const budgetId = Array.isArray(id) ? id[0] : id;
  const editor = useBudgetEditor(budgetId);

  const exportRef = useRef<View>(null);

  const [isDeletingItem, setIsDeletingItem] = useState(false);
  const [isBudgetAmountFocused, setIsBudgetAmountFocused] = useState(false);

  const receiptItems = useMemo(() => {
    return [...editor.items].reverse();
  }, [editor.items]);

  function capture(eventName: string, properties?: any) {
    posthog?.capture(eventName, properties);
  }

  const { tutorialStep, setTutorialStep, completeTutorial, skipTutorial } =
    useBudgetTutorial(capture, () => ({
      itemCount: editor.items.length,
      salesTaxEnabled: editor.salesTaxEnabled,
    }));

  function toggleSalesTaxEnabled(value: boolean) {
    trackSalesTaxChanged(capture, value, {
      itemCount: editor.items.length,
      salesTaxEnabled: editor.salesTaxEnabled,
      totalSpent: editor.totalSpent,
    });

    editor.setSalesTaxEnabled(value);
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

  function handleBudgetAmountFocus() {
    setIsBudgetAmountFocused(true);

    if (tutorialStep === "budgetHighlight") {
      setTutorialStep("addItemPopup");
    }
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
          />

          <ScrollView
            style={styles.scroll}
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
            alwaysBounceVertical
            bounces
          >
            <View id="receipt-export" ref={exportRef}>
              <View style={styles.taxOnlySection}>
                <MoneyAvailableSection
                  startingMoney=""
                  setStartingMoney={() => {}}
                  salesTaxEnabled={editor.salesTaxEnabled}
                  setSalesTaxEnabled={editor.setSalesTaxEnabled}
                  taxRate={editor.taxRate}
                  setTaxRate={editor.setTaxRate}
                  startingMoneyRef={editor.startingMoneyRef}
                  taxRateRef={editor.taxRateRef}
                />
              </View>

              <BudgetIdentityCard
                noteTitle={editor.noteTitle}
                setNoteTitle={editor.setNoteTitle}
                startingMoney={editor.startingMoney}
                setStartingMoney={editor.setStartingMoney}
                onBudgetAmountFocus={handleBudgetAmountFocus}
                onBudgetAmountBlur={() => setIsBudgetAmountFocused(false)}
                cleanMoneyInput={cleanMoneyInput}
              />

              <BudgetSummaryBox
                items={receiptItems}
                subtotal={editor.subtotal}
                taxAmount={editor.taxAmount}
                totalSpent={editor.totalSpent}
                salesTaxEnabled={editor.salesTaxEnabled}
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

          {tutorialStep === "budgetPopup" && (
            <TutorialOverlay
              title="Set your budget"
              body="Start with the amount you want to spend before adding purchases."
              buttonText="OK"
              onNext={() => setTutorialStep("budgetHighlight")}
              onSkip={skipTutorial}
            />
          )}

          {tutorialStep === "addItemPopup" && (
            <TutorialOverlay
              title="Add purchases"
              body="Use the Add Item button to quickly enter purchases while shopping or planning."
              buttonText="OK"
              onNext={() => setTutorialStep("addItemHighlight")}
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

  taxOnlySection: {
    marginBottom: 8,
  },
});
