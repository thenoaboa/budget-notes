import { useRouter } from "expo-router";
import { Platform, ScrollView, StyleSheet, Text, View } from "react-native";

import { GroceryQuickShop } from "../components/GroceryQuickShop";

export default function GroceryListWithRunningTotalPage() {
  const router = useRouter();

  async function handleSaveAsBudget(prices: string[]) {
    // Reuse the same save-as-budget flow your existing Quick Shop modal uses.
    // If that logic currently lives in the parent screen, move that function
    // into a shared helper and call it here.
    console.log("Save as Budget", prices);

    if (Platform.OS === "web") {
      router.push("/");
    }
  }

  return (
    <ScrollView
      style={styles.page}
      contentContainerStyle={styles.content}
      keyboardShouldPersistTaps="handled"
    >
      <View style={styles.hero}>
        <Text style={styles.eyebrow}>BUDGET NOTE</Text>
        <Text style={styles.title}>Grocery List With Running Total</Text>
        <Text style={styles.subtitle}>
          Enter prices as you shop and see your grocery total update instantly.
          No download required.
        </Text>
      </View>

      <View style={styles.toolWrap}>
        <GroceryQuickShop onSave={handleSaveAsBudget} />
      </View>

      <View style={styles.copySection}>
        <Text style={styles.heading}>
          Keep a running grocery total while you shop
        </Text>
        <Text style={styles.body}>
          Quick Shop is a simple grocery price calculator built for the store.
          Enter each item price as you go and your running total updates
          automatically, including sales tax when you want it.
        </Text>

        <Text style={styles.heading}>
          Know what you are spending before checkout
        </Text>
        <Text style={styles.body}>
          Instead of estimating your cart total in your head, Quick Shop keeps
          every price in one place. You can edit a price, undo changes, mark
          items as you get them, and restore previous Quick Shops from history.
        </Text>

        <Text style={styles.heading}>
          Turn a shopping trip into a Budget Note
        </Text>
        <Text style={styles.body}>
          When a quick grocery total turns into something you want to keep or
          plan ahead, save it as a Budget Note and continue from there.
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  page: {
    flex: 1,
    backgroundColor: "#0F1824",
  },
  content: {
    width: "100%",
    maxWidth: 680,
    alignSelf: "center",
    paddingHorizontal: 18,
    paddingTop: 42,
    paddingBottom: 80,
  },
  hero: {
    marginBottom: 24,
  },
  eyebrow: {
    color: "#B784F4",
    fontSize: 12,
    fontWeight: "900",
    letterSpacing: 1.5,
    marginBottom: 8,
  },
  title: {
    color: "#FFFFFF",
    fontSize: 38,
    lineHeight: 44,
    fontWeight: "900",
  },
  subtitle: {
    color: "#AAB5C2",
    fontSize: 17,
    lineHeight: 26,
    fontWeight: "600",
    marginTop: 12,
    maxWidth: 650,
  },
  toolWrap: {
    width: "100%",
    maxWidth: 410,
    alignSelf: "center",
    marginTop: 8,
    marginBottom: 42,
  },
  copySection: {
    gap: 12,
  },
  heading: {
    color: "#FFFFFF",
    fontSize: 24,
    lineHeight: 30,
    fontWeight: "900",
    marginTop: 18,
  },
  body: {
    color: "#AAB5C2",
    fontSize: 16,
    lineHeight: 25,
    fontWeight: "600",
  },
});
