import { Modal, Pressable, StyleSheet, Text, View } from "react-native";

type BillsCornerModalProps = {
  visible: boolean;
  onClose: () => void;
};

export function BillsCornerModal({ visible, onClose }: BillsCornerModalProps) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.backdrop}>
        <View style={styles.card}>
          <Text style={styles.pig}>🐷</Text>

          <Text style={styles.title}>Hi, I’m Bill.</Text>

          <Text style={styles.body}>
            I’m here to help you answer one simple question:
          </Text>

          <Text style={styles.question}>Can I afford this?</Text>

          <Text style={styles.body}>
            Budgeting isn’t about restriction. It’s about knowing where your
            money is going before it disappears.
          </Text>

          <View style={styles.lessonBox}>
            <Text style={styles.lessonLabel}>Lesson 1</Text>

            <Text style={styles.lessonTitle}>
              A budget is a plan, not a punishment.
            </Text>

            <Text style={styles.lessonText}>
              A budget doesn’t tell you “no.” It helps you see what happens if
              you say “yes.”
            </Text>
          </View>

          <Pressable style={styles.primaryButton} onPress={onClose}>
            <Text style={styles.primaryButtonText}>Got it</Text>
          </Pressable>

          <Pressable style={styles.secondaryButton} onPress={onClose}>
            <Text style={styles.secondaryButtonText}>Not now</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.45)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },

  card: {
    width: "100%",
    maxWidth: 430,
    backgroundColor: "#FFFFFF",
    borderRadius: 28,
    padding: 24,
    alignItems: "center",
  },

  pig: {
    fontSize: 52,
    marginBottom: 8,
  },

  title: {
    fontSize: 28,
    fontWeight: "900",
    color: "#101820",
    marginBottom: 12,
    textAlign: "center",
  },

  body: {
    fontSize: 16,
    color: "#4B5563",
    textAlign: "center",
    lineHeight: 23,
    marginBottom: 12,
    fontWeight: "600",
  },

  question: {
    fontSize: 24,
    fontWeight: "900",
    color: "#2ECC71",
    textAlign: "center",
    marginBottom: 14,
  },

  lessonBox: {
    width: "100%",
    backgroundColor: "#F0FDF4",
    borderRadius: 18,
    padding: 16,
    marginTop: 8,
    marginBottom: 18,
    borderWidth: 1,
    borderColor: "#BBF7D0",
  },

  lessonLabel: {
    fontSize: 13,
    fontWeight: "900",
    color: "#2ECC71",
    marginBottom: 6,
    textTransform: "uppercase",
    letterSpacing: 0.6,
  },

  lessonTitle: {
    fontSize: 17,
    fontWeight: "900",
    color: "#101820",
    marginBottom: 6,
  },

  lessonText: {
    fontSize: 15,
    color: "#374151",
    lineHeight: 22,
    fontWeight: "600",
  },

  primaryButton: {
    width: "100%",
    backgroundColor: "#2ECC71",
    borderRadius: 999,
    paddingVertical: 14,
    alignItems: "center",
    marginBottom: 10,
  },

  primaryButtonText: {
    color: "#101820",
    fontSize: 16,
    fontWeight: "900",
  },

  secondaryButton: {
    paddingVertical: 8,
  },

  secondaryButtonText: {
    color: "#6B7280",
    fontSize: 15,
    fontWeight: "800",
  },
});
