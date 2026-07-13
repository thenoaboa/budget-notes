import { router, useLocalSearchParams } from "expo-router";
import { Pressable, SafeAreaView, StyleSheet, Text, View } from "react-native";

import { ComicLessonScreen } from "@/components/lessons/ComicLessonScreen";
import { getBillLessonById } from "@/data/billLessons";

export default function BillLessonRoute() {
  const params = useLocalSearchParams<{
    lessonId?: string | string[];
  }>();

  const lessonId = Array.isArray(params.lessonId)
    ? params.lessonId[0]
    : params.lessonId;

  const lesson = lessonId ? getBillLessonById(lessonId) : undefined;

  if (!lesson) {
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

  return (
    <ComicLessonScreen
      lesson={lesson}
      onClose={() => router.back()}
      onOpenBudgets={() => router.push("/")}
      onComplete={() => router.replace("/bills-corner")}
    />
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#111513",
  },
  errorContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  },
  errorEmoji: {
    fontSize: 64,
    marginBottom: 16,
  },
  errorTitle: {
    color: "#FFFFFF",
    fontSize: 24,
    fontWeight: "800",
  },
  errorText: {
    color: "#AAB4AE",
    fontSize: 15,
    textAlign: "center",
    marginTop: 8,
  },
  backButton: {
    backgroundColor: "#4E7D3A",
    borderRadius: 14,
    paddingHorizontal: 20,
    paddingVertical: 14,
    marginTop: 24,
  },
  backButtonText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "700",
  },
});
