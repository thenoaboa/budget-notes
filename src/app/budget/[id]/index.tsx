// Save as: src/app/budget/[id]/index.tsx

import AsyncStorage from "@react-native-async-storage/async-storage";
import { useLocalSearchParams, useRouter } from "expo-router";
import { usePostHog } from "posthog-react-native";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

import html2canvas from "html2canvas";

import { BudgetHeaderCard } from "@/components/BudgetHeaderCard";
import { AddItemOverlay } from "../../../components/AddItemOverlay";
import { BudgetSummaryBox } from "../../../components/BudgetSummary";
import { BudgetTitleCard } from "../../../components/BudgetTitleCard";
import { MoneyAvailableSection } from "../../../components/MoneyAvailable";
import { ReceiptItemOverlay } from "../../../components/ReceiptItemOverlay";
import { TutorialOverlay } from "../../../components/TutorialOverlay";
import { useBudgetEditor } from "../../../hooks/usebudgetEditor";

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
  const [isDeletingItem, setIsDeletingItem] = useState(false);

  const receiptItems = useMemo(() => {
    return [...editor.items].reverse();
  }, [editor.items]);

  useEffect(() => {
    async function loadTutorial() {
      const completed = await AsyncStorage.getItem(
        "budget-note-tutorial-complete-v2",
      );

      if (!completed) {
        posthog?.capture("tutorial_started", {
          tutorialVersion: "budget_v2",
          source: "budget_screen",
        });

        setTutorialStep("budgetPopup");
      }
    }

    loadTutorial();
  }, [posthog]);

  async function completeTutorial() {
    posthog?.capture("tutorial_completed", {
      tutorialVersion: "budget_v2",
      itemCount: editor.items.length,
      salesTaxEnabled: editor.salesTaxEnabled,
    });

    await AsyncStorage.setItem("budget-note-tutorial-complete-v2", "true");

    setTutorialStep("hidden");
  }

  async function skipTutorial() {
    posthog?.capture("tutorial_skipped", {
      tutorialVersion: "budget_v2",
      step: tutorialStep,
      itemCount: editor.items.length,
      salesTaxEnabled: editor.salesTaxEnabled,
    });

    await completeTutorial();
  }

  function toggleSalesTaxEnabled(value: boolean) {
    posthog?.capture(value ? "sales_tax_enabled" : "sales_tax_disabled", {
      itemCount: editor.items.length,
      totalSpent: editor.totalSpent,
    });

    editor.setSalesTaxEnabled(value);
  }

  function addItemFromDraftWithAnalytics() {
    posthog?.capture("item_added", {
      existingItems: editor.items.length,
      salesTaxEnabled: editor.salesTaxEnabled,
      hasName: editor.draftItem.name.trim().length > 0,
      hasAmount: editor.draftItem.amount.trim().length > 0,
      quantity: editor.draftItem.quantity,
    });

    editor.addItemFromDraft();
  }

  function deleteItemWithAnalytics(id: number) {
    setIsDeletingItem(true);

    editor.closeReceiptItemOverlay();

    posthog?.capture("item_deleted", {
      itemCountBeforeDelete: editor.items.length,
      itemCountAfterDelete: Math.max(editor.items.length - 1, 0),
      salesTaxEnabled: editor.salesTaxEnabled,
    });

    setTimeout(() => {
      editor.deleteItem(id);

      setTimeout(() => {
        setIsDeletingItem(false);
      }, 250);
    }, 0);
  }

  function openReceiptItemOverlayWithAnalytics(id: number) {
    if (isDeletingItem) {
      return;
    }

    posthog?.capture("item_edited", {
      itemCount: editor.items.length,
      source: "receipt_card",
    });

    editor.openReceiptItemOverlay(id);
  }

  function openReceiptPage() {
    posthog?.capture("receipt_edited", {
      itemCount: editor.items.length,
      salesTaxEnabled: editor.salesTaxEnabled,
      totalSpent: editor.totalSpent,
    });

    router.push(`/budget/${budgetId}/items` as any);
  }

  async function shareReceipt() {
    posthog?.capture("share_pressed", {
      itemCount: editor.items.length,
      salesTaxEnabled: editor.salesTaxEnabled,
      totalSpent: editor.totalSpent,
      source: "budget_title_card",
    });

    try {
      if (typeof window === "undefined") {
        Alert.alert(
          "Unsupported",
          "Image export is only supported on web right now.",
        );
        return;
      }

      const target = document.getElementById("receipt-export");

      if (!target) {
        Alert.alert("Export failed", "Could not find receipt content.");
        return;
      }

      const canvas = await html2canvas(target, {
        backgroundColor: "#101820",
        scale: 2,
        useCORS: true,
      });

      const dataUrl = canvas.toDataURL("image/png");

      const newWindow = window.open();

      if (!newWindow) {
        Alert.alert("Popup blocked", "Please allow popups for image export.");
        return;
      }

      newWindow.document.write(`
        <html>
          <head>
            <title>Budget Export</title>

            <style>
              body {
                margin: 0;
                background: #101820;

                display: flex;
                justify-content: center;
                align-items: center;

                min-height: 100vh;
              }

              img {
                max-width: 100%;
                height: auto;
              }
            </style>
          </head>

          <body>
            <img src="${dataUrl}" />
          </body>
        </html>
      `);

      newWindow.document.close();
    } catch (error) {
      console.log("Export failed:", error);

      Alert.alert(
        "Export failed",
        "Something went wrong while exporting the image.",
      );
    }
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

              <BudgetTitleCard
                noteTitle={editor.noteTitle}
                setNoteTitle={editor.setNoteTitle}
                onShare={shareReceipt}
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
                onAddItem={() => {
                  if (tutorialStep === "addItemHighlight") {
                    posthog?.capture("tutorial_step_completed", {
                      tutorialVersion: "budget_v2",
                      step: "add_item_highlight",
                    });

                    setTutorialStep("donePopup");
                    return;
                  }

                  editor.openAddItemOverlay();
                }}
                onPressItem={openReceiptItemOverlayWithAnalytics}
                onDeleteItem={deleteItemWithAnalytics}
              />
            </View>

            <View style={styles.bottomButtonRow}>
              <TouchableOpacity
                style={styles.backButton}
                onPress={() => router.push("/" as any)}
              >
                <Text style={styles.backButtonText}>← Menu</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.editReceiptButton}
                onPress={openReceiptPage}
              >
                <Text style={styles.editReceiptButtonText}>Receipt →</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.notesCard}>
              <Text style={styles.notesMirror}>
                {editor.receiptNote.length > 0
                  ? `${editor.receiptNote}\n`
                  : "Notes..."}
              </Text>

              <TextInput
                style={styles.notesInput}
                value={editor.receiptNote}
                onChangeText={editor.setReceiptNote}
                placeholder="Note..."
                placeholderTextColor="#6F7F8F"
                multiline
                textAlignVertical="top"
                selectionColor="#2ECC71"
                underlineColorAndroid="transparent"
                scrollEnabled={false}
              />
            </View>
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

  bottomButtonRow: {
    flexDirection: "row",
    gap: 12,
    marginTop: 0,
  },

  backButton: {
    flex: 1,
    backgroundColor: "#123527",
    borderRadius: 14,
    paddingVertical: 13,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "rgba(46, 204, 113, 0.35)",
  },

  backButtonText: {
    color: "#2ECC71",
    fontSize: 15,
    fontWeight: "900",
    textAlign: "center",
  },

  editReceiptButton: {
    flex: 1,
    backgroundColor: "#243342",
    borderRadius: 14,
    paddingVertical: 13,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#3B4D5F",
  },

  editReceiptButtonText: {
    color: "#CAD3DD",
    fontSize: 15,
    fontWeight: "900",
    textAlign: "center",
  },

  notesCard: {
    marginTop: 19,
    backgroundColor: "#17232F",
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "#2D3D4D",
    paddingHorizontal: 14,
    paddingTop: 14,
    paddingBottom: 14,
    minHeight: 116,
  },

  notesMirror: {
    minHeight: 88,
    color: "transparent",
    fontSize: 15,
    fontWeight: "600",
    lineHeight: 21,
  },

  notesInput: {
    position: "absolute",
    top: 14,
    left: 14,
    right: 14,
    bottom: 14,
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "600",
    lineHeight: 21,
    padding: 0,
    borderWidth: 0,
    outlineStyle: "none" as any,
    overflow: "hidden",
  },
});
