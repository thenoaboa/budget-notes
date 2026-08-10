import { useRouter } from "expo-router";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

const SUPPORT_EMAIL = "support.budgetnote@gmail.com";

export default function PrivacyScreen() {
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

        <Text style={styles.title}>Privacy Policy</Text>
        <Text style={styles.updated}>Last updated: July 27, 2026</Text>

        <Text style={styles.introduction}>
          This Privacy Policy explains how Budget Note handles information when
          you use the application.
        </Text>

        <Section title="Information you enter">
          Budget Note allows you to enter information such as budget titles,
          available money, planned purchases, item descriptions, prices,
          quantities, links and personal notes.
        </Section>

        <Section title="Local storage">
          Budget Note may store your budgets, preferences and tutorial progress
          locally on your device or in your browser. Removing the application,
          clearing browser storage or resetting your device may delete locally
          stored information.
        </Section>

        <Section title="Account and financial information">
          Budget Note does not require you to connect a bank account. Do not
          enter passwords, payment card numbers, bank login credentials or other
          highly sensitive account information into the application.
        </Section>

        <Section title="Analytics">
          Budget Note may use analytics services to understand how features are
          used, identify technical problems and improve the application.
          Analytics information may include app interactions, device or browser
          information, general usage events and technical diagnostic
          information.
        </Section>

        <Section title="Advertising">
          Budget Note may display advertisements. Advertising providers may use
          cookies, device identifiers or similar technologies to deliver,
          measure and improve advertisements, subject to their own privacy
          policies and applicable consent requirements.
        </Section>

        <Section title="How information is used">
          Information may be used to provide Budget Note&apos;s features,
          maintain the application, understand feature usage, fix problems,
          prevent abuse and improve the user experience.
        </Section>

        <Section title="Selling personal information">
          Budget Note does not sell the personal financial information you enter
          into the application.
        </Section>

        <Section title="Third-party links">
          Items may contain links to third-party websites. Budget Note is not
          responsible for the privacy practices, security or content of those
          websites.
        </Section>

        <Section title="Data security">
          Reasonable measures may be used to protect information, but no
          application, device, storage method or internet transmission can be
          guaranteed to be completely secure.
        </Section>

        <Section title="Children's privacy">
          Budget Note is not intended to knowingly collect personal information
          from children without the involvement of a parent or legal guardian.
          Parents and guardians should supervise a child&apos;s use of the
          application.
        </Section>

        <Section title="Changes to this policy">
          This Privacy Policy may be updated as Budget Note changes. The date at
          the top of this page will be updated when revisions are made.
        </Section>

        <View style={styles.contactCard}>
          <Text style={styles.contactTitle}>Questions about privacy</Text>
          <Text style={styles.contactText}>Contact us at {SUPPORT_EMAIL}.</Text>
        </View>

        <Text style={styles.disclaimer}>
          This policy should be reviewed before public release to make sure it
          accurately describes every service, advertisement provider and data
          practice used by the published version of Budget Note.
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
