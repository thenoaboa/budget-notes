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

type BudgetCategory = "Food" | "Transportation" | "Savings" | "Entertainment";

type BudgetItem = {
  id: string;
  name: string;
  emoji: string;
  priceCents: number;
  category: BudgetCategory;
};

const STARTING_MONEY_CENTS = 10000;
const SAVINGS_GOAL_CENTS = 2000;

const BUDGET_ITEMS: BudgetItem[] = [
  {
    id: "groceries",
    name: "Lunch groceries",
    emoji: "🥪",
    priceCents: 2000,
    category: "Food",
  },
  {
    id: "takeout",
    name: "Buy lunch out",
    emoji: "🍔",
    priceCents: 4000,
    category: "Food",
  },
  {
    id: "bus",
    name: "Bus pass",
    emoji: "🚌",
    priceCents: 2000,
    category: "Transportation",
  },
  {
    id: "rideshare",
    name: "Rideshare trips",
    emoji: "🚗",
    priceCents: 4500,
    category: "Transportation",
  },
  {
    id: "save-20",
    name: "Save $20",
    emoji: "🐷",
    priceCents: 2000,
    category: "Savings",
  },
  {
    id: "save-30",
    name: "Save $30",
    emoji: "🏦",
    priceCents: 3000,
    category: "Savings",
  },
  {
    id: "movie",
    name: "Movie ticket",
    emoji: "🎟️",
    priceCents: 1500,
    category: "Entertainment",
  },
  {
    id: "game",
    name: "New game",
    emoji: "🎮",
    priceCents: 2500,
    category: "Entertainment",
  },
  {
    id: "snacks",
    name: "Extra snacks",
    emoji: "🍿",
    priceCents: 1000,
    category: "Entertainment",
  },
];

function formatMoney(cents: number) {
  return `$${(Math.abs(cents) / 100).toFixed(2)}`;
}

export default function FirstBudgetScreen() {
  const router = useRouter();

  const [selectedItemIds, setSelectedItemIds] = useState<string[]>([]);
  const [showFeedback, setShowFeedback] = useState(false);
  const [challengeComplete, setChallengeComplete] = useState(false);

  const selectedItems = useMemo(
    () => BUDGET_ITEMS.filter((item) => selectedItemIds.includes(item.id)),
    [selectedItemIds],
  );

  const totalPlannedCents = useMemo(
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

  const remainingCents = STARTING_MONEY_CENTS - totalPlannedCents;

  const hasFood = selectedItems.some((item) => item.category === "Food");
  const hasTransportation = selectedItems.some(
    (item) => item.category === "Transportation",
  );
  const hasSavings = savingsCents >= SAVINGS_GOAL_CENTS;
  const isWithinBudget = remainingCents >= 0;

  const canComplete =
    hasFood && hasTransportation && hasSavings && isWithinBudget;

  function toggleItem(item: BudgetItem) {
    if (challengeComplete) {
      return;
    }

    setShowFeedback(false);

    setSelectedItemIds((currentIds) => {
      const alreadySelected = currentIds.includes(item.id);

      if (alreadySelected) {
        return currentIds.filter((id) => id !== item.id);
      }

      if (
        item.category === "Food" ||
        item.category === "Transportation" ||
        item.category === "Savings"
      ) {
        const idsWithoutSameCategory = currentIds.filter((id) => {
          const existingItem = BUDGET_ITEMS.find(
            (budgetItem) => budgetItem.id === id,
          );

          return existingItem?.category !== item.category;
        });

        return [...idsWithoutSameCategory, item.id];
      }

      return [...currentIds, item.id];
    });
  }

  function checkBudget() {
    setShowFeedback(true);

    if (canComplete) {
      void markLessonComplete("first-budget");
      setChallengeComplete(true);
    }
  }

  function resetChallenge() {
    setSelectedItemIds([]);
    setShowFeedback(false);
    setChallengeComplete(false);
  }

  if (challengeComplete) {
    const entertainmentItems = selectedItems.filter(
      (item) => item.category === "Entertainment",
    );

    return (
      <SafeAreaView style={styles.screen}>
        <View style={styles.completionContainer}>
          <View style={styles.completionIcon}>
            <Ionicons name="checkmark" size={52} color="#101820" />
          </View>

          <Text style={styles.completionTitle}>Budget Complete!</Text>

          <Text style={styles.completionText}>
            You covered your important expenses, reached your savings goal, and
            stayed within your $100.00 limit.
          </Text>

          <View style={styles.resultsCard}>
            <View style={styles.resultRow}>
              <Text style={styles.resultLabel}>Money available</Text>
              <Text style={styles.resultValue}>$100.00</Text>
            </View>

            <View style={styles.resultRow}>
              <Text style={styles.resultLabel}>Money planned</Text>
              <Text style={styles.resultValue}>
                {formatMoney(totalPlannedCents)}
              </Text>
            </View>

            <View style={styles.resultRow}>
              <Text style={styles.resultLabel}>Savings</Text>
              <Text style={styles.resultValueGreen}>
                {formatMoney(savingsCents)}
              </Text>
            </View>

            <View style={styles.resultRow}>
              <Text style={styles.resultLabel}>Money left</Text>
              <Text style={styles.resultValueGreen}>
                {formatMoney(remainingCents)}
              </Text>
            </View>
          </View>

          <View style={styles.reflectionCard}>
            <Text style={styles.reflectionLabel}>Think about it</Text>

            <Text style={styles.reflectionQuestion}>
              {entertainmentItems.length > 0
                ? "How did your food and transportation choices affect what you could afford for entertainment?"
                : "You chose not to include entertainment. What could you do with the money you left unplanned?"}
            </Text>
          </View>

          <Pressable
            style={({ pressed }) => [
              styles.primaryButton,
              pressed && styles.pressed,
            ]}
            onPress={resetChallenge}
          >
            <Text style={styles.primaryButtonText}>Build Another Budget</Text>
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

        <Text style={styles.headerTitle}>Build Your First Budget</Text>

        <Pressable
          onPress={resetChallenge}
          hitSlop={10}
          accessibilityRole="button"
          accessibilityLabel="Reset budget"
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
          <Text style={styles.totalLabel}>Planned</Text>
          <Text style={styles.totalAmount}>
            {formatMoney(totalPlannedCents)}
          </Text>
        </View>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.instructionsCard}>
          <Text style={styles.instructionsTitle}>Plan your $100</Text>

          <Text style={styles.instructionsText}>
            Choose food, transportation, and at least $20 in savings. Then
            decide whether you can afford anything else.
          </Text>

          <View style={styles.requirementsRow}>
            <Requirement label="Food" complete={hasFood} />
            <Requirement label="Transportation" complete={hasTransportation} />
            <Requirement label="Save $20" complete={hasSavings} />
          </View>
        </View>

        <Text style={styles.sectionTitle}>Choose your expenses</Text>

        <View style={styles.itemsGrid}>
          {BUDGET_ITEMS.map((item) => {
            const selected = selectedItemIds.includes(item.id);

            return (
              <Pressable
                key={item.id}
                style={({ pressed }) => [
                  styles.itemCard,
                  selected && styles.itemCardSelected,
                  pressed && styles.pressedCard,
                ]}
                onPress={() => toggleItem(item)}
                accessibilityRole="checkbox"
                accessibilityState={{ checked: selected }}
                accessibilityLabel={`${item.name}, ${formatMoney(
                  item.priceCents,
                )}`}
              >
                <View style={styles.itemTopRow}>
                  <Text style={styles.itemEmoji}>{item.emoji}</Text>

                  <View
                    style={[
                      styles.selectionCircle,
                      selected && styles.selectionCircleSelected,
                    ]}
                  >
                    {selected && (
                      <Ionicons name="checkmark" size={16} color="#101820" />
                    )}
                  </View>
                </View>

                <Text style={styles.itemName}>{item.name}</Text>
                <Text style={styles.itemCategory}>{item.category}</Text>
                <Text style={styles.itemPrice}>
                  {formatMoney(item.priceCents)}
                </Text>
              </Pressable>
            );
          })}
        </View>

        {showFeedback && !hasFood && (
          <Feedback text="Choose how you will pay for food." />
        )}

        {showFeedback && !hasTransportation && (
          <Feedback text="Choose how you will pay for transportation." />
        )}

        {showFeedback && !hasSavings && (
          <Feedback text="Your plan must include at least $20 in savings." />
        )}

        {showFeedback && !isWithinBudget && (
          <View style={styles.feedbackCard}>
            <Ionicons name="warning-outline" size={21} color="#FF7676" />

            <Text style={styles.feedbackText}>
              You planned {formatMoney(Math.abs(remainingCents))} more than you
              have. Remove or replace an expense.
            </Text>
          </View>
        )}

        <Pressable
          style={({ pressed }) => [
            styles.checkButton,
            pressed && styles.pressed,
          ]}
          onPress={checkBudget}
        >
          <Text style={styles.checkButtonText}>Check My Budget</Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

function Requirement({
  label,
  complete,
}: {
  label: string;
  complete: boolean;
}) {
  return (
    <View style={[styles.requirement, complete && styles.requirementMet]}>
      <Ionicons
        name={complete ? "checkmark-circle" : "ellipse-outline"}
        size={17}
        color={complete ? "#2ECC71" : "#8A98A8"}
      />

      <Text
        style={[styles.requirementText, complete && styles.requirementTextMet]}
      >
        {label}
      </Text>
    </View>
  );
}

function Feedback({ text }: { text: string }) {
  return (
    <View style={styles.feedbackCard}>
      <Ionicons name="information-circle-outline" size={21} color="#F5C451" />
      <Text style={styles.feedbackText}>{text}</Text>
    </View>
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
    fontSize: 17,
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
