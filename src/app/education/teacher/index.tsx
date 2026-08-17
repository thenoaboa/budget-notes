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

type TeacherLesson = {
  id: string;
  number: number;
  title: string;
  duration: string;
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
  route: string;
  objective: string;
  openingQuestion: string;
  discussionQuestions: string[];
};

const LESSONS: TeacherLesson[] = [
  {
    id: "grocery-challenge",
    number: 1,
    title: "The Grocery Challenge",
    duration: "10–15 min",
    icon: "cart-outline",
    color: "#2ECC71",
    route: "/education/grocery-challenge",
    objective:
      "Practice meeting important needs while making tradeoffs inside a limited grocery budget.",
    openingQuestion:
      "If you cannot buy everything at the store, how do you decide what stays in the cart?",
    discussionQuestions: [
      "What did you choose first, and why?",
      "What did you remove when the total became too high?",
      "How did sales tax change your plan?",
    ],
  },
  {
    id: "needs-and-wants",
    number: 2,
    title: "Needs vs. Wants",
    duration: "10 min",
    icon: "git-compare-outline",
    color: "#5DADE2",
    route: "/education/needs-and-wants",
    objective:
      "Recognize that whether something is a need or a want depends on its purpose and the situation.",
    openingQuestion:
      "Can the same item be a need for one person and a want for another person?",
    discussionQuestions: [
      "Which decision was the hardest to classify?",
      "When can something normally considered a want become a need?",
      "Why should needs usually come before wants?",
    ],
  },
  {
    id: "first-budget",
    number: 3,
    title: "Build Your First Budget",
    duration: "15–20 min",
    icon: "calculator-outline",
    color: "#B56CFF",
    route: "/education/first-budget",
    objective:
      "Build a complete plan that covers important expenses, includes savings, and does not exceed available money.",
    openingQuestion: "What should you decide before you begin spending money?",
    discussionQuestions: [
      "Which expense did you plan first?",
      "How did saving money affect what else you could choose?",
      "Did your final budget leave any money available?",
    ],
  },
  {
    id: "unexpected-expense",
    number: 4,
    title: "The Unexpected Expense",
    duration: "10–15 min",
    icon: "warning-outline",
    color: "#F5A623",
    route: "/education/unexpected-expense",
    objective:
      "Revise an existing budget when an important unplanned expense appears.",
    openingQuestion:
      "What could you change if an emergency made your original budget stop working?",
    discussionQuestions: [
      "What part of your original plan did you change?",
      "Why were optional expenses easier to change than essentials?",
      "How can savings make unexpected expenses less stressful?",
    ],
  },
  {
    id: "dont-spend-it-all",
    number: 5,
    title: "You Don't Have to Spend It All",
    duration: "10 min",
    icon: "wallet-outline",
    color: "#5DADE2",
    route: "/education/dont-spend-it-all",
    objective:
      "Understand that leaving money available is an intentional choice, not an unfinished budget.",
    openingQuestion:
      "If you have $20 left after paying for everything important, do you need to find something to buy?",
    discussionQuestions: [
      "Why did you decide to stop spending?",
      "What options does remaining money give you?",
      "Is unspent money the same as wasted money?",
    ],
  },
  {
    id: "overspending",
    number: 6,
    title: "What Happens When You Overspend?",
    duration: "10–15 min",
    icon: "trending-down-outline",
    color: "#FF7676",
    route: "/education/overspending",
    objective:
      "See how spending beyond available money can create fees, debt, or less money in the future.",
    openingQuestion:
      "If you spend $100 but only have $80, where does the missing $20 come from?",
    discussionQuestions: [
      "What did you change to repair the plan?",
      "How can borrowing reduce the money available later?",
      "What could help prevent overspending before it happens?",
    ],
  },
];

export default function TeacherHomeScreen() {
  const router = useRouter();
  const [expandedLessonId, setExpandedLessonId] = useState<string | null>(
    LESSONS[0].id,
  );

  function toggleLesson(lessonId: string) {
    setExpandedLessonId((currentId) =>
      currentId === lessonId ? null : lessonId,
    );
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
            <Text style={styles.summaryNumber}>6</Text>
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

        <Text style={styles.sectionTitle}>Lesson Guides</Text>

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
  sectionTitle: {
    color: "#FFFFFF",
    fontSize: 20,
    fontWeight: "900",
    marginTop: 28,
    marginBottom: 13,
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
