import AsyncStorage from "@react-native-async-storage/async-storage";
import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
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
      } else {
        setBudget({
          id: String(id),
          budgetName: "",
          amount: "",
          item1: "",
          item2: "",
          item3: "",
          notes: "",
        });
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

  return (
    <View style={styles.container}>
      <Pressable onPress={() => router.push("/")}>
        <Text style={styles.backButton}>← Back</Text>
      </Pressable>

      <TextInput
        style={styles.title}
        value={budget.budgetName}
        placeholder="New Budget"
        placeholderTextColor="#6b7280"
        onChangeText={(text) => updateBudget("budgetName", text)}
      />

      <Text style={styles.sectionTitle}>Dollar Amount</Text>

      <TextInput
        style={styles.input}
        value={budget.amount}
        placeholder="$0.00"
        placeholderTextColor="#6b7280"
        keyboardType="numeric"
        onChangeText={(text) => updateBudget("amount", text)}
      />

      <Text style={styles.sectionTitle}>Expenses</Text>

      <TextInput
        style={styles.input}
        value={budget.item1}
        placeholder="$0.00 - Item 1"
        placeholderTextColor="#6b7280"
        onChangeText={(text) => updateBudget("item1", text)}
      />

      <TextInput
        style={styles.input}
        value={budget.item2}
        placeholder="$0.00 - Item 2"
        placeholderTextColor="#6b7280"
        onChangeText={(text) => updateBudget("item2", text)}
      />

      <TextInput
        style={styles.input}
        value={budget.item3}
        placeholder="$0.00 - Item 3"
        placeholderTextColor="#6b7280"
        onChangeText={(text) => updateBudget("item3", text)}
      />

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
  backButton: {
    color: "#60a5fa",
    fontSize: 18,
    marginBottom: 20,
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
  input: {
    backgroundColor: "#1f2937",
    color: "white",
    padding: 14,
    borderRadius: 10,
    marginBottom: 10,
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
