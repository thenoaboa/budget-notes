import { StudentPrintScreen } from "../../../../components/education/StudentPrintScreen";
import {
    STUDENT_WORKSHEETS
} from "../../../../lib/education/student-worksheets";

export default function PrintAllStudentWorksheetsScreen() {
  return (
    <StudentPrintScreen
      worksheets={STUDENT_WORKSHEETS}
      title="All Student Worksheets"
    />
  );
}
