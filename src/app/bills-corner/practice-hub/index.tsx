import { router, useFocusEffect } from "expo-router";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    Modal,
    Platform,
    Pressable,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    View,
} from "react-native";

import { billLessons, getPracticeQuestionsForLesson } from "@/data/billLessons";
import { showBillRewardedAd } from "@/services/billRewardedAd";
import type { BillLessonProgress } from "@/storage/billLessonProgress";
import { getBillLessonProgress } from "@/storage/billLessonProgress";
import {
    BillPracticeState,
    EMPTY_PRACTICE_STATE,
    MAX_PRACTICE_COINS,
    addBillPracticeCoin,
    getBillPracticeState,
} from "@/storage/billPracticeState";

type ProgressMap = Record<string, BillLessonProgress>;

function renderCoins(coinsRemaining: number): string {
  return Array.from({ length: MAX_PRACTICE_COINS }, (_, index) =>
    index < coinsRemaining ? "🪙" : "⚫",
  ).join(" ");
}

function formatCountdown(milliseconds: number): string {
  const totalSeconds = Math.max(0, Math.ceil(milliseconds / 1000));
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;

  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
}

function formatFullRecharge(milliseconds: number): string {
  const totalMinutes = Math.max(0, Math.ceil(milliseconds / 60000));
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;

  if (hours <= 0) {
    return `${minutes} min`;
  }

  return `${hours}h ${minutes}m`;
}

export default function PracticeHubScreen() {
  const [progressByLesson, setProgressByLesson] = useState<ProgressMap>({});
  const [practiceState, setPracticeState] =
    useState<BillPracticeState>(EMPTY_PRACTICE_STATE);
  const [loading, setLoading] = useState(true);
  const [watchingAd, setWatchingAd] = useState(false);
  const [showWebAdModal, setShowWebAdModal] = useState(false);
  const [now, setNow] = useState(Date.now());

  const loadPracticeHub = useCallback(async () => {
    setLoading(true);

    const [nextPracticeState, entries] = await Promise.all([
      getBillPracticeState(),
      Promise.all(
        billLessons.map(async (lesson) => {
          const progress = await getBillLessonProgress(lesson.id);
          return [lesson.id, progress] as const;
        }),
      ),
    ]);

    setPracticeState(nextPracticeState);
    setProgressByLesson(Object.fromEntries(entries));
    setNow(Date.now());
    setLoading(false);
  }, []);

  useFocusEffect(
    useCallback(() => {
      void loadPracticeHub();
    }, [loadPracticeHub]),
  );

  useEffect(() => {
    if (practiceState.coinsRemaining >= MAX_PRACTICE_COINS) {
      return;
    }

    const interval = setInterval(() => {
      setNow(Date.now());
    }, 1000);

    return () => clearInterval(interval);
  }, [practiceState.coinsRemaining]);

  useEffect(() => {
    if (practiceState.nextCoinAt !== null && now >= practiceState.nextCoinAt) {
      void getBillPracticeState().then((nextState) => {
        setPracticeState(nextState);
        setNow(Date.now());
      });
    }
  }, [now, practiceState.nextCoinAt]);

  const availableLessons = billLessons.filter((lesson) => {
    const progress = progressByLesson[lesson.id];

    return (
      progress?.lessonCompleted ||
      progress?.testCompleted ||
      progress?.practiceCompleted
    );
  });

  const hasCoins = practiceState.coinsRemaining > 0;
  const canStartMixedReview = availableLessons.length > 0 && hasCoins;

  const nextCoinCountdown = useMemo(() => {
    if (practiceState.nextCoinAt === null) {
      return null;
    }

    return formatCountdown(practiceState.nextCoinAt - now);
  }, [now, practiceState.nextCoinAt]);

  const fullRechargeCountdown = useMemo(() => {
    if (practiceState.fullRechargeAt === null) {
      return null;
    }

    return formatFullRecharge(practiceState.fullRechargeAt - now);
  }, [now, practiceState.fullRechargeAt]);

  const watchAdForCoin = async () => {
    if (Platform.OS === "web") {
      setShowWebAdModal(true);
      return;
    }

    if (watchingAd || practiceState.coinsRemaining >= MAX_PRACTICE_COINS) {
      return;
    }

    setWatchingAd(true);

    try {
      const earnedReward = await showBillRewardedAd();

      if (!earnedReward) {
        Alert.alert(
          "No coin earned",
          "Finish the rewarded ad to receive a practice coin.",
        );
        return;
      }

      const nextState = await addBillPracticeCoin(1);
      setPracticeState(nextState);
      setNow(Date.now());

      Alert.alert("Coin restored", "You earned 1 practice coin.");
    } catch (error) {
      console.warn("Unable to show rewarded ad:", error);

      Alert.alert(
        "Ad unavailable",
        "The rewarded ad could not load. Try again in a moment.",
      );
    } finally {
      setWatchingAd(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <Modal
        visible={showWebAdModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowWebAdModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalEmoji}>🐷</Text>

            <Text style={styles.modalTitle}>Watch ads are coming!</Text>

            <Text style={styles.modalText}>
              Rewarded ads will be available in the Android and iPhone versions
              of Budget Note.
            </Text>

            <Text style={styles.modalSubtext}>
              Watch a short ad to instantly restore a practice coin.
            </Text>

            <Pressable
              style={({ pressed }) => [
                styles.modalButton,
                pressed && styles.buttonPressed,
              ]}
              onPress={() => setShowWebAdModal(false)}
              accessibilityRole="button"
              accessibilityLabel="Close rewarded ads message"
            >
              <Text style={styles.modalButtonText}>Got it</Text>
            </Pressable>
          </View>
        </View>
      </Modal>

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
              {practiceState.coinsRemaining >= MAX_PRACTICE_COINS
                ? "All six coins are ready."
                : `Next coin in ${nextCoinCountdown ?? "30:00"}`}
            </Text>

            {fullRechargeCountdown && (
              <Text style={styles.fullRechargeText}>
                Full recharge in {fullRechargeCountdown}
              </Text>
            )}
          </View>

          <View style={styles.coinDisplay}>
            <Text style={styles.coins}>
              {renderCoins(practiceState.coinsRemaining)}
            </Text>

            <Text style={styles.coinCount}>
              {practiceState.coinsRemaining} of {MAX_PRACTICE_COINS}
            </Text>
          </View>
        </View>

        {practiceState.coinsRemaining === 0 && (
          <View style={styles.outOfCoinsCard}>
            <Text style={styles.outOfCoinsEmoji}>🐷</Text>
            <Text style={styles.outOfCoinsTitle}>
              You&apos;re out of practice coins
            </Text>
            <Text style={styles.outOfCoinsText}>
              Your next coin will recharge in {nextCoinCountdown ?? "30:00"}.
            </Text>

            <Pressable
              style={({ pressed }) => [
                styles.adButton,
                watchingAd && styles.disabledButton,
                pressed && !watchingAd && styles.buttonPressed,
              ]}
              disabled={watchingAd}
              onPress={() => void watchAdForCoin()}
            >
              <Text style={styles.adButtonText}>
                {watchingAd ? "Loading ad..." : "▶ Watch ad for +1 coin"}
              </Text>
            </Pressable>
          </View>
        )}

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
              params: { mode: "mixed" },
            })
          }
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
              {!hasCoins
                ? "Recharge a coin to continue"
                : availableLessons.length > 0
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

            const lessonUnlocked =
              progress?.lessonCompleted === true ||
              progress?.testCompleted === true ||
              progress?.practiceCompleted === true;

            const playable = lessonUnlocked && hasCoins;

            const questionCount = getPracticeQuestionsForLesson(
              lesson.id,
            ).length;

            return (
              <Pressable
                key={lesson.id}
                style={({ pressed }) => [
                  styles.lessonCard,
                  !playable && styles.disabledCard,
                  pressed && playable && styles.buttonPressed,
                ]}
                disabled={!playable}
                onPress={() =>
                  router.push({
                    pathname: "/bills-corner/practice-hub/session",
                    params: {
                      mode: "lesson",
                      lessonId: lesson.id,
                    },
                  })
                }
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

                  <Text
                    style={[
                      styles.lessonStatus,
                      !playable && styles.lockedText,
                    ]}
                  >
                    {!lessonUnlocked
                      ? "Complete the lesson to unlock"
                      : !hasCoins
                        ? "Recharge a coin to continue"
                        : progress.practiceAttempts > 0
                          ? `Best score: ${progress.bestPracticeScore}%`
                          : "Ready to practice"}
                  </Text>
                </View>

                <Text style={styles.cardChevron}>{playable ? "›" : "🔒"}</Text>
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
  modalOverlay: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(0, 0, 0, 0.72)",
    padding: 24,
  },
  modalCard: {
    width: "100%",
    maxWidth: 380,
    alignItems: "center",
    backgroundColor: "#1B211E",
    borderRadius: 24,
    borderWidth: 1,
    borderColor: "#2A332E",
    padding: 24,
  },
  modalEmoji: {
    fontSize: 44,
  },
  modalTitle: {
    color: "#FFFFFF",
    fontSize: 21,
    fontWeight: "800",
    textAlign: "center",
    marginTop: 12,
  },
  modalText: {
    color: "#AAB4AE",
    fontSize: 14,
    lineHeight: 21,
    textAlign: "center",
    marginTop: 10,
  },
  modalSubtext: {
    color: "#D6DDD9",
    fontSize: 14,
    lineHeight: 21,
    textAlign: "center",
    marginTop: 12,
  },
  modalButton: {
    width: "100%",
    minHeight: 48,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#4E7D3A",
    borderRadius: 14,
    marginTop: 20,
  },
  modalButtonText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "800",
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
    marginBottom: 18,
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
  fullRechargeText: {
    color: "#7CB55B",
    fontSize: 11,
    fontWeight: "700",
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
  outOfCoinsCard: {
    alignItems: "center",
    backgroundColor: "#1B211E",
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#5B4734",
    padding: 20,
    marginBottom: 24,
  },
  outOfCoinsEmoji: {
    fontSize: 38,
  },
  outOfCoinsTitle: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "800",
    marginTop: 10,
  },
  outOfCoinsText: {
    color: "#AAB4AE",
    fontSize: 13,
    lineHeight: 19,
    textAlign: "center",
    marginTop: 6,
  },
  adButton: {
    width: "100%",
    minHeight: 48,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#4E7D3A",
    borderRadius: 14,
    paddingHorizontal: 16,
    marginTop: 16,
  },
  adButtonText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "800",
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
  lessonStatus: {
    color: "#7CB55B",
    fontSize: 12,
    fontWeight: "700",
    marginTop: 8,
  },
  cardChevron: {
    color: "#FFFFFF",
    fontSize: 28,
    marginLeft: 10,
  },
  disabledCard: {
    opacity: 0.52,
  },
  disabledButton: {
    opacity: 0.5,
  },
  lockedText: {
    color: "#7F8A84",
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
