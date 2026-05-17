import AsyncStorage from "@react-native-async-storage/async-storage";
import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useRef, useState } from "react";
import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";

type Budget = {
  id: string;
  budgetName: string;
  amount: string;
  item1: string;
  item2: string;
  item3: string;
  notes: string;
};

export default function BudgetDetailScreen() {
  const { id } = useLocalSearchParams();

  const item1NameRef = useRef<TextInput>(null);
  const item2AmountRef = useRef<TextInput>(null);
  const item2NameRef = useRef<TextInput>(null);
  const item3AmountRef = useRef<TextInput>(null);
  const item3NameRef = useRef<TextInput>(null);

  const [budget, setBudget] = useState<Budget>({
    id: String(id),
    budgetName: "",
    amount: "",
    item1: "",
    item2: "",
    item3: "",
    notes: "",
  });

  useEffect(() => {
    async function loadBudget() {
      const savedBudgets = await AsyncStorage.getItem("budgets");
      const parsedBudgets: Budget[] = savedBudgets
        ? JSON.parse(savedBudgets)
        : [];

      const foundBudget = parsedBudgets.find((b) => b.id === String(id));

      if (foundBudget) {
        setBudget(foundBudget);
      }
    }

    loadBudget();
  }, [id]);

  async function updateBudget(field: keyof Budget, value: string) {
    const updatedBudget = {
      ...budget,
      id: String(id),
      [field]: value,
    };

    setBudget(updatedBudget);

    const hasContent =
      updatedBudget.budgetName.trim() !== "" ||
      updatedBudget.amount.trim() !== "" ||
      updatedBudget.item1.trim() !== "" ||
      updatedBudget.item2.trim() !== "" ||
      updatedBudget.item3.trim() !== "" ||
      updatedBudget.notes.trim() !== "";

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

  async function deleteBudget() {
    const savedBudgets = await AsyncStorage.getItem("budgets");
    const parsedBudgets: Budget[] = savedBudgets
      ? JSON.parse(savedBudgets)
      : [];

    const updatedBudgets = parsedBudgets.filter((b) => b.id !== String(id));

    await AsyncStorage.setItem("budgets", JSON.stringify(updatedBudgets));

    router.push("/");
  }

  return (
    <View style={styles.container}>
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
        onChangeText={(text) => updateBudget("budgetName", text)}
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
          blurOnSubmit={false}
          onSubmitEditing={() => item2AmountRef.current?.focus()}
          onChangeText={(text) => updateBudget("amount", text)}
        />
      </View>

      <Text style={styles.sectionTitle}>Spending</Text>

      <View style={styles.spendingRow}>
        <View style={styles.spendingAmountContainer}>
          <Text style={styles.dollarSign}>$</Text>

          <TextInput
            style={styles.spendingAmountInput}
            value={budget.item1}
            placeholder="0.00"
            placeholderTextColor="#6b7280"
            keyboardType="numeric"
            returnKeyType="next"
            blurOnSubmit={false}
            onSubmitEditing={() => item1NameRef.current?.focus()}
            onChangeText={(text) => updateBudget("item1", text)}
          />
        </View>

        <TextInput
          ref={item1NameRef}
          style={styles.spendingNameInput}
          placeholder="Item name"
          placeholderTextColor="#6b7280"
          returnKeyType="next"
          blurOnSubmit={false}
          onSubmitEditing={() => item2AmountRef.current?.focus()}
        />
      </View>

      <View style={styles.spendingRow}>
        <View style={styles.spendingAmountContainer}>
          <Text style={styles.dollarSign}>$</Text>

          <TextInput
            ref={item2AmountRef}
            style={styles.spendingAmountInput}
            value={budget.item2}
            placeholder="0.00"
            placeholderTextColor="#6b7280"
            keyboardType="numeric"
            returnKeyType="next"
            blurOnSubmit={false}
            onSubmitEditing={() => item2NameRef.current?.focus()}
            onChangeText={(text) => updateBudget("item2", text)}
          />
        </View>

        <TextInput
          ref={item2NameRef}
          style={styles.spendingNameInput}
          placeholder="Item name"
          placeholderTextColor="#6b7280"
          returnKeyType="next"
          blurOnSubmit={false}
          onSubmitEditing={() => item3AmountRef.current?.focus()}
        />
      </View>

      <View style={styles.spendingRow}>
        <View style={styles.spendingAmountContainer}>
          <Text style={styles.dollarSign}>$</Text>

          <TextInput
            ref={item3AmountRef}
            style={styles.spendingAmountInput}
            value={budget.item3}
            placeholder="0.00"
            placeholderTextColor="#6b7280"
            keyboardType="numeric"
            returnKeyType="next"
            blurOnSubmit={false}
            onSubmitEditing={() => item3NameRef.current?.focus()}
            onChangeText={(text) => updateBudget("item3", text)}
          />
        </View>

        <TextInput
          ref={item3NameRef}
          style={styles.spendingNameInput}
          placeholder="Item name"
          placeholderTextColor="#6b7280"
          returnKeyType="done"
        />
      </View>

      <Text style={styles.sectionTitle}>Notes</Text>

      <TextInput
        style={styles.notes}
        value={budget.notes}
        placeholder="Write budget notes here..."
        placeholderTextColor="#6b7280"
        multiline
        onChangeText={(text) => updateBudget("notes", text)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#111",
    padding: 24,
    paddingTop: 60,
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
  },

  spendingAmountContainer: {
    backgroundColor: "#1f2937",
    borderRadius: 10,
    paddingHorizontal: 14,
    flexDirection: "row",
    alignItems: "center",
    width: 120,
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

  notes: {
    backgroundColor: "#1f2937",
    color: "white",
    padding: 14,
    borderRadius: 10,
    minHeight: 120,
    textAlignVertical: "top",
  },
});
