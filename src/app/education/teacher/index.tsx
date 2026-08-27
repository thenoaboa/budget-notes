import Ionicons from "@expo/vector-icons/Ionicons";
import { useRouter } from "expo-router";
import { useState } from "react";
import {
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { LESSONS } from "@/lib/education/teacher-lessons";

export default function TeacherHomeScreen() {
  const router = useRouter();
  const [lessonApproach, setLessonApproach] = useState<"standard" | "faith">(
    "standard",
  );
  const [expandedLessonId, setExpandedLessonId] = useState<string | null>(
    LESSONS[0]?.id ?? null,
  );

  function toggleLesson(lessonId: string) {
    setExpandedLessonId((currentId) =>
      currentId === lessonId ? null : lessonId,
    );
  }

  function printAllTeacherGuides() {
    router.push({
      pathname: "/education/teacher/print",
      params: { approach: lessonApproach },
    } as any);
  }

  function printTeacherGuide(lessonId: string) {
    router.push({
      pathname: "/education/teacher/print/[lessonId]",
      params: { lessonId, approach: lessonApproach },
    } as any);
  }

  function printAllStudentWorksheets() {
    router.push("/education/teacher/student-print" as any);
  }

  function printStudentWorksheet(lessonId: string) {
    router.push({
      pathname: "/education/teacher/student-print/[lessonId]",
      params: { lessonId },
    } as any);
  }

  return (
    <SafeAreaView style={styles.screen}>
      <View style={styles.header}>
        <Pressable
          style={({ pressed }) => [
            styles.backButton,
            pressed && styles.pressed,
          ]}
          onPress={() => router.back()}
          hitSlop={10}
          accessibilityRole="button"
          accessibilityLabel="Return to Education Mode"
        >
          <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
        </Pressable>

        <Text style={styles.headerTitle}>Teacher Mode</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.introduction}>
          <View style={styles.teacherIcon}>
            <Ionicons name="people-outline" size={34} color="#B56CFF" />
          </View>

          <View style={styles.introductionContent}>
            <Text style={styles.title}>Teach through decisions.</Text>
            <Text style={styles.subtitle}>
              Use these guides to introduce each idea, launch the activity, and
              talk through the student's choices afterward.
            </Text>
          </View>
        </View>

        <View style={styles.summaryCard}>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryNumber}>{LESSONS.length}</Text>
            <Text style={styles.summaryLabel}>Lessons</Text>
          </View>
          <View style={styles.summaryDivider} />
          <View style={styles.summaryItem}>
            <Text style={styles.summaryNumber}>60–90</Text>
            <Text style={styles.summaryLabel}>Total minutes</Text>
          </View>
          <View style={styles.summaryDivider} />
          <View style={styles.summaryItem}>
            <Text style={styles.summaryNumber}>Ages 8+</Text>
            <Text style={styles.summaryLabel}>Starter level</Text>
          </View>
        </View>

        <View style={styles.approachSection}>
          <Text style={styles.approachLabel}>LESSON APPROACH</Text>
          <View style={styles.approachSelector}>
            <ApproachButton
              label="Standard"
              icon="school-outline"
              selected={lessonApproach === "standard"}
              onPress={() => setLessonApproach("standard")}
            />
            <ApproachButton
              label="Faith-Based"
              icon="book-outline"
              selected={lessonApproach === "faith"}
              onPress={() => setLessonApproach("faith")}
            />
          </View>
          <Text style={styles.approachDescription}>
            {lessonApproach === "faith"
              ? "Every teacher guide includes an additional scripture, biblical principle, and discussion question."
              : "Teacher guides focus on practical financial decision-making without faith-specific material."}
          </Text>
        </View>

        <Text style={styles.sectionTitle}>Lesson Guides</Text>

        <View style={styles.printAllRow}>
          <Pressable
            style={({ pressed }) => [
              styles.printAllButton,
              pressed && styles.pressedCard,
            ]}
            onPress={printAllTeacherGuides}
            accessibilityRole="button"
            accessibilityLabel="Print all teacher guides"
          >
            <View style={styles.printAllIconPurple}>
              <Ionicons name="print-outline" size={19} color="#B56CFF" />
            </View>
            <View style={styles.printAllTextWrap}>
              <Text style={styles.printAllTitle}>Teacher Guides</Text>
              <Text style={styles.printAllSubtitle}>
                Print all {LESSONS.length}
              </Text>
            </View>
          </Pressable>

          <Pressable
            style={({ pressed }) => [
              styles.printAllButton,
              pressed && styles.pressedCard,
            ]}
            onPress={printAllStudentWorksheets}
            accessibilityRole="button"
            accessibilityLabel="Print all student worksheets"
          >
            <View style={styles.printAllIconGreen}>
              <Ionicons name="documents-outline" size={19} color="#2ECC71" />
            </View>
            <View style={styles.printAllTextWrap}>
              <Text style={styles.printAllTitle}>Student Sheets</Text>
              <Text style={styles.printAllSubtitle}>
                Print all {LESSONS.length}
              </Text>
            </View>
          </Pressable>
        </View>

        <View style={styles.lessonList}>
          {LESSONS.map((lesson) => {
            const expanded = expandedLessonId === lesson.id;

            return (
              <View key={lesson.id} style={styles.lessonCard}>
                <Pressable
                  style={({ pressed }) => [
                    styles.lessonHeader,
                    pressed && styles.pressedCard,
                  ]}
                  onPress={() => toggleLesson(lesson.id)}
                  accessibilityRole="button"
                  accessibilityState={{ expanded }}
                >
                  <View style={styles.lessonNumber}>
                    <Text style={styles.lessonNumberText}>{lesson.number}</Text>
                  </View>

                  <View
                    style={[
                      styles.lessonIcon,
                      { borderColor: `${lesson.color}55` },
                    ]}
                  >
                    <Ionicons
                      name={lesson.icon}
                      size={25}
                      color={lesson.color}
                    />
                  </View>

                  <View style={styles.lessonHeading}>
                    <Text style={styles.lessonTitle}>{lesson.title}</Text>
                    <View style={styles.durationRow}>
                      <Ionicons name="time-outline" size={14} color="#8A98A8" />
                      <Text style={styles.durationText}>{lesson.duration}</Text>
                    </View>
                  </View>

                  <Ionicons
                    name={expanded ? "chevron-up" : "chevron-down"}
                    size={21}
                    color="#8A98A8"
                  />
                </Pressable>

                {expanded && (
                  <View style={styles.lessonDetails}>
                    <GuideSection
                      icon="flag-outline"
                      label="OBJECTIVE"
                      text={lesson.objective}
                    />

                    <GuideSection
                      icon="chatbubble-ellipses-outline"
                      label="ASK BEFORE THE ACTIVITY"
                      text={lesson.openingQuestion}
                    />

                    <View style={styles.guideSection}>
                      <View style={styles.guideLabelRow}>
                        <Ionicons
                          name="help-circle-outline"
                          size={18}
                          color="#B56CFF"
                        />
                        <Text style={styles.guideLabel}>DISCUSS AFTERWARD</Text>
                      </View>

                      {lesson.discussionQuestions.map((question, index) => (
                        <View key={question} style={styles.questionRow}>
                          <View style={styles.questionNumber}>
                            <Text style={styles.questionNumberText}>
                              {index + 1}
                            </Text>
                          </View>
                          <Text style={styles.questionText}>{question}</Text>
                        </View>
                      ))}
                    </View>

                    {lessonApproach === "faith" && (
                      <View style={styles.faithSection}>
                        <View style={styles.faithHeadingRow}>
                          <View style={styles.faithIcon}>
                            <Ionicons
                              name="book-outline"
                              size={18}
                              color="#F5C451"
                            />
                          </View>
                          <View style={styles.faithHeadingContent}>
                            <Text style={styles.faithLabel}>
                              FAITH CONNECTION
                            </Text>
                            <Text style={styles.scriptureText}>
                              {lesson.faithConnection.scripture}
                            </Text>
                          </View>
                        </View>

                        <Text style={styles.faithPrinciple}>
                          {lesson.faithConnection.principle}
                        </Text>

                        <View style={styles.faithQuestionRow}>
                          <Ionicons
                            name="chatbubble-outline"
                            size={17}
                            color="#F5C451"
                          />
                          <Text style={styles.faithQuestionText}>
                            {lesson.faithConnection.discussionQuestion}
                          </Text>
                        </View>
                      </View>
                    )}

                    <Pressable
                      style={({ pressed }) => [
                        styles.launchButton,
                        pressed && styles.pressed,
                      ]}
                      onPress={() => router.push(lesson.route as any)}
                      accessibilityRole="button"
                      accessibilityLabel={`Launch ${lesson.title}`}
                    >
                      <Ionicons name="play" size={18} color="#101820" />
                      <Text style={styles.launchButtonText}>
                        Launch Student Activity
                      </Text>
                    </Pressable>

                    <View style={styles.lessonPrintRow}>
                      <Pressable
                        style={({ pressed }) => [
                          styles.lessonPrintButton,
                          pressed && styles.pressed,
                        ]}
                        onPress={() => printStudentWorksheet(lesson.id)}
                        accessibilityRole="button"
                        accessibilityLabel={`Print student worksheet for ${lesson.title}`}
                      >
                        <Ionicons
                          name="document-text-outline"
                          size={18}
                          color="#2ECC71"
                        />
                        <Text style={styles.studentPrintButtonText}>
                          Student Worksheet
                        </Text>
                      </Pressable>

                      <Pressable
                        style={({ pressed }) => [
                          styles.lessonPrintButton,
                          pressed && styles.pressed,
                        ]}
                        onPress={() => printTeacherGuide(lesson.id)}
                        accessibilityRole="button"
                        accessibilityLabel={`Print teacher guide for ${lesson.title}`}
                      >
                        <Ionicons
                          name="print-outline"
                          size={18}
                          color="#B56CFF"
                        />
                        <Text style={styles.teacherPrintButtonText}>
                          Teacher Guide
                        </Text>
                      </Pressable>
                    </View>
                  </View>
                )}
              </View>
            );
          })}
        </View>

        <View style={styles.teacherNote}>
          <Ionicons name="bulb-outline" size={22} color="#F5C451" />
          <Text style={styles.teacherNoteText}>
            Let students explain their reasoning before correcting them. The
            goal is to understand how they make decisions, not only whether they
            reached the expected answer.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function ApproachButton({
  label,
  icon,
  selected,
  onPress,
}: {
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  selected: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      style={({ pressed }) => [
        styles.approachButton,
        selected && styles.approachButtonSelected,
        pressed && styles.pressed,
      ]}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityState={{ selected }}
    >
      <Ionicons
        name={icon}
        size={18}
        color={selected ? "#101820" : "#AAB5C1"}
      />
      <Text
        style={[
          styles.approachButtonText,
          selected && styles.approachButtonTextSelected,
        ]}
      >
        {label}
      </Text>
    </Pressable>
  );
}

function GuideSection({
  icon,
  label,
  text,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  text: string;
}) {
  return (
    <View style={styles.guideSection}>
      <View style={styles.guideLabelRow}>
        <Ionicons name={icon} size={18} color="#B56CFF" />
        <Text style={styles.guideLabel}>{label}</Text>
      </View>
      <Text style={styles.guideText}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: "#101820" },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 18,
    paddingTop: 12,
    paddingBottom: 8,
  },
  backButton: {
    width: 42,
    height: 42,
    borderRadius: 13,
    backgroundColor: "#1B2738",
    borderWidth: 1,
    borderColor: "#344657",
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: { color: "#FFFFFF", fontSize: 18, fontWeight: "900" },
  headerSpacer: { width: 42 },
  scrollView: { flex: 1 },
  scrollContent: { paddingHorizontal: 18, paddingTop: 20, paddingBottom: 40 },
  introduction: { flexDirection: "row", alignItems: "flex-start" },
  teacherIcon: {
    width: 66,
    height: 66,
    borderRadius: 20,
    backgroundColor: "#243342",
    borderWidth: 1,
    borderColor: "#3B4D5F",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 14,
  },
  introductionContent: { flex: 1 },
  title: {
    color: "#FFFFFF",
    fontSize: 25,
    fontWeight: "900",
    lineHeight: 30,
    letterSpacing: -0.4,
  },
  subtitle: {
    color: "#AAB5C1",
    fontSize: 14,
    fontWeight: "600",
    lineHeight: 20,
    marginTop: 7,
  },
  summaryCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#1B2738",
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "#344657",
    paddingVertical: 16,
    marginTop: 24,
  },
  summaryItem: { flex: 1, alignItems: "center" },
  summaryNumber: { color: "#FFFFFF", fontSize: 17, fontWeight: "900" },
  summaryLabel: {
    color: "#8A98A8",
    fontSize: 11,
    fontWeight: "700",
    marginTop: 4,
    textAlign: "center",
  },
  summaryDivider: { width: 1, height: 33, backgroundColor: "#344657" },
  approachSection: {
    backgroundColor: "#1B2738",
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "#344657",
    padding: 14,
    marginTop: 14,
  },
  approachLabel: {
    color: "#8A98A8",
    fontSize: 11,
    fontWeight: "900",
    letterSpacing: 0.7,
    marginBottom: 10,
  },
  approachSelector: {
    flexDirection: "row",
    backgroundColor: "#101820",
    borderRadius: 14,
    padding: 4,
    gap: 4,
  },
  approachButton: {
    flex: 1,
    minHeight: 43,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 11,
    gap: 7,
  },
  approachButtonSelected: { backgroundColor: "#F5C451" },
  approachButtonText: { color: "#AAB5C1", fontSize: 13, fontWeight: "900" },
  approachButtonTextSelected: { color: "#101820" },
  approachDescription: {
    color: "#AAB5C1",
    fontSize: 12,
    fontWeight: "600",
    lineHeight: 18,
    marginTop: 10,
  },
  sectionTitle: {
    color: "#FFFFFF",
    fontSize: 20,
    fontWeight: "900",
    marginTop: 28,
    marginBottom: 13,
  },
  printAllRow: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 14,
  },
  printAllButton: {
    flex: 1,
    minHeight: 67,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#1B2738",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#344657",
    paddingHorizontal: 11,
  },
  printAllIconPurple: {
    width: 36,
    height: 36,
    borderRadius: 11,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#302645",
    marginRight: 9,
  },
  printAllIconGreen: {
    width: 36,
    height: 36,
    borderRadius: 11,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#183C32",
    marginRight: 9,
  },
  printAllTextWrap: { flex: 1 },
  printAllTitle: { color: "#FFFFFF", fontSize: 12, fontWeight: "900" },
  printAllSubtitle: {
    color: "#8A98A8",
    fontSize: 10,
    fontWeight: "700",
    marginTop: 3,
  },
  lessonList: { gap: 12 },
  lessonCard: {
    backgroundColor: "#1B2738",
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "#344657",
    overflow: "hidden",
  },
  lessonHeader: {
    minHeight: 91,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 13,
    paddingVertical: 14,
  },
  lessonNumber: {
    position: "absolute",
    top: 7,
    left: 7,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: "#2A3848",
    alignItems: "center",
    justifyContent: "center",
  },
  lessonNumberText: { color: "#AAB5C1", fontSize: 10, fontWeight: "900" },
  lessonIcon: {
    width: 49,
    height: 49,
    borderRadius: 15,
    backgroundColor: "#243342",
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  lessonHeading: { flex: 1, paddingRight: 8 },
  lessonTitle: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "900",
    lineHeight: 21,
  },
  durationRow: { flexDirection: "row", alignItems: "center", marginTop: 5 },
  durationText: {
    color: "#8A98A8",
    fontSize: 12,
    fontWeight: "700",
    marginLeft: 5,
  },
  lessonDetails: { borderTopWidth: 1, borderTopColor: "#344657", padding: 15 },
  guideSection: {
    backgroundColor: "#243342",
    borderRadius: 14,
    padding: 13,
    marginBottom: 10,
  },
  guideLabelRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 7,
  },
  guideLabel: {
    color: "#B56CFF",
    fontSize: 11,
    fontWeight: "900",
    letterSpacing: 0.7,
    marginLeft: 7,
  },
  guideText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "600",
    lineHeight: 20,
  },
  questionRow: { flexDirection: "row", alignItems: "flex-start", marginTop: 8 },
  questionNumber: {
    width: 21,
    height: 21,
    borderRadius: 11,
    backgroundColor: "#344657",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 8,
    marginTop: 1,
  },
  questionNumberText: { color: "#FFFFFF", fontSize: 10, fontWeight: "900" },
  questionText: {
    flex: 1,
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "600",
    lineHeight: 19,
  },
  faithSection: {
    backgroundColor: "#3C3520",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#65582B",
    padding: 13,
    marginBottom: 10,
  },
  faithHeadingRow: { flexDirection: "row", alignItems: "center" },
  faithIcon: {
    width: 34,
    height: 34,
    borderRadius: 11,
    backgroundColor: "#514723",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },
  faithHeadingContent: { flex: 1 },
  faithLabel: {
    color: "#F5C451",
    fontSize: 11,
    fontWeight: "900",
    letterSpacing: 0.7,
  },
  scriptureText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "900",
    marginTop: 2,
  },
  faithPrinciple: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "600",
    lineHeight: 19,
    marginTop: 11,
  },
  faithQuestionRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    borderTopWidth: 1,
    borderTopColor: "#65582B",
    marginTop: 11,
    paddingTop: 11,
    gap: 8,
  },
  faithQuestionText: {
    flex: 1,
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "600",
    lineHeight: 19,
  },
  launchButton: {
    minHeight: 52,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#B56CFF",
    borderRadius: 15,
    marginTop: 4,
    gap: 8,
  },
  launchButtonText: { color: "#101820", fontSize: 15, fontWeight: "900" },
  lessonPrintRow: {
    flexDirection: "row",
    gap: 9,
    marginTop: 9,
  },
  lessonPrintButton: {
    flex: 1,
    minHeight: 48,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 7,
    backgroundColor: "#243342",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#465769",
    paddingHorizontal: 8,
  },
  studentPrintButtonText: {
    color: "#2ECC71",
    fontSize: 12,
    fontWeight: "900",
  },
  teacherPrintButtonText: {
    color: "#CFA7FF",
    fontSize: 12,
    fontWeight: "900",
  },
  teacherNote: {
    flexDirection: "row",
    alignItems: "flex-start",
    backgroundColor: "#3C3520",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#65582B",
    padding: 15,
    marginTop: 20,
  },
  teacherNoteText: {
    flex: 1,
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "600",
    lineHeight: 19,
    marginLeft: 10,
  },
  pressedCard: { backgroundColor: "#243342" },
  pressed: { opacity: 0.7 },
});
