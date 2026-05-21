// Save as: src/app/budget/[id].tsx

import { useLocalSearchParams, useRouter } from "expo-router";
import { useState } from "react";
import {
  KeyboardAvoidingView,
  NativeScrollEvent,
  NativeSyntheticEvent,
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import { BudgetHeaderCard } from "@/components/BudgetHeaderCard";
import { BudgetBottomBar } from "../../components/BudgetBottomBar";
import { BudgetSummaryBox } from "../../components/BudgetSummary";
import { MoneyAvailableSection } from "../../components/MoneyAvailable";
import { SpendingItemRow } from "../../components/SpendingItemCard";
import { useBudgetEditor } from "../../hooks/usebudgetEditor";
import { formatBudgetEditorTime } from "../../utils/budgetEditorDates";

export default function BudgetScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();

  const [showCreatedDate, setShowCreatedDate] = useState(false);

  const budgetId = Array.isArray(id) ? id[0] : id;

  const editor = useBudgetEditor(budgetId);

  function createNewNote() {
    const newId = Date.now().toString();
    router.push(`/budget/${newId}` as any);
  }

  function handleScroll(event: NativeSyntheticEvent<NativeScrollEvent>) {
    const scrollY = event.nativeEvent.contentOffset.y;

    setShowCreatedDate(scrollY > 5);
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        keyboardVerticalOffset={20}
      >
        <View style={styles.page}>
          <ScrollView
            style={styles.scroll}
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
            onScroll={handleScroll}
            scrollEventThrottle={16}
          >
            <BudgetHeaderCard
              affirmingMessage={editor.affirmingMessage}
              safeToSpend={editor.safeToSpend}
              headerSubtext={editor.headerSubtext}
              currentStyle={editor.currentStyle}
              headerTextColor={editor.headerTextColor}
              hasEnteredMoney={editor.startingMoney.trim() !== ""}
            />

            <MoneyAvailableSection
              startingMoney={editor.startingMoney}
              setStartingMoney={editor.setStartingMoney}
              salesTaxEnabled={editor.salesTaxEnabled}
              setSalesTaxEnabled={editor.setSalesTaxEnabled}
              taxRate={editor.taxRate}
              setTaxRate={editor.setTaxRate}
              startingMoneyRef={editor.startingMoneyRef}
              taxRateRef={editor.taxRateRef}
            />

            <Text style={styles.label}>Things to cover</Text>

            {editor.items.map((item) => (
              <SpendingItemRow
                key={item.id}
                item={item}
                itemNameRefs={editor.itemNameRefs}
                itemAmountRefs={editor.itemAmountRefs}
                updateItem={editor.updateItem}
                increaseQuantity={editor.increaseQuantity}
                resetQuantity={editor.resetQuantity}
                toggleIncluded={editor.toggleIncluded}
                deleteItem={editor.deleteItem}
                focusNextItemOrAddCurrent={editor.focusNextItemOrAddCurrent}
              />
            ))}

            <TouchableOpacity style={styles.addButton} onPress={editor.addItem}>
              <Text style={styles.addButtonText}>+ Add Item</Text>
            </TouchableOpacity>

            <BudgetSummaryBox
              items={editor.items}
              subtotal={editor.subtotal}
              taxAmount={editor.taxAmount}
              totalSpent={editor.totalSpent}
              salesTaxEnabled={editor.salesTaxEnabled}
              affirmingMessage={editor.affirmingMessage}
              currentStyle={editor.currentStyle}
            />

            <BudgetBottomBar
              noteTitle={editor.noteTitle}
              setNoteTitle={editor.setNoteTitle}
              lastEditedText={
                showCreatedDate
                  ? formatBudgetEditorTime(
                      editor.createdAt,
                      editor.lastEditedAt,
                    )
                  : ""
              }
              onBack={() => router.push("/" as any)}
              onCreateNewNote={createNewNote}
            />
          </ScrollView>
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
    paddingTop: 12,
    paddingBottom: 80,
    backgroundColor: "#101820",
  },

  label: {
    color: "#F4F7FA",
    fontSize: 15,
    fontWeight: "800",
    marginBottom: 8,
  },

  addButton: {
    backgroundColor: "#2ECC71",
    borderRadius: 16,
    paddingVertical: 15,
    alignItems: "center",
    marginTop: 6,
    marginBottom: 18,
  },

  addButtonText: {
    color: "#101820",
    fontSize: 17,
    fontWeight: "900",
  },
});
