import Ionicons from "@expo/vector-icons/Ionicons";
import * as Print from "expo-print";
import { useRouter } from "expo-router";
import { useEffect, type ReactNode } from "react";
import {
  Alert,
  Platform,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

import type {
  LessonApproach,
  TeacherLesson,
} from "../../lib/education/teacher-lessons";

type SearchParamValue = string | string[] | undefined;

export function normalizeApproach(value: SearchParamValue): LessonApproach {
  const resolved = Array.isArray(value) ? value[0] : value;
  return resolved === "faith" ? "faith" : "standard";
}

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function renderLessonHtml(lesson: TeacherLesson, approach: LessonApproach) {
  const discussionQuestions = lesson.discussionQuestions
    .map(
      (question, index) => `
        <li>
          <span class="question-number">${index + 1}</span>
          <span>${escapeHtml(question)}</span>
        </li>
      `,
    )
    .join("");

  const faithSection =
    approach === "faith"
      ? `
        <section class="faith-section">
          <div class="section-kicker faith-kicker">FAITH CONNECTION</div>
          <div class="scripture">${escapeHtml(
            lesson.faithConnection.scripture,
          )}</div>
          <p>${escapeHtml(lesson.faithConnection.principle)}</p>
          <div class="faith-question">
            <strong>Discuss:</strong>
            ${escapeHtml(lesson.faithConnection.discussionQuestion)}
          </div>
        </section>
      `
      : "";

  return `
    <article class="lesson">
      <header class="lesson-header">
        <div>
          <div class="brand">BUDGET NOTE · TEACHER GUIDE</div>
          <div class="lesson-number">LESSON ${lesson.number}</div>
          <h1>${escapeHtml(lesson.title)}</h1>
        </div>
        <div class="duration">${escapeHtml(lesson.duration)}</div>
      </header>

      <section>
        <div class="section-kicker">OBJECTIVE</div>
        <p>${escapeHtml(lesson.objective)}</p>
      </section>

      <section>
        <div class="section-kicker">ASK BEFORE THE ACTIVITY</div>
        <p class="prompt">${escapeHtml(lesson.openingQuestion)}</p>
      </section>

      <section>
        <div class="section-kicker">DISCUSS AFTERWARD</div>
        <ol class="questions">
          ${discussionQuestions}
        </ol>
      </section>

      ${faithSection}

      <section class="notes-section">
        <div class="section-kicker">TEACHER NOTES</div>
        <div class="note-line"></div>
        <div class="note-line"></div>
        <div class="note-line"></div>
      </section>

      <footer>
        Budget Note · Lesson ${lesson.number} · ${
          approach === "faith" ? "Faith-Based" : "Standard"
        } Guide
      </footer>
    </article>
  `;
}

export function buildPrintHtml(
  lessons: TeacherLesson[],
  approach: LessonApproach,
) {
  const lessonMarkup = lessons
    .map((lesson) => renderLessonHtml(lesson, approach))
    .join("");

  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8" />
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1.0"
        />
        <style>
          @page {
            size: Letter;
            margin: 0.5in;
          }

          * {
            box-sizing: border-box;
          }

          html,
          body {
            margin: 0;
            padding: 0;
            background: #ffffff;
            color: #18212b;
            font-family: Arial, Helvetica, sans-serif;
          }

          .lesson {
            width: 100%;
            min-height: 9.85in;
            display: flex;
            flex-direction: column;
            break-after: page;
            page-break-after: always;
          }

          .lesson:last-child {
            break-after: auto;
            page-break-after: auto;
          }

          .lesson-header {
            display: flex;
            flex-direction: row;
            justify-content: space-between;
            align-items: flex-start;
            gap: 24px;
            padding-bottom: 18px;
            margin-bottom: 18px;
            border-bottom: 3px solid #b56cff;
          }

          .brand {
            color: #6b7280;
            font-size: 9px;
            font-weight: 700;
            letter-spacing: 1.4px;
            margin-bottom: 12px;
          }

          .lesson-number {
            color: #7a3db5;
            font-size: 11px;
            font-weight: 800;
            letter-spacing: 1px;
            margin-bottom: 5px;
          }

          h1 {
            margin: 0;
            color: #101820;
            font-size: 27px;
            line-height: 1.1;
          }

          .duration {
            white-space: nowrap;
            border: 1px solid #d7dce2;
            border-radius: 999px;
            padding: 7px 11px;
            color: #4b5563;
            font-size: 11px;
            font-weight: 700;
          }

          section {
            border: 1px solid #dde2e7;
            border-radius: 10px;
            padding: 13px 15px;
            margin-bottom: 12px;
            break-inside: avoid;
            page-break-inside: avoid;
          }

          .section-kicker {
            color: #7a3db5;
            font-size: 9px;
            font-weight: 800;
            letter-spacing: 1px;
            margin-bottom: 7px;
          }

          p {
            margin: 0;
            font-size: 12px;
            line-height: 1.5;
          }

          .prompt {
            font-size: 13px;
            font-weight: 700;
          }

          .questions {
            list-style: none;
            margin: 0;
            padding: 0;
          }

          .questions li {
            display: flex;
            align-items: flex-start;
            gap: 9px;
            margin-top: 8px;
            font-size: 12px;
            line-height: 1.45;
          }

          .questions li:first-child {
            margin-top: 0;
          }

          .question-number {
            flex: 0 0 20px;
            width: 20px;
            height: 20px;
            border-radius: 10px;
            display: inline-flex;
            align-items: center;
            justify-content: center;
            background: #eef0f3;
            color: #101820;
            font-size: 9px;
            font-weight: 800;
          }

          .faith-section {
            background: #fff9e7;
            border-color: #e3c96e;
          }

          .faith-kicker {
            color: #876b0a;
          }

          .scripture {
            color: #101820;
            font-size: 13px;
            font-weight: 800;
            margin-bottom: 7px;
          }

          .faith-question {
            border-top: 1px solid #e3c96e;
            margin-top: 10px;
            padding-top: 10px;
            font-size: 12px;
            line-height: 1.45;
          }

          .notes-section {
            margin-top: auto;
          }

          .note-line {
            height: 20px;
            border-bottom: 1px solid #cfd5dc;
          }

          footer {
            padding-top: 10px;
            color: #8a939e;
            font-size: 8px;
            text-align: right;
          }
        </style>
      </head>
      <body>
        ${lessonMarkup}
      </body>
    </html>
  `;
}

function useWebPrintStyles() {
  useEffect(() => {
    if (Platform.OS !== "web" || typeof document === "undefined") {
      return;
    }

    const styleId = "budget-note-teacher-print-styles";
    const existingStyle = document.getElementById(styleId);

    if (existingStyle) {
      return;
    }

    const style = document.createElement("style");
    style.id = styleId;
    style.textContent = `
      @media print {
        @page {
          size: Letter;
          margin: 0.5in;
        }

        html,
        body,
        #root,
        #teacher-print-root {
          background: #ffffff !important;
          height: auto !important;
          min-height: 0 !important;
          overflow: visible !important;
        }

        #teacher-print-actions {
          display: none !important;
        }

        #teacher-print-scroll {
          height: auto !important;
          max-height: none !important;
          overflow: visible !important;
        }

        #teacher-print-content {
          padding: 0 !important;
        }

        #teacher-print-root * {
          -webkit-print-color-adjust: exact !important;
          print-color-adjust: exact !important;
        }
      }
    `;

    document.head.appendChild(style);

    return () => {
      style.remove();
    };
  }, []);
}

const webPageBreakStyle =
  Platform.OS === "web"
    ? ({
        breakAfter: "page",
        pageBreakAfter: "always",
      } as any)
    : undefined;

export function PrintableLesson({
  lesson,
  approach,
  pageBreakAfter = false,
}: {
  lesson: TeacherLesson;
  approach: LessonApproach;
  pageBreakAfter?: boolean;
}) {
  return (
    <View style={[styles.paper, pageBreakAfter && webPageBreakStyle]}>
      <View style={styles.paperHeader}>
        <View style={styles.paperHeaderText}>
          <Text style={styles.brand}>BUDGET NOTE · TEACHER GUIDE</Text>
          <Text style={styles.lessonNumber}>LESSON {lesson.number}</Text>
          <Text style={styles.paperTitle}>{lesson.title}</Text>
        </View>

        <View style={styles.durationPill}>
          <Text style={styles.durationPillText}>{lesson.duration}</Text>
        </View>
      </View>

      <PrintSection label="OBJECTIVE">
        <Text style={styles.bodyText}>{lesson.objective}</Text>
      </PrintSection>

      <PrintSection label="ASK BEFORE THE ACTIVITY">
        <Text style={styles.promptText}>{lesson.openingQuestion}</Text>
      </PrintSection>

      <PrintSection label="DISCUSS AFTERWARD">
        {lesson.discussionQuestions.map((question, index) => (
          <View key={question} style={styles.printQuestionRow}>
            <View style={styles.printQuestionNumber}>
              <Text style={styles.printQuestionNumberText}>{index + 1}</Text>
            </View>
            <Text style={styles.printQuestionText}>{question}</Text>
          </View>
        ))}
      </PrintSection>

      {approach === "faith" && (
        <View style={styles.printFaithSection}>
          <Text style={styles.printFaithLabel}>FAITH CONNECTION</Text>
          <Text style={styles.printScripture}>
            {lesson.faithConnection.scripture}
          </Text>
          <Text style={styles.bodyText}>
            {lesson.faithConnection.principle}
          </Text>

          <View style={styles.printFaithQuestion}>
            <Text style={styles.printFaithQuestionText}>
              <Text style={styles.boldText}>Discuss: </Text>
              {lesson.faithConnection.discussionQuestion}
            </Text>
          </View>
        </View>
      )}

      <View style={styles.notesSection}>
        <Text style={styles.printLabel}>TEACHER NOTES</Text>
        <View style={styles.noteLine} />
        <View style={styles.noteLine} />
        <View style={styles.noteLine} />
      </View>

      <Text style={styles.paperFooter}>
        Budget Note · Lesson {lesson.number} ·{" "}
        {approach === "faith" ? "Faith-Based" : "Standard"} Guide
      </Text>
    </View>
  );
}

function PrintSection({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <View style={styles.printSection}>
      <Text style={styles.printLabel}>{label}</Text>
      {children}
    </View>
  );
}

export function TeacherPrintScreen({
  lessons,
  approach,
  title,
  printButtonLabel,
}: {
  lessons: TeacherLesson[];
  approach: LessonApproach;
  title: string;
  printButtonLabel: string;
}) {
  const router = useRouter();
  useWebPrintStyles();

  async function handlePrint() {
    try {
      const html = buildPrintHtml(lessons, approach);
      await Print.printAsync({ html });
    } catch (error) {
      console.error("Unable to print teacher guide:", error);

      if (Platform.OS === "web" && typeof window !== "undefined") {
        window.alert(
          "Budget Note could not open the print dialog. Please try again.",
        );
        return;
      }

      Alert.alert(
        "Unable to print",
        "Budget Note could not open the print dialog. Please try again.",
      );
    }
  }

  return (
    <SafeAreaView nativeID="teacher-print-root" style={styles.printScreen}>
      <View nativeID="teacher-print-actions" style={styles.actionBar}>
        <Pressable
          style={({ pressed }) => [
            styles.actionBackButton,
            pressed && styles.pressed,
          ]}
          onPress={() => router.back()}
          accessibilityRole="button"
          accessibilityLabel="Return to Teacher Mode"
        >
          <Ionicons name="arrow-back" size={22} color="#FFFFFF" />
        </Pressable>

        <View style={styles.actionTitleContainer}>
          <Text style={styles.actionTitle}>{title}</Text>
          <Text style={styles.actionSubtitle}>
            {approach === "faith" ? "Faith-Based" : "Standard"} guide
          </Text>
        </View>

        <Pressable
          style={({ pressed }) => [
            styles.actionPrintButton,
            pressed && styles.pressed,
          ]}
          onPress={handlePrint}
          accessibilityRole="button"
          accessibilityLabel={printButtonLabel}
        >
          <Ionicons name="print-outline" size={18} color="#101820" />
          <Text style={styles.actionPrintButtonText}>{printButtonLabel}</Text>
        </Pressable>
      </View>

      <ScrollView
        nativeID="teacher-print-scroll"
        style={styles.printScroll}
        contentContainerStyle={styles.printScrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View nativeID="teacher-print-content" style={styles.paperStack}>
          {lessons.map((lesson, index) => (
            <PrintableLesson
              key={lesson.id}
              lesson={lesson}
              approach={approach}
              pageBreakAfter={index < lessons.length - 1}
            />
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  printScreen: {
    flex: 1,
    backgroundColor: "#DDE2E7",
  },
  actionBar: {
    minHeight: 70,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: "#101820",
    gap: 12,
  },
  actionBackButton: {
    width: 42,
    height: 42,
    borderRadius: 13,
    backgroundColor: "#1B2738",
    borderWidth: 1,
    borderColor: "#344657",
    alignItems: "center",
    justifyContent: "center",
  },
  actionTitleContainer: {
    flex: 1,
  },
  actionTitle: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "900",
  },
  actionSubtitle: {
    color: "#8A98A8",
    fontSize: 11,
    fontWeight: "700",
    marginTop: 2,
  },
  actionPrintButton: {
    minHeight: 42,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#B56CFF",
    borderRadius: 13,
    paddingHorizontal: 13,
    gap: 7,
  },
  actionPrintButtonText: {
    color: "#101820",
    fontSize: 12,
    fontWeight: "900",
  },
  printScroll: {
    flex: 1,
  },
  printScrollContent: {
    paddingHorizontal: 16,
    paddingVertical: 22,
  },
  paperStack: {
    width: "100%",
    alignItems: "center",
    gap: 22,
  },
  paper: {
    width: "100%",
    maxWidth: 816,
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 38,
    paddingTop: 38,
    paddingBottom: 28,
    borderRadius: 2,
    borderWidth: 1,
    borderColor: "#D7DCE2",
  },
  paperHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: 18,
    borderBottomWidth: 3,
    borderBottomColor: "#B56CFF",
    paddingBottom: 18,
    marginBottom: 18,
  },
  paperHeaderText: {
    flex: 1,
  },
  brand: {
    color: "#6B7280",
    fontSize: 9,
    fontWeight: "800",
    letterSpacing: 1.3,
    marginBottom: 11,
  },
  lessonNumber: {
    color: "#7A3DB5",
    fontSize: 11,
    fontWeight: "900",
    letterSpacing: 1,
    marginBottom: 5,
  },
  paperTitle: {
    color: "#101820",
    fontSize: 27,
    fontWeight: "900",
    lineHeight: 31,
  },
  durationPill: {
    borderWidth: 1,
    borderColor: "#D7DCE2",
    borderRadius: 999,
    paddingHorizontal: 11,
    paddingVertical: 7,
  },
  durationPillText: {
    color: "#4B5563",
    fontSize: 11,
    fontWeight: "800",
  },
  printSection: {
    borderWidth: 1,
    borderColor: "#DDE2E7",
    borderRadius: 10,
    paddingHorizontal: 15,
    paddingVertical: 13,
    marginBottom: 12,
  },
  printLabel: {
    color: "#7A3DB5",
    fontSize: 9,
    fontWeight: "900",
    letterSpacing: 1,
    marginBottom: 7,
  },
  bodyText: {
    color: "#18212B",
    fontSize: 12,
    fontWeight: "500",
    lineHeight: 18,
  },
  promptText: {
    color: "#18212B",
    fontSize: 13,
    fontWeight: "800",
    lineHeight: 19,
  },
  printQuestionRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginTop: 8,
  },
  printQuestionNumber: {
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#EEF0F3",
    marginRight: 9,
    marginTop: 1,
  },
  printQuestionNumberText: {
    color: "#101820",
    fontSize: 9,
    fontWeight: "900",
  },
  printQuestionText: {
    flex: 1,
    color: "#18212B",
    fontSize: 12,
    fontWeight: "500",
    lineHeight: 18,
  },
  printFaithSection: {
    backgroundColor: "#FFF9E7",
    borderWidth: 1,
    borderColor: "#E3C96E",
    borderRadius: 10,
    paddingHorizontal: 15,
    paddingVertical: 13,
    marginBottom: 12,
  },
  printFaithLabel: {
    color: "#876B0A",
    fontSize: 9,
    fontWeight: "900",
    letterSpacing: 1,
    marginBottom: 5,
  },
  printScripture: {
    color: "#101820",
    fontSize: 13,
    fontWeight: "900",
    marginBottom: 7,
  },
  printFaithQuestion: {
    borderTopWidth: 1,
    borderTopColor: "#E3C96E",
    marginTop: 10,
    paddingTop: 10,
  },
  printFaithQuestionText: {
    color: "#18212B",
    fontSize: 12,
    fontWeight: "500",
    lineHeight: 18,
  },
  boldText: {
    fontWeight: "900",
  },
  notesSection: {
    borderWidth: 1,
    borderColor: "#DDE2E7",
    borderRadius: 10,
    paddingHorizontal: 15,
    paddingTop: 13,
    paddingBottom: 11,
    marginTop: 2,
  },
  noteLine: {
    height: 21,
    borderBottomWidth: 1,
    borderBottomColor: "#CFD5DC",
  },
  paperFooter: {
    color: "#8A939E",
    fontSize: 8,
    fontWeight: "600",
    textAlign: "right",
    marginTop: 10,
  },
  pressed: {
    opacity: 0.7,
  },
});
