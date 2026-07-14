import { router, useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import {
    ActivityIndicator,
    Pressable,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    View,
} from "react-native";

import { billLessons, getPracticeQuestionsForLesson } from "@/data/billLessons";
import type { BillLessonProgress } from "@/storage/billLessonProgress";
import { getBillLessonProgress } from "@/storage/billLessonProgress";
import {
    MAX_PRACTICE_COINS,
    getBillPracticeState,
} from "@/storage/billPracticeState";

type ProgressMap = Record<string, BillLessonProgress>;

function renderCoins(coinsRemaining: number): string {
  return Array.from({ length: MAX_PRACTICE_COINS }, (_, index) =>
    index < coinsRemaining ? "🪙" : "⚫",
  ).join(" ");
}

export default function PracticeHubScreen() {
  const [progressByLesson, setProgressByLesson] = useState<ProgressMap>({});
  const [coinsRemaining, setCoinsRemaining] = useState(MAX_PRACTICE_COINS);
  const [loading, setLoading] = useState(true);

  const loadPracticeHub = useCallback(async () => {
    setLoading(true);

    const [practiceState, entries] = await Promise.all([
      getBillPracticeState(),

      Promise.all(
        billLessons.map(async (lesson) => {
          const progress = await getBillLessonProgress(lesson.id);

          return [lesson.id, progress] as const;
        }),
      ),
    ]);

    setCoinsRemaining(practiceState.coinsRemaining);
    setProgressByLesson(Object.fromEntries(entries));
    setLoading(false);
  }, []);

  useFocusEffect(
    useCallback(() => {
      void loadPracticeHub();
    }, [loadPracticeHub]),
  );

  const availableLessons = billLessons.filter((lesson) => {
    const progress = progressByLesson[lesson.id];

    return (
      progress?.lessonCompleted ||
      progress?.testCompleted ||
      progress?.practiceCompleted
    );
  });

  const canStartMixedReview = availableLessons.length > 0;

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Pressable
            style={({ pressed }) => [
              styles.backButton,
              pressed && styles.buttonPressed,
            ]}
            onPress={() => router.back()}
            accessibilityRole="button"
            accessibilityLabel="Go back"
          >
            <Text style={styles.backButtonText}>‹</Text>
          </Pressable>

          <View style={styles.headerText}>
            <Text style={styles.title}>Practice with Bill</Text>

            <Text style={styles.subtitle}>
              Review completed lessons without replaying the full story.
            </Text>
          </View>

          <Text style={styles.billEmoji}>🐷</Text>
        </View>

        <View style={styles.coinCard}>
          <View style={styles.coinInformation}>
            <Text style={styles.coinLabel}>Practice coins</Text>

            <Text style={styles.coinHelp}>
              Wrong answers use one coin and save automatically.
            </Text>
          </View>

          <View style={styles.coinDisplay}>
            <Text style={styles.coins}>{renderCoins(coinsRemaining)}</Text>

            <Text style={styles.coinCount}>
              {coinsRemaining} of {MAX_PRACTICE_COINS}
            </Text>
          </View>
        </View>

        <Text style={styles.sectionTitle}>Challenges</Text>

        <Pressable
          style={({ pressed }) => [
            styles.featureCard,
            pressed && canStartMixedReview && styles.buttonPressed,
            !canStartMixedReview && styles.disabledCard,
          ]}
          disabled={!canStartMixedReview}
          onPress={() =>
            router.push({
              pathname: "/bills-corner/practice-hub/session",
              params: {
                mode: "mixed",
              },
            })
          }
          accessibilityRole="button"
          accessibilityLabel="Start Mixed Review"
        >
          <View style={styles.featureIcon}>
            <Text style={styles.featureEmoji}>🧠</Text>
          </View>

          <View style={styles.featureContent}>
            <Text style={styles.featureTitle}>Mixed Review</Text>

            <Text style={styles.featureDescription}>
              Five new scenarios that are different from the lesson tests.
            </Text>

            <Text
              style={[
                styles.featureStatus,
                !canStartMixedReview && styles.lockedText,
              ]}
            >
              {canStartMixedReview
                ? "Unique mixed-review questions"
                : "Complete a lesson to unlock"}
            </Text>
          </View>

          <Text style={styles.cardChevron}>
            {canStartMixedReview ? "›" : "🔒"}
          </Text>
        </Pressable>

        <View style={[styles.featureCard, styles.disabledCard]}>
          <View style={styles.featureIcon}>
            <Text style={styles.featureEmoji}>⭐</Text>
          </View>

          <View style={styles.featureContent}>
            <Text style={styles.featureTitle}>Daily Challenge</Text>

            <Text style={styles.featureDescription}>
              Return each day for a fresh five-question challenge.
            </Text>

            <Text style={styles.lockedText}>Coming in a future update</Text>
          </View>

          <Text style={styles.cardChevron}>🔒</Text>
        </View>

        <Text style={styles.sectionTitle}>Lesson Practice</Text>

        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator />

            <Text style={styles.loadingText}>Loading progress...</Text>
          </View>
        ) : (
          billLessons.map((lesson) => {
            const progress = progressByLesson[lesson.id];

            const unlocked =
              progress?.lessonCompleted === true ||
              progress?.testCompleted === true ||
              progress?.practiceCompleted === true;

            const questionCount = getPracticeQuestionsForLesson(
              lesson.id,
            ).length;

            return (
              <Pressable
                key={lesson.id}
                style={({ pressed }) => [
                  styles.lessonCard,
                  !unlocked && styles.disabledCard,
                  pressed && unlocked && styles.buttonPressed,
                ]}
                disabled={!unlocked}
                onPress={() =>
                  router.push({
                    pathname: "/bills-corner/practice-hub/session",
                    params: {
                      mode: "lesson",
                      lessonId: lesson.id,
                    },
                  })
                }
                accessibilityRole="button"
                accessibilityLabel={`Practice Lesson ${lesson.lessonNumber}: ${lesson.title}`}
              >
                <View style={styles.lessonNumber}>
                  <Text style={styles.lessonNumberText}>
                    {lesson.lessonNumber}
                  </Text>
                </View>

                <View style={styles.lessonContent}>
                  <Text style={styles.lessonTitle}>{lesson.title}</Text>

                  <Text style={styles.lessonDescription}>
                    {questionCount} practice questions
                  </Text>

                  <View style={styles.lessonStatusRow}>
                    <Text
                      style={[
                        styles.lessonStatus,
                        !unlocked && styles.lockedText,
                      ]}
                    >
                      {!unlocked
                        ? "Complete the lesson to unlock"
                        : progress.practiceAttempts > 0
                          ? `Best score: ${progress.bestPracticeScore}%`
                          : "Ready to practice"}
                    </Text>
                  </View>
                </View>

                <Text style={styles.cardChevron}>{unlocked ? "›" : "🔒"}</Text>
              </Pressable>
            );
          })
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#111513",
  },

  content: {
    padding: 20,
    paddingBottom: 50,
  },

  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 24,
  },

  backButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#1B211E",
    marginRight: 12,
  },

  backButtonText: {
    color: "#FFFFFF",
    fontSize: 34,
    lineHeight: 36,
  },

  headerText: {
    flex: 1,
  },

  title: {
    color: "#FFFFFF",
    fontSize: 25,
    fontWeight: "800",
  },

  subtitle: {
    color: "#AAB4AE",
    fontSize: 14,
    lineHeight: 20,
    marginTop: 4,
  },

  billEmoji: {
    fontSize: 38,
    marginLeft: 10,
  },

  coinCard: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#1B211E",
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "#2A332E",
    padding: 16,
    marginBottom: 26,
  },

  coinInformation: {
    flex: 1,
    paddingRight: 12,
  },

  coinLabel: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
  },

  coinHelp: {
    color: "#8F9A94",
    fontSize: 12,
    lineHeight: 17,
    marginTop: 4,
  },

  coinDisplay: {
    alignItems: "flex-end",
  },

  coins: {
    fontSize: 15,
  },

  coinCount: {
    color: "#AAB4AE",
    fontSize: 11,
    fontWeight: "700",
    marginTop: 5,
  },

  sectionTitle: {
    color: "#FFFFFF",
    fontSize: 20,
    fontWeight: "700",
    marginBottom: 12,
    marginTop: 4,
  },

  featureCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#1B211E",
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#2A332E",
    padding: 16,
    marginBottom: 14,
  },

  featureIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#29352F",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 14,
  },

  featureEmoji: {
    fontSize: 24,
  },

  featureContent: {
    flex: 1,
  },

  featureTitle: {
    color: "#FFFFFF",
    fontSize: 17,
    fontWeight: "700",
  },

  featureDescription: {
    color: "#AAB4AE",
    fontSize: 13,
    lineHeight: 19,
    marginTop: 4,
  },

  featureStatus: {
    color: "#7CB55B",
    fontSize: 12,
    fontWeight: "700",
    marginTop: 8,
  },

  lessonCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#1B211E",
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#2A332E",
    padding: 16,
    marginBottom: 14,
  },

  lessonNumber: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#4E7D3A",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 14,
  },

  lessonNumberText: {
    color: "#FFFFFF",
    fontSize: 17,
    fontWeight: "800",
  },

  lessonContent: {
    flex: 1,
  },

  lessonTitle: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
  },

  lessonDescription: {
    color: "#AAB4AE",
    fontSize: 13,
    marginTop: 4,
  },

  lessonStatusRow: {
    flexDirection: "row",
    marginTop: 8,
  },

  lessonStatus: {
    color: "#7CB55B",
    fontSize: 12,
    fontWeight: "700",
  },

  cardChevron: {
    color: "#FFFFFF",
    fontSize: 28,
    marginLeft: 10,
  },

  disabledCard: {
    opacity: 0.52,
  },

  lockedText: {
    color: "#7F8A84",
    fontSize: 12,
    fontWeight: "700",
    marginTop: 8,
  },

  buttonPressed: {
    opacity: 0.75,
    transform: [{ scale: 0.99 }],
  },

  loadingContainer: {
    alignItems: "center",
    paddingVertical: 30,
  },

  loadingText: {
    color: "#AAB4AE",
    fontSize: 13,
    marginTop: 10,
  },
});
