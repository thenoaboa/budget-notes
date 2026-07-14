import AsyncStorage from "@react-native-async-storage/async-storage";

export type BillLessonProgress = {
  lessonCompleted: boolean;
  testCompleted: boolean;
  practiceCompleted: boolean;
  bestPracticeScore: number;
  practiceAttempts: number;
};

const STORAGE_PREFIX = "budget-note-bill-lesson-progress";

export const EMPTY_PROGRESS: BillLessonProgress = {
  lessonCompleted: false,
  testCompleted: false,
  practiceCompleted: false,
  bestPracticeScore: 0,
  practiceAttempts: 0,
};

function getStorageKey(lessonId: string): string {
  return `${STORAGE_PREFIX}:${lessonId}`;
}

export async function getBillLessonProgress(
  lessonId: string,
): Promise<BillLessonProgress> {
  try {
    const saved = await AsyncStorage.getItem(getStorageKey(lessonId));

    if (!saved) {
      return { ...EMPTY_PROGRESS };
    }

    const parsed = JSON.parse(saved) as Partial<BillLessonProgress>;

    return {
      lessonCompleted: parsed.lessonCompleted === true,
      testCompleted: parsed.testCompleted === true,
      practiceCompleted: parsed.practiceCompleted === true,

      bestPracticeScore:
        typeof parsed.bestPracticeScore === "number"
          ? parsed.bestPracticeScore
          : 0,

      practiceAttempts:
        typeof parsed.practiceAttempts === "number"
          ? parsed.practiceAttempts
          : 0,
    };
  } catch (error) {
    console.warn("Unable to load Bill lesson progress:", error);

    return { ...EMPTY_PROGRESS };
  }
}

export async function updateBillLessonProgress(
  lessonId: string,
  updates: Partial<BillLessonProgress>,
): Promise<BillLessonProgress> {
  const current = await getBillLessonProgress(lessonId);

  const next: BillLessonProgress = {
    ...current,
    ...updates,
  };

  try {
    await AsyncStorage.setItem(getStorageKey(lessonId), JSON.stringify(next));
  } catch (error) {
    console.warn("Unable to save Bill lesson progress:", error);
  }

  return next;
}

export async function recordBillPracticeResult(
  lessonId: string,
  correctAnswers: number,
  totalQuestions: number,
): Promise<BillLessonProgress> {
  const current = await getBillLessonProgress(lessonId);

  const score =
    totalQuestions > 0
      ? Math.round((correctAnswers / totalQuestions) * 100)
      : 0;

  return updateBillLessonProgress(lessonId, {
    practiceCompleted: true,
    bestPracticeScore: Math.max(current.bestPracticeScore, score),
    practiceAttempts: current.practiceAttempts + 1,
  });
}
