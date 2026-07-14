import { router, useLocalSearchParams } from "expo-router";
import { useCallback } from "react";
import { Pressable, SafeAreaView, StyleSheet, Text, View } from "react-native";

import { ComicLessonScreen } from "@/components/lessons/ComicLessonScreen";
import { billLessons, getBillLessonById } from "@/data/billLessons";
import { updateBillLessonProgress } from "@/storage/billLessonProgress";

export function generateStaticParams() {
  return billLessons.map((lesson) => ({ lessonId: lesson.id }));
}

export default function BillLessonLearnRoute() {
  const params = useLocalSearchParams<{ lessonId?: string | string[] }>();
  const lessonId = Array.isArray(params.lessonId)
    ? params.lessonId[0]
    : params.lessonId;
  const lesson = lessonId ? getBillLessonById(lessonId) : undefined;

  if (!lesson || !lessonId) return <MissingActivity />;

  const resolvedLessonId = lessonId;

  const markLessonCompleted = useCallback(async () => {
    await updateBillLessonProgress(resolvedLessonId, { lessonCompleted: true });
  }, [resolvedLessonId]);

  async function startTest() {
    await markLessonCompleted();
    router.replace(
      `/bills-corner/lessons/${encodeURIComponent(resolvedLessonId)}/test` as never,
    );
  }

  return (
    <ComicLessonScreen
      lesson={lesson}
      mode="learn"
      onClose={() =>
        router.replace(
          `/bills-corner/lessons/${encodeURIComponent(resolvedLessonId)}` as never,
        )
      }
      onOpenBudgets={() => router.push("/" as never)}
      onStartTest={startTest}
      onStartPractice={() =>
        router.replace(
          `/bills-corner/lessons/${encodeURIComponent(resolvedLessonId)}/practice` as never,
        )
      }
      onActivityCompleted={markLessonCompleted}
      onComplete={startTest}
    />
  );
}

function MissingActivity() {
  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.errorContainer}>
        <Text style={styles.errorEmoji}>🐷</Text>
        <Text style={styles.errorTitle}>Lesson not found</Text>
        <Text style={styles.errorText}>
          This lesson may have been moved or removed.
        </Text>
        <Pressable style={styles.backButton} onPress={() => router.back()}>
          <Text style={styles.backButtonText}>Go back</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#111513" },
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
