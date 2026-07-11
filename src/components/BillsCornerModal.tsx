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
};

export function BillsCornerModal({
  visible,
  lessonOneCompleted,
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
            {!lessonOneCompleted ? (
              <>
                <Text style={styles.pig}>🐷</Text>

                <Text style={styles.title}>Hi, I’m Bill.</Text>

                <Text style={styles.body}>
                  I’m here to help you answer one simple question:
                </Text>

                <Text style={styles.question}>Can I afford this?</Text>

                <Text style={styles.body}>
                  Let’s build your first budget together and see what happens
                  before you spend.
                </Text>

                <View style={styles.lessonBox}>
                  <Text style={styles.lessonLabel}>Lesson 1</Text>

                  <Text style={styles.lessonTitle}>
                    Build your first budget
                  </Text>

                  <Text style={styles.lessonText}>
                    Learn how to name a budget, set your spending limit, add
                    purchases, and track what’s left.
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
              </>
            ) : (
              <>
                <Text style={styles.pig}>🐷</Text>

                <Text style={styles.title}>Bill’s Corner</Text>

                <Text style={styles.body}>
                  Keep learning how to plan before you spend.
                </Text>

                <Text style={styles.sectionTitle}>Lessons</Text>

                <Pressable
                  style={styles.activeLessonCard}
                  onPress={onStartTutorial}
                  accessibilityRole="button"
                  accessibilityLabel="Replay Lesson 1"
                >
                  <View style={styles.lessonHeader}>
                    <Text style={styles.lessonNumber}>Lesson 1</Text>

                    <View style={styles.completedBadge}>
                      <Text style={styles.completedBadgeText}>Completed</Text>
                    </View>
                  </View>

                  <Text style={styles.activeLessonTitle}>
                    Build your first budget
                  </Text>

                  <Text style={styles.activeLessonText}>
                    Name a budget, set your spending limit, add purchases, and
                    track what’s left.
                  </Text>

                  <Text style={styles.replayText}>Replay Lesson →</Text>
                </Pressable>

                <View style={styles.lockedLessonCard}>
                  <View style={styles.lessonHeader}>
                    <Text style={styles.lockedLessonNumber}>Lesson 2</Text>
                    <Text style={styles.comingSoon}>Coming soon</Text>
                  </View>

                  <Text style={styles.lockedLessonTitle}>Needs vs. Wants</Text>

                  <Text style={styles.lockedLessonText}>
                    Learn how to separate what matters now from what can wait.
                  </Text>
                </View>

                <View style={styles.lockedLessonCard}>
                  <View style={styles.lessonHeader}>
                    <Text style={styles.lockedLessonNumber}>Lesson 3</Text>
                    <Text style={styles.comingSoon}>Coming soon</Text>
                  </View>

                  <Text style={styles.lockedLessonTitle}>
                    Planning before buying
                  </Text>

                  <Text style={styles.lockedLessonText}>
                    Create space between wanting something and spending money on
                    it.
                  </Text>
                </View>

                <View style={styles.tipCard}>
                  <Text style={styles.tipLabel}>Bill’s Quick Tip</Text>

                  <Text style={styles.tipText}>
                    A budget doesn’t tell you “no.” It helps you see what
                    happens if you say “yes.”
                  </Text>
                </View>
              </>
            )}

            <Pressable
              style={styles.secondaryButton}
              onPress={onClose}
              accessibilityRole="button"
              accessibilityLabel="Close Bill's Corner"
            >
              <Text style={styles.secondaryButtonText}>
                {lessonOneCompleted ? "Close" : "Not now"}
              </Text>
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
    fontSize: 26,
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
    marginBottom: 14,
  },

  sectionTitle: {
    width: "100%",
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "900",
    marginTop: 10,
    marginBottom: 10,
  },

  lessonBox: {
    width: "100%",
    backgroundColor: "#182638",
    borderRadius: 18,
    padding: 16,
    marginTop: 6,
    marginBottom: 18,
    borderWidth: 1,
    borderColor: "#2D4562",
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
    color: "#FFFFFF",
    marginBottom: 6,
  },

  lessonText: {
    fontSize: 15,
    color: "#CAD3DD",
    lineHeight: 22,
    fontWeight: "600",
  },

  activeLessonCard: {
    width: "100%",
    backgroundColor: "#182638",
    borderRadius: 18,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#2ECC71",
  },

  lessonHeader: {
    width: "100%",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },

  lessonNumber: {
    color: "#2ECC71",
    fontSize: 13,
    fontWeight: "900",
    textTransform: "uppercase",
    letterSpacing: 0.6,
  },

  completedBadge: {
    backgroundColor: "rgba(46, 204, 113, 0.16)",
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },

  completedBadgeText: {
    color: "#2ECC71",
    fontSize: 12,
    fontWeight: "900",
  },

  activeLessonTitle: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "900",
    marginBottom: 6,
  },

  activeLessonText: {
    color: "#CAD3DD",
    fontSize: 14,
    lineHeight: 21,
    fontWeight: "600",
  },

  replayText: {
    color: "#2ECC71",
    fontSize: 14,
    fontWeight: "900",
    marginTop: 12,
  },

  lockedLessonCard: {
    width: "100%",
    backgroundColor: "#182638",
    borderRadius: 18,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#2D4562",
    opacity: 0.78,
  },

  lockedLessonNumber: {
    color: "#93A4B4",
    fontSize: 13,
    fontWeight: "900",
    textTransform: "uppercase",
    letterSpacing: 0.6,
  },

  lockedLessonTitle: {
    color: "#FFFFFF",
    fontSize: 17,
    fontWeight: "900",
    marginBottom: 6,
  },

  lockedLessonText: {
    color: "#AAB7C4",
    fontSize: 14,
    lineHeight: 21,
    fontWeight: "600",
  },

  comingSoon: {
    color: "#93A4B4",
    fontSize: 12,
    fontWeight: "900",
  },

  tipCard: {
    width: "100%",
    backgroundColor: "#101820",
    borderRadius: 18,
    padding: 16,
    marginTop: 4,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: "#2D4562",
  },

  tipLabel: {
    color: "#2ECC71",
    fontSize: 13,
    fontWeight: "900",
    marginBottom: 8,
    textTransform: "uppercase",
    letterSpacing: 0.6,
  },

  tipText: {
    color: "#CAD3DD",
    fontSize: 15,
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
    color: "#93A4B4",
    fontSize: 15,
    fontWeight: "800",
  },
});
