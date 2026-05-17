import {
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import { Link } from "expo-router";

export default function HomeScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.header}>Budgets</Text>

      <Link href="/budget-detail" asChild>
        <TouchableOpacity style={styles.newButton}>
          <Text style={styles.newButtonText}>+ New Budget</Text>
        </TouchableOpacity>
      </Link>

      <Link href="/budget-detail" asChild>
        <Pressable style={styles.card}>
          <Text style={styles.cardTitle}>May Budget</Text>
          <Text style={styles.cardSubtitle}>
            Tap to edit income, bills, and notes
          </Text>
        </Pressable>
      </Link>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Wedding Budget</Text>
        <Text style={styles.cardSubtitle}>Saved draft</Text>
      </View>
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
