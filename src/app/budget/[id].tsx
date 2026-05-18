import AsyncStorage from "@react-native-async-storage/async-storage";
import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useRef, useState } from "react";
import {
    Alert,
    KeyboardAvoidingView,
    Platform,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    View,
} from "react-native";
import {
    Swipeable,
    type Swipeable as SwipeableType,
} from "react-native-gesture-handler";

type SpendingItem = {
  id: string;
  amount: string;
  name: string;
  quantity: string;
  included: boolean;
};

type Budget = {
  id: string;
  budgetName: string;
  amount: string;
  spendingItems: SpendingItem[];
  notes: string;
};

function createBlankSpendingItem(): SpendingItem {
  return {
    id: Date.now().toString() + Math.random().toString(),
    amount: "",
    name: "",
    quantity: "1",
    included: true,
  };
}

function moneyToNumber(value: string) {
  const number = parseFloat(value);
  return isNaN(number) ? 0 : number;
}

function quantityToNumber(value: string) {
  const number = parseFloat(value);
  return isNaN(number) || number <= 0 ? 1 : number;
}

function formatMoney(value: number) {
  return `$${Math.abs(value).toFixed(2)}`;
}

export default function BudgetDetailScreen() {
  const { id } = useLocalSearchParams();

  const scrollViewRef = useRef<ScrollView>(null);
  const amountRefs = useRef<Record<string, TextInput | null>>({});
  const nameRefs = useRef<Record<string, TextInput | null>>({});
  const quantityRefs = useRef<Record<string, TextInput | null>>({});
  const swipeableRefs = useRef<Record<string, SwipeableType | null>>({});

  const [budget, setBudget] = useState<Budget>({
    id: String(id),
    budgetName: "",
    amount: "",
    spendingItems: [createBlankSpendingItem()],
    notes: "",
  });

  const totalSpending = budget.spendingItems.reduce((total, item) => {
    if (!item.included) return total;

    return total + moneyToNumber(item.amount) * quantityToNumber(item.quantity);
  }, 0);

  const remaining = moneyToNumber(budget.amount) - totalSpending;
  const isOverBudget = remaining < 0;

  useEffect(() => {
    async function loadBudget() {
      const savedBudgets = await AsyncStorage.getItem("budgets");
      const parsedBudgets: Budget[] = savedBudgets
        ? JSON.parse(savedBudgets)
        : [];

      const foundBudget = parsedBudgets.find((b) => b.id === String(id));

      if (foundBudget) {
        setBudget({
          ...foundBudget,
          spendingItems:
            foundBudget.spendingItems && foundBudget.spendingItems.length > 0
              ? foundBudget.spendingItems
              : [createBlankSpendingItem()],
        });
      }
    }

    loadBudget();
  }, [id]);

  async function saveBudget(updatedBudget: Budget) {
    const hasContent =
      updatedBudget.budgetName.trim() !== "" ||
      updatedBudget.amount.trim() !== "" ||
      updatedBudget.notes.trim() !== "" ||
      updatedBudget.spendingItems.some(
        (item) =>
          item.amount.trim() !== "" ||
          item.name.trim() !== "" ||
          item.quantity.trim() !== "",
      );

    const savedBudgets = await AsyncStorage.getItem("budgets");
    const parsedBudgets: Budget[] = savedBudgets
      ? JSON.parse(savedBudgets)
      : [];

    if (!hasContent) {
      const filteredBudgets = parsedBudgets.filter((b) => b.id !== String(id));
      await AsyncStorage.setItem("budgets", JSON.stringify(filteredBudgets));
      return;
    }

    const budgetExists = parsedBudgets.some((b) => b.id === String(id));

    const updatedBudgets = budgetExists
      ? parsedBudgets.map((b) => (b.id === String(id) ? updatedBudget : b))
      : [updatedBudget, ...parsedBudgets];

    await AsyncStorage.setItem("budgets", JSON.stringify(updatedBudgets));
  }

  function updateBudgetField(field: keyof Budget, value: string) {
    const updatedBudget = {
      ...budget,
      id: String(id),
      [field]: value,
    };

    setBudget(updatedBudget);
    saveBudget(updatedBudget);
  }

  function updateSpendingItem(
    itemId: string,
    field: keyof SpendingItem,
    value: string,
  ) {
    const updatedItems = budget.spendingItems.map((item) =>
      item.id === itemId ? { ...item, [field]: value } : item,
    );

    const updatedBudget = {
      ...budget,
      id: String(id),
      spendingItems: updatedItems,
    };

    setBudget(updatedBudget);
    saveBudget(updatedBudget);
  }

  function toggleItemIncluded(itemId: string) {
    const updatedItems = budget.spendingItems.map((item) =>
      item.id === itemId ? { ...item, included: !item.included } : item,
    );

    const updatedBudget = {
      ...budget,
      id: String(id),
      spendingItems: updatedItems,
    };

    setBudget(updatedBudget);
    saveBudget(updatedBudget);
  }

  function deleteSpendingItem(itemId: string) {
    const updatedItems = budget.spendingItems.filter(
      (item) => item.id !== itemId,
    );

    const finalItems =
      updatedItems.length > 0 ? updatedItems : [createBlankSpendingItem()];

    const updatedBudget = {
      ...budget,
      id: String(id),
      spendingItems: finalItems,
    };

    setBudget(updatedBudget);
    saveBudget(updatedBudget);
  }

  function confirmDeleteSpendingItem(itemId: string) {
    Alert.alert("Delete item?", "Are you sure you want to delete this item?", [
      {
        text: "No",
        style: "cancel",
        onPress: () => swipeableRefs.current[itemId]?.close(),
      },
      {
        text: "Yes",
        style: "destructive",
        onPress: () => {
          deleteSpendingItem(itemId);
          swipeableRefs.current[itemId]?.close();
        },
      },
    ]);
  }

  function addSpendingItemAndFocus() {
    const newItem = createBlankSpendingItem();

    const updatedBudget = {
      ...budget,
      id: String(id),
      spendingItems: [...budget.spendingItems, newItem],
    };

    setBudget(updatedBudget);
    saveBudget(updatedBudget);

    setTimeout(() => {
      amountRefs.current[newItem.id]?.focus();
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 150);
  }

  function deleteBudget() {
    Alert.alert(
      "Delete budget?",
      "Are you sure you want to delete this budget?",
      [
        {
          text: "No",
          style: "cancel",
        },
        {
          text: "Yes",
          style: "destructive",
          onPress: async () => {
            const savedBudgets = await AsyncStorage.getItem("budgets");
            const parsedBudgets: Budget[] = savedBudgets
              ? JSON.parse(savedBudgets)
              : [];

            const updatedBudgets = parsedBudgets.filter(
              (b) => b.id !== String(id),
            );

            await AsyncStorage.setItem(
              "budgets",
              JSON.stringify(updatedBudgets),
            );

            router.push("/");
          },
        },
      ],
    );
  }

  function renderLeftActions(itemId: string, included: boolean) {
    return (
      <Pressable
        style={[
          styles.includeAction,
          included ? styles.excludeActionColor : styles.includeActionColor,
        ]}
        onPress={() => {
          toggleItemIncluded(itemId);
          swipeableRefs.current[itemId]?.close();
        }}
      >
        <Text style={styles.includeActionText}>
          {included ? "Exclude" : "Include"}
        </Text>
      </Pressable>
    );
  }

  function renderRightActions(itemId: string) {
    return (
      <Pressable
        style={styles.deleteAction}
        onPress={() => confirmDeleteSpendingItem(itemId)}
      >
        <Text style={styles.deleteActionText}>Delete</Text>
      </Pressable>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.screen}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={90}
    >
      <ScrollView
        ref={scrollViewRef}
        style={styles.scrollArea}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.topBar}>
          <Pressable onPress={() => router.push("/")}>
            <Text style={styles.backButton}>← Back</Text>
          </Pressable>

          <Pressable onPress={deleteBudget}>
            <Text style={styles.trashButton}>🗑️</Text>
          </Pressable>
        </View>

        <TextInput
          style={styles.title}
          value={budget.budgetName}
          placeholder="New Budget"
          placeholderTextColor="#6b7280"
          returnKeyType="next"
          onChangeText={(text) => updateBudgetField("budgetName", text)}
        />

        <Text style={styles.sectionTitle}>Dollar Amount</Text>

        <View style={styles.moneyInputContainer}>
          <Text style={styles.dollarSign}>$</Text>

          <TextInput
            style={styles.moneyInput}
            value={budget.amount}
            placeholder="0.00"
            placeholderTextColor="#6b7280"
            keyboardType="numeric"
            returnKeyType="next"
            onChangeText={(text) => updateBudgetField("amount", text)}
          />
        </View>

        <Text style={styles.sectionTitle}>Spending</Text>

        {budget.spendingItems.map((item, index) => {
          const isLastItem = index === budget.spendingItems.length - 1;

          return (
            <Swipeable
              ref={(ref) => {
                swipeableRefs.current[item.id] = ref;
              }}
              key={item.id}
              renderLeftActions={() =>
                renderLeftActions(item.id, item.included)
              }
              renderRightActions={() => renderRightActions(item.id)}
            >
              <View
                style={[
                  styles.spendingRow,
                  !item.included && styles.excludedSpendingRow,
                ]}
              >
                <View style={styles.spendingAmountContainer}>
                  <Text style={styles.dollarSign}>$</Text>

                  <TextInput
                    ref={(ref) => {
                      amountRefs.current[item.id] = ref;
                    }}
                    style={styles.spendingAmountInput}
                    value={item.amount}
                    placeholder="0.00"
                    placeholderTextColor="#6b7280"
                    keyboardType="numeric"
                    returnKeyType="next"
                    blurOnSubmit={false}
                    onSubmitEditing={() => nameRefs.current[item.id]?.focus()}
                    onChangeText={(text) =>
                      updateSpendingItem(item.id, "amount", text)
                    }
                  />
                </View>

                <TextInput
                  ref={(ref) => {
                    nameRefs.current[item.id] = ref;
                  }}
                  style={styles.spendingNameInput}
                  value={item.name}
                  placeholder="Item name"
                  placeholderTextColor="#6b7280"
                  returnKeyType="next"
                  blurOnSubmit={false}
                  onSubmitEditing={() => {
                    if (isLastItem) {
                      addSpendingItemAndFocus();
                    } else {
                      const nextItem = budget.spendingItems[index + 1];
                      amountRefs.current[nextItem.id]?.focus();
                    }
                  }}
                  onChangeText={(text) =>
                    updateSpendingItem(item.id, "name", text)
                  }
                />

                <TextInput
                  ref={(ref) => {
                    quantityRefs.current[item.id] = ref;
                  }}
                  style={styles.quantityInput}
                  value={item.quantity}
                  placeholder="1"
                  placeholderTextColor="#6b7280"
                  keyboardType="numeric"
                  returnKeyType="done"
                  onChangeText={(text) =>
                    updateSpendingItem(item.id, "quantity", text)
                  }
                />
              </View>
            </Swipeable>
          );
        })}

        <Text style={styles.sectionTitle}>Notes</Text>

        <TextInput
          style={styles.notes}
          value={budget.notes}
          placeholder="Write budget notes here..."
          placeholderTextColor="#6b7280"
          multiline
          onChangeText={(text) => updateBudgetField("notes", text)}
        />
      </ScrollView>

      <View style={styles.summaryBar}>
        <Text
          style={[
            styles.remainingText,
            isOverBudget ? styles.overBudgetText : styles.underBudgetText,
          ]}
        >
          {isOverBudget ? "-" : ""}
          {formatMoney(remaining)}
        </Text>

        <Text style={styles.summaryLabel}>Remaining</Text>

        <Text style={styles.totalSpendingText}>
          Total Spending: {formatMoney(totalSpending)}
        </Text>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#111",
  },

  scrollArea: {
    flex: 1,
  },

  scrollContent: {
    padding: 24,
    paddingTop: 60,
    paddingBottom: 190,
  },

  topBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },

  backButton: {
    color: "#60a5fa",
    fontSize: 18,
  },

  trashButton: {
    fontSize: 24,
  },

  title: {
    color: "white",
    fontSize: 36,
    fontWeight: "bold",
    marginBottom: 24,
  },

  sectionTitle: {
    color: "#9ca3af",
    fontSize: 16,
    fontWeight: "bold",
    marginTop: 18,
    marginBottom: 8,
  },

  moneyInputContainer: {
    backgroundColor: "#1f2937",
    borderRadius: 10,
    paddingHorizontal: 14,
    marginBottom: 10,
    flexDirection: "row",
    alignItems: "center",
  },

  dollarSign: {
    color: "white",
    fontSize: 18,
    marginRight: 4,
  },

  moneyInput: {
    flex: 1,
    color: "white",
    paddingVertical: 14,
    fontSize: 16,
  },

  spendingRow: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 10,
    backgroundColor: "#111",
  },

  excludedSpendingRow: {
    opacity: 0.4,
  },

  spendingAmountContainer: {
    backgroundColor: "#1f2937",
    borderRadius: 10,
    paddingHorizontal: 14,
    flexDirection: "row",
    alignItems: "center",
    width: 105,
  },

  spendingAmountInput: {
    flex: 1,
    color: "white",
    paddingVertical: 14,
  },

  spendingNameInput: {
    flex: 1,
    backgroundColor: "#1f2937",
    color: "white",
    padding: 14,
    borderRadius: 10,
  },

  quantityInput: {
    width: 55,
    backgroundColor: "#1f2937",
    color: "white",
    padding: 14,
    borderRadius: 10,
    textAlign: "center",
  },

  includeAction: {
    justifyContent: "center",
    alignItems: "center",
    width: 100,
    marginBottom: 10,
    borderRadius: 10,
  },

  includeActionColor: {
    backgroundColor: "#16a34a",
  },

  excludeActionColor: {
    backgroundColor: "#6b7280",
  },

  includeActionText: {
    color: "white",
    fontWeight: "bold",
  },

  deleteAction: {
    backgroundColor: "#dc2626",
    justifyContent: "center",
    alignItems: "center",
    width: 90,
    marginBottom: 10,
    borderRadius: 10,
  },

  deleteActionText: {
    color: "white",
    fontWeight: "bold",
  },

  notes: {
    backgroundColor: "#1f2937",
    color: "white",
    padding: 14,
    borderRadius: 10,
    minHeight: 120,
    textAlignVertical: "top",
  },

  summaryBar: {
    backgroundColor: "#1f2937",
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: "#374151",
  },

  remainingText: {
    fontSize: 32,
    fontWeight: "bold",
    textAlign: "left",
  },

  underBudgetText: {
    color: "#16a34a",
  },

  overBudgetText: {
    color: "#dc2626",
  },

  summaryLabel: {
    color: "#9ca3af",
    textAlign: "left",
    fontSize: 14,
    marginTop: 2,
  },

  totalSpendingText: {
    color: "#9ca3af",
    textAlign: "left",
    fontSize: 16,
    marginTop: 8,
  },
});
