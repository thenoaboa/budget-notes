import Ionicons from "@expo/vector-icons/Ionicons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Pressable, SafeAreaView, StyleSheet, Text, View } from "react-native";

import {
    normalizeApproach,
    TeacherPrintScreen,
} from "@/components/education/TeacherPrintScreen";
import { LESSONS } from "@/lib/education/teacher-lessons";

export default function PrintTeacherLessonScreen() {
  const router = useRouter();
  const { lessonId, approach } = useLocalSearchParams<{
    lessonId?: string | string[];
    approach?: string | string[];
  }>();

  const resolvedLessonId = Array.isArray(lessonId) ? lessonId[0] : lessonId;
  const lessonApproach = normalizeApproach(approach);
  const lesson = LESSONS.find((item) => item.id === resolvedLessonId);

  if (!lesson) {
    return (
      <SafeAreaView style={styles.screen}>
        <View style={styles.card}>
          <Ionicons name="alert-circle-outline" size={42} color="#FF7676" />
          <Text style={styles.title}>Lesson not found</Text>
          <Text style={styles.text}>
            This printable lesson guide does not exist.
          </Text>

          <Pressable
            style={({ pressed }) => [
              styles.backButton,
              pressed && styles.pressed,
            ]}
            onPress={() => router.back()}
            accessibilityRole="button"
          >
            <Text style={styles.backButtonText}>Return to Teacher Mode</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <TeacherPrintScreen
      lessons={[lesson]}
      approach={lessonApproach}
      title={lesson.title}
      printButtonLabel="Print"
    />
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#101820",
    alignItems: "center",
    justifyContent: "center",
    padding: 22,
  },
  card: {
    width: "100%",
    maxWidth: 430,
    alignItems: "center",
    backgroundColor: "#1B2738",
    borderWidth: 1,
    borderColor: "#344657",
    borderRadius: 20,
    padding: 24,
  },
  title: {
    color: "#FFFFFF",
    fontSize: 21,
    fontWeight: "900",
    marginTop: 12,
  },
  text: {
    color: "#AAB5C1",
    fontSize: 13,
    fontWeight: "600",
    textAlign: "center",
    lineHeight: 19,
    marginTop: 7,
  },
  backButton: {
    minHeight: 46,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#B56CFF",
    borderRadius: 14,
    paddingHorizontal: 18,
    marginTop: 20,
  },
  backButtonText: {
    color: "#101820",
    fontSize: 14,
    fontWeight: "900",
  },
  pressed: {
    opacity: 0.7,
  },
});
