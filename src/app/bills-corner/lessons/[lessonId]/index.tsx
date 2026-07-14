import { useFocusEffect } from "@react-navigation/native";
import { router, useLocalSearchParams } from "expo-router";
import { useCallback, useState } from "react";
import {
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { billLessons, getBillLessonById } from "@/data/billLessons";
import {
  EMPTY_PROGRESS,
  getBillLessonProgress,
} from "@/storage/billLessonProgress";

import type { BillLessonProgress } from "@/storage/billLessonProgress";

export function generateStaticParams() {
  return billLessons.map((lesson) => ({ lessonId: lesson.id }));
}

export default function LessonActivityMenuRoute() {
  const params = useLocalSearchParams<{ lessonId?: string | string[] }>();
  const lessonId = Array.isArray(params.lessonId)
    ? params.lessonId[0]
    : params.lessonId;
  const lesson = lessonId ? getBillLessonById(lessonId) : undefined;

  const [progress, setProgress] = useState<BillLessonProgress>(EMPTY_PROGRESS);

  useFocusEffect(
    useCallback(() => {
      let active = true;

      async function loadProgress() {
        if (!lessonId) return;
        const saved = await getBillLessonProgress(lessonId);

        if (active) {
          setProgress(saved);
        }
      }

      loadProgress();

      return () => {
        active = false;
      };
    }, [lessonId]),
  );

  if (!lesson || !lessonId) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorEmoji}>🐷</Text>
          <Text style={styles.errorTitle}>Lesson not found</Text>
          <Text style={styles.errorText}>
            This lesson may have been moved or removed.
          </Text>

          <Pressable style={styles.backButton} onPress={() => router.back()}>
            <Text style={styles.backButtonText}>
              Return to Bill&apos;s Corner
            </Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  const testUnlocked = progress.lessonCompleted;
  const practiceUnlocked = progress.testCompleted;
  const fullyCompleted = progress.practiceCompleted;

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.navigation}>
          <Pressable
            style={styles.navigationButton}
            onPress={() => router.replace("/bills-corner" as never)}
          >
            <Text style={styles.navigationButtonText}>‹</Text>
          </Pressable>

          <Text style={styles.navigationTitle}>
            Lesson {lesson.lessonNumber}
          </Text>

          <Pressable
            style={styles.navigationButton}
            onPress={() => router.replace("/bills-corner" as never)}
          >
            <Text style={styles.closeButtonText}>×</Text>
          </Pressable>
        </View>

        <View style={styles.heroCard}>
          <Text style={styles.billEmoji}>🐷</Text>
          <Text style={styles.title}>{lesson.title}</Text>
          <Text style={styles.description}>{lesson.description}</Text>

          {fullyCompleted && (
            <View style={styles.completedBadge}>
              <Text style={styles.completedBadgeText}>Lesson completed</Text>
            </View>
          )}
        </View>

        <Text style={styles.sectionTitle}>Choose an activity</Text>

        <ActivityButton
          number="1"
          title={fullyCompleted ? "Replay the Lesson" : "Learn the Lesson"}
          description="Follow Bill through the story and learn the main idea."
          status={progress.lessonCompleted ? "Completed" : "Start here"}
          locked={false}
          onPress={() =>
            router.push(
              `/bills-corner/lessons/${encodeURIComponent(lessonId)}/learn` as never,
            )
          }
        />

        <ActivityButton
          number="2"
          title="Test Your Knowledge"
          description="Answer five different question types about the lesson."
          status={
            progress.testCompleted
              ? "Completed"
              : testUnlocked
                ? "Available"
                : "Locked"
          }
          locked={!testUnlocked}
          onPress={() =>
            router.push(
              `/bills-corner/lessons/${encodeURIComponent(lessonId)}/test` as never,
            )
          }
        />

        <ActivityButton
          number="3"
          title="Practice with Budget Note"
          description="Apply what you learned inside an interactive budget."
          status={
            progress.practiceCompleted
              ? "Completed"
              : practiceUnlocked
                ? "Available"
                : "Locked"
          }
          locked={!practiceUnlocked}
          onPress={() =>
            router.push(
              `/bills-corner/lessons/${encodeURIComponent(lessonId)}/practice` as never,
            )
          }
        />

        {!fullyCompleted && (
          <View style={styles.flowTip}>
            <Text style={styles.flowTipEmoji}>💡</Text>
            <Text style={styles.flowTipText}>
              Complete the activities in order the first time. After finishing
              the full lesson, you can replay any activity.
            </Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

function ActivityButton({
  number,
  title,
  description,
  status,
  locked,
  onPress,
}: {
  number: string;
  title: string;
  description: string;
  status: string;
  locked: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      disabled={locked}
      style={({ pressed }) => [
        styles.activityCard,
        locked && styles.activityCardLocked,
        pressed && !locked && styles.activityCardPressed,
      ]}
      onPress={onPress}
    >
      <View
        style={[styles.activityNumber, locked && styles.activityNumberLocked]}
      >
        <Text style={styles.activityNumberText}>{locked ? "🔒" : number}</Text>
      </View>

      <View style={styles.activityInformation}>
        <View style={styles.activityHeader}>
          <Text
            style={[styles.activityTitle, locked && styles.activityTextLocked]}
          >
            {title}
          </Text>

          <Text
            style={[
              styles.activityStatus,
              locked && styles.activityStatusLocked,
            ]}
          >
            {status}
          </Text>
        </View>

        <Text
          style={[
            styles.activityDescription,
            locked && styles.activityTextLocked,
          ]}
        >
          {description}
        </Text>
      </View>

      <Text style={styles.chevron}>{locked ? "" : "›"}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#111513" },
  content: { paddingHorizontal: 20, paddingBottom: 50 },
  navigation: {
    minHeight: 56,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  navigationButton: {
    width: 44,
    height: 44,
    alignItems: "center",
    justifyContent: "center",
  },
  navigationButtonText: {
    color: "#FFFFFF",
    fontSize: 38,
    lineHeight: 40,
  },
  navigationTitle: { color: "#FFFFFF", fontSize: 15, fontWeight: "800" },
  closeButtonText: { color: "#AAB4AE", fontSize: 30 },
  heroCard: {
    alignItems: "center",
    backgroundColor: "#1B211E",
    borderRadius: 24,
    borderWidth: 1,
    borderColor: "#2A332E",
    padding: 22,
    marginTop: 8,
    marginBottom: 28,
  },
  billEmoji: { fontSize: 58, marginBottom: 10 },
  title: {
    color: "#FFFFFF",
    fontSize: 28,
    fontWeight: "900",
    textAlign: "center",
  },
  description: {
    color: "#AAB4AE",
    fontSize: 15,
    lineHeight: 22,
    textAlign: "center",
    marginTop: 9,
  },
  completedBadge: {
    backgroundColor: "rgba(124, 181, 91, 0.18)",
    borderRadius: 999,
    paddingHorizontal: 13,
    paddingVertical: 7,
    marginTop: 16,
  },
  completedBadgeText: {
    color: "#8AC769",
    fontSize: 12,
    fontWeight: "900",
  },
  sectionTitle: {
    color: "#FFFFFF",
    fontSize: 20,
    fontWeight: "800",
    marginBottom: 12,
  },
  activityCard: {
    minHeight: 112,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#1B211E",
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#35443B",
    padding: 15,
    marginBottom: 13,
  },
  activityCardLocked: {
    backgroundColor: "#181C1A",
    borderColor: "#252B28",
    opacity: 0.58,
  },
  activityCardPressed: {
    opacity: 0.75,
    transform: [{ scale: 0.99 }],
  },
  activityNumber: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: "#4E7D3A",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 13,
  },
  activityNumberLocked: { backgroundColor: "#2D3430" },
  activityNumberText: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "900",
  },
  activityInformation: { flex: 1 },
  activityHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: 8,
  },
  activityTitle: {
    flex: 1,
    color: "#FFFFFF",
    fontSize: 17,
    fontWeight: "800",
  },
  activityDescription: {
    color: "#AAB4AE",
    fontSize: 13,
    lineHeight: 19,
    marginTop: 6,
  },
  activityTextLocked: { color: "#7B847F" },
  activityStatus: {
    color: "#8AC769",
    fontSize: 11,
    fontWeight: "900",
    textTransform: "uppercase",
  },
  activityStatusLocked: { color: "#6E7672" },
  chevron: { color: "#FFFFFF", fontSize: 30, marginLeft: 8 },
  flowTip: {
    flexDirection: "row",
    backgroundColor: "#171C19",
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "#2A332E",
    padding: 15,
    marginTop: 6,
  },
  flowTipEmoji: { fontSize: 25, marginRight: 10 },
  flowTipText: {
    flex: 1,
    color: "#AAB4AE",
    fontSize: 13,
    lineHeight: 19,
  },
  errorContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  },
  errorEmoji: { fontSize: 64, marginBottom: 16 },
  errorTitle: { color: "#FFFFFF", fontSize: 24, fontWeight: "800" },
  errorText: {
    color: "#AAB4AE",
    fontSize: 15,
    textAlign: "center",
    marginTop: 8,
    lineHeight: 22,
  },
  backButton: {
    backgroundColor: "#4E7D3A",
    borderRadius: 14,
    paddingHorizontal: 20,
    paddingVertical: 14,
    marginTop: 24,
  },
  backButtonText: { color: "#FFFFFF", fontSize: 15, fontWeight: "700" },
});
