import { useEffect, useRef, useState } from "react";
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

type BillsCornerModalProps = {
  visible: boolean;
  lessonOneCompleted: boolean;
  onClose: () => void;
  onStartTutorial: () => void;
  onOpenAbout: () => void;
  onOpenContact: () => void;
  onOpenPrivacy: () => void;
  onOpenTerms: () => void;
};

type MenuRowProps = {
  icon: string;
  label: string;
  accessibilityLabel: string;
  onPress: () => void;
  isLast?: boolean;
};

function MenuRow({
  icon,
  label,
  accessibilityLabel,
  onPress,
  isLast = false,
}: MenuRowProps) {
  return (
    <Pressable
      style={({ pressed }) => [
        styles.menuRow,
        !isLast && styles.menuRowBorder,
        pressed && styles.buttonPressed,
      ]}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
    >
      <View style={styles.menuRowLeft}>
        <Text style={styles.menuIcon}>{icon}</Text>
        <Text style={styles.menuLabel}>{label}</Text>
      </View>

      <Text style={styles.chevron}>›</Text>
    </Pressable>
  );
}

export function BillsCornerModal({
  visible,
  lessonOneCompleted,
  onClose,
  onStartTutorial,
  onOpenAbout,
  onOpenContact,
  onOpenPrivacy,
  onOpenTerms,
}: BillsCornerModalProps) {
  const scrollRef = useRef<ScrollView>(null);
  const [scrollKey, setScrollKey] = useState(0);

  useEffect(() => {
    if (!visible) return;

    setScrollKey((current) => current + 1);
  }, [visible]);

  function handleStartTutorial() {
    onClose();
    onStartTutorial();
  }

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.backdrop}>
        <View style={styles.card}>
          <ScrollView
            key={scrollKey}
            ref={scrollRef}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}
          >
            <Text style={styles.pig}>🐷</Text>

            <Text style={styles.title}>Hi, I’m Bill.</Text>

            <Text style={styles.body}>
              I’m here to help you answer one simple question:
            </Text>

            <Text style={styles.question}>Can I afford this?</Text>

            <View style={styles.divider} />

            <Text style={styles.sectionTitle}>Learn</Text>

            <Pressable
              style={({ pressed }) => [
                styles.primaryButton,
                pressed && styles.buttonPressed,
              ]}
              onPress={handleStartTutorial}
              accessibilityRole="button"
              accessibilityLabel={
                lessonOneCompleted ? "Replay tutorial" : "Start tutorial"
              }
            >
              <Text style={styles.primaryButtonIcon}>▶</Text>

              <Text style={styles.primaryButtonText}>
                {lessonOneCompleted ? "Replay Tutorial" : "Start Tutorial"}
              </Text>
            </Pressable>

            <View style={styles.divider} />

            <Text style={styles.sectionTitle}>Support</Text>

            <View style={styles.menuCard}>
              <MenuRow
                icon="ℹ"
                label="About Budget Note"
                accessibilityLabel="Open About Budget Note"
                onPress={onOpenAbout}
              />

              <MenuRow
                icon="✉"
                label="Contact Support"
                accessibilityLabel="Open Contact Support"
                onPress={onOpenContact}
              />

              <MenuRow
                icon="🔒"
                label="Privacy Policy"
                accessibilityLabel="Open Privacy Policy"
                onPress={onOpenPrivacy}
              />

              <MenuRow
                icon="📄"
                label="Terms of Service"
                accessibilityLabel="Open Terms of Service"
                onPress={onOpenTerms}
                isLast
              />
            </View>

            <Pressable
              style={({ pressed }) => [
                styles.secondaryButton,
                pressed && styles.buttonPressed,
              ]}
              onPress={onClose}
              accessibilityRole="button"
              accessibilityLabel="Close Bill's Corner"
            >
              <Text style={styles.secondaryButtonText}>Close</Text>
            </Pressable>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.55)",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 48,
  },

  card: {
    width: "100%",
    maxWidth: 430,
    maxHeight: "90%",
    backgroundColor: "#17232F",
    borderRadius: 28,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#2ECC71",
  },

  scrollContent: {
    padding: 24,
    alignItems: "center",
  },

  pig: {
    fontSize: 44,
    marginBottom: 6,
  },

  title: {
    fontSize: 28,
    fontWeight: "900",
    color: "#FFFFFF",
    marginBottom: 10,
    textAlign: "center",
  },

  body: {
    fontSize: 15,
    color: "#CAD3DD",
    textAlign: "center",
    lineHeight: 22,
    marginBottom: 10,
    fontWeight: "600",
  },

  question: {
    fontSize: 28,
    fontWeight: "900",
    color: "#2ECC71",
    textAlign: "center",
    marginBottom: 4,
  },

  divider: {
    width: "100%",
    height: 1,
    backgroundColor: "#2D4562",
    marginVertical: 20,
  },

  sectionTitle: {
    width: "100%",
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "900",
    marginBottom: 10,
  },

  primaryButton: {
    width: "100%",
    backgroundColor: "#2ECC71",
    borderRadius: 18,
    paddingVertical: 15,
    paddingHorizontal: 18,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
  },

  primaryButtonIcon: {
    color: "#101820",
    fontSize: 14,
    fontWeight: "900",
  },

  primaryButtonText: {
    color: "#101820",
    fontSize: 16,
    fontWeight: "900",
  },

  menuCard: {
    width: "100%",
    backgroundColor: "#182638",
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "#2D4562",
    overflow: "hidden",
  },

  menuRow: {
    minHeight: 58,
    paddingHorizontal: 16,
    paddingVertical: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  menuRowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: "#2D4562",
  },

  menuRowLeft: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },

  menuIcon: {
    width: 24,
    color: "#2ECC71",
    fontSize: 18,
    textAlign: "center",
  },

  menuLabel: {
    flex: 1,
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "800",
  },

  chevron: {
    color: "#93A4B4",
    fontSize: 26,
    lineHeight: 26,
    marginLeft: 12,
  },

  secondaryButton: {
    marginTop: 18,
    paddingHorizontal: 20,
    paddingVertical: 10,
  },

  secondaryButtonText: {
    color: "#93A4B4",
    fontSize: 15,
    fontWeight: "800",
  },

  buttonPressed: {
    opacity: 0.72,
  },
});
