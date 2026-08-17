import Ionicons from "@expo/vector-icons/Ionicons";
import { useRouter } from "expo-router";
import {
    Alert,
    Platform,
    Pressable,
    SafeAreaView,
    StyleSheet,
    Text,
    View,
} from "react-native";

export default function EducationHomeScreen() {
  const router = useRouter();

  function showComingSoon(feature: string) {
    const message = `${feature} will be built next.`;

    if (Platform.OS === "web") {
      window.alert(message);
      return;
    }

    Alert.alert(feature, message);
  }

  return (
    <SafeAreaView style={styles.screen}>
      <View style={styles.container}>
        <View style={styles.header}>
          <Pressable
            style={({ pressed }) => [
              styles.backButton,
              pressed && styles.pressed,
            ]}
            onPress={() => router.back()}
            hitSlop={10}
            accessibilityRole="button"
            accessibilityLabel="Return to BudgetNote"
          >
            <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
          </Pressable>

          <Text style={styles.headerTitle}>Education Mode</Text>

          <View style={styles.headerSpacer} />
        </View>

        <View style={styles.introduction}>
          <View style={styles.educationIcon}>
            <Ionicons name="school-outline" size={38} color="#B56CFF" />
          </View>

          <Text style={styles.title}>Learn money by making decisions.</Text>

          <Text style={styles.subtitle}>
            Practice budgeting, saving, shopping, and handling unexpected
            expenses through real-life challenges.
          </Text>
        </View>

        <View style={styles.options}>
          <Pressable
            style={({ pressed }) => [
              styles.optionCard,
              pressed && styles.pressedCard,
            ]}
            onPress={() => router.push("/education/grocery-challenge" as any)}
            accessibilityRole="button"
            accessibilityLabel="Enter Student Mode"
          >
            <View style={styles.optionIcon}>
              <Ionicons
                name="game-controller-outline"
                size={28}
                color="#2ECC71"
              />
            </View>

            <View style={styles.optionContent}>
              <Text style={styles.optionTitle}>I’m a Student</Text>

              <Text style={styles.optionDescription}>
                Join a class and complete money challenges.
              </Text>
            </View>

            <Ionicons name="chevron-forward" size={22} color="#8A98A8" />
          </Pressable>

          <Pressable
            style={({ pressed }) => [
              styles.optionCard,
              pressed && styles.pressedCard,
            ]}
            onPress={() => showComingSoon("Teacher Mode")}
            accessibilityRole="button"
            accessibilityLabel="Enter Teacher Mode"
          >
            <View style={styles.optionIcon}>
              <Ionicons name="people-outline" size={28} color="#B56CFF" />
            </View>

            <View style={styles.optionContent}>
              <Text style={styles.optionTitle}>I’m a Teacher</Text>

              <Text style={styles.optionDescription}>
                Create challenges and guide your class.
              </Text>
            </View>

            <Ionicons name="chevron-forward" size={22} color="#8A98A8" />
          </Pressable>
        </View>

        <Text style={styles.footerText}>
          Your personal budgets remain separate from Education Mode.
        </Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#101820",
  },

  container: {
    flex: 1,
    paddingHorizontal: 18,
    paddingTop: 12,
    paddingBottom: 28,
  },

  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  backButton: {
    width: 42,
    height: 42,
    borderRadius: 13,
    backgroundColor: "#1B2738",
    borderWidth: 1,
    borderColor: "#344657",
    alignItems: "center",
    justifyContent: "center",
  },

  headerTitle: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "900",
  },

  headerSpacer: {
    width: 42,
  },

  introduction: {
    alignItems: "center",
    marginTop: 52,
    paddingHorizontal: 12,
  },

  educationIcon: {
    width: 76,
    height: 76,
    borderRadius: 24,
    backgroundColor: "#243342",
    borderWidth: 1,
    borderColor: "#3B4D5F",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 22,
  },

  title: {
    color: "#FFFFFF",
    fontSize: 29,
    fontWeight: "900",
    textAlign: "center",
    lineHeight: 35,
    letterSpacing: -0.5,
  },

  subtitle: {
    color: "#AAB5C1",
    fontSize: 16,
    fontWeight: "600",
    textAlign: "center",
    lineHeight: 23,
    marginTop: 12,
  },

  options: {
    gap: 14,
    marginTop: 42,
  },

  optionCard: {
    minHeight: 96,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#1B2738",
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "#344657",
    paddingHorizontal: 16,
    paddingVertical: 16,
  },

  pressedCard: {
    backgroundColor: "#243342",
    transform: [{ scale: 0.99 }],
  },

  optionIcon: {
    width: 52,
    height: 52,
    borderRadius: 16,
    backgroundColor: "#243342",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 14,
  },

  optionContent: {
    flex: 1,
    paddingRight: 10,
  },

  optionTitle: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "900",
    marginBottom: 5,
  },

  optionDescription: {
    color: "#AAB5C1",
    fontSize: 14,
    fontWeight: "600",
    lineHeight: 19,
  },

  footerText: {
    color: "#748292",
    fontSize: 13,
    fontWeight: "600",
    textAlign: "center",
    marginTop: "auto",
    paddingHorizontal: 20,
  },

  pressed: {
    opacity: 0.7,
  },
});
