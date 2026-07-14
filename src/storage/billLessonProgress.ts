import AsyncStorage from "@react-native-async-storage/async-storage";

export type BillLessonProgress = {
  lessonCompleted: boolean;
  testCompleted: boolean;
  practiceCompleted: boolean;
};

const STORAGE_PREFIX = "budget-note-bill-lesson-progress";

const EMPTY_PROGRESS: BillLessonProgress = {
  lessonCompleted: false,
  testCompleted: false,
  practiceCompleted: false,
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
  const next = { ...current, ...updates };

  try {
    await AsyncStorage.setItem(getStorageKey(lessonId), JSON.stringify(next));
  } catch (error) {
    console.warn("Unable to save Bill lesson progress:", error);
  }

  return next;
}
