import { useEffect, useState } from "react";
import {
    Pressable,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    View,
} from "react-native";

import type {
    ActionPanel,
    BillLesson,
    CalculationPanel,
    ExpensesPanel,
    LessonPanel,
    PrinciplePanel,
    QuizPanel,
    StoryPanel,
} from "@/data/billLessons";

type ComicLessonScreenProps = {
  lesson: BillLesson;
  onClose: () => void;
  onOpenBudgets: () => void;
  onComplete: () => void;
};

export function ComicLessonScreen({
  lesson,
  onClose,
  onOpenBudgets,
  onComplete,
}: ComicLessonScreenProps) {
  const [panelIndex, setPanelIndex] = useState(0);
  const [selectedAnswerIndex, setSelectedAnswerIndex] = useState<number | null>(
    null,
  );

  const panel = lesson.panels[panelIndex];
  const isFirstPanel = panelIndex === 0;
  const isLastPanel = panelIndex === lesson.panels.length - 1;

  const progress = (panelIndex + 1) / lesson.panels.length;

  useEffect(() => {
    setSelectedAnswerIndex(null);
  }, [panelIndex]);

  function goToPreviousPanel() {
    if (isFirstPanel) {
      onClose();
      return;
    }

    setPanelIndex((current) => Math.max(0, current - 1));
  }

  function goToNextPanel() {
    if (panel.type === "quiz" && selectedAnswerIndex === null) {
      return;
    }

    if (isLastPanel) {
      onComplete();
      return;
    }

    setPanelIndex((current) => Math.min(lesson.panels.length - 1, current + 1));
  }

  const quizNeedsAnswer = panel.type === "quiz" && selectedAnswerIndex === null;

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.navigation}>
          <Pressable
            style={styles.navigationButton}
            onPress={goToPreviousPanel}
          >
            <Text style={styles.navigationButtonText}>‹</Text>
          </Pressable>

          <Text style={styles.lessonLabel}>Lesson {lesson.lessonNumber}</Text>

          <Pressable style={styles.closeButton} onPress={onClose}>
            <Text style={styles.closeButtonText}>×</Text>
          </Pressable>
        </View>

        <View style={styles.progressTrack}>
          <View
            style={[
              styles.progressFill,
              {
                width: `${progress * 100}%`,
              },
            ]}
          />
        </View>

        <Text style={styles.stepLabel}>
          {panelIndex + 1} of {lesson.panels.length}
        </Text>

        <ScrollView
          style={styles.panelScrollView}
          contentContainerStyle={styles.panelScrollContent}
          showsVerticalScrollIndicator={false}
        >
          <PanelRenderer
            panel={panel}
            selectedAnswerIndex={selectedAnswerIndex}
            onSelectAnswer={setSelectedAnswerIndex}
            onOpenBudgets={onOpenBudgets}
            onComplete={onComplete}
          />
        </ScrollView>

        {panel.type !== "action" && (
          <Pressable
            disabled={quizNeedsAnswer}
            style={({ pressed }) => [
              styles.nextButton,
              quizNeedsAnswer && styles.nextButtonDisabled,
              pressed && !quizNeedsAnswer && styles.nextButtonPressed,
            ]}
            onPress={goToNextPanel}
          >
            <Text
              style={[
                styles.nextButtonText,
                quizNeedsAnswer && styles.nextButtonTextDisabled,
              ]}
            >
              {isLastPanel ? "Finish lesson" : "Next"}
            </Text>
          </Pressable>
        )}
      </View>
    </SafeAreaView>
  );
}

type PanelRendererProps = {
  panel: LessonPanel;
  selectedAnswerIndex: number | null;
  onSelectAnswer: (index: number) => void;
  onOpenBudgets: () => void;
  onComplete: () => void;
};

function PanelRenderer({
  panel,
  selectedAnswerIndex,
  onSelectAnswer,
  onOpenBudgets,
  onComplete,
}: PanelRendererProps) {
  switch (panel.type) {
    case "story":
      return <StoryPanelView panel={panel} />;

    case "expenses":
      return <ExpensesPanelView panel={panel} />;

    case "calculation":
      return <CalculationPanelView panel={panel} />;

    case "principle":
      return <PrinciplePanelView panel={panel} />;

    case "quiz":
      return (
        <QuizPanelView
          panel={panel}
          selectedAnswerIndex={selectedAnswerIndex}
          onSelectAnswer={onSelectAnswer}
        />
      );

    case "action":
      return (
        <ActionPanelView
          panel={panel}
          onOpenBudgets={onOpenBudgets}
          onComplete={onComplete}
        />
      );

    default:
      return null;
  }
}

function StoryPanelView({ panel }: { panel: StoryPanel }) {
  return (
    <View style={styles.comicPanel}>
      <SpeechBubble text={panel.text} />

      {panel.secondaryText && (
        <Text style={styles.secondaryStoryText}>{panel.secondaryText}</Text>
      )}

      <View style={styles.storyScene}>
        <Text style={styles.characterEmoji}>{panel.characterEmoji}</Text>

        {panel.itemEmoji && (
          <View style={styles.itemContainer}>
            <Text style={styles.itemEmoji}>{panel.itemEmoji}</Text>

            {typeof panel.price === "number" && (
              <View style={styles.priceTag}>
                <Text style={styles.priceTagText}>
                  ${panel.price.toFixed(0)}
                </Text>
              </View>
            )}
          </View>
        )}
      </View>
    </View>
  );
}

function ExpensesPanelView({ panel }: { panel: ExpensesPanel }) {
  return (
    <View style={[styles.comicPanel, styles.greenComicPanel]}>
      <SpeechBubble text={panel.text} />

      <Text style={styles.largeBillEmoji}>🐷</Text>

      <View style={styles.expenseList}>
        {panel.expenses.map((expense) => (
          <View key={expense.name} style={styles.expenseRow}>
            <View style={styles.expenseNameContainer}>
              <Text style={styles.expenseEmoji}>{expense.emoji}</Text>
              <Text style={styles.expenseName}>{expense.name}</Text>
            </View>

            <Text style={styles.expenseAmount}>
              ${expense.amount.toFixed(0)}
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
}

function CalculationPanelView({ panel }: { panel: CalculationPanel }) {
  return (
    <View style={styles.comicPanel}>
      <SpeechBubble text={panel.text} />

      <Text style={styles.billInvestigatorEmoji}>🐷🔍</Text>

      <View style={styles.calculationCard}>
        {panel.rows.map((row, index) => {
          const isFinalRow = index === panel.rows.length - 1;

          return (
            <View
              key={row.label}
              style={[
                styles.calculationRow,
                isFinalRow && styles.finalCalculationRow,
              ]}
            >
              <Text
                style={[
                  styles.calculationLabel,
                  isFinalRow && styles.finalCalculationText,
                ]}
              >
                {row.label}
              </Text>

              <Text
                style={[
                  styles.calculationAmount,
                  row.highlight === "positive" && styles.positiveAmount,
                  row.highlight === "negative" && styles.negativeAmount,
                  isFinalRow && styles.finalCalculationText,
                ]}
              >
                {formatMoney(row.amount)}
              </Text>
            </View>
          );
        })}
      </View>
    </View>
  );
}

function PrinciplePanelView({ panel }: { panel: PrinciplePanel }) {
  return (
    <View style={styles.principlePanel}>
      <Text style={styles.lightBulb}>💡</Text>

      <Text style={styles.principleTitle}>{panel.title}</Text>

      <View style={styles.principleDivider} />

      <Text style={styles.principleBody}>{panel.body}</Text>

      {panel.billText && (
        <View style={styles.billAdvice}>
          <Text style={styles.billAdviceEmoji}>🐷</Text>
          <Text style={styles.billAdviceText}>{panel.billText}</Text>
        </View>
      )}
    </View>
  );
}

type QuizPanelViewProps = {
  panel: QuizPanel;
  selectedAnswerIndex: number | null;
  onSelectAnswer: (index: number) => void;
};

function QuizPanelView({
  panel,
  selectedAnswerIndex,
  onSelectAnswer,
}: QuizPanelViewProps) {
  const hasAnswered = selectedAnswerIndex !== null;
  const isCorrect = selectedAnswerIndex === panel.correctAnswerIndex;

  return (
    <View style={styles.quizPanel}>
      <View style={styles.quizQuestionContainer}>
        <Text style={styles.quizBillEmoji}>🐷</Text>
        <Text style={styles.quizQuestion}>{panel.question}</Text>
      </View>

      <View style={styles.answerList}>
        {panel.answers.map((answer, index) => {
          const isSelected = selectedAnswerIndex === index;

          const showCorrect = hasAnswered && index === panel.correctAnswerIndex;

          const showIncorrect = hasAnswered && isSelected && !isCorrect;

          return (
            <Pressable
              key={answer}
              disabled={hasAnswered}
              style={[
                styles.answerButton,
                showCorrect && styles.correctAnswer,
                showIncorrect && styles.incorrectAnswer,
              ]}
              onPress={() => onSelectAnswer(index)}
            >
              <View style={styles.answerLetter}>
                <Text style={styles.answerLetterText}>
                  {String.fromCharCode(65 + index)}
                </Text>
              </View>

              <Text style={styles.answerText}>{answer}</Text>

              {showCorrect && <Text style={styles.answerIndicator}>✓</Text>}

              {showIncorrect && <Text style={styles.answerIndicator}>×</Text>}
            </Pressable>
          );
        })}
      </View>

      {hasAnswered && (
        <View
          style={[
            styles.quizFeedback,
            isCorrect ? styles.correctFeedback : styles.incorrectFeedback,
          ]}
        >
          <Text style={styles.feedbackEmoji}>{isCorrect ? "🐷" : "🤔"}</Text>

          <View style={styles.feedbackTextContainer}>
            <Text style={styles.feedbackTitle}>
              {isCorrect ? "Exactly!" : "Not quite"}
            </Text>

            <Text style={styles.feedbackBody}>
              {isCorrect ? panel.correctMessage : panel.incorrectMessage}
            </Text>
          </View>
        </View>
      )}
    </View>
  );
}

type ActionPanelViewProps = {
  panel: ActionPanel;
  onOpenBudgets: () => void;
  onComplete: () => void;
};

function ActionPanelView({
  panel,
  onOpenBudgets,
  onComplete,
}: ActionPanelViewProps) {
  return (
    <View style={styles.actionPanel}>
      <SpeechBubble text={panel.title} />

      <Text style={styles.actionBillEmoji}>🐷</Text>

      <View style={styles.clipboard}>
        <Text style={styles.clipboardTitle}>Your Budget</Text>

        <Text style={styles.clipboardItem}>✓ Stay on track</Text>

        <Text style={styles.clipboardItem}>✓ Make progress</Text>

        <Text style={styles.clipboardItem}>✓ Reach your goals</Text>
      </View>

      <Text style={styles.actionBody}>{panel.body}</Text>

      <Pressable
        style={({ pressed }) => [
          styles.actionPrimaryButton,
          pressed && styles.actionButtonPressed,
        ]}
        onPress={onOpenBudgets}
      >
        <Text style={styles.actionPrimaryButtonText}>
          {panel.primaryButtonText}
        </Text>
      </Pressable>

      <Pressable
        style={({ pressed }) => [
          styles.actionSecondaryButton,
          pressed && styles.actionButtonPressed,
        ]}
        onPress={onComplete}
      >
        <Text style={styles.actionSecondaryButtonText}>
          {panel.secondaryButtonText}
        </Text>
      </Pressable>
    </View>
  );
}

function SpeechBubble({ text }: { text: string }) {
  return (
    <View style={styles.speechBubble}>
      <Text style={styles.speechBubbleText}>{text}</Text>
      <View style={styles.speechBubbleTail} />
    </View>
  );
}

function formatMoney(amount: number): string {
  const absoluteAmount = Math.abs(amount).toFixed(0);

  if (amount < 0) {
    return `-$${absoluteAmount}`;
  }

  return `$${absoluteAmount}`;
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#111513",
  },
  container: {
    flex: 1,
    paddingHorizontal: 18,
    paddingBottom: 16,
  },
  navigation: {
    height: 54,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  navigationButton: {
    width: 44,
    height: 44,
    alignItems: "center",
    justifyContent: "center",
  },
  navigationButtonText: {
    color: "#FFFFFF",
    fontSize: 38,
    lineHeight: 40,
  },
  lessonLabel: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "700",
  },
  closeButton: {
    width: 44,
    height: 44,
    alignItems: "center",
    justifyContent: "center",
  },
  closeButtonText: {
    color: "#AAB4AE",
    fontSize: 30,
  },
  progressTrack: {
    height: 7,
    backgroundColor: "#343D38",
    borderRadius: 999,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    backgroundColor: "#72A956",
    borderRadius: 999,
  },
  stepLabel: {
    color: "#839089",
    fontSize: 12,
    textAlign: "right",
    marginTop: 8,
  },
  panelScrollView: {
    flex: 1,
  },
  panelScrollContent: {
    flexGrow: 1,
    justifyContent: "center",
    paddingVertical: 14,
  },
  comicPanel: {
    minHeight: 500,
    backgroundColor: "#202622",
    borderRadius: 26,
    borderWidth: 1,
    borderColor: "#313A35",
    padding: 18,
    alignItems: "center",
    justifyContent: "space-between",
  },
  greenComicPanel: {
    backgroundColor: "#273A2D",
  },
  speechBubble: {
    width: "100%",
    backgroundColor: "#FFF9EE",
    borderRadius: 25,
    paddingHorizontal: 20,
    paddingVertical: 18,
    position: "relative",
  },
  speechBubbleText: {
    color: "#171A18",
    fontSize: 21,
    lineHeight: 29,
    textAlign: "center",
    fontWeight: "800",
  },
  speechBubbleTail: {
    position: "absolute",
    bottom: -14,
    right: 38,
    width: 0,
    height: 0,
    borderLeftWidth: 13,
    borderRightWidth: 3,
    borderTopWidth: 18,
    borderLeftColor: "transparent",
    borderRightColor: "transparent",
    borderTopColor: "#FFF9EE",
  },
  secondaryStoryText: {
    color: "#D5DDD8",
    fontSize: 17,
    fontWeight: "600",
    textAlign: "center",
    marginTop: 22,
  },
  storyScene: {
    flex: 1,
    width: "100%",
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-around",
    paddingBottom: 20,
  },
  characterEmoji: {
    fontSize: 115,
  },
  itemContainer: {
    alignItems: "center",
  },
  itemEmoji: {
    fontSize: 100,
  },
  priceTag: {
    backgroundColor: "#FFF9EE",
    borderRadius: 15,
    paddingHorizontal: 14,
    paddingVertical: 8,
    marginTop: 5,
  },
  priceTagText: {
    color: "#171A18",
    fontSize: 22,
    fontWeight: "800",
  },
  largeBillEmoji: {
    fontSize: 92,
    marginVertical: 16,
  },
  expenseList: {
    width: "100%",
    backgroundColor: "#1A211D",
    borderRadius: 18,
    overflow: "hidden",
  },
  expenseRow: {
    minHeight: 58,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#333D37",
  },
  expenseNameContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  expenseEmoji: {
    fontSize: 22,
    marginRight: 11,
  },
  expenseName: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
  expenseAmount: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "800",
  },
  billInvestigatorEmoji: {
    fontSize: 76,
    marginVertical: 12,
  },
  calculationCard: {
    width: "100%",
    backgroundColor: "#171C19",
    borderRadius: 18,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  calculationRow: {
    minHeight: 58,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  finalCalculationRow: {
    borderTopWidth: 1,
    borderTopColor: "#59645E",
    marginTop: 4,
  },
  calculationLabel: {
    color: "#FFFFFF",
    fontSize: 16,
  },
  calculationAmount: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "800",
  },
  positiveAmount: {
    color: "#76B45C",
  },
  negativeAmount: {
    color: "#F06159",
  },
  finalCalculationText: {
    fontWeight: "800",
  },
  principlePanel: {
    minHeight: 500,
    backgroundColor: "#1C2420",
    borderRadius: 26,
    borderWidth: 1,
    borderColor: "#40613A",
    padding: 24,
    alignItems: "center",
    justifyContent: "center",
  },
  lightBulb: {
    fontSize: 58,
    marginBottom: 20,
  },
  principleTitle: {
    color: "#FFFFFF",
    fontSize: 29,
    lineHeight: 38,
    textAlign: "center",
    fontWeight: "900",
  },
  principleDivider: {
    width: 80,
    height: 4,
    borderRadius: 999,
    backgroundColor: "#6FA653",
    marginVertical: 22,
  },
  principleBody: {
    color: "#D4DDD7",
    fontSize: 17,
    lineHeight: 25,
    textAlign: "center",
  },
  billAdvice: {
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#111513",
    borderRadius: 18,
    padding: 15,
    marginTop: 26,
  },
  billAdviceEmoji: {
    fontSize: 42,
    marginRight: 12,
  },
  billAdviceText: {
    flex: 1,
    color: "#FFFFFF",
    fontSize: 15,
    lineHeight: 21,
    fontWeight: "600",
  },
  quizPanel: {
    minHeight: 500,
    backgroundColor: "#202622",
    borderRadius: 26,
    borderWidth: 1,
    borderColor: "#313A35",
    padding: 18,
  },
  quizQuestionContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFF9EE",
    borderRadius: 22,
    padding: 18,
    marginBottom: 18,
  },
  quizBillEmoji: {
    fontSize: 48,
    marginRight: 12,
  },
  quizQuestion: {
    flex: 1,
    color: "#171A18",
    fontSize: 20,
    lineHeight: 27,
    fontWeight: "800",
  },
  answerList: {
    gap: 10,
  },
  answerButton: {
    minHeight: 72,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#292F2C",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#3B4540",
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  correctAnswer: {
    backgroundColor: "#31482E",
    borderColor: "#6DA653",
  },
  incorrectAnswer: {
    backgroundColor: "#4A2E2D",
    borderColor: "#D65C54",
  },
  answerLetter: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: "#F4F0E7",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  answerLetterText: {
    color: "#171A18",
    fontSize: 15,
    fontWeight: "900",
  },
  answerText: {
    flex: 1,
    color: "#FFFFFF",
    fontSize: 15,
    lineHeight: 21,
    fontWeight: "600",
  },
  answerIndicator: {
    color: "#FFFFFF",
    fontSize: 25,
    fontWeight: "900",
    marginLeft: 10,
  },
  quizFeedback: {
    flexDirection: "row",
    borderRadius: 17,
    padding: 15,
    marginTop: 16,
  },
  correctFeedback: {
    backgroundColor: "#263F27",
  },
  incorrectFeedback: {
    backgroundColor: "#40322A",
  },
  feedbackEmoji: {
    fontSize: 42,
    marginRight: 12,
  },
  feedbackTextContainer: {
    flex: 1,
  },
  feedbackTitle: {
    color: "#8AC769",
    fontSize: 18,
    fontWeight: "800",
  },
  feedbackBody: {
    color: "#FFFFFF",
    fontSize: 14,
    lineHeight: 20,
    marginTop: 3,
  },
  actionPanel: {
    minHeight: 500,
    backgroundColor: "#202622",
    borderRadius: 26,
    borderWidth: 1,
    borderColor: "#313A35",
    padding: 18,
    alignItems: "center",
  },
  actionBillEmoji: {
    fontSize: 80,
    marginTop: 20,
    marginBottom: -12,
    zIndex: 2,
  },
  clipboard: {
    width: "85%",
    backgroundColor: "#FFF9EE",
    borderRadius: 14,
    padding: 20,
    transform: [{ rotate: "-1deg" }],
  },
  clipboardTitle: {
    color: "#171A18",
    fontSize: 22,
    fontWeight: "900",
    marginBottom: 14,
  },
  clipboardItem: {
    color: "#315B2D",
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 10,
  },
  actionBody: {
    color: "#C7D0CA",
    fontSize: 15,
    lineHeight: 22,
    textAlign: "center",
    marginVertical: 18,
  },
  actionPrimaryButton: {
    width: "100%",
    minHeight: 54,
    backgroundColor: "#5D9447",
    borderRadius: 15,
    alignItems: "center",
    justifyContent: "center",
  },
  actionPrimaryButtonText: {
    color: "#FFFFFF",
    fontSize: 17,
    fontWeight: "800",
  },
  actionSecondaryButton: {
    width: "100%",
    minHeight: 52,
    backgroundColor: "#303733",
    borderRadius: 15,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 10,
  },
  actionSecondaryButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
  },
  actionButtonPressed: {
    opacity: 0.75,
  },
  nextButton: {
    minHeight: 56,
    backgroundColor: "#5D9447",
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 12,
  },
  nextButtonPressed: {
    opacity: 0.8,
  },
  nextButtonDisabled: {
    backgroundColor: "#343C38",
  },
  nextButtonText: {
    color: "#FFFFFF",
    fontSize: 17,
    fontWeight: "800",
  },
  nextButtonTextDisabled: {
    color: "#7F8A84",
  },
});
