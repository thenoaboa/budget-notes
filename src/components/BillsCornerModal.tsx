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
  onClose: () => void;
  onStartTutorial: () => void;
};

export function BillsCornerModal({
  visible,
  onClose,
  onStartTutorial,
}: BillsCornerModalProps) {
  const scrollRef = useRef<ScrollView>(null);
  const [scrollKey, setScrollKey] = useState(0);

  useEffect(() => {
    if (!visible) return;

    setScrollKey((current) => current + 1);
  }, [visible]);

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

            <Text style={styles.body}>
              Let’s build your first budget together and see what happens before
              you spend.
            </Text>

            <View style={styles.lessonBox}>
              <Text style={styles.lessonLabel}>Lesson 1</Text>

              <Text style={styles.lessonTitle}>Build your first budget</Text>

              <Text style={styles.lessonText}>
                Start with the money you have available, add what you’re
                thinking about buying, and I’ll help you track what’s left.
              </Text>
            </View>

            <Pressable
              style={styles.primaryButton}
              onPress={onStartTutorial}
              accessibilityRole="button"
              accessibilityLabel="Start Lesson 1"
            >
              <Text style={styles.primaryButtonText}>Start Lesson 1</Text>
            </Pressable>

            <Pressable
              style={styles.secondaryButton}
              onPress={onClose}
              accessibilityRole="button"
              accessibilityLabel="Close Bill's Corner"
            >
              <Text style={styles.secondaryButtonText}>Not now</Text>
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
    backgroundColor: "rgba(0,0,0,0.45)",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 48,
  },

  card: {
    width: "100%",
    maxWidth: 430,
    maxHeight: "90%",
    backgroundColor: "#FFFFFF",
    borderRadius: 28,
    overflow: "hidden",
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
    fontSize: 26,
    fontWeight: "900",
    color: "#101820",
    marginBottom: 10,
    textAlign: "center",
  },

  body: {
    fontSize: 15,
    color: "#4B5563",
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
    marginBottom: 14,
  },

  lessonBox: {
    width: "100%",
    backgroundColor: "#F0FDF4",
    borderRadius: 18,
    padding: 16,
    marginTop: 6,
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
