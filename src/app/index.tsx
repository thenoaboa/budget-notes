import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFocusEffect, useRouter } from "expo-router";
import { useCallback, useState } from "react";
import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
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
    Alert.alert("Delete note?", "Are you sure you want to delete this?", [
      { text: "No", style: "cancel" },
      {
        text: "Yes",
        style: "destructive",
        onPress: () => deleteBudget(budgetId),
      },
    ]);
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
      <View style={styles.simpleHeader}>
        <Text style={styles.simpleTitle}>Your Notes</Text>

        <Text style={styles.simpleSubtitle}>
          Keep track of what you have and what still feels safe.
        </Text>
      </View>

      <Pressable style={styles.newButton} onPress={createNewBudget}>
        <Text style={styles.newButtonText}>+ New Note</Text>
      </Pressable>

      {budgets.length === 0 && (
        <View style={styles.emptyCard}>
          <Text style={styles.emptyTitle}>Nothing here yet.</Text>
          <Text style={styles.emptyText}>
            Start a note when you want a clearer picture before spending.
          </Text>
        </View>
      )}

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
              {budget.budgetName || "Untitled Note"}
            </Text>

            <Text style={styles.cardSubtitle}>Tap to keep planning</Text>
          </Pressable>
        </Swipeable>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#101820",
  },

  content: {
    paddingHorizontal: 16,
    paddingTop: 58,
    paddingBottom: 120,
    backgroundColor: "#101820",
  },

  simpleHeader: {
    marginBottom: 22,
  },

  simpleTitle: {
    color: "#FFFFFF",
    fontSize: 42,
    fontWeight: "900",
    letterSpacing: -1,
  },

  simpleSubtitle: {
    color: "#8A98A8",
    fontSize: 16,
    fontWeight: "700",
    marginTop: 6,
    lineHeight: 22,
  },

  newButton: {
    backgroundColor: "#2ECC71",
    borderRadius: 16,
    paddingVertical: 15,
    alignItems: "center",
    marginBottom: 18,
  },

  newButtonText: {
    color: "#101820",
    fontSize: 17,
    fontWeight: "900",
  },

  emptyCard: {
    backgroundColor: "#1B2633",
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: "#344657",
    marginBottom: 14,
  },

  emptyTitle: {
    color: "#FFFFFF",
    fontSize: 20,
    fontWeight: "900",
    marginBottom: 6,
  },

  emptyText: {
    color: "#CAD3DD",
    fontSize: 15,
    fontWeight: "700",
    lineHeight: 21,
  },

  card: {
    backgroundColor: "#1B2633",
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: "#344657",
    marginBottom: 14,
  },

  cardTitle: {
    color: "#FFFFFF",
    fontSize: 24,
    fontWeight: "900",
  },

  cardSubtitle: {
    color: "#CAD3DD",
    fontSize: 15,
    fontWeight: "700",
    marginTop: 6,
  },

  deleteAction: {
    backgroundColor: "#3A1C1C",
    borderColor: "#FF6B6B",
    borderWidth: 1,
    justifyContent: "center",
    alignItems: "center",
    width: 90,
    marginBottom: 14,
    borderRadius: 18,
  },

  deleteActionText: {
    color: "#FF6B6B",
    fontWeight: "900",
  },
});
