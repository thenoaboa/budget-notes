// Save as: src/app/budget/[id]/index.tsx

import { useLocalSearchParams, useRouter } from "expo-router";
import {
    KeyboardAvoidingView,
    Platform,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

import { BudgetHeaderCard } from "@/components/BudgetHeaderCard";
import { AddItemOverlay } from "../../../components/AddItemOverlay";
import { BudgetSummaryBox } from "../../../components/BudgetSummary";
import { MoneyAvailableSection } from "../../../components/MoneyAvailable";
import { ReceiptItemOverlay } from "../../../components/ReceiptItemOverlay";
import { useBudgetEditor } from "../../../hooks/usebudgetEditor";

export default function BudgetDashboardScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();

  const budgetId = Array.isArray(id) ? id[0] : id;

  const editor = useBudgetEditor(budgetId);

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
          />

          <ScrollView
            style={styles.scroll}
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
            alwaysBounceVertical
            bounces
          >
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

            <BudgetSummaryBox
              items={editor.items}
              subtotal={editor.subtotal}
              taxAmount={editor.taxAmount}
              totalSpent={editor.totalSpent}
              salesTaxEnabled={editor.salesTaxEnabled}
              affirmingMessage={editor.affirmingMessage}
              currentStyle={editor.currentStyle}
              onAddItem={editor.openAddItemOverlay}
              onPressItem={editor.openReceiptItemOverlay}
              onDeleteItem={editor.deleteItem}
            />

            <View style={styles.bottomButtonRow}>
              <TouchableOpacity
                style={styles.backButton}
                onPress={() => router.push("/" as any)}
              >
                <Text style={styles.backButtonText}>← Back To Menu</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.editReceiptButton}
                onPress={() => router.push(`/budget/${budgetId}/items` as any)}
              >
                <Text style={styles.editReceiptButtonText}>Edit Receipt →</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>

          <AddItemOverlay
            visible={editor.showAddItemOverlay}
            draftItem={editor.draftItem}
            setDraftItem={editor.setDraftItem}
            onClose={editor.closeAddItemOverlay}
            onAdd={editor.addItemFromDraft}
          />

          <ReceiptItemOverlay
            visible={editor.selectedReceiptItemId !== null}
            item={editor.selectedReceiptItem}
            itemNameRefs={editor.itemNameRefs}
            itemAmountRefs={editor.itemAmountRefs}
            updateItem={editor.updateItem}
            increaseQuantity={editor.increaseQuantity}
            resetQuantity={editor.resetQuantity}
            toggleIncluded={editor.toggleIncluded}
            deleteItem={editor.deleteItem}
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
    marginTop: 2,
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
});
