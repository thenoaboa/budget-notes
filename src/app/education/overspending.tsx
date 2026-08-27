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

type Expense = {
  id: string;
  name: string;
  emoji: string;
  priceCents: number;
  category: "Essential" | "Savings" | "Want";
  locked?: boolean;
};

type ConsequenceChoice = "nothing" | "future" | "more";

const MONEY_AVAILABLE_CENTS = 8000;

const EXPENSES: Expense[] = [
  {
    id: "food",
    name: "Lunch groceries",
    emoji: "🥪",
    priceCents: 2500,
    category: "Essential",
    locked: true,
  },
  {
    id: "bus",
    name: "Bus pass",
    emoji: "🚌",
    priceCents: 2000,
    category: "Essential",
    locked: true,
  },
  {
    id: "save-15",
    name: "Save $15",
    emoji: "🐷",
    priceCents: 1500,
    category: "Savings",
  },
  {
    id: "save-10",
    name: "Save $10",
    emoji: "🏦",
    priceCents: 1000,
    category: "Savings",
  },
  {
    id: "game",
    name: "New game",
    emoji: "🎮",
    priceCents: 3000,
    category: "Want",
  },
  {
    id: "snacks",
    name: "Extra snacks",
    emoji: "🍿",
    priceCents: 1000,
    category: "Want",
  },
];

const STARTING_SELECTION = ["food", "bus", "save-15", "game", "snacks"];

function formatMoney(cents: number) {
  return `$${(Math.abs(cents) / 100).toFixed(2)}`;
}

export default function OverspendingScreen() {
  const router = useRouter();
  const [selectedIds, setSelectedIds] = useState<string[]>(STARTING_SELECTION);
  const [consequenceChoice, setConsequenceChoice] =
    useState<ConsequenceChoice | null>(null);
  const [repairUnlocked, setRepairUnlocked] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);
  const [complete, setComplete] = useState(false);

  const selectedItems = useMemo(
    () => EXPENSES.filter((item) => selectedIds.includes(item.id)),
    [selectedIds],
  );

  const totalCents = selectedItems.reduce(
    (total, item) => total + item.priceCents,
    0,
  );
  const remainingCents = MONEY_AVAILABLE_CENTS - totalCents;
  const savingsCents = selectedItems
    .filter((item) => item.category === "Savings")
    .reduce((total, item) => total + item.priceCents, 0);
  const withinBudget = remainingCents >= 0;
  const hasSavings = savingsCents >= 1000;

  function selectConsequence(choice: ConsequenceChoice) {
    setConsequenceChoice(choice);
  }

  function continueToRepair() {
    if (!consequenceChoice) return;
    setRepairUnlocked(true);
    setShowFeedback(false);
  }

  function toggleExpense(item: Expense) {
    if (!repairUnlocked || item.locked) return;

    setShowFeedback(false);
    setSelectedIds((current) => {
      if (current.includes(item.id)) {
        return current.filter((id) => id !== item.id);
      }

      if (item.category === "Savings") {
        return [
          ...current.filter((id) => {
            const existing = EXPENSES.find((expense) => expense.id === id);
            return existing?.category !== "Savings";
          }),
          item.id,
        ];
      }

      return [...current, item.id];
    });
  }

  function checkRepair() {
    setShowFeedback(true);

    if (withinBudget && hasSavings) {
      void markLessonComplete("overspending");
      setComplete(true);
    }
  }

  function resetLesson() {
    setSelectedIds(STARTING_SELECTION);
    setConsequenceChoice(null);
    setRepairUnlocked(false);
    setShowFeedback(false);
    setComplete(false);
  }

  if (complete) {
    return (
      <SafeAreaView style={styles.screen}>
        <View style={styles.completionContainer}>
          <View style={styles.completionIcon}>
            <Ionicons name="checkmark" size={52} color="#101820" />
          </View>
          <Text style={styles.completionTitle}>Plan Repaired!</Text>
          <Text style={styles.completionText}>
            You brought the plan back under $80 without giving up every dollar
            of savings.
          </Text>

          <View style={styles.resultsCard}>
            <View style={styles.resultRow}>
              <Text style={styles.resultLabel}>Money available</Text>
              <Text style={styles.resultValue}>$80.00</Text>
            </View>
            <View style={styles.resultRow}>
              <Text style={styles.resultLabel}>New total</Text>
              <Text style={styles.resultValue}>{formatMoney(totalCents)}</Text>
            </View>
            <View style={styles.resultRow}>
              <Text style={styles.resultLabel}>Money remaining</Text>
              <Text style={styles.resultValueGreen}>
                {formatMoney(remainingCents)}
              </Text>
            </View>
          </View>

          <View style={styles.lessonCard}>
            <Text style={styles.lessonLabel}>WHAT OVERSPENDING DOES</Text>
            <Text style={styles.lessonText}>
              If you borrow to cover a shortage, future money must repay it.
              Fees or interest can make the original purchase cost even more.
            </Text>
          </View>

          <Pressable style={styles.primaryButton} onPress={resetLesson}>
            <Text style={styles.primaryButtonText}>Try Again</Text>
          </Pressable>
          <Pressable
            style={styles.secondaryButton}
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
          style={styles.backButton}
          onPress={() => router.push("/education/curriculum" as any)}
          hitSlop={10}
        >
          <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
        </Pressable>
        <Text style={styles.headerTitle}>What Happens When You Overspend?</Text>
        <Pressable onPress={resetLesson} hitSlop={10}>
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
          <Text style={styles.totalAmount}>{formatMoney(totalCents)}</Text>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.warningCard}>
          <Ionicons name="warning-outline" size={27} color="#FF7676" />
          <View style={styles.warningContent}>
            <Text style={styles.warningTitle}>
              Your plan is $20 over budget
            </Text>
            <Text style={styles.warningText}>
              You planned $100 of expenses, but you only have $80.
            </Text>
          </View>
        </View>

        {!repairUnlocked ? (
          <>
            <Text style={styles.question}>
              What can happen if you spend the full $100 anyway?
            </Text>
            <Choice
              label="Nothing changes"
              selected={consequenceChoice === "nothing"}
              onPress={() => selectConsequence("nothing")}
            />
            <Choice
              label="You may use future money or owe a fee"
              selected={consequenceChoice === "future"}
              correct={consequenceChoice !== null}
              onPress={() => selectConsequence("future")}
            />
            <Choice
              label="You automatically receive more money"
              selected={consequenceChoice === "more"}
              onPress={() => selectConsequence("more")}
            />

            {consequenceChoice && (
              <View style={styles.explanationCard}>
                <Text style={styles.explanationTitle}>
                  {consequenceChoice === "future" ? "Correct" : "Not quite"}
                </Text>
                <Text style={styles.explanationText}>
                  Overspending does not create money. A purchase may be
                  declined, cause a fee, or require borrowing from future
                  income.
                </Text>
              </View>
            )}

            <Pressable
              style={[
                styles.primaryButton,
                !consequenceChoice && styles.disabledButton,
              ]}
              disabled={!consequenceChoice}
              onPress={continueToRepair}
            >
              <Text style={styles.primaryButtonText}>Repair the Plan</Text>
            </Pressable>
          </>
        ) : (
          <>
            <View style={styles.instructionsCard}>
              <Text style={styles.instructionsTitle}>
                Make the numbers work
              </Text>
              <Text style={styles.instructionsText}>
                Essentials are locked. Change wants or savings, stay within $80,
                and keep at least $10 saved.
              </Text>
            </View>

            <View style={styles.itemsGrid}>
              {EXPENSES.map((item) => {
                const selected = selectedIds.includes(item.id);
                return (
                  <Pressable
                    key={item.id}
                    disabled={item.locked}
                    style={[
                      styles.itemCard,
                      selected && styles.itemCardSelected,
                      item.locked && styles.lockedItem,
                    ]}
                    onPress={() => toggleExpense(item)}
                  >
                    <View style={styles.itemTopRow}>
                      <Text style={styles.itemEmoji}>{item.emoji}</Text>
                      <Ionicons
                        name={
                          item.locked
                            ? "lock-closed"
                            : selected
                              ? "checkmark-circle"
                              : "ellipse-outline"
                        }
                        size={23}
                        color={
                          item.locked
                            ? "#8A98A8"
                            : selected
                              ? "#2ECC71"
                              : "#657383"
                        }
                      />
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

            {showFeedback && !withinBudget && (
              <View style={styles.feedbackCard}>
                <Text style={styles.feedbackText}>
                  You are still {formatMoney(Math.abs(remainingCents))} over
                  budget.
                </Text>
              </View>
            )}
            {showFeedback && !hasSavings && (
              <View style={styles.feedbackCard}>
                <Text style={styles.feedbackText}>
                  Keep at least $10 in savings.
                </Text>
              </View>
            )}

            <Pressable style={styles.primaryButton} onPress={checkRepair}>
              <Text style={styles.primaryButtonText}>Check My New Plan</Text>
            </Pressable>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

function Choice({
  label,
  selected,
  correct,
  onPress,
}: {
  label: string;
  selected: boolean;
  correct?: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      style={[
        styles.choiceButton,
        selected && styles.choiceSelected,
        selected && correct && styles.choiceCorrect,
      ]}
      onPress={onPress}
    >
      <Text style={styles.choiceText}>{label}</Text>
      {selected && (
        <Ionicons
          name="checkmark-circle"
          size={22}
          color={correct ? "#2ECC71" : "#B56CFF"}
        />
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: "#101820" },
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
    fontSize: 16,
    fontWeight: "900",
    textAlign: "center",
    paddingHorizontal: 6,
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
  moneyLabel: { color: "#AAB5C1", fontSize: 13, fontWeight: "700" },
  moneyAmount: {
    color: "#2ECC71",
    fontSize: 28,
    fontWeight: "900",
    marginTop: 3,
  },
  moneyAmountOver: { color: "#FF7676" },
  totalSection: { alignItems: "flex-end" },
  totalLabel: { color: "#8A98A8", fontSize: 13, fontWeight: "700" },
  totalAmount: {
    color: "#FFFFFF",
    fontSize: 19,
    fontWeight: "900",
    marginTop: 2,
  },
  scrollContent: { padding: 16, paddingBottom: 40 },
  warningCard: {
    flexDirection: "row",
    backgroundColor: "#4A2E34",
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "#8C4853",
    padding: 16,
  },
  warningContent: { flex: 1, marginLeft: 11 },
  warningTitle: { color: "#FF9B9B", fontSize: 18, fontWeight: "900" },
  warningText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "600",
    lineHeight: 20,
    marginTop: 4,
  },
  question: {
    color: "#FFFFFF",
    fontSize: 19,
    fontWeight: "900",
    lineHeight: 26,
    marginTop: 25,
    marginBottom: 12,
  },
  choiceButton: {
    minHeight: 60,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#1B2738",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#344657",
    paddingHorizontal: 16,
    marginBottom: 10,
  },
  choiceSelected: { backgroundColor: "#2E2540", borderColor: "#B56CFF" },
  choiceCorrect: { backgroundColor: "#183C32", borderColor: "#2ECC71" },
  choiceText: {
    flex: 1,
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "800",
    paddingRight: 10,
  },
  explanationCard: {
    backgroundColor: "#243342",
    borderRadius: 16,
    padding: 15,
    marginTop: 5,
  },
  explanationTitle: { color: "#B56CFF", fontSize: 15, fontWeight: "900" },
  explanationText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "600",
    lineHeight: 20,
    marginTop: 5,
  },
  instructionsCard: {
    backgroundColor: "#1B2738",
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "#344657",
    padding: 17,
    marginTop: 15,
  },
  instructionsTitle: { color: "#FFFFFF", fontSize: 20, fontWeight: "900" },
  instructionsText: {
    color: "#AAB5C1",
    fontSize: 14,
    fontWeight: "600",
    lineHeight: 20,
    marginTop: 7,
  },
  itemsGrid: { flexDirection: "row", flexWrap: "wrap", gap: 11, marginTop: 18 },
  itemCard: {
    width: "48%",
    minHeight: 140,
    backgroundColor: "#1B2738",
    borderRadius: 17,
    borderWidth: 1,
    borderColor: "#344657",
    padding: 13,
  },
  itemCardSelected: { backgroundColor: "#253B35", borderColor: "#2ECC71" },
  lockedItem: { opacity: 0.8 },
  itemTopRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  itemEmoji: { fontSize: 30 },
  itemName: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "900",
    marginTop: 10,
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
    backgroundColor: "#3C3520",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#65582B",
    padding: 13,
    marginTop: 12,
  },
  feedbackText: { color: "#FFFFFF", fontSize: 13, fontWeight: "700" },
  primaryButton: {
    minHeight: 54,
    backgroundColor: "#B56CFF",
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 20,
  },
  disabledButton: { backgroundColor: "#2A3848" },
  primaryButtonText: { color: "#101820", fontSize: 16, fontWeight: "900" },
  secondaryButton: {
    minHeight: 52,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#465769",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 11,
  },
  secondaryButtonText: { color: "#FFFFFF", fontSize: 15, fontWeight: "800" },
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
  resultLabel: { color: "#AAB5C1", fontSize: 14, fontWeight: "700" },
  resultValue: { color: "#FFFFFF", fontSize: 15, fontWeight: "900" },
  resultValueGreen: { color: "#2ECC71", fontSize: 15, fontWeight: "900" },
  lessonCard: {
    backgroundColor: "#243342",
    borderRadius: 17,
    padding: 16,
    marginTop: 14,
  },
  lessonLabel: {
    color: "#B56CFF",
    fontSize: 12,
    fontWeight: "900",
    letterSpacing: 0.8,
  },
  lessonText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "700",
    lineHeight: 21,
    marginTop: 7,
  },
});
