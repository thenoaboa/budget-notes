import AsyncStorage from "@react-native-async-storage/async-storage";

export type EducationLessonId =
  | "grocery-challenge"
  | "needs-and-wants"
  | "first-budget"
  | "unexpected-expense"
  | "overspending";

const EDUCATION_PROGRESS_KEY = "@budgetnote:education:completed-lessons";

export async function getCompletedLessons(): Promise<EducationLessonId[]> {
  try {
    const savedProgress = await AsyncStorage.getItem(EDUCATION_PROGRESS_KEY);

    if (!savedProgress) {
      return [];
    }

    const parsedProgress: unknown = JSON.parse(savedProgress);

    return Array.isArray(parsedProgress)
      ? (parsedProgress as EducationLessonId[])
      : [];
  } catch (error) {
    console.error("Unable to load education progress:", error);
    return [];
  }
}

export async function markLessonComplete(lessonId: EducationLessonId) {
  try {
    const completedLessons = await getCompletedLessons();

    if (completedLessons.includes(lessonId)) {
      return;
    }

    await AsyncStorage.setItem(
      EDUCATION_PROGRESS_KEY,
      JSON.stringify([...completedLessons, lessonId]),
    );
  } catch (error) {
    console.error("Unable to save education progress:", error);
  }
}

export async function resetEducationProgress() {
  try {
    await AsyncStorage.removeItem(EDUCATION_PROGRESS_KEY);
  } catch (error) {
    console.error("Unable to reset education progress:", error);
  }
}
