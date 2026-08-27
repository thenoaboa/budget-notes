import { useLocalSearchParams } from "expo-router";

import {
    normalizeApproach,
    TeacherPrintScreen,
} from "@/components/education/TeacherPrintScreen";
import { LESSONS } from "@/lib/education/teacher-lessons";

export default function PrintAllTeacherLessonsScreen() {
  const { approach } = useLocalSearchParams<{
    approach?: string | string[];
  }>();

  const lessonApproach = normalizeApproach(approach);

  return (
    <TeacherPrintScreen
      lessons={LESSONS}
      approach={lessonApproach}
      title="All Lesson Guides"
      printButtonLabel="Print All"
    />
  );
}
