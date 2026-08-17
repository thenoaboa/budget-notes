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

type GroceryCategory = "Protein" | "Grain" | "Fruit" | "Vegetable" | "Optional";

type GroceryItem = {
  id: string;
  name: string;
  priceCents: number;
  category: GroceryCategory;
  emoji: string;
};

const STARTING_MONEY_CENTS = 6000;
const TAX_RATE = 0.0825;

const REQUIRED_CATEGORIES: GroceryCategory[] = [
  "Protein",
  "Fruit",
  "Vegetable",
];

const GROCERY_ITEMS: GroceryItem[] = [
  {
    id: "chicken",
    name: "Chicken",
    priceCents: 1200,
    category: "Protein",
    emoji: "🍗",
  },
  {
    id: "beef",
    name: "Ground Beef",
    priceCents: 1000,
    category: "Protein",
    emoji: "🥩",
  },
  {
    id: "rice",
    name: "Rice",
    priceCents: 400,
    category: "Grain",
    emoji: "🍚",
  },
  {
    id: "bread",
    name: "Bread",
    priceCents: 350,
    category: "Grain",
    emoji: "🍞",
  },
  {
    id: "apples",
    name: "Apples",
    priceCents: 500,
    category: "Fruit",
    emoji: "🍎",
  },
  {
    id: "bananas",
    name: "Bananas",
    priceCents: 300,
    category: "Fruit",
    emoji: "🍌",
  },
  {
    id: "carrots",
    name: "Carrots",
    priceCents: 350,
    category: "Vegetable",
    emoji: "🥕",
  },
  {
    id: "broccoli",
    name: "Broccoli",
    priceCents: 400,
    category: "Vegetable",
    emoji: "🥦",
  },
  {
    id: "pizza",
    name: "Frozen Pizza",
    priceCents: 800,
    category: "Optional",
    emoji: "🍕",
  },
  {
    id: "cookies",
    name: "Cookies",
    priceCents: 450,
    category: "Optional",
    emoji: "🍪",
  },
  {
    id: "soda",
    name: "Soda",
    priceCents: 500,
    category: "Optional",
    emoji: "🥤",
  },
];

function formatMoney(cents: number) {
  return `$${(Math.abs(cents) / 100).toFixed(2)}`;
}

export default function GroceryChallengeScreen() {
  const router = useRouter();

  const [selectedItemIds, setSelectedItemIds] = useState<string[]>([]);
  const [surpriseActive, setSurpriseActive] = useState(false);
  const [challengeComplete, setChallengeComplete] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);

  const selectedItems = useMemo(
    () => GROCERY_ITEMS.filter((item) => selectedItemIds.includes(item.id)),
    [selectedItemIds],
  );

  const subtotalCents = useMemo(
    () =>
      selectedItems.reduce(
        (currentTotal, item) => currentTotal + item.priceCents,
        0,
      ),
    [selectedItems],
  );

  const taxCents = surpriseActive ? Math.round(subtotalCents * TAX_RATE) : 0;

  const totalCents = subtotalCents + taxCents;
  const remainingCents = STARTING_MONEY_CENTS - totalCents;

  const selectedCategories = new Set(
    selectedItems.map((item) => item.category),
  );

  const missingCategories = REQUIRED_CATEGORIES.filter(
    (category) => !selectedCategories.has(category),
  );

  const hasRequiredCategories = missingCategories.length === 0;
  const isWithinBudget = remainingCents >= 0;
  const canComplete =
    selectedItems.length > 0 && hasRequiredCategories && isWithinBudget;

  function toggleItem(itemId: string) {
    if (challengeComplete) {
      return;
    }

    setShowFeedback(false);

    setSelectedItemIds((currentIds) => {
      if (currentIds.includes(itemId)) {
        return currentIds.filter((id) => id !== itemId);
      }

      return [...currentIds, itemId];
    });
  }

  function checkPlan() {
    setShowFeedback(true);

    if (!hasRequiredCategories || !isWithinBudget) {
      return;
    }

    if (!surpriseActive) {
      setSurpriseActive(true);
      setShowFeedback(false);
      return;
    }

    if (canComplete) {
      setChallengeComplete(true);
    }
  }

  function resetChallenge() {
    setSelectedItemIds([]);
    setSurpriseActive(false);
    setChallengeComplete(false);
    setShowFeedback(false);
  }

  if (challengeComplete) {
    return (
      <SafeAreaView style={styles.screen}>
        <View style={styles.completionContainer}>
          <View style={styles.completionIcon}>
            <Ionicons name="checkmark" size={52} color="#101820" />
          </View>

          <Text style={styles.completionTitle}>Challenge Complete!</Text>

          <Text style={styles.completionText}>
            You bought the required groceries and stayed within your $60.00
            budget—even after sales tax was added.
          </Text>

          <View style={styles.resultsCard}>
            <View style={styles.resultRow}>
              <Text style={styles.resultLabel}>Items selected</Text>
              <Text style={styles.resultValue}>{selectedItems.length}</Text>
            </View>

            <View style={styles.resultRow}>
              <Text style={styles.resultLabel}>Total spent</Text>
              <Text style={styles.resultValue}>{formatMoney(totalCents)}</Text>
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
              What did you decide not to buy so you could stay within your
              budget?
            </Text>
          </View>

          <Pressable
            style={({ pressed }) => [
              styles.primaryButton,
              pressed && styles.pressed,
            ]}
            onPress={resetChallenge}
          >
            <Text style={styles.primaryButtonText}>Try Again</Text>
          </Pressable>

          <Pressable
            style={({ pressed }) => [
              styles.secondaryButton,
              pressed && styles.pressed,
            ]}
            onPress={() => router.back()}
          >
            <Text style={styles.secondaryButtonText}>
              Return to Education Mode
            </Text>
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
          onPress={() => router.back()}
          hitSlop={10}
          accessibilityRole="button"
          accessibilityLabel="Return to Education Mode"
        >
          <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
        </Pressable>

        <Text style={styles.headerTitle}>Grocery Challenge</Text>

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
          <Text style={styles.totalLabel}>Total</Text>
          <Text style={styles.totalAmount}>{formatMoney(totalCents)}</Text>
        </View>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.instructionsCard}>
          <Text style={styles.instructionsTitle}>Feed your family for $60</Text>

          <Text style={styles.instructionsText}>
            Choose at least one protein, one fruit, and one vegetable. Optional
            treats are allowed if they fit your budget.
          </Text>

          <View style={styles.requirementsRow}>
            {REQUIRED_CATEGORIES.map((category) => {
              const requirementMet = selectedCategories.has(category);

              return (
                <View
                  key={category}
                  style={[
                    styles.requirement,
                    requirementMet && styles.requirementMet,
                  ]}
                >
                  <Ionicons
                    name={
                      requirementMet ? "checkmark-circle" : "ellipse-outline"
                    }
                    size={17}
                    color={requirementMet ? "#2ECC71" : "#8A98A8"}
                  />

                  <Text
                    style={[
                      styles.requirementText,
                      requirementMet && styles.requirementTextMet,
                    ]}
                  >
                    {category}
                  </Text>
                </View>
              );
            })}
          </View>
        </View>

        {surpriseActive && (
          <View style={styles.surpriseCard}>
            <View style={styles.surpriseHeader}>
              <Text style={styles.surpriseEmoji}>⚡</Text>
              <Text style={styles.surpriseTitle}>Surprise!</Text>
            </View>

            <Text style={styles.surpriseText}>
              Sales tax has been added. Check your total and change your choices
              if necessary.
            </Text>
          </View>
        )}

        <Text style={styles.sectionTitle}>Choose your groceries</Text>

        <View style={styles.itemsGrid}>
          {GROCERY_ITEMS.map((item) => {
            const selected = selectedItemIds.includes(item.id);

            return (
              <Pressable
                key={item.id}
                style={({ pressed }) => [
                  styles.itemCard,
                  selected && styles.itemCardSelected,
                  pressed && styles.pressedCard,
                ]}
                onPress={() => toggleItem(item.id)}
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

        {surpriseActive && (
          <View style={styles.receiptCard}>
            <View style={styles.receiptRow}>
              <Text style={styles.receiptLabel}>Subtotal</Text>
              <Text style={styles.receiptValue}>
                {formatMoney(subtotalCents)}
              </Text>
            </View>

            <View style={styles.receiptRow}>
              <Text style={styles.receiptLabel}>Sales tax</Text>
              <Text style={styles.receiptValue}>{formatMoney(taxCents)}</Text>
            </View>

            <View style={styles.receiptDivider} />

            <View style={styles.receiptRow}>
              <Text style={styles.receiptTotalLabel}>Total</Text>
              <Text style={styles.receiptTotalValue}>
                {formatMoney(totalCents)}
              </Text>
            </View>
          </View>
        )}

        {showFeedback && !hasRequiredCategories && (
          <View style={styles.feedbackCard}>
            <Ionicons
              name="information-circle-outline"
              size={21}
              color="#F5C451"
            />

            <Text style={styles.feedbackText}>
              You still need: {missingCategories.join(", ")}.
            </Text>
          </View>
        )}

        {showFeedback && !isWithinBudget && (
          <View style={styles.feedbackCard}>
            <Ionicons name="warning-outline" size={21} color="#FF7676" />

            <Text style={styles.feedbackText}>
              You are {formatMoney(Math.abs(remainingCents))} over budget.
              Remove something before continuing.
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
          <Text style={styles.checkButtonText}>
            {surpriseActive ? "Finish Challenge" : "Check My Plan"}
          </Text>
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
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "900",
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
    backgroundColor: "rgba(46, 204, 113, 0.12)",
    borderWidth: 1,
    borderColor: "rgba(46, 204, 113, 0.35)",
  },

  requirementText: {
    color: "#AAB5C1",
    fontSize: 12,
    fontWeight: "800",
  },

  requirementTextMet: {
    color: "#2ECC71",
  },

  surpriseCard: {
    backgroundColor: "rgba(245, 196, 81, 0.12)",
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "rgba(245, 196, 81, 0.45)",
    padding: 16,
    marginTop: 14,
  },

  surpriseHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
    marginBottom: 5,
  },

  surpriseEmoji: {
    fontSize: 20,
  },

  surpriseTitle: {
    color: "#F5C451",
    fontSize: 17,
    fontWeight: "900",
  },

  surpriseText: {
    color: "#E3E8EE",
    fontSize: 14,
    fontWeight: "600",
    lineHeight: 20,
  },

  sectionTitle: {
    color: "#FFFFFF",
    fontSize: 19,
    fontWeight: "900",
    marginTop: 24,
    marginBottom: 12,
  },

  itemsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    gap: 12,
  },

  itemCard: {
    width: "48%",
    minHeight: 156,
    backgroundColor: "#1B2738",
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "#344657",
    padding: 14,
  },

  itemCardSelected: {
    borderColor: "#2ECC71",
    backgroundColor: "rgba(46, 204, 113, 0.09)",
  },

  pressedCard: {
    opacity: 0.75,
    transform: [{ scale: 0.98 }],
  },

  itemTopRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
  },

  itemEmoji: {
    fontSize: 32,
  },

  selectionCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: "#526273",
    alignItems: "center",
    justifyContent: "center",
  },

  selectionCircleSelected: {
    backgroundColor: "#2ECC71",
    borderColor: "#2ECC71",
  },

  itemName: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "900",
    marginTop: 12,
  },

  itemCategory: {
    color: "#8A98A8",
    fontSize: 12,
    fontWeight: "700",
    marginTop: 3,
  },

  itemPrice: {
    color: "#B56CFF",
    fontSize: 17,
    fontWeight: "900",
    marginTop: 8,
  },

  receiptCard: {
    backgroundColor: "#1B2738",
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "#344657",
    padding: 16,
    marginTop: 18,
    gap: 9,
  },

  receiptRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },

  receiptLabel: {
    color: "#AAB5C1",
    fontSize: 14,
    fontWeight: "700",
  },

  receiptValue: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "800",
  },

  receiptDivider: {
    height: 1,
    backgroundColor: "#344657",
    marginVertical: 3,
  },

  receiptTotalLabel: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "900",
  },

  receiptTotalValue: {
    color: "#2ECC71",
    fontSize: 18,
    fontWeight: "900",
  },

  feedbackCard: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 9,
    backgroundColor: "#243342",
    borderRadius: 14,
    padding: 13,
    marginTop: 14,
  },

  feedbackText: {
    flex: 1,
    color: "#E3E8EE",
    fontSize: 14,
    fontWeight: "700",
    lineHeight: 19,
  },

  checkButton: {
    backgroundColor: "#2ECC71",
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: "center",
    marginTop: 22,
  },

  checkButtonText: {
    color: "#101820",
    fontSize: 17,
    fontWeight: "900",
  },

  completionContainer: {
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: 22,
    paddingVertical: 30,
  },

  completionIcon: {
    width: 82,
    height: 82,
    borderRadius: 41,
    backgroundColor: "#2ECC71",
    alignItems: "center",
    justifyContent: "center",
    alignSelf: "center",
    marginBottom: 22,
  },

  completionTitle: {
    color: "#FFFFFF",
    fontSize: 30,
    fontWeight: "900",
    textAlign: "center",
  },

  completionText: {
    color: "#AAB5C1",
    fontSize: 16,
    fontWeight: "600",
    lineHeight: 23,
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
    gap: 13,
  },

  resultRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },

  resultLabel: {
    color: "#AAB5C1",
    fontSize: 15,
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
    backgroundColor: "rgba(181, 108, 255, 0.12)",
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "rgba(181, 108, 255, 0.4)",
    padding: 17,
    marginTop: 14,
  },

  reflectionLabel: {
    color: "#B56CFF",
    fontSize: 13,
    fontWeight: "900",
    textTransform: "uppercase",
    letterSpacing: 0.7,
  },

  reflectionQuestion: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
    lineHeight: 22,
    marginTop: 7,
  },

  primaryButton: {
    backgroundColor: "#2ECC71",
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: "center",
    marginTop: 20,
  },

  primaryButtonText: {
    color: "#101820",
    fontSize: 17,
    fontWeight: "900",
  },

  secondaryButton: {
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#344657",
    paddingVertical: 15,
    alignItems: "center",
    marginTop: 10,
  },

  secondaryButtonText: {
    color: "#CAD3DD",
    fontSize: 15,
    fontWeight: "800",
  },

  pressed: {
    opacity: 0.7,
  },
});
