import { router, useLocalSearchParams } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import { Pressable, SafeAreaView, StyleSheet, Text, View } from "react-native";

import { ComicLessonScreen } from "@/components/lessons/ComicLessonScreen";
import { billLessons, getBillLessonById } from "@/data/billLessons";
import {
  getBillLessonProgress,
  updateBillLessonProgress,
} from "@/storage/billLessonProgress";

export function generateStaticParams() {
  return billLessons.map((lesson) => ({ lessonId: lesson.id }));
}

export default function BillLessonTestRoute() {
  const params = useLocalSearchParams<{ lessonId?: string | string[] }>();
  const lessonId = Array.isArray(params.lessonId)
    ? params.lessonId[0]
    : params.lessonId;
  const lesson = lessonId ? getBillLessonById(lessonId) : undefined;
  const [checked, setChecked] = useState(false);
  const [unlocked, setUnlocked] = useState(false);

  useEffect(() => {
    let active = true;
    async function load() {
      if (!lessonId) {
        if (active) setChecked(true);
        return;
      }
      const progress = await getBillLessonProgress(lessonId);
      if (active) {
        setUnlocked(progress.lessonCompleted);
        setChecked(true);
      }
    }
    load();
    return () => {
      active = false;
    };
  }, [lessonId]);

  if (!lesson || !lessonId) {
    return (
      <StatusScreen emoji="🐷" title="Test not found" buttonText="Go back" />
    );
  }

  const resolvedLessonId = lessonId;

  if (!checked) return <StatusScreen emoji="🐷" title="Loading activity…" />;

  if (!unlocked) {
    return (
      <StatusScreen
        emoji="🔒"
        title="Complete the lesson first"
        body="Finish Learn the Lesson to unlock Test Your Knowledge."
        buttonText="Start the lesson"
        onPress={() =>
          router.replace(
            `/bills-corner/lessons/${encodeURIComponent(resolvedLessonId)}/learn` as never,
          )
        }
      />
    );
  }

  const markTestCompleted = useCallback(async () => {
    await updateBillLessonProgress(resolvedLessonId, {
      lessonCompleted: true,
      testCompleted: true,
    });
  }, [resolvedLessonId]);

  async function startPractice() {
    await markTestCompleted();
    router.replace(
      `/bills-corner/lessons/${encodeURIComponent(resolvedLessonId)}/practice` as never,
    );
  }

  return (
    <ComicLessonScreen
      lesson={lesson}
      mode="test"
      onClose={() =>
        router.replace(
          `/bills-corner/lessons/${encodeURIComponent(resolvedLessonId)}` as never,
        )
      }
      onOpenBudgets={() => router.push("/" as never)}
      onStartTest={() => undefined}
      onStartPractice={startPractice}
      onActivityCompleted={markTestCompleted}
      onComplete={() =>
        router.replace(
          `/bills-corner/lessons/${encodeURIComponent(resolvedLessonId)}` as never,
        )
      }
    />
  );
}

function StatusScreen({
  emoji,
  title,
  body,
  buttonText,
  onPress,
}: {
  emoji: string;
  title: string;
  body?: string;
  buttonText?: string;
  onPress?: () => void;
}) {
  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.errorContainer}>
        <Text style={styles.errorEmoji}>{emoji}</Text>
        <Text style={styles.errorTitle}>{title}</Text>
        {!!body && <Text style={styles.errorText}>{body}</Text>}
        {!!buttonText && (
          <Pressable
            style={styles.backButton}
            onPress={onPress ?? (() => router.back())}
          >
            <Text style={styles.backButtonText}>{buttonText}</Text>
          </Pressable>
        )}
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
  errorTitle: {
    color: "#FFFFFF",
    fontSize: 24,
    fontWeight: "800",
    textAlign: "center",
  },
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
