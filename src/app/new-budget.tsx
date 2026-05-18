import AsyncStorage from "@react-native-async-storage/async-storage";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";

export default function NewBudgetScreen() {
  const [budgetName, setBudgetName] = useState("Newww Budget");
  const [amount, setAmount] = useState("");
  const [item1, setItem1] = useState("");
  const [item2, setItem2] = useState("");
  const [item3, setItem3] = useState("");
  const [notes, setNotes] = useState("");

  useEffect(() => {
    async function autoSaveBudget() {
      const budget = {
        id: "new-budget",
        budgetName,
        amount,
        item1,
        item2,
        item3,
        notes,
      };

      await AsyncStorage.setItem("newBudgetDraft", JSON.stringify(budget));
    }

    autoSaveBudget();
  }, [budgetName, amount, item1, item2, item3, notes]);

  return (
    <View style={styles.container}>
      <Pressable onPress={() => router.push("/")}>
        <Text style={styles.backButton}>← Back</Text>
      </Pressable>

      <TextInput
        style={styles.title}
        value={budgetName}
        onChangeText={setBudgetName}
        placeholder="New Budget"
        placeholderTextColor="#6b7280"
      />

      <Text style={styles.sectionTitle}>Dollar Amount</Text>

      <TextInput
        style={styles.input}
        placeholder="$0.00"
        placeholderTextColor="#6b7280"
        keyboardType="numeric"
        value={amount}
        onChangeText={setAmount}
      />

      <Text style={styles.sectionTitle}>Expenses</Text>

      <TextInput
        style={styles.input}
        placeholder="$0.00 - Item 1"
        placeholderTextColor="#6b7280"
        value={item1}
        onChangeText={setItem1}
      />

      <TextInput
        style={styles.input}
        placeholder="$0.00 - Item 2"
        placeholderTextColor="#6b7280"
        value={item2}
        onChangeText={setItem2}
      />

      <TextInput
        style={styles.input}
        placeholder="$0.00 - Item 3"
        placeholderTextColor="#6b7280"
        value={item3}
        onChangeText={setItem3}
      />

      <Text style={styles.sectionTitle}>Notes</Text>

      <TextInput
        style={styles.notes}
        placeholder="Write budget notes here..."
        placeholderTextColor="#6b7280"
        multiline
        value={notes}
        onChangeText={setNotes}
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
    marginBottom: 20,
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
