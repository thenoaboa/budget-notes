import { useMemo, useState } from "react";
import {
    KeyboardAvoidingView,
    Platform,
    Pressable,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    View,
} from "react-native";

type PracticeItem = {
  id: string;
  name: string;
  amount: number;
  emoji: string;
  included: boolean;
};

type PracticeStep =
  | "starting-money"
  | "gas"
  | "phone"
  | "gift"
  | "groceries"
  | "shoes"
  | "review"
  | "exclude-shoes"
  | "complete";

type BudgetPracticeScreenProps = {
  onClose: () => void;
  onComplete: () => void;
};

const expectedItems = [
  { step: "gas" as const, name: "Gas", amount: 60, emoji: "⛽" },
  { step: "phone" as const, name: "Phone bill", amount: 50, emoji: "📱" },
  { step: "gift" as const, name: "Birthday gift", amount: 40, emoji: "🎁" },
  { step: "groceries" as const, name: "Groceries", amount: 80, emoji: "🛒" },
  { step: "shoes" as const, name: "Shoes", amount: 120, emoji: "👟" },
];

export function BudgetPracticeScreen({
  onClose,
  onComplete,
}: BudgetPracticeScreenProps) {
  const [step, setStep] = useState<PracticeStep>("starting-money");
  const [startingMoney, setStartingMoney] = useState("");
  const [items, setItems] = useState<PracticeItem[]>([]);
  const [draftName, setDraftName] = useState("");
  const [draftAmount, setDraftAmount] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const includedTotal = useMemo(
    () =>
      items
        .filter((item) => item.included)
        .reduce((sum, item) => sum + item.amount, 0),
    [items],
  );

  const startingAmount = parseFloat(startingMoney) || 0;
  const remaining = startingAmount - includedTotal;
  const currentExpectedItem = expectedItems.find((item) => item.step === step);

  function submitStartingMoney() {
    if (parseFloat(startingMoney) !== 300) {
      setErrorMessage("Enter $300 to match the practice scenario.");
      return;
    }

    setErrorMessage("");
    setStep("gas");
  }

  function addExpectedItem() {
    if (!currentExpectedItem) return;

    const enteredAmount = parseFloat(draftAmount);
    const enteredName = draftName.trim().toLowerCase();
    const expectedName = currentExpectedItem.name.toLowerCase();

    if (
      enteredName !== expectedName ||
      enteredAmount !== currentExpectedItem.amount
    ) {
      setErrorMessage(
        `Add ${currentExpectedItem.name} for $${currentExpectedItem.amount}.`,
      );
      return;
    }

    setItems((current) => [
      ...current,
      {
        id: currentExpectedItem.step,
        name: currentExpectedItem.name,
        amount: currentExpectedItem.amount,
        emoji: currentExpectedItem.emoji,
        included: true,
      },
    ]);

    setDraftName("");
    setDraftAmount("");
    setErrorMessage("");

    const nextStep: Record<
      "gas" | "phone" | "gift" | "groceries" | "shoes",
      PracticeStep
    > = {
      gas: "phone",
      phone: "gift",
      gift: "groceries",
      groceries: "shoes",
      shoes: "review",
    };

    setStep(nextStep[currentExpectedItem.step]);
  }

  function continueFromReview() {
    if (remaining !== -50) {
      setErrorMessage("The included items should leave the budget at -$50.");
      return;
    }

    setErrorMessage("");
    setStep("exclude-shoes");
  }

  function toggleItem(itemId: string) {
    if (step !== "exclude-shoes" || itemId !== "shoes") return;

    setItems((current) =>
      current.map((item) =>
        item.id === itemId ? { ...item, included: false } : item,
      ),
    );

    setStep("complete");
  }

  function restartPractice() {
    setStep("starting-money");
    setStartingMoney("");
    setItems([]);
    setDraftName("");
    setDraftAmount("");
    setErrorMessage("");
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <View style={styles.page}>
          <View style={styles.topBar}>
            <Pressable style={styles.topBarButton} onPress={onClose}>
              <Text style={styles.closeText}>×</Text>
            </Pressable>

            <Text style={styles.topBarTitle}>Budget Practice</Text>
            <View style={styles.topBarButton} />
          </View>

          <View style={styles.progressTrack}>
            <View
              style={[
                styles.progressFill,
                { width: `${getProgress(step) * 100}%` },
              ]}
            />
          </View>

          <ScrollView
            style={styles.scroll}
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.billCard}>
              <Text style={styles.billEmoji}>🐷</Text>
              <View style={styles.billTextContainer}>
                <Text style={styles.billLabel}>Bill says</Text>
                <Text style={styles.billInstruction}>
                  {getInstruction(step)}
                </Text>
              </View>
            </View>

            <View style={styles.budgetHeaderCard}>
              <Text style={styles.budgetHeaderLabel}>Money available</Text>

              <View style={styles.moneyInputRow}>
                <Text style={styles.currencySymbol}>$</Text>
                <TextInput
                  style={styles.moneyInput}
                  value={startingMoney}
                  onChangeText={(value) => {
                    setStartingMoney(value);
                    setErrorMessage("");
                  }}
                  keyboardType="decimal-pad"
                  placeholder="0.00"
                  placeholderTextColor="#728092"
                  editable={step === "starting-money"}
                />
              </View>

              <View style={styles.headerDivider} />

              <View style={styles.balanceRow}>
                <Text style={styles.balanceLabel}>Left after spending</Text>
                <Text
                  style={[
                    styles.balanceAmount,
                    remaining < 0 && styles.negativeAmount,
                  ]}
                >
                  {formatMoney(remaining)}
                </Text>
              </View>
            </View>

            <View style={styles.itemsCard}>
              <View style={styles.itemsHeader}>
                <Text style={styles.itemsTitle}>Planned items</Text>
                <Text style={styles.itemsTotal}>
                  {formatMoney(includedTotal)}
                </Text>
              </View>

              {items.length === 0 ? (
                <View style={styles.emptyState}>
                  <Text style={styles.emptyEmoji}>📝</Text>
                  <Text style={styles.emptyText}>
                    Add each item Bill gives you.
                  </Text>
                </View>
              ) : (
                items.map((item) => (
                  <Pressable
                    key={item.id}
                    style={[
                      styles.itemRow,
                      !item.included && styles.excludedItemRow,
                    ]}
                    onPress={() => toggleItem(item.id)}
                    disabled={step !== "exclude-shoes" || item.id !== "shoes"}
                  >
                    <Text style={styles.itemEmoji}>{item.emoji}</Text>

                    <View style={styles.itemNameContainer}>
                      <Text
                        style={[
                          styles.itemName,
                          !item.included && styles.excludedText,
                        ]}
                      >
                        {item.name}
                      </Text>

                      {step === "exclude-shoes" && item.id === "shoes" && (
                        <Text style={styles.tapHint}>Tap to exclude</Text>
                      )}
                    </View>

                    <Text
                      style={[
                        styles.itemAmount,
                        !item.included && styles.excludedText,
                      ]}
                    >
                      {formatMoney(item.amount)}
                    </Text>

                    <View
                      style={[
                        styles.includeIndicator,
                        item.included
                          ? styles.includeIndicatorOn
                          : styles.includeIndicatorOff,
                      ]}
                    >
                      <Text style={styles.includeIndicatorText}>
                        {item.included ? "✓" : "–"}
                      </Text>
                    </View>
                  </Pressable>
                ))
              )}
            </View>

            {step === "starting-money" && (
              <Pressable
                style={styles.primaryButton}
                onPress={submitStartingMoney}
              >
                <Text style={styles.primaryButtonText}>Set $300 budget</Text>
              </Pressable>
            )}

            {currentExpectedItem && (
              <View style={styles.addItemCard}>
                <Text style={styles.addItemTitle}>Add an item</Text>

                <TextInput
                  style={styles.input}
                  value={draftName}
                  onChangeText={(value) => {
                    setDraftName(value);
                    setErrorMessage("");
                  }}
                  placeholder="Item name"
                  placeholderTextColor="#728092"
                  autoCapitalize="words"
                />

                <View style={styles.amountInputContainer}>
                  <Text style={styles.amountCurrency}>$</Text>
                  <TextInput
                    style={styles.amountInput}
                    value={draftAmount}
                    onChangeText={(value) => {
                      setDraftAmount(value);
                      setErrorMessage("");
                    }}
                    keyboardType="decimal-pad"
                    placeholder="0.00"
                    placeholderTextColor="#728092"
                  />
                </View>

                <Pressable
                  style={styles.primaryButton}
                  onPress={addExpectedItem}
                >
                  <Text style={styles.primaryButtonText}>Add Item</Text>
                </Pressable>
              </View>
            )}

            {step === "review" && (
              <Pressable
                style={styles.primaryButton}
                onPress={continueFromReview}
              >
                <Text style={styles.primaryButtonText}>Review the result</Text>
              </Pressable>
            )}

            {step === "complete" && (
              <View style={styles.completeCard}>
                <Text style={styles.completeEmoji}>🎉</Text>
                <Text style={styles.completeTitle}>Practice complete</Text>
                <Text style={styles.completeBody}>
                  The shoes could be purchased, but including them would leave
                  the budget $50 short. Excluding them protects the money needed
                  for everything else.
                </Text>

                <Pressable style={styles.primaryButton} onPress={onComplete}>
                  <Text style={styles.primaryButtonText}>Finish lesson</Text>
                </Pressable>

                <Pressable
                  style={styles.secondaryButton}
                  onPress={restartPractice}
                >
                  <Text style={styles.secondaryButtonText}>Practice again</Text>
                </Pressable>
              </View>
            )}

            {!!errorMessage && (
              <View style={styles.errorCard}>
                <Text style={styles.errorText}>{errorMessage}</Text>
              </View>
            )}
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

function getInstruction(step: PracticeStep): string {
  switch (step) {
    case "starting-money":
      return "You have $300 available. Enter that amount at the top.";
    case "gas":
      return "Add Gas for $60.";
    case "phone":
      return "Now add the Phone bill for $50.";
    case "gift":
      return "Add the Birthday gift for $40.";
    case "groceries":
      return "Add Groceries for $80.";
    case "shoes":
      return "Finally, add the Shoes for $120.";
    case "review":
      return "Look at what is left. The budget is now $50 short.";
    case "exclude-shoes":
      return "Tap the Shoes row to exclude them from the plan.";
    case "complete":
      return "Exactly. You could buy the shoes, but the full budget shows why you cannot comfortably afford them.";
  }
}

function getProgress(step: PracticeStep): number {
  const order: PracticeStep[] = [
    "starting-money",
    "gas",
    "phone",
    "gift",
    "groceries",
    "shoes",
    "review",
    "exclude-shoes",
    "complete",
  ];

  return (order.indexOf(step) + 1) / order.length;
}

function formatMoney(amount: number): string {
  const absoluteAmount = Math.abs(amount).toFixed(2);
  return amount < 0 ? `-$${absoluteAmount}` : `$${absoluteAmount}`;
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#101820" },
  keyboardView: { flex: 1 },
  page: { flex: 1, backgroundColor: "#101820", paddingHorizontal: 16 },
  topBar: {
    minHeight: 54,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  topBarButton: {
    width: 44,
    height: 44,
    alignItems: "center",
    justifyContent: "center",
  },
  closeText: { color: "#AAB7C4", fontSize: 30 },
  topBarTitle: { color: "#FFFFFF", fontSize: 16, fontWeight: "900" },
  progressTrack: {
    height: 7,
    backgroundColor: "#2D3945",
    borderRadius: 999,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    backgroundColor: "#2ECC71",
    borderRadius: 999,
  },
  scroll: { flex: 1 },
  scrollContent: { paddingTop: 14, paddingBottom: 50 },
  billCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#17232F",
    borderWidth: 1,
    borderColor: "#2D4562",
    borderRadius: 20,
    padding: 15,
    marginBottom: 14,
  },
  billEmoji: { fontSize: 45, marginRight: 12 },
  billTextContainer: { flex: 1 },
  billLabel: {
    color: "#2ECC71",
    fontSize: 12,
    fontWeight: "900",
    textTransform: "uppercase",
    letterSpacing: 0.6,
    marginBottom: 4,
  },
  billInstruction: {
    color: "#FFFFFF",
    fontSize: 16,
    lineHeight: 22,
    fontWeight: "800",
  },
  budgetHeaderCard: {
    backgroundColor: "#182638",
    borderRadius: 22,
    borderWidth: 1,
    borderColor: "#2D4562",
    padding: 18,
    marginBottom: 14,
  },
  budgetHeaderLabel: { color: "#AAB7C4", fontSize: 13, fontWeight: "800" },
  moneyInputRow: { flexDirection: "row", alignItems: "center", marginTop: 4 },
  currencySymbol: {
    color: "#FFFFFF",
    fontSize: 34,
    fontWeight: "900",
    marginRight: 3,
  },
  moneyInput: {
    flex: 1,
    color: "#FFFFFF",
    fontSize: 38,
    fontWeight: "900",
    paddingVertical: 4,
  },
  headerDivider: {
    height: 1,
    backgroundColor: "#2D4562",
    marginVertical: 12,
  },
  balanceRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  balanceLabel: { color: "#CAD3DD", fontSize: 14, fontWeight: "700" },
  balanceAmount: { color: "#2ECC71", fontSize: 20, fontWeight: "900" },
  negativeAmount: { color: "#F06159" },
  itemsCard: {
    backgroundColor: "#17232F",
    borderRadius: 22,
    borderWidth: 1,
    borderColor: "#2D4562",
    overflow: "hidden",
    marginBottom: 14,
  },
  itemsHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#2D4562",
  },
  itemsTitle: { color: "#FFFFFF", fontSize: 17, fontWeight: "900" },
  itemsTotal: { color: "#FFFFFF", fontSize: 17, fontWeight: "900" },
  emptyState: {
    alignItems: "center",
    paddingVertical: 30,
    paddingHorizontal: 16,
  },
  emptyEmoji: { fontSize: 34, marginBottom: 8 },
  emptyText: { color: "#93A4B4", fontSize: 14, fontWeight: "700" },
  itemRow: {
    minHeight: 66,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#26394D",
  },
  excludedItemRow: { opacity: 0.58 },
  itemEmoji: { fontSize: 24, marginRight: 10 },
  itemNameContainer: { flex: 1 },
  itemName: { color: "#FFFFFF", fontSize: 15, fontWeight: "800" },
  tapHint: {
    color: "#2ECC71",
    fontSize: 12,
    fontWeight: "800",
    marginTop: 2,
  },
  itemAmount: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "900",
    marginRight: 10,
  },
  excludedText: {
    textDecorationLine: "line-through",
    color: "#93A4B4",
  },
  includeIndicator: {
    width: 29,
    height: 29,
    borderRadius: 15,
    alignItems: "center",
    justifyContent: "center",
  },
  includeIndicatorOn: { backgroundColor: "#2ECC71" },
  includeIndicatorOff: { backgroundColor: "#46525F" },
  includeIndicatorText: {
    color: "#101820",
    fontSize: 16,
    fontWeight: "900",
  },
  addItemCard: {
    backgroundColor: "#17232F",
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#2D4562",
    padding: 16,
  },
  addItemTitle: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "900",
    marginBottom: 12,
  },
  input: {
    backgroundColor: "#101820",
    borderWidth: 1,
    borderColor: "#2D4562",
    borderRadius: 15,
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
    paddingHorizontal: 14,
    paddingVertical: 13,
    marginBottom: 10,
  },
  amountInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#101820",
    borderWidth: 1,
    borderColor: "#2D4562",
    borderRadius: 15,
    paddingHorizontal: 14,
    marginBottom: 12,
  },
  amountCurrency: { color: "#FFFFFF", fontSize: 18, fontWeight: "900" },
  amountInput: {
    flex: 1,
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
    paddingVertical: 13,
    paddingHorizontal: 5,
  },
  primaryButton: {
    minHeight: 54,
    backgroundColor: "#2ECC71",
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  primaryButtonText: { color: "#101820", fontSize: 16, fontWeight: "900" },
  secondaryButton: {
    minHeight: 52,
    backgroundColor: "#293541",
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 10,
  },
  secondaryButtonText: { color: "#FFFFFF", fontSize: 15, fontWeight: "800" },
  completeCard: {
    backgroundColor: "#1A2D2A",
    borderRadius: 22,
    borderWidth: 1,
    borderColor: "#2ECC71",
    padding: 20,
    alignItems: "center",
  },
  completeEmoji: { fontSize: 54, marginBottom: 8 },
  completeTitle: {
    color: "#FFFFFF",
    fontSize: 25,
    fontWeight: "900",
    marginBottom: 10,
  },
  completeBody: {
    color: "#CAD3DD",
    fontSize: 15,
    lineHeight: 22,
    textAlign: "center",
    fontWeight: "600",
    marginBottom: 18,
  },
  errorCard: {
    backgroundColor: "#4A2E2D",
    borderWidth: 1,
    borderColor: "#D65C54",
    borderRadius: 15,
    padding: 13,
    marginTop: 12,
  },
  errorText: {
    color: "#FFFFFF",
    fontSize: 14,
    lineHeight: 20,
    fontWeight: "700",
    textAlign: "center",
  },
});
