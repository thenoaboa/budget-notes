import Ionicons from "@expo/vector-icons/Ionicons";
import { useRouter } from "expo-router";
import {
    Pressable,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    View,
} from "react-native";

const COLORS = {
  background: "#101820",
  card: "#1B2633",
  white: "#FFFFFF",
  muted: "#A7B2BE",
  green: "#2ECC71",
  blue: "#4EA8FF",
  purple: "#A855F7",
  yellow: "#F5C451",
};

type DashboardCardProps = {
  title: string;
  description: string;
  accentColor: string;
  icon: keyof typeof Ionicons.glyphMap;
  onPress: () => void;
};

function DashboardCard({
  title,
  description,
  accentColor,
  icon,
  onPress,
}: DashboardCardProps) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`Open ${title}`}
      style={({ pressed }) => [
        styles.card,
        {
          borderColor: accentColor,
          opacity: pressed ? 0.82 : 1,
        },
      ]}
    >
      <View style={styles.cardIconRow}>
        <View
          style={[
            styles.iconCircle,
            {
              borderColor: accentColor,
              backgroundColor: `${accentColor}1A`,
            },
          ]}
        >
          <Ionicons name={icon} size={24} color={accentColor} />
        </View>

        <Ionicons name="chevron-forward" size={22} color={accentColor} />
      </View>

      <Text style={styles.cardTitle}>{title}</Text>

      <Text style={styles.cardDescription}>{description}</Text>
    </Pressable>
  );
}

export default function HomeScreen() {
  const router = useRouter();

  function openSpendingNotes() {
    router.push("/spending" as any);
  }

  function openSavingsNotes() {
    router.push("/savings" as any);
  }

  function openBillNotes() {
    router.push("/bill-note" as any);
  }

  function openBillsCorner() {
    router.push("/bills-corner" as any);
  }

  return (
    <SafeAreaView style={styles.screen}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Text style={styles.title}>Budget Note</Text>

          <View style={styles.subtitleRow}>
            <Text style={styles.subtitle}>Plan today, spend confidently.</Text>

            <Text style={styles.headerBill}>🐷</Text>
          </View>
        </View>

        <Text style={styles.question}>What do you want to work on?</Text>

        <View style={styles.cardList}>
          <DashboardCard
            title="Spending Notes"
            description="Plan purchases and control spending."
            accentColor={COLORS.green}
            icon="wallet-outline"
            onPress={openSpendingNotes}
          />

          <DashboardCard
            title="Savings Notes"
            description="Save toward goals and purchases."
            accentColor={COLORS.blue}
            icon="cash-outline"
            onPress={openSavingsNotes}
          />

          <DashboardCard
            title="Bill Notes"
            description="Track balances and payment plans."
            accentColor={COLORS.purple}
            icon="document-text-outline"
            onPress={openBillNotes}
          />
        </View>

        <View style={styles.learnSection}>
          <View style={styles.learnHeadingRow}>
            <Text style={styles.billEmoji}>🐷</Text>

            <View style={styles.learnHeadingText}>
              <Text style={styles.learnTitle}>Learn with Bill</Text>

              <Text style={styles.learnSubtitle}>
                Build stronger money habits.
              </Text>
            </View>
          </View>

          <Pressable
            onPress={openBillsCorner}
            accessibilityRole="button"
            accessibilityLabel="Open Bill's Corner"
            style={({ pressed }) => [
              styles.learnButton,
              pressed && styles.pressedButton,
            ]}
          >
            <Ionicons
              name="school-outline"
              size={21}
              color={COLORS.background}
            />

            <Text style={styles.learnButtonText}>Start Learning</Text>

            <Ionicons
              name="chevron-forward"
              size={20}
              color={COLORS.background}
            />
          </Pressable>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: COLORS.background,
  },

  scrollView: {
    flex: 1,
    backgroundColor: COLORS.background,
  },

  content: {
    paddingHorizontal: 16,
    paddingTop: 24,
    paddingBottom: 48,
  },

  header: {
    marginBottom: 32,
  },

  title: {
    color: COLORS.white,
    fontSize: 40,
    fontWeight: "900",
    letterSpacing: -1,
  },

  subtitleRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 6,
  },

  subtitle: {
    color: COLORS.muted,
    fontSize: 15,
    fontWeight: "700",
  },

  headerBill: {
    fontSize: 22,
    marginLeft: 8,
  },

  question: {
    color: COLORS.white,
    fontSize: 22,
    fontWeight: "900",
    marginBottom: 16,
  },

  cardList: {
    gap: 14,
  },

  card: {
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderRadius: 20,
    padding: 18,
  },

  cardIconRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 14,
  },

  iconCircle: {
    width: 44,
    height: 44,
    borderRadius: 14,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },

  cardTitle: {
    color: COLORS.white,
    fontSize: 21,
    fontWeight: "900",
  },

  cardDescription: {
    color: COLORS.muted,
    fontSize: 15,
    fontWeight: "600",
    lineHeight: 21,
    marginTop: 6,
  },

  learnSection: {
    backgroundColor: COLORS.card,
    borderRadius: 20,
    marginTop: 22,
    padding: 18,
    borderWidth: 1,
    borderColor: "#344657",
  },

  learnHeadingRow: {
    flexDirection: "row",
    alignItems: "center",
  },

  billEmoji: {
    fontSize: 38,
    marginRight: 12,
  },

  learnHeadingText: {
    flex: 1,
  },

  learnTitle: {
    color: COLORS.white,
    fontSize: 20,
    fontWeight: "900",
  },

  learnSubtitle: {
    color: COLORS.muted,
    fontSize: 14,
    fontWeight: "600",
    marginTop: 3,
  },

  learnButton: {
    backgroundColor: COLORS.yellow,
    borderRadius: 14,
    marginTop: 16,
    minHeight: 50,
    paddingHorizontal: 16,
    flexDirection: "row",
    alignItems: "center",
  },

  pressedButton: {
    opacity: 0.82,
  },

  learnButtonText: {
    flex: 1,
    color: COLORS.background,
    fontSize: 15,
    fontWeight: "900",
    marginLeft: 10,
  },
});
