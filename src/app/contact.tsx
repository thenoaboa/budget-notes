import { useRouter } from "expo-router";
import {
    Alert,
    Linking,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    View,
} from "react-native";

const SUPPORT_EMAIL = "support.budgetnote@gmail.com";

export default function ContactScreen() {
  const router = useRouter();

  async function openSupportEmail() {
    const subject = encodeURIComponent("Budget Note Support");
    const body = encodeURIComponent(
      [
        "Hi Budget Note Support,",
        "",
        "I need help with:",
        "",
        "",
        "App version: 1.0",
      ].join("\n"),
    );

    const emailUrl = `mailto:${SUPPORT_EMAIL}?subject=${subject}&body=${body}`;

    const canOpen = await Linking.canOpenURL(emailUrl);

    if (!canOpen) {
      Alert.alert(
        "Email unavailable",
        `Please email us directly at ${SUPPORT_EMAIL}.`,
      );

      return;
    }

    await Linking.openURL(emailUrl);
  }

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
        >
          <Text style={styles.backButtonText}>‹ Back</Text>
        </Pressable>

        <Text style={styles.title}>Contact Support</Text>

        <Text style={styles.subtitle}>
          Questions, bug reports and feature suggestions are welcome.
        </Text>

        <View style={styles.supportCard}>
          <Text style={styles.icon}>✉</Text>

          <View style={styles.supportTextContainer}>
            <Text style={styles.cardLabel}>Support email</Text>
            <Text style={styles.email}>{SUPPORT_EMAIL}</Text>
          </View>
        </View>

        <Pressable
          style={({ pressed }) => [
            styles.emailButton,
            pressed && styles.pressed,
          ]}
          onPress={openSupportEmail}
        >
          <Text style={styles.emailButtonText}>Email Support</Text>
        </Pressable>

        <Text style={styles.sectionTitle}>You can contact us to:</Text>

        <View style={styles.listCard}>
          <ListItem text="Report a bug or technical problem" />
          <ListItem text="Ask a question about using Budget Note" />
          <ListItem text="Suggest a new feature or improvement" />
          <ListItem text="Share general feedback about the app" isLast />
        </View>

        <View style={styles.helpCard}>
          <Text style={styles.helpTitle}>Helpful information to include</Text>

          <Text style={styles.helpText}>
            Tell us what you were trying to do, what happened and what device or
            browser you were using. Screenshots may also help us understand the
            problem.
          </Text>
        </View>

        <Text style={styles.footer}>
          We will respond as soon as reasonably possible.
        </Text>
      </ScrollView>
    </View>
  );
}

type ListItemProps = {
  text: string;
  isLast?: boolean;
};

function ListItem({ text, isLast = false }: ListItemProps) {
  return (
    <View style={[styles.listItem, isLast && styles.lastListItem]}>
      <Text style={styles.bullet}>•</Text>
      <Text style={styles.listText}>{text}</Text>
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

  subtitle: {
    color: "#CAD3DD",
    fontSize: 16,
    fontWeight: "600",
    lineHeight: 24,
    marginTop: 9,
    marginBottom: 24,
  },

  supportCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#1B2633",
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "#344657",
    padding: 16,
    marginBottom: 12,
  },

  icon: {
    fontSize: 25,
    marginRight: 14,
  },

  supportTextContainer: {
    flex: 1,
  },

  cardLabel: {
    color: "#8A98A8",
    fontSize: 13,
    fontWeight: "800",
    marginBottom: 3,
  },

  email: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "900",
  },

  emailButton: {
    backgroundColor: "#2ECC71",
    borderRadius: 16,
    paddingVertical: 15,
    alignItems: "center",
    marginBottom: 28,
  },

  emailButtonText: {
    color: "#101820",
    fontSize: 16,
    fontWeight: "900",
  },

  sectionTitle: {
    color: "#FFFFFF",
    fontSize: 20,
    fontWeight: "900",
    marginBottom: 12,
  },

  listCard: {
    backgroundColor: "#1B2633",
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "#344657",
    paddingHorizontal: 16,
    marginBottom: 24,
  },

  listItem: {
    flexDirection: "row",
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#2B3A4A",
  },

  lastListItem: {
    borderBottomWidth: 0,
  },

  bullet: {
    color: "#2ECC71",
    fontSize: 20,
    fontWeight: "900",
    marginRight: 10,
    lineHeight: 22,
  },

  listText: {
    flex: 1,
    color: "#CAD3DD",
    fontSize: 15,
    fontWeight: "700",
    lineHeight: 22,
  },

  helpCard: {
    backgroundColor: "#18261D",
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "#275B43",
    padding: 16,
  },

  helpTitle: {
    color: "#FFFFFF",
    fontSize: 17,
    fontWeight: "900",
    marginBottom: 7,
  },

  helpText: {
    color: "#CAD3DD",
    fontSize: 15,
    fontWeight: "600",
    lineHeight: 22,
  },

  footer: {
    color: "#738191",
    fontSize: 13,
    fontWeight: "700",
    textAlign: "center",
    marginTop: 28,
  },

  pressed: {
    opacity: 0.7,
  },
});
