import Ionicons from "@expo/vector-icons/Ionicons";
import { useRouter } from "expo-router";
import { useMemo, useState } from "react";
import {
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { markLessonComplete } from "../../lib/educationProgress";

type ExpenseCategory =
  | "Food"
  | "Transportation"
  | "Phone"
  | "Savings"
  | "Optional"
  | "Emergency";

type ExpenseItem = {
  id: string;
  name: string;
  emoji: string;
  priceCents: number;
  category: ExpenseCategory;
  locked?: boolean;
};

const MONEY_AVAILABLE_CENTS = 12000;

const EXPENSES: ExpenseItem[] = [
  {
    id: "groceries",
    name: "Groceries",
    emoji: "🥦",
    priceCents: 3500,
    category: "Food",
    locked: true,
  },
  {
    id: "bus",
    name: "Bus pass",
    emoji: "🚌",
    priceCents: 2000,
    category: "Transportation",
    locked: true,
  },
  {
    id: "phone",
    name: "Phone service",
    emoji: "📱",
    priceCents: 1500,
    category: "Phone",
    locked: true,
  },
  {
    id: "savings-20",
    name: "Save $20",
    emoji: "🐷",
    priceCents: 2000,
    category: "Savings",
  },
  {
    id: "savings-10",
    name: "Save $10",
    emoji: "🏦",
    priceCents: 1000,
    category: "Savings",
  },
  {
    id: "movie",
    name: "Movie ticket",
    emoji: "🎟️",
    priceCents: 1500,
    category: "Optional",
  },
  {
    id: "snacks",
    name: "Extra snacks",
    emoji: "🍿",
    priceCents: 1000,
    category: "Optional",
  },
  {
    id: "emergency",
    name: "Unexpected medicine",
    emoji: "💊",
    priceCents: 2500,
    category: "Emergency",
    locked: true,
  },
];

const STARTING_SELECTION = [
  "groceries",
  "bus",
  "phone",
  "savings-20",
  "movie",
  "snacks",
  "emergency",
];

function formatMoney(cents: number) {
  return `$${(Math.abs(cents) / 100).toFixed(2)}`;
}

export default function UnexpectedExpenseScreen() {
  const router = useRouter();

  const [selectedItemIds, setSelectedItemIds] =
    useState<string[]>(STARTING_SELECTION);
  const [showFeedback, setShowFeedback] = useState(false);
  const [challengeComplete, setChallengeComplete] = useState(false);

  const selectedItems = useMemo(
    () => EXPENSES.filter((item) => selectedItemIds.includes(item.id)),
    [selectedItemIds],
  );

  const totalCents = useMemo(
    () => selectedItems.reduce((total, item) => total + item.priceCents, 0),
    [selectedItems],
  );

  const savingsCents = useMemo(
    () =>
      selectedItems
        .filter((item) => item.category === "Savings")
        .reduce((total, item) => total + item.priceCents, 0),
    [selectedItems],
  );

  const remainingCents = MONEY_AVAILABLE_CENTS - totalCents;
  const isWithinBudget = remainingCents >= 0;
  const hasSavings = savingsCents >= 1000;
  const canComplete = isWithinBudget && hasSavings;

  function toggleItem(item: ExpenseItem) {
    if (item.locked || challengeComplete) {
      return;
    }

    setShowFeedback(false);

    setSelectedItemIds((currentIds) => {
      if (currentIds.includes(item.id)) {
        return currentIds.filter((id) => id !== item.id);
      }

      if (item.category === "Savings") {
        const withoutCurrentSavings = currentIds.filter((id) => {
          const existingItem = EXPENSES.find((expense) => expense.id === id);

          return existingItem?.category !== "Savings";
        });

        return [...withoutCurrentSavings, item.id];
      }

      return [...currentIds, item.id];
    });
  }

  function checkPlan() {
    setShowFeedback(true);

    if (canComplete) {
      void markLessonComplete("unexpected-expense");
      setChallengeComplete(true);
    }
  }

  function resetChallenge() {
    setSelectedItemIds(STARTING_SELECTION);
    setShowFeedback(false);
    setChallengeComplete(false);
  }

  if (challengeComplete) {
    const removedOptionalItems = EXPENSES.filter(
      (item) =>
        item.category === "Optional" && !selectedItemIds.includes(item.id),
    );

    return (
      <SafeAreaView style={styles.screen}>
        <View style={styles.completionContainer}>
          <View style={styles.completionIcon}>
            <Ionicons name="checkmark" size={52} color="#101820" />
          </View>

          <Text style={styles.completionTitle}>Budget Repaired!</Text>

          <Text style={styles.completionText}>
            You handled the surprise expense, protected your essential expenses,
            and kept at least some money in savings.
          </Text>

          <View style={styles.resultsCard}>
            <View style={styles.resultRow}>
              <Text style={styles.resultLabel}>Medicine</Text>
              <Text style={styles.resultValue}>$25.00</Text>
            </View>

            <View style={styles.resultRow}>
              <Text style={styles.resultLabel}>New total</Text>
              <Text style={styles.resultValue}>{formatMoney(totalCents)}</Text>
            </View>

            <View style={styles.resultRow}>
              <Text style={styles.resultLabel}>Savings protected</Text>
              <Text style={styles.resultValueGreen}>
                {formatMoney(savingsCents)}
              </Text>
            </View>

            <View style={styles.resultRow}>
              <Text style={styles.resultLabel}>Money remaining</Text>
              <Text style={styles.resultValueGreen}>
                {formatMoney(remainingCents)}
              </Text>
            </View>
          </View>

          <View style={styles.reflectionCard}>
            <Text style={styles.reflectionLabel}>Think about it</Text>

            <Text style={styles.reflectionQuestion}>
              {removedOptionalItems.length > 0
                ? `You gave up ${removedOptionalItems
                    .map((item) => item.name.toLowerCase())
                    .join(
                      " and ",
                    )}. Why were those easier to change than your essential expenses?`
                : "How did changing your savings plan help you handle the emergency?"}
            </Text>
          </View>

          <Pressable
            style={({ pressed }) => [
              styles.primaryButton,
              pressed && styles.pressed,
            ]}
            onPress={resetChallenge}
          >
            <Text style={styles.primaryButtonText}>Try Another Plan</Text>
          </Pressable>

          <Pressable
            style={({ pressed }) => [
              styles.secondaryButton,
              pressed && styles.pressed,
            ]}
            onPress={() => router.push("/education/curriculum" as any)}
          >
            <Text style={styles.secondaryButtonText}>Return to Curriculum</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.screen}>
      <View style={styles.header}>
        <Pressable
          style={({ pressed }) => [
            styles.backButton,
            pressed && styles.pressed,
          ]}
          onPress={() => router.push("/education/curriculum" as any)}
          hitSlop={10}
          accessibilityRole="button"
          accessibilityLabel="Return to curriculum"
        >
          <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
        </Pressable>

        <Text style={styles.headerTitle}>Unexpected Expense</Text>

        <Pressable
          onPress={resetChallenge}
          hitSlop={10}
          accessibilityRole="button"
          accessibilityLabel="Reset challenge"
        >
          <Text style={styles.resetText}>Reset</Text>
        </Pressable>
      </View>

      <View style={styles.moneyCard}>
        <View>
          <Text style={styles.moneyLabel}>Money remaining</Text>

          <Text
            style={[
              styles.moneyAmount,
              remainingCents < 0 && styles.moneyAmountOver,
            ]}
          >
            {remainingCents < 0 ? "-" : ""}
            {formatMoney(remainingCents)}
          </Text>
        </View>

        <View style={styles.totalSection}>
          <Text style={styles.totalLabel}>New total</Text>
          <Text style={styles.totalAmount}>{formatMoney(totalCents)}</Text>
        </View>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.surpriseCard}>
          <View style={styles.surpriseHeader}>
            <Text style={styles.surpriseEmoji}>⚡</Text>
            <Text style={styles.surpriseTitle}>Something changed!</Text>
          </View>

          <Text style={styles.surpriseText}>
            You completed your $120 budget, but now you need $25 of medicine.
            Your original plan no longer fits.
          </Text>
        </View>

        <View style={styles.instructionsCard}>
          <Text style={styles.instructionsTitle}>Repair your budget</Text>

          <Text style={styles.instructionsText}>
            Essential expenses are locked. Change your optional spending or
            savings plan until the budget works again.
          </Text>

          <View style={styles.requirementsRow}>
            <View style={styles.requirement}>
              <Ionicons name="checkmark-circle" size={17} color="#2ECC71" />
              <Text style={styles.requirementTextMet}>Keep essentials</Text>
            </View>

            <View
              style={[styles.requirement, hasSavings && styles.requirementMet]}
            >
              <Ionicons
                name={hasSavings ? "checkmark-circle" : "ellipse-outline"}
                size={17}
                color={hasSavings ? "#2ECC71" : "#8A98A8"}
              />
              <Text
                style={[
                  styles.requirementText,
                  hasSavings && styles.requirementTextMet,
                ]}
              >
                Save at least $10
              </Text>
            </View>

            <View
              style={[
                styles.requirement,
                isWithinBudget && styles.requirementMet,
              ]}
            >
              <Ionicons
                name={isWithinBudget ? "checkmark-circle" : "ellipse-outline"}
                size={17}
                color={isWithinBudget ? "#2ECC71" : "#8A98A8"}
              />
              <Text
                style={[
                  styles.requirementText,
                  isWithinBudget && styles.requirementTextMet,
                ]}
              >
                Stay under $120
              </Text>
            </View>
          </View>
        </View>

        <Text style={styles.sectionTitle}>Adjust your plan</Text>

        <View style={styles.itemsGrid}>
          {EXPENSES.map((item) => {
            const selected = selectedItemIds.includes(item.id);

            return (
              <Pressable
                key={item.id}
                disabled={item.locked}
                style={({ pressed }) => [
                  styles.itemCard,
                  selected && styles.itemCardSelected,
                  item.category === "Emergency" && styles.emergencyItem,
                  item.locked && styles.lockedItem,
                  pressed && !item.locked && styles.pressedCard,
                ]}
                onPress={() => toggleItem(item)}
                accessibilityRole="checkbox"
                accessibilityState={{
                  checked: selected,
                  disabled: item.locked,
                }}
                accessibilityLabel={`${item.name}, ${formatMoney(
                  item.priceCents,
                )}${item.locked ? ", required" : ""}`}
              >
                <View style={styles.itemTopRow}>
                  <Text style={styles.itemEmoji}>{item.emoji}</Text>

                  <View
                    style={[
                      styles.selectionCircle,
                      selected && styles.selectionCircleSelected,
                      item.locked && styles.lockedCircle,
                    ]}
                  >
                    <Ionicons
                      name={item.locked ? "lock-closed" : "checkmark"}
                      size={14}
                      color={
                        item.locked
                          ? "#AAB5C1"
                          : selected
                            ? "#101820"
                            : "transparent"
                      }
                    />
                  </View>
                </View>

                <Text style={styles.itemName}>{item.name}</Text>
                <Text style={styles.itemCategory}>
                  {item.locked ? "Required" : item.category}
                </Text>
                <Text style={styles.itemPrice}>
                  {formatMoney(item.priceCents)}
                </Text>
              </Pressable>
            );
          })}
        </View>

        {showFeedback && !isWithinBudget && (
          <View style={styles.feedbackCard}>
            <Ionicons name="warning-outline" size={21} color="#FF7676" />

            <Text style={styles.feedbackText}>
              Your plan is still {formatMoney(Math.abs(remainingCents))} over
              budget. Change another expense.
            </Text>
          </View>
        )}

        {showFeedback && !hasSavings && (
          <View style={styles.feedbackCard}>
            <Ionicons
              name="information-circle-outline"
              size={21}
              color="#F5C451"
            />

            <Text style={styles.feedbackText}>
              Keep at least $10 in savings. Emergencies matter, but completely
              emptying your savings leaves you vulnerable to the next one.
            </Text>
          </View>
        )}

        <Pressable
          style={({ pressed }) => [
            styles.checkButton,
            pressed && styles.pressed,
          ]}
          onPress={checkPlan}
        >
          <Text style={styles.checkButtonText}>Check My New Plan</Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#101820",
  },

  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 14,
  },

  backButton: {
    width: 42,
    height: 42,
    borderRadius: 13,
    backgroundColor: "#1B2738",
    borderWidth: 1,
    borderColor: "#344657",
    alignItems: "center",
    justifyContent: "center",
  },

  headerTitle: {
    flex: 1,
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "900",
    textAlign: "center",
    paddingHorizontal: 8,
  },

  resetText: {
    width: 42,
    color: "#B56CFF",
    fontSize: 14,
    fontWeight: "900",
    textAlign: "right",
  },

  moneyCard: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#1B2738",
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: "#344657",
    paddingHorizontal: 18,
    paddingVertical: 15,
  },

  moneyLabel: {
    color: "#AAB5C1",
    fontSize: 13,
    fontWeight: "700",
    marginBottom: 3,
  },

  moneyAmount: {
    color: "#2ECC71",
    fontSize: 28,
    fontWeight: "900",
  },

  moneyAmountOver: {
    color: "#FF7676",
  },

  totalSection: {
    alignItems: "flex-end",
  },

  totalLabel: {
    color: "#8A98A8",
    fontSize: 13,
    fontWeight: "700",
  },

  totalAmount: {
    color: "#FFFFFF",
    fontSize: 19,
    fontWeight: "900",
    marginTop: 2,
  },

  scrollView: {
    flex: 1,
  },

  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },

  surpriseCard: {
    backgroundColor: "#4A4024",
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "#776634",
    padding: 17,
    marginBottom: 14,
  },

  surpriseHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 7,
  },

  surpriseEmoji: {
    fontSize: 23,
    marginRight: 8,
  },

  surpriseTitle: {
    color: "#F5C451",
    fontSize: 19,
    fontWeight: "900",
  },

  surpriseText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "600",
    lineHeight: 20,
  },

  instructionsCard: {
    backgroundColor: "#1B2738",
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "#344657",
    padding: 17,
  },

  instructionsTitle: {
    color: "#FFFFFF",
    fontSize: 20,
    fontWeight: "900",
    marginBottom: 7,
  },

  instructionsText: {
    color: "#AAB5C1",
    fontSize: 14,
    fontWeight: "600",
    lineHeight: 20,
  },

  requirementsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginTop: 15,
  },

  requirement: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    backgroundColor: "#243342",
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 7,
  },

  requirementMet: {
    backgroundColor: "#183C32",
  },

  requirementText: {
    color: "#AAB5C1",
    fontSize: 12,
    fontWeight: "800",
  },

  requirementTextMet: {
    color: "#2ECC71",
    fontSize: 12,
    fontWeight: "800",
  },

  sectionTitle: {
    color: "#FFFFFF",
    fontSize: 19,
    fontWeight: "900",
    marginTop: 25,
    marginBottom: 12,
  },

  itemsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 11,
  },

  itemCard: {
    width: "48%",
    minHeight: 145,
    backgroundColor: "#1B2738",
    borderRadius: 17,
    borderWidth: 1,
    borderColor: "#344657",
    padding: 13,
  },

  itemCardSelected: {
    backgroundColor: "#253B35",
    borderColor: "#2ECC71",
  },

  emergencyItem: {
    backgroundColor: "#4A2E34",
    borderColor: "#FF7676",
  },

  lockedItem: {
    opacity: 0.82,
  },

  itemTopRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  itemEmoji: {
    fontSize: 31,
  },

  selectionCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: "#657383",
    alignItems: "center",
    justifyContent: "center",
  },

  selectionCircleSelected: {
    backgroundColor: "#2ECC71",
    borderColor: "#2ECC71",
  },

  lockedCircle: {
    backgroundColor: "#344657",
    borderColor: "#657383",
  },

  itemName: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "900",
    marginTop: 11,
  },

  itemCategory: {
    color: "#8A98A8",
    fontSize: 12,
    fontWeight: "700",
    marginTop: 4,
  },

  itemPrice: {
    color: "#B56CFF",
    fontSize: 17,
    fontWeight: "900",
    marginTop: 7,
  },

  feedbackCard: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 9,
    backgroundColor: "#3C3520",
    borderRadius: 15,
    borderWidth: 1,
    borderColor: "#65582B",
    padding: 13,
    marginTop: 12,
  },

  feedbackText: {
    flex: 1,
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "700",
    lineHeight: 18,
  },

  checkButton: {
    minHeight: 56,
    backgroundColor: "#B56CFF",
    borderRadius: 17,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 22,
  },

  checkButtonText: {
    color: "#101820",
    fontSize: 16,
    fontWeight: "900",
  },

  completionContainer: {
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: 22,
    paddingVertical: 30,
  },

  completionIcon: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: "#2ECC71",
    alignItems: "center",
    justifyContent: "center",
    alignSelf: "center",
  },

  completionTitle: {
    color: "#FFFFFF",
    fontSize: 29,
    fontWeight: "900",
    textAlign: "center",
    marginTop: 22,
  },

  completionText: {
    color: "#AAB5C1",
    fontSize: 15,
    fontWeight: "600",
    lineHeight: 22,
    textAlign: "center",
    marginTop: 10,
  },

  resultsCard: {
    backgroundColor: "#1B2738",
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "#344657",
    padding: 17,
    marginTop: 25,
  },

  resultRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 7,
  },

  resultLabel: {
    color: "#AAB5C1",
    fontSize: 14,
    fontWeight: "700",
  },

  resultValue: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "900",
  },

  resultValueGreen: {
    color: "#2ECC71",
    fontSize: 15,
    fontWeight: "900",
  },

  reflectionCard: {
    backgroundColor: "#243342",
    borderRadius: 17,
    padding: 16,
    marginTop: 14,
  },

  reflectionLabel: {
    color: "#B56CFF",
    fontSize: 12,
    fontWeight: "900",
    textTransform: "uppercase",
    letterSpacing: 0.8,
  },

  reflectionQuestion: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "700",
    lineHeight: 21,
    marginTop: 7,
  },

  primaryButton: {
    minHeight: 54,
    backgroundColor: "#B56CFF",
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 22,
  },

  primaryButtonText: {
    color: "#101820",
    fontSize: 16,
    fontWeight: "900",
  },

  secondaryButton: {
    minHeight: 52,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#465769",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 11,
  },

  secondaryButtonText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "800",
  },

  pressedCard: {
    transform: [{ scale: 0.98 }],
  },

  pressed: {
    opacity: 0.7,
  },
});
