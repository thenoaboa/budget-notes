import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFocusEffect, useRouter } from "expo-router";
import { useCallback, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

type Budget = {
  id: string;
  name: string;
  subtitle: string;
};

export default function HomeScreen() {
  const router = useRouter();
  const [savedBudgets, setSavedBudgets] = useState<Budget[]>([]);

  useFocusEffect(
    useCallback(() => {
      async function loadBudgets() {
        const existingBudgets = await AsyncStorage.getItem("budgets");
        const budgets = existingBudgets ? JSON.parse(existingBudgets) : [];
        setSavedBudgets(budgets);
      }

      loadBudgets();
    }, []),
  );

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Budgets</Text>

      <Pressable
        style={styles.newButton}
        onPress={() => router.push("/new-budget")}
      >
        <Text style={styles.newButtonText}>+ New Budget</Text>
      </Pressable>

      <Pressable style={styles.card} onPress={() => router.push("/may-budget")}>
        <Text style={styles.cardTitle}>May Budget</Text>
        <Text style={styles.cardSubtitle}>
          Tap to edit income, bills, and notes
        </Text>
      </Pressable>

      <Pressable
        style={styles.card}
        onPress={() => router.push("/wedding-budget")}
      >
        <Text style={styles.cardTitle}>Wedding Budget</Text>
        <Text style={styles.cardSubtitle}>Saved draft</Text>
      </Pressable>

      {savedBudgets.map((budget) => (
        <Pressable key={budget.id} style={styles.card}>
          <Text style={styles.cardTitle}>{budget.name}</Text>
          <Text style={styles.cardSubtitle}>{budget.subtitle}</Text>
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
