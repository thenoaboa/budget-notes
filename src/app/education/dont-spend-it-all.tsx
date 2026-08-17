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

type SpendingItem = {
  id: string;
  name: string;
  emoji: string;
  priceCents: number;
  category: "Essential" | "Optional";
  locked?: boolean;
};

const MONEY_AVAILABLE_CENTS = 5000;
const MONEY_TO_KEEP_CENTS = 1000;

const ITEMS: SpendingItem[] = [
  {
    id: "supplies",
    name: "School supplies",
    emoji: "✏️",
    priceCents: 1200,
    category: "Essential",
    locked: true,
  },
  {
    id: "lunch",
    name: "Lunch",
    emoji: "🥪",
    priceCents: 1000,
    category: "Essential",
    locked: true,
  },
  {
    id: "bus",
    name: "Bus fare",
    emoji: "🚌",
    priceCents: 800,
    category: "Essential",
    locked: true,
  },
  {
    id: "shirt",
    name: "New shirt",
    emoji: "👕",
    priceCents: 2000,
    category: "Optional",
  },
  {
    id: "movie",
    name: "Movie and snacks",
    emoji: "🎬",
    priceCents: 1800,
    category: "Optional",
  },
  {
    id: "game",
    name: "New game",
    emoji: "🎮",
    priceCents: 1500,
    category: "Optional",
  },
  {
    id: "drink",
    name: "Special drink",
    emoji: "🧋",
    priceCents: 500,
    category: "Optional",
  },
];

const REQUIRED_SELECTION = ["supplies", "lunch", "bus"];

function formatMoney(cents: number) {
  return `$${(Math.abs(cents) / 100).toFixed(2)}`;
}

export default function DontSpendItAllScreen() {
  const router = useRouter();
  const [selectedIds, setSelectedIds] = useState<string[]>(REQUIRED_SELECTION);
  const [showFeedback, setShowFeedback] = useState(false);
  const [complete, setComplete] = useState(false);

  const selectedItems = useMemo(
    () => ITEMS.filter((item) => selectedIds.includes(item.id)),
    [selectedIds],
  );

  const totalCents = selectedItems.reduce(
    (total, item) => total + item.priceCents,
    0,
  );
  const remainingCents = MONEY_AVAILABLE_CENTS - totalCents;
  const keptEnough = remainingCents >= MONEY_TO_KEEP_CENTS;
  const isWithinBudget = remainingCents >= 0;

  function toggleItem(item: SpendingItem) {
    if (item.locked || complete) return;

    setShowFeedback(false);
    setSelectedIds((current) =>
      current.includes(item.id)
        ? current.filter((id) => id !== item.id)
        : [...current, item.id],
    );
  }

  function checkPlan() {
    setShowFeedback(true);

    if (isWithinBudget && keptEnough) {
      void markLessonComplete("dont-spend-it-all");
      setComplete(true);
    }
  }

  function resetLesson() {
    setSelectedIds(REQUIRED_SELECTION);
    setShowFeedback(false);
    setComplete(false);
  }

  if (complete) {
    const optionalItems = selectedItems.filter(
      (item) => item.category === "Optional",
    );

    return (
      <SafeAreaView style={styles.screen}>
        <View style={styles.completionContainer}>
          <View style={styles.completionIcon}>
            <Ionicons name="checkmark" size={52} color="#101820" />
          </View>

          <Text style={styles.completionTitle}>Smart Stopping!</Text>

          <Text style={styles.completionText}>
            You paid for what you needed without treating every remaining dollar
            like money that had to be spent.
          </Text>

          <View style={styles.resultsCard}>
            <View style={styles.resultRow}>
              <Text style={styles.resultLabel}>Money available</Text>
              <Text style={styles.resultValue}>$50.00</Text>
            </View>
            <View style={styles.resultRow}>
              <Text style={styles.resultLabel}>Money spent</Text>
              <Text style={styles.resultValue}>{formatMoney(totalCents)}</Text>
            </View>
            <View style={styles.resultRow}>
              <Text style={styles.resultLabel}>Money kept available</Text>
              <Text style={styles.resultValueGreen}>
                {formatMoney(remainingCents)}
              </Text>
            </View>
          </View>

          <View style={styles.reflectionCard}>
            <Text style={styles.reflectionLabel}>REMEMBER</Text>
            <Text style={styles.reflectionText}>
              {optionalItems.length > 0
                ? "You chose something you wanted and still stopped before your money reached zero."
                : "Choosing not to buy anything optional is still a complete financial decision."}
            </Text>
          </View>

          <Pressable style={styles.primaryButton} onPress={resetLesson}>
            <Text style={styles.primaryButtonText}>Try Another Plan</Text>
          </Pressable>

          <Pressable
            style={styles.secondaryButton}
            onPress={() => router.back()}
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
          onPress={() => router.back()}
          hitSlop={10}
          accessibilityRole="button"
          accessibilityLabel="Return to curriculum"
        >
          <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
        </Pressable>

        <Text style={styles.headerTitle}>You Don't Have to Spend It All</Text>

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
              remainingCents < MONEY_TO_KEEP_CENTS && styles.moneyAmountLow,
            ]}
          >
            {remainingCents < 0 ? "-" : ""}
            {formatMoney(remainingCents)}
          </Text>
        </View>

        <View style={styles.totalSection}>
          <Text style={styles.totalLabel}>Spent</Text>
          <Text style={styles.totalAmount}>{formatMoney(totalCents)}</Text>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.instructionsCard}>
          <Text style={styles.instructionsTitle}>Keep some options open</Text>
          <Text style={styles.instructionsText}>
            Your essentials cost $30. You may choose something you want, but
            finish with at least $10 still available.
          </Text>

          <View style={styles.goalRow}>
            <Ionicons
              name={keptEnough ? "checkmark-circle" : "ellipse-outline"}
              size={18}
              color={keptEnough ? "#2ECC71" : "#8A98A8"}
            />
            <Text style={[styles.goalText, keptEnough && styles.goalTextMet]}>
              Keep at least $10
            </Text>
          </View>
        </View>

        <Text style={styles.sectionTitle}>Choose what else to buy</Text>

        <View style={styles.itemsGrid}>
          {ITEMS.map((item) => {
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
                onPress={() => toggleItem(item)}
                accessibilityRole="checkbox"
                accessibilityState={{
                  checked: selected,
                  disabled: item.locked,
                }}
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
                      item.locked ? "#8A98A8" : selected ? "#2ECC71" : "#657383"
                    }
                  />
                </View>

                <Text style={styles.itemName}>{item.name}</Text>
                <Text style={styles.itemCategory}>
                  {item.locked ? "Already planned" : item.category}
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
              You selected {formatMoney(Math.abs(remainingCents))} more than you
              have.
            </Text>
          </View>
        )}

        {showFeedback && isWithinBudget && !keptEnough && (
          <View style={styles.feedbackCard}>
            <Ionicons
              name="information-circle-outline"
              size={21}
              color="#F5C451"
            />
            <Text style={styles.feedbackText}>
              This plan is affordable, but it leaves less than $10 available.
              Remove something and practice stopping early.
            </Text>
          </View>
        )}

        <Pressable style={styles.checkButton} onPress={checkPlan}>
          <Text style={styles.checkButtonText}>Finish My Plan</Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
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
  moneyAmountLow: { color: "#FF7676" },
  totalSection: { alignItems: "flex-end" },
  totalLabel: { color: "#8A98A8", fontSize: 13, fontWeight: "700" },
  totalAmount: {
    color: "#FFFFFF",
    fontSize: 19,
    fontWeight: "900",
    marginTop: 2,
  },
  scrollContent: { padding: 16, paddingBottom: 40 },
  instructionsCard: {
    backgroundColor: "#1B2738",
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "#344657",
    padding: 17,
  },
  instructionsTitle: { color: "#FFFFFF", fontSize: 20, fontWeight: "900" },
  instructionsText: {
    color: "#AAB5C1",
    fontSize: 14,
    fontWeight: "600",
    lineHeight: 20,
    marginTop: 7,
  },
  goalRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#243342",
    borderRadius: 20,
    alignSelf: "flex-start",
    paddingHorizontal: 11,
    paddingVertical: 7,
    marginTop: 14,
  },
  goalText: { color: "#AAB5C1", fontSize: 12, fontWeight: "800" },
  goalTextMet: { color: "#2ECC71" },
  sectionTitle: {
    color: "#FFFFFF",
    fontSize: 19,
    fontWeight: "900",
    marginTop: 25,
    marginBottom: 12,
  },
  itemsGrid: { flexDirection: "row", flexWrap: "wrap", gap: 11 },
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
  checkButtonText: { color: "#101820", fontSize: 16, fontWeight: "900" },
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
    letterSpacing: 0.8,
  },
  reflectionText: {
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
});
