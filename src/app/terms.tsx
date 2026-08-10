import { useRouter } from "expo-router";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

const SUPPORT_EMAIL = "support.budgetnote@gmail.com";

export default function TermsScreen() {
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

        <Text style={styles.title}>Terms of Service</Text>
        <Text style={styles.updated}>Last updated: July 27, 2026</Text>

        <Text style={styles.introduction}>
          These Terms of Service govern your use of Budget Note. By accessing or
          using the application, you agree to these terms.
        </Text>

        <Section title="Purpose of Budget Note">
          Budget Note provides tools that help users plan purchases and
          understand how planned items affect the amount of money they have
          available. The application is intended for planning and informational
          purposes.
        </Section>

        <Section title="No financial advice">
          Budget Note does not provide financial, investment, accounting, tax or
          legal advice. Information shown by the application should not be
          treated as a recommendation or guarantee. Consider consulting a
          qualified professional when making important financial decisions.
        </Section>

        <Section title="Your responsibility">
          You are responsible for the accuracy of the amounts and information
          you enter. You are also responsible for reviewing calculations,
          confirming prices, considering taxes and fees, and deciding whether a
          purchase or financial decision is appropriate for you.
        </Section>

        <Section title="Permitted use">
          You may use Budget Note for lawful personal purposes. You may not
          attempt to disrupt the application, access systems without
          authorization, misuse its services, distribute malicious code or use
          the application in a way that violates applicable law.
        </Section>

        <Section title="Advertisements and external services">
          Budget Note may display advertisements or provide links to external
          websites and services. Budget Note does not control and is not
          responsible for third-party products, content, prices, availability,
          terms or privacy practices.
        </Section>

        <Section title="Availability and changes">
          Features may be added, changed, suspended or removed. Budget Note does
          not guarantee that the application will always be available,
          uninterrupted or free from errors.
        </Section>

        <Section title="Stored information">
          You are responsible for maintaining any backup you need. Information
          stored locally may be lost if you delete the application, clear
          browser storage, reset your device or experience a technical failure.
        </Section>

        <Section title="Disclaimer of warranties">
          Budget Note is provided on an &quot;as is&quot; and &quot;as
          available&quot; basis to the extent permitted by law. No guarantee is
          made that the application will meet every requirement or that all
          calculations and features will always be complete, accurate or
          error-free.
        </Section>

        <Section title="Limitation of liability">
          To the extent permitted by law, Budget Note and its owner will not be
          liable for indirect, incidental, special or consequential losses
          resulting from your use of, or inability to use, the application. You
          remain responsible for your financial decisions.
        </Section>

        <Section title="Changes to these terms">
          These terms may be updated as Budget Note changes. Continued use of
          the application after updated terms are posted means you accept the
          revised terms.
        </Section>

        <Section title="Governing law">
          These terms will be governed by applicable laws of the United States
          and the State of Texas, without regard to conflict-of-law rules,
          except where another law is required to apply.
        </Section>

        <View style={styles.contactCard}>
          <Text style={styles.contactTitle}>Questions about these terms</Text>
          <Text style={styles.contactText}>Contact us at {SUPPORT_EMAIL}.</Text>
        </View>

        <Text style={styles.disclaimer}>
          These terms are a practical starting point and should be reviewed by a
          qualified attorney before relying on them for a public commercial
          release.
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

  updated: {
    color: "#8A98A8",
    fontSize: 13,
    fontWeight: "700",
    marginTop: 6,
    marginBottom: 22,
  },

  introduction: {
    color: "#CAD3DD",
    fontSize: 16,
    fontWeight: "600",
    lineHeight: 24,
    marginBottom: 26,
  },

  section: {
    marginBottom: 24,
  },

  sectionTitle: {
    color: "#FFFFFF",
    fontSize: 20,
    fontWeight: "900",
    marginBottom: 8,
  },

  bodyText: {
    color: "#CAD3DD",
    fontSize: 15,
    fontWeight: "600",
    lineHeight: 23,
  },

  contactCard: {
    backgroundColor: "#18261D",
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "#275B43",
    padding: 16,
    marginTop: 4,
  },

  contactTitle: {
    color: "#FFFFFF",
    fontSize: 17,
    fontWeight: "900",
    marginBottom: 6,
  },

  contactText: {
    color: "#CAD3DD",
    fontSize: 15,
    fontWeight: "700",
    lineHeight: 22,
  },

  disclaimer: {
    color: "#738191",
    fontSize: 12,
    fontWeight: "600",
    lineHeight: 18,
    marginTop: 26,
  },

  pressed: {
    opacity: 0.7,
  },
});
