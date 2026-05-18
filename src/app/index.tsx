import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFocusEffect, useRouter } from "expo-router";
import { useCallback, useState } from "react";
import { Alert, Pressable, ScrollView, StyleSheet, Text } from "react-native";
import { Swipeable } from "react-native-gesture-handler";

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

  function createNewBudget() {
    const id = Date.now().toString();

    router.push(`/budget/${id}` as any);
  }

  async function deleteBudget(budgetId: string) {
    const updatedBudgets = budgets.filter((budget) => budget.id !== budgetId);

    setBudgets(updatedBudgets);

    await AsyncStorage.setItem("budgets", JSON.stringify(updatedBudgets));
  }

  function confirmDeleteBudget(budgetId: string) {
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
          onPress: () => deleteBudget(budgetId),
        },
      ],
    );
  }

  function renderRightActions(budgetId: string) {
    return (
      <Pressable
        style={styles.deleteAction}
        onPress={() => confirmDeleteBudget(budgetId)}
      >
        <Text style={styles.deleteActionText}>Delete</Text>
      </Pressable>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.header}>Budgets</Text>

      <Pressable style={styles.newButton} onPress={createNewBudget}>
        <Text style={styles.newButtonText}>+ New Budget</Text>
      </Pressable>

      {budgets.map((budget) => (
        <Swipeable
          key={budget.id}
          renderRightActions={() => renderRightActions(budget.id)}
        >
          <Pressable
            style={styles.card}
            onPress={() => router.push(`/budget/${budget.id}` as any)}
          >
            <Text style={styles.cardTitle}>
              {budget.budgetName || "Untitled Budget"}
            </Text>

            <Text style={styles.cardSubtitle}>Tap to edit budget</Text>
          </Pressable>
        </Swipeable>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#111",
  },

  content: {
    padding: 24,
    paddingTop: 60,
    paddingBottom: 40,
  },

  header: {
    color: "white",
    fontSize: 42,
    fontWeight: "bold",
    marginBottom: 24,
  },

  newButton: {
    backgroundColor: "#2563eb",
    padding: 18,
    borderRadius: 14,
    alignItems: "center",
    marginBottom: 18,
  },

  newButtonText: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
  },

  card: {
    backgroundColor: "#1f2937",
    padding: 20,
    borderRadius: 14,
    marginBottom: 14,
  },

  cardTitle: {
    color: "white",
    fontSize: 24,
    fontWeight: "bold",
  },

  cardSubtitle: {
    color: "#9ca3af",
    marginTop: 6,
  },

  deleteAction: {
    backgroundColor: "#dc2626",
    justifyContent: "center",
    alignItems: "center",
    width: 90,
    marginBottom: 14,
    borderRadius: 14,
  },

  deleteActionText: {
    color: "white",
    fontWeight: "bold",
  },
});
