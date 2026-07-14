import { router, useLocalSearchParams } from "expo-router";

import { BudgetPracticeScreen } from "@/components/lessons/BudgetPracticeScreen";

export default function BudgetPracticeRoute() {
  const params = useLocalSearchParams<{
    lessonId?: string | string[];
  }>();

  const lessonId = Array.isArray(params.lessonId)
    ? params.lessonId[0]
    : params.lessonId;

  function returnToLesson() {
    if (lessonId) {
      router.replace(
        `/bills-corner/lessons/${encodeURIComponent(lessonId)}` as never,
      );
      return;
    }

    router.replace("/bills-corner" as never);
  }

  return (
    <BudgetPracticeScreen
      onClose={returnToLesson}
      onComplete={() => router.replace("/bills-corner" as never)}
    />
  );
}
