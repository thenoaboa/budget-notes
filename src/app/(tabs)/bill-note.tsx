// src/app/(tabs)/bill-note.tsx

import { useRouter } from "expo-router";
import { Pressable, SafeAreaView, StyleSheet, Text, View } from "react-native";

export default function BillNoteScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.screen}>
      <View style={styles.content}>
        <View style={styles.headerRow}>
          <View style={styles.headerText}>
            <Text style={styles.title}>Bills</Text>

            <Text style={styles.subtitle}>Plan to pay what you owe.</Text>
          </View>

          <Pressable
            onPress={() => router.replace("/home" as any)}
            style={({ pressed }) => [
              styles.billHomeButton,
              pressed && styles.pressedButton,
            ]}
            hitSlop={10}
            accessibilityRole="button"
            accessibilityLabel="Go to Budget Note home"
          >
            <Text style={styles.billIcon}>🐷</Text>
          </Pressable>
        </View>

        <View style={styles.placeholder}>
          <Text style={styles.placeholderTitle}>No bill notes yet.</Text>

          <Text style={styles.placeholderText}>
            Create a bill note when you are ready to organize a balance or
            payment plan.
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#101820",
  },

  content: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 58,
    paddingBottom: 120,
  },

  headerRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    marginBottom: 24,
  },

  headerText: {
    flex: 1,
    paddingRight: 14,
  },

  title: {
    color: "#FFFFFF",
    fontSize: 42,
    fontWeight: "900",
    letterSpacing: -1,
  },

  subtitle: {
    color: "#A6A0B3",
    fontSize: 15,
    fontWeight: "700",
    lineHeight: 20,
    marginTop: 6,
  },

  billHomeButton: {
    width: 48,
    height: 48,
    borderRadius: 16,
    backgroundColor: "#1B2633",
    borderWidth: 1,
    borderColor: "#344657",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 2,
  },

  pressedButton: {
    opacity: 0.7,
  },

  billIcon: {
    fontSize: 27,
  },

  placeholder: {
    backgroundColor: "#241B33",
    borderRadius: 18,
    padding: 18,
    borderWidth: 1,
    borderColor: "#5B3A78",
  },

  placeholderTitle: {
    color: "#FFFFFF",
    fontSize: 20,
    fontWeight: "900",
    marginBottom: 6,
  },

  placeholderText: {
    color: "#D4C8DF",
    fontSize: 15,
    fontWeight: "700",
    lineHeight: 21,
  },
});
