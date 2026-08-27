import Ionicons from "@expo/vector-icons/Ionicons";
import * as Print from "expo-print";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
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

import {
  StudentWorksheet,
  StudentWorksheetSection,
} from "../../lib/education/student-worksheets";

type Props = {
  worksheets: StudentWorksheet[];
  title: string;
};

export function StudentPrintScreen({ worksheets, title }: Props) {
  const router = useRouter();
  const [printing, setPrinting] = useState(false);

  useEffect(() => {
    if (Platform.OS !== "web") return;

    const doc = (globalThis as any).document;
    if (!doc?.head) return;

    const style = doc.createElement("style");
    style.textContent = `
      @media print {
        body { margin: 0 !important; background: #fff !important; }
        #student-print-controls { display: none !important; }
        [id^="student-print-page-"] {
          width: 100% !important;
          max-width: none !important;
          margin: 0 !important;
          border: 0 !important;
          border-radius: 0 !important;
          page-break-after: always;
          break-after: page;
        }
        [id^="student-print-page-"]:last-child {
          page-break-after: auto;
          break-after: auto;
        }
      }
    `;

    doc.head.appendChild(style);
    return () => style.remove();
  }, []);

  async function handlePrint() {
    if (printing) return;

    try {
      setPrinting(true);

      if (Platform.OS === "web") {
        (globalThis as any).window?.print?.();
        return;
      }

      await Print.printAsync({
        html: buildStudentWorksheetsHtml(worksheets),
      });
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Unable to open the printer.";
      Alert.alert("Print Error", message);
    } finally {
      setPrinting(false);
    }
  }

  return (
    <SafeAreaView style={styles.screen}>
      <View nativeID="student-print-controls" style={styles.controls}>
        <Pressable
          style={({ pressed }) => [
            styles.backButton,
            pressed && styles.pressed,
          ]}
          onPress={() => router.push("/education/teacher" as any)}
          accessibilityRole="button"
          accessibilityLabel="Return to Teacher Mode"
        >
          <Ionicons name="arrow-back" size={23} color="#FFFFFF" />
        </Pressable>

        <View style={styles.controlTitleWrap}>
          <Text style={styles.controlEyebrow}>STUDENT PRINTABLE</Text>
          <Text style={styles.controlTitle}>{title}</Text>
        </View>

        <Pressable
          style={({ pressed }) => [
            styles.printButton,
            pressed && styles.pressed,
            printing && styles.printButtonDisabled,
          ]}
          onPress={handlePrint}
          disabled={printing}
          accessibilityRole="button"
          accessibilityLabel="Print student worksheet"
        >
          <Ionicons name="print-outline" size={18} color="#101820" />
          <Text style={styles.printButtonText}>
            {printing ? "Opening…" : "Print"}
          </Text>
        </Pressable>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {worksheets.map((worksheet) => (
          <WorksheetPage key={worksheet.id} worksheet={worksheet} />
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

function WorksheetPage({ worksheet }: { worksheet: StudentWorksheet }) {
  return (
    <View nativeID={`student-print-page-${worksheet.id}`} style={styles.paper}>
      <View style={styles.paperTopRow}>
        <View style={styles.lessonBadge}>
          <Text style={styles.lessonBadgeText}>LESSON {worksheet.number}</Text>
        </View>
        <Text style={styles.duration}>{worksheet.duration}</Text>
      </View>

      <Text style={styles.paperTitle}>{worksheet.title}</Text>
      <Text style={styles.paperSubtitle}>{worksheet.subtitle}</Text>

      <View style={styles.identityRow}>
        <View style={styles.identityField}>
          <Text style={styles.identityLabel}>NAME</Text>
          <View style={styles.identityLine} />
        </View>
        <View style={styles.identityFieldSmall}>
          <Text style={styles.identityLabel}>DATE</Text>
          <View style={styles.identityLine} />
        </View>
        <View style={styles.identityFieldSmall}>
          <Text style={styles.identityLabel}>CLASS</Text>
          <View style={styles.identityLine} />
        </View>
      </View>

      <View style={styles.paperDivider} />

      {worksheet.sections.map((section, index) => (
        <WorksheetSection key={`${worksheet.id}-${index}`} section={section} />
      ))}

      <Text style={styles.footer}>Budget Note • Student Activity</Text>
    </View>
  );
}

function WorksheetSection({ section }: { section: StudentWorksheetSection }) {
  if (section.kind === "instructions") {
    return (
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{section.title}</Text>
        <Text style={styles.bodyText}>{section.text}</Text>
      </View>
    );
  }

  if (section.kind === "requirements") {
    return (
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{section.title}</Text>
        <View style={styles.requirements}>
          {section.items.map((item) => (
            <View key={item} style={styles.requirementRow}>
              <View style={styles.emptyBox} />
              <Text style={styles.requirementText}>{item}</Text>
            </View>
          ))}
        </View>
      </View>
    );
  }

  if (section.kind === "table") {
    return (
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{section.title}</Text>
        <View style={styles.table}>
          <View style={[styles.tableRow, styles.tableHeader]}>
            {section.columns.map((column, index) => (
              <Text
                key={column}
                style={[
                  styles.tableHeaderText,
                  index === 0 && styles.tableFirstColumn,
                ]}
              >
                {column}
              </Text>
            ))}
          </View>

          {section.rows.map((row, rowIndex) => (
            <View key={rowIndex} style={styles.tableRow}>
              {row.map((cell, cellIndex) => (
                <Text
                  key={`${cellIndex}-${cell}`}
                  style={[
                    styles.tableCell,
                    cellIndex === 0 && styles.tableFirstColumn,
                  ]}
                >
                  {cell}
                </Text>
              ))}
            </View>
          ))}
        </View>
      </View>
    );
  }

  if (section.kind === "multiple-choice") {
    return (
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{section.title}</Text>
        <Text style={styles.questionText}>{section.question}</Text>
        {section.options.map((option) => (
          <View key={option} style={styles.choiceRow}>
            <View style={styles.choiceCircle} />
            <Text style={styles.choiceText}>{option}</Text>
          </View>
        ))}
      </View>
    );
  }

  if (section.kind === "calculations") {
    return (
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{section.title}</Text>
        <View style={styles.calculationBox}>
          {section.rows.map((row) => (
            <View key={row} style={styles.calculationRow}>
              <Text style={styles.calculationLabel}>{row}</Text>
              <View style={styles.calculationLine} />
            </View>
          ))}
        </View>
      </View>
    );
  }

  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{section.title}</Text>
      <Text style={styles.bodyText}>{section.text}</Text>
      <View style={styles.answerLines}>
        {Array.from({ length: section.lines ?? 3 }).map((_, index) => (
          <View key={index} style={styles.answerLine} />
        ))}
      </View>
    </View>
  );
}

function buildStudentWorksheetsHtml(worksheets: StudentWorksheet[]) {
  const pages = worksheets
    .map((worksheet) => {
      const sections = worksheet.sections.map(sectionToHtml).join("");
      return `
        <section class="worksheet">
          <div class="top-row">
            <span class="badge">LESSON ${worksheet.number}</span>
            <span class="duration">${escapeHtml(worksheet.duration)}</span>
          </div>
          <h1>${escapeHtml(worksheet.title)}</h1>
          <p class="subtitle">${escapeHtml(worksheet.subtitle)}</p>
          <div class="identity">
            <div><span>NAME</span><div class="line"></div></div>
            <div><span>DATE</span><div class="line"></div></div>
            <div><span>CLASS</span><div class="line"></div></div>
          </div>
          <hr />
          ${sections}
          <div class="footer">Budget Note • Student Activity</div>
        </section>
      `;
    })
    .join("");

  return `
    <!doctype html>
    <html>
      <head>
        <meta charset="utf-8" />
        <style>
          @page { size: letter; margin: .45in; }
          * { box-sizing: border-box; }
          body { margin: 0; color: #16202a; font-family: Arial, sans-serif; }
          .worksheet { min-height: 9.9in; page-break-after: always; }
          .worksheet:last-child { page-break-after: auto; }
          .top-row { display:flex; justify-content:space-between; align-items:center; }
          .badge { background:#eee4ff; color:#6f36ad; font-size:10px; font-weight:800; padding:6px 9px; border-radius:999px; }
          .duration { color:#667381; font-size:11px; font-weight:700; }
          h1 { margin:12px 0 3px; font-size:25px; }
          .subtitle { margin:0; color:#55616d; font-size:12px; line-height:1.45; }
          .identity { display:grid; grid-template-columns:2fr 1fr 1fr; gap:14px; margin-top:18px; }
          .identity span { display:block; color:#6d7883; font-size:9px; font-weight:800; }
          .line { border-bottom:1px solid #7f8992; height:17px; }
          hr { border:0; border-top:2px solid #1d2730; margin:15px 0; }
          .section { margin-bottom:15px; page-break-inside:avoid; }
          .section h2 { margin:0 0 6px; font-size:13px; }
          .section p { margin:0; color:#37424c; font-size:11px; line-height:1.5; }
          .requirements { display:grid; grid-template-columns:1fr 1fr; gap:5px 14px; margin-top:6px; }
          .requirement, .choice { display:flex; gap:7px; font-size:10.5px; margin:4px 0; }
          .box { width:12px; height:12px; border:1.5px solid #35414b; flex:0 0 12px; }
          .circle { width:12px; height:12px; border:1.5px solid #35414b; border-radius:50%; flex:0 0 12px; }
          table { width:100%; border-collapse:collapse; table-layout:fixed; margin-top:6px; }
          th, td { border:1px solid #9aa3ab; padding:5px 6px; font-size:9.5px; word-wrap:break-word; }
          th { background:#edf0f3; }
          th:first-child, td:first-child { width:13%; text-align:center; }
          .calculations { border:1px solid #a4adb5; border-radius:7px; padding:7px 10px; }
          .calc-row { display:grid; grid-template-columns:1fr 1.1fr; gap:10px; margin:6px 0; font-size:10.5px; font-weight:700; }
          .calc-line, .answer-line { border-bottom:1px solid #7f8992; min-height:16px; }
          .answer-line { height:20px; }
          .question { font-weight:700; margin-bottom:7px !important; }
          .footer { margin-top:18px; padding-top:7px; border-top:1px solid #d2d7db; color:#7d8790; font-size:8.5px; text-align:right; }
        </style>
      </head>
      <body>${pages}</body>
    </html>
  `;
}

function sectionToHtml(section: StudentWorksheetSection) {
  if (section.kind === "instructions") {
    return `<div class="section"><h2>${escapeHtml(section.title)}</h2><p>${escapeHtml(section.text)}</p></div>`;
  }

  if (section.kind === "requirements") {
    const items = section.items
      .map(
        (item) =>
          `<div class="requirement"><span class="box"></span><span>${escapeHtml(item)}</span></div>`,
      )
      .join("");
    return `<div class="section"><h2>${escapeHtml(section.title)}</h2><div class="requirements">${items}</div></div>`;
  }

  if (section.kind === "table") {
    const head = section.columns
      .map((column) => `<th>${escapeHtml(column)}</th>`)
      .join("");
    const rows = section.rows
      .map(
        (row) =>
          `<tr>${row.map((cell) => `<td>${escapeHtml(cell)}</td>`).join("")}</tr>`,
      )
      .join("");
    return `<div class="section"><h2>${escapeHtml(section.title)}</h2><table><thead><tr>${head}</tr></thead><tbody>${rows}</tbody></table></div>`;
  }

  if (section.kind === "multiple-choice") {
    const options = section.options
      .map(
        (option) =>
          `<div class="choice"><span class="circle"></span><span>${escapeHtml(option)}</span></div>`,
      )
      .join("");
    return `<div class="section"><h2>${escapeHtml(section.title)}</h2><p class="question">${escapeHtml(section.question)}</p>${options}</div>`;
  }

  if (section.kind === "calculations") {
    const rows = section.rows
      .map(
        (row) =>
          `<div class="calc-row"><span>${escapeHtml(row)}</span><span class="calc-line"></span></div>`,
      )
      .join("");
    return `<div class="section"><h2>${escapeHtml(section.title)}</h2><div class="calculations">${rows}</div></div>`;
  }

  const lines = Array.from({ length: section.lines ?? 3 })
    .map(() => `<div class="answer-line"></div>`)
    .join("");
  return `<div class="section"><h2>${escapeHtml(section.title)}</h2><p>${escapeHtml(section.text)}</p>${lines}</div>`;
}

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: "#101820" },
  controls: {
    minHeight: 72,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    gap: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#344657",
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
  controlTitleWrap: { flex: 1 },
  controlEyebrow: {
    color: "#2ECC71",
    fontSize: 10,
    fontWeight: "900",
    letterSpacing: 0.8,
  },
  controlTitle: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "900",
    marginTop: 2,
  },
  printButton: {
    minHeight: 42,
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
    backgroundColor: "#2ECC71",
    borderRadius: 13,
    paddingHorizontal: 14,
  },
  printButtonDisabled: { opacity: 0.6 },
  printButtonText: { color: "#101820", fontSize: 13, fontWeight: "900" },
  scrollView: { flex: 1, backgroundColor: "#E8EBEE" },
  scrollContent: { padding: 18, gap: 18, alignItems: "center" },
  paper: {
    width: "100%",
    maxWidth: 816,
    backgroundColor: "#FFFFFF",
    borderRadius: 4,
    paddingHorizontal: 34,
    paddingVertical: 32,
    borderWidth: 1,
    borderColor: "#CFD5DA",
  },
  paperTopRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  lessonBadge: {
    backgroundColor: "#EEE4FF",
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  lessonBadgeText: {
    color: "#6F36AD",
    fontSize: 10,
    fontWeight: "900",
    letterSpacing: 0.7,
  },
  duration: { color: "#667381", fontSize: 11, fontWeight: "700" },
  paperTitle: {
    color: "#16202A",
    fontSize: 26,
    fontWeight: "900",
    marginTop: 12,
  },
  paperSubtitle: {
    color: "#55616D",
    fontSize: 13,
    lineHeight: 19,
    fontWeight: "600",
    marginTop: 4,
  },
  identityRow: { flexDirection: "row", gap: 14, marginTop: 20 },
  identityField: { flex: 2 },
  identityFieldSmall: { flex: 1 },
  identityLabel: { color: "#6D7883", fontSize: 9, fontWeight: "900" },
  identityLine: {
    height: 19,
    borderBottomWidth: 1,
    borderBottomColor: "#7F8992",
  },
  paperDivider: { height: 2, backgroundColor: "#1D2730", marginVertical: 17 },
  section: { marginBottom: 17 },
  sectionTitle: {
    color: "#18222C",
    fontSize: 14,
    fontWeight: "900",
    marginBottom: 7,
  },
  bodyText: {
    color: "#37424C",
    fontSize: 12,
    lineHeight: 18,
    fontWeight: "500",
  },
  requirements: { flexDirection: "row", flexWrap: "wrap" },
  requirementRow: {
    width: "50%",
    flexDirection: "row",
    paddingVertical: 4,
    paddingRight: 8,
  },
  emptyBox: {
    width: 13,
    height: 13,
    borderWidth: 1.5,
    borderColor: "#35414B",
    marginRight: 7,
  },
  requirementText: { flex: 1, color: "#2A343D", fontSize: 11 },
  table: { borderTopWidth: 1, borderLeftWidth: 1, borderColor: "#9AA3AB" },
  tableRow: { flexDirection: "row" },
  tableHeader: { backgroundColor: "#EDF0F3" },
  tableHeaderText: {
    flex: 1,
    color: "#202A33",
    fontSize: 9,
    fontWeight: "900",
    padding: 6,
    borderRightWidth: 1,
    borderBottomWidth: 1,
    borderColor: "#9AA3AB",
  },
  tableCell: {
    flex: 1,
    color: "#313C45",
    fontSize: 9,
    fontWeight: "600",
    padding: 6,
    borderRightWidth: 1,
    borderBottomWidth: 1,
    borderColor: "#9AA3AB",
  },
  tableFirstColumn: { flex: 0.55, textAlign: "center" },
  questionText: {
    color: "#202A33",
    fontSize: 12,
    fontWeight: "800",
    marginBottom: 6,
  },
  choiceRow: { flexDirection: "row", marginTop: 7 },
  choiceCircle: {
    width: 13,
    height: 13,
    borderRadius: 7,
    borderWidth: 1.5,
    borderColor: "#35414B",
    marginRight: 8,
  },
  choiceText: { flex: 1, color: "#2A343D", fontSize: 11 },
  calculationBox: {
    borderWidth: 1,
    borderColor: "#A4ADB5",
    borderRadius: 8,
    paddingHorizontal: 11,
    paddingVertical: 5,
  },
  calculationRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    paddingVertical: 7,
  },
  calculationLabel: {
    flex: 1,
    color: "#25303A",
    fontSize: 11,
    fontWeight: "800",
  },
  calculationLine: {
    flex: 1.1,
    height: 17,
    borderBottomWidth: 1,
    borderBottomColor: "#7F8992",
    marginLeft: 12,
  },
  answerLines: { marginTop: 5 },
  answerLine: {
    height: 22,
    borderBottomWidth: 1,
    borderBottomColor: "#8A949D",
  },
  footer: {
    color: "#7D8790",
    fontSize: 9,
    textAlign: "right",
    borderTopWidth: 1,
    borderTopColor: "#D2D7DB",
    paddingTop: 8,
    marginTop: 6,
  },
  pressed: { opacity: 0.7 },
});
