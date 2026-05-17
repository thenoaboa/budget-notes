import { StyleSheet, Text, View } from "react-native";

export default function BudgetDetailScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>New Budget</Text>
      <Text style={styles.subtitle}>
        This is where the editable budget will go.
      </Text>
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
  },
  subtitle: {
    color: "#9ca3af",
    marginTop: 12,
    fontSize: 16,
  },
});
