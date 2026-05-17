import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFocusEffect, useRouter } from "expo-router";
import { useCallback, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

type Budget = {
  id: string;
  budgetName: string;
  amount: string;
  item1: string;
  item2: string;
  item3: string;
  notes: string;
};

export default function HomeScreen() {
  const router = useRouter();
  const [budgets, setBudgets] = useState<Budget[]>([]);

  useFocusEffect(
    useCallback(() => {
      async function loadBudgets() {
        const savedBudgets = await AsyncStorage.getItem("budgets");

        const parsedBudgets = savedBudgets ? JSON.parse(savedBudgets) : [];

        setBudgets(parsedBudgets);
      }

      loadBudgets();
    }, []),
  );

  async function createNewBudget() {
    const id = Date.now().toString();

    const newBudget: Budget = {
      id,
      budgetName: "New Budget",
      amount: "",
      item1: "",
      item2: "",
      item3: "",
      notes: "",
    };

    const updatedBudgets = [newBudget, ...budgets];

    await AsyncStorage.setItem("budgets", JSON.stringify(updatedBudgets));

    setBudgets(updatedBudgets);

    router.push({
      pathname: "/budget/[id]",
      params: { id },
    });
  }

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Budgets</Text>

      <Pressable style={styles.newButton} onPress={createNewBudget}>
        <Text style={styles.newButtonText}>+ New Budget</Text>
      </Pressable>

      {budgets.map((budget) => (
        <Pressable
          key={budget.id}
          style={styles.card}
          onPress={() =>
            router.push({
              pathname: "/budget/[id]",
              params: { id: budget.id },
            })
          }
        >
          <Text style={styles.cardTitle}>{budget.budgetName}</Text>

          <Text style={styles.cardSubtitle}>Tap to edit budget</Text>
        </Pressable>
      ))}
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

  header: {
    color: "white",
    fontSize: 36,
    fontWeight: "bold",
    marginBottom: 20,
  },

  newButton: {
    backgroundColor: "#2563eb",
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
  },

  newButtonText: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
    textAlign: "center",
  },

  card: {
    backgroundColor: "#1f2937",
    padding: 18,
    borderRadius: 14,
    marginBottom: 14,
  },

  cardTitle: {
    color: "white",
    fontSize: 22,
    fontWeight: "bold",
  },

  cardSubtitle: {
    color: "#9ca3af",
    marginTop: 6,
  },
});
