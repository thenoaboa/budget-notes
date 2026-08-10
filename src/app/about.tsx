import { useRouter } from "expo-router";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

export default function AboutScreen() {
  const router = useRouter();

  return (
    <View style={styles.screen}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <Pressable
          style={({ pressed }) => [
            styles.backButton,
            pressed && styles.pressed,
          ]}
          onPress={() => router.back()}
          accessibilityRole="button"
          accessibilityLabel="Go back"
        >
          <Text style={styles.backButtonText}>‹ Back</Text>
        </Pressable>

        <Text style={styles.title}>About Budget Note</Text>
        <Text style={styles.tagline}>Plan today, spend confidently.</Text>

        <View style={styles.introCard}>
          <Text style={styles.billIcon}>🐷</Text>

          <Text style={styles.introText}>
            Budget Note helps you think through purchases before you spend.
          </Text>
        </View>

        <Section title="A place to pause before buying">
          Budget Note is built for the moment before a purchase. Instead of only
          tracking money after it is gone, it gives you a place to write down
          what you are considering, estimate the total cost and see how the
          purchase fits within the money you have available.
        </Section>

        <View style={styles.questionCard}>
          <Text style={styles.questionLabel}>
            Bill helps you answer one simple question:
          </Text>

          <Text style={styles.question}>Can I afford this?</Text>
        </View>

        <Section title="How Budget Note works">
          Start with the amount of money you have available. Then add the things
          you are planning to buy, along with their prices, quantities, taxes,
          notes and links. Budget Note calculates the planned total and shows
          how much money would remain.
        </Section>

        <Section title="Use it your way">
          A budget can be used for groceries, a trip, a shopping list, a party,
          home improvements, baby supplies or any other situation where you want
          a clearer picture before spending.
        </Section>

        <Section title="Plan, compare and adjust">
          Add or remove items, change quantities, reorder your list and compare
          different choices before making a final decision. Budget Note does not
          tell you what to buy. It helps you see the tradeoffs clearly.
        </Section>

        <Section title="Your information">
          Budget Note organizes the information you choose to enter. You are
          responsible for reviewing your amounts, confirming prices and making
          your own financial decisions.
        </Section>

        <View style={styles.versionCard}>
          <Text style={styles.versionLabel}>Budget Note</Text>
          <Text style={styles.versionText}>Version 1.0</Text>
        </View>

        <Text style={styles.footer}>
          Made to help people feel more confident before spending.
        </Text>
      </ScrollView>
    </View>
  );
}

type SectionProps = {
  title: string;
  children: string;
};

function Section({ title, children }: SectionProps) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <Text style={styles.bodyText}>{children}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#101820",
  },

  content: {
    paddingHorizontal: 18,
    paddingTop: 54,
    paddingBottom: 50,
  },

  backButton: {
    alignSelf: "flex-start",
    paddingVertical: 8,
    paddingRight: 14,
    marginBottom: 18,
  },

  backButtonText: {
    color: "#2ECC71",
    fontSize: 16,
    fontWeight: "900",
  },

  title: {
    color: "#FFFFFF",
    fontSize: 34,
    fontWeight: "900",
    letterSpacing: -0.6,
  },

  tagline: {
    color: "#8A98A8",
    fontSize: 16,
    fontWeight: "700",
    marginTop: 6,
    marginBottom: 24,
  },

  introCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#18261D",
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "#275B43",
    padding: 16,
    marginBottom: 24,
  },

  billIcon: {
    fontSize: 32,
    marginRight: 14,
  },

  introText: {
    flex: 1,
    color: "#FFFFFF",
    fontSize: 17,
    fontWeight: "800",
    lineHeight: 24,
  },

  section: {
    marginBottom: 24,
  },

  sectionTitle: {
    color: "#FFFFFF",
    fontSize: 21,
    fontWeight: "900",
    marginBottom: 8,
  },

  bodyText: {
    color: "#CAD3DD",
    fontSize: 16,
    fontWeight: "600",
    lineHeight: 24,
  },

  questionCard: {
    backgroundColor: "#1B2633",
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "#344657",
    padding: 18,
    marginBottom: 24,
  },

  questionLabel: {
    color: "#CAD3DD",
    fontSize: 15,
    fontWeight: "700",
  },

  question: {
    color: "#2ECC71",
    fontSize: 22,
    fontWeight: "900",
    marginTop: 6,
  },

  versionCard: {
    backgroundColor: "#1B2633",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#344657",
    padding: 16,
    marginTop: 6,
  },

  versionLabel: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "900",
  },

  versionText: {
    color: "#8A98A8",
    fontSize: 14,
    fontWeight: "700",
    marginTop: 3,
  },

  footer: {
    color: "#738191",
    fontSize: 13,
    fontWeight: "700",
    textAlign: "center",
    marginTop: 30,
  },

  pressed: {
    opacity: 0.7,
  },
});
