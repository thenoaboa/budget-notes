// Save as: src/app/budget/[id]/index.tsx

import { useLocalSearchParams, useRouter } from "expo-router";
import {
    KeyboardAvoidingView,
    Platform,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    View,
} from "react-native";

import { BudgetHeaderCard } from "@/components/BudgetHeaderCard";
import { BudgetSummaryBox } from "../../../components/BudgetSummary";
import { MoneyAvailableSection } from "../../../components/MoneyAvailable";
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
              onAddItem={() => router.push(`/budget/${budgetId}/items` as any)}
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
    paddingBottom: 80,
    backgroundColor: "#101820",
  },

  taxOnlySection: {
    marginBottom: 8,
  },
});
