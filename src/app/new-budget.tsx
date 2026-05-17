import { StyleSheet, Text, TextInput, View } from "react-native";

export default function NewBudgetScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>New Budget</Text>

      <TextInput
        style={styles.budgetName}
        placeholder="Budget name"
        placeholderTextColor="#6b7280"
      />

      <Text style={styles.sectionTitle}>Dollar Amount</Text>
      <TextInput
        style={styles.input}
        placeholder="$0.00"
        placeholderTextColor="#6b7280"
        keyboardType="numeric"
      />

      <Text style={styles.sectionTitle}>Spending</Text>
      <TextInput
        style={styles.input}
        placeholder="$0.00 - Item 1"
        placeholderTextColor="#6b7280"
        keyboardType="numeric"
      />

      <TextInput
        style={styles.input}
        placeholder="$0.00 - Item 2"
        placeholderTextColor="#6b7280"
        keyboardType="numeric"
      />

      <TextInput
        style={styles.input}
        placeholder="$0.00 - Item 3"
        placeholderTextColor="#6b7280"
        keyboardType="numeric"
      />

      <Text style={styles.sectionTitle}>Notes</Text>
      <TextInput
        style={styles.notes}
        placeholder="Write budget notes here..."
        placeholderTextColor="#6b7280"
        multiline
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
  title: {
    color: "white",
    fontSize: 36,
    fontWeight: "bold",
    marginBottom: 20,
  },
  budgetName: {
    color: "white",
    fontSize: 24,
    borderBottomWidth: 1,
    borderBottomColor: "#374151",
    paddingBottom: 10,
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
