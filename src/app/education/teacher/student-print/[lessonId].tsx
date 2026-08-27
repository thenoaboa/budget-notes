import { StudentPrintScreen } from "@/components/education/StudentPrintScreen";
import { getStudentWorksheet } from "@/lib/education/student-worksheets";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect } from "react";

export default function PrintStudentWorksheetScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ lessonId?: string | string[] }>();

  const lessonId = Array.isArray(params.lessonId)
    ? params.lessonId[0]
    : params.lessonId;

  const worksheet = getStudentWorksheet(lessonId);

  useEffect(() => {
    if (!lessonId || worksheet) return;

    router.replace("/education/teacher" as any);
  }, [lessonId, router, worksheet]);

  if (!worksheet) {
    return null;
  }

  return (
    <StudentPrintScreen worksheets={[worksheet]} title={worksheet.title} />
  );
}
