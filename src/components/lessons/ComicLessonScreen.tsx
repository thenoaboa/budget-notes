import { useEffect, useMemo, useState } from "react";
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
  KnowledgeQuestion,
  KnowledgeTestPanel,
  LessonPanel,
  OrderKnowledgeQuestion,
  PrinciplePanel,
  QuizPanel,
  SelectItemKnowledgeQuestion,
  StoryPanel,
} from "@/data/billLessons";

type ComicLessonScreenProps = {
  lesson: BillLesson;
  onClose: () => void;
  onOpenBudgets: () => void;
  onStartPractice: () => void;
  onComplete: () => void;
};

export function ComicLessonScreen({
  lesson,
  onClose,
  onOpenBudgets,
  onStartPractice,
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
  const usesOwnNavigation =
    panel.type === "action" || panel.type === "knowledge-test";

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.navigation}>
          <Pressable
            style={styles.navigationButton}
            onPress={goToPreviousPanel}
            accessibilityRole="button"
            accessibilityLabel={isFirstPanel ? "Close lesson" : "Previous step"}
          >
            <Text style={styles.navigationButtonText}>‹</Text>
          </Pressable>

          <Text style={styles.lessonLabel}>Lesson {lesson.lessonNumber}</Text>

          <Pressable
            style={styles.closeButton}
            onPress={onClose}
            accessibilityRole="button"
            accessibilityLabel="Close lesson"
          >
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
            onContinue={goToNextPanel}
            onStartPractice={onStartPractice}
            onComplete={onComplete}
          />
        </ScrollView>

        {!usesOwnNavigation && (
          <Pressable
            disabled={quizNeedsAnswer}
            style={({ pressed }) => [
              styles.nextButton,
              quizNeedsAnswer && styles.nextButtonDisabled,
              pressed && !quizNeedsAnswer && styles.nextButtonPressed,
            ]}
            onPress={goToNextPanel}
            accessibilityRole="button"
            accessibilityLabel={isLastPanel ? "Finish lesson" : "Next step"}
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
  onContinue: () => void;
  onStartPractice: () => void;
  onComplete: () => void;
};

function PanelRenderer({
  panel,
  selectedAnswerIndex,
  onSelectAnswer,
  onOpenBudgets,
  onContinue,
  onStartPractice,
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
          onStartTest={onContinue}
        />
      );

    case "knowledge-test":
      return (
        <KnowledgeTestPanelView
          panel={panel}
          onStartPractice={onStartPractice}
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
        <FeedbackCard
          isCorrect={isCorrect}
          explanation={
            isCorrect ? panel.correctMessage : panel.incorrectMessage
          }
        />
      )}
    </View>
  );
}

type ActionPanelViewProps = {
  panel: ActionPanel;
  onOpenBudgets: () => void;
  onStartTest: () => void;
};

function ActionPanelView({
  panel,
  onOpenBudgets,
  onStartTest,
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
        onPress={onStartTest}
      >
        <Text style={styles.actionSecondaryButtonText}>
          {panel.secondaryButtonText}
        </Text>
      </Pressable>
    </View>
  );
}

type KnowledgeTestPanelViewProps = {
  panel: KnowledgeTestPanel;
  onStartPractice: () => void;
  onComplete: () => void;
};

function KnowledgeTestPanelView({
  panel,
  onStartPractice,
  onComplete,
}: KnowledgeTestPanelViewProps) {
  const [questionIndex, setQuestionIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [hasAnswered, setHasAnswered] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [selectedAnswerIndex, setSelectedAnswerIndex] = useState<number | null>(
    null,
  );
  const [selectedBoolean, setSelectedBoolean] = useState<boolean | null>(null);
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);
  const [orderedStepIds, setOrderedStepIds] = useState<string[]>([]);
  const [showResults, setShowResults] = useState(false);

  const question = panel.questions[questionIndex];
  const questionNumber = questionIndex + 1;

  const explanation = useMemo(() => question.explanation, [question]);

  function recordAnswer(correct: boolean) {
    if (hasAnswered) return;

    setHasAnswered(true);
    setIsCorrect(correct);

    if (correct) {
      setScore((current) => current + 1);
    }
  }

  function answerChoice(index: number) {
    if (question.type !== "multiple-choice" && question.type !== "scenario") {
      return;
    }

    setSelectedAnswerIndex(index);
    recordAnswer(index === question.correctAnswerIndex);
  }

  function answerTrueFalse(value: boolean) {
    if (question.type !== "true-false") return;

    setSelectedBoolean(value);
    recordAnswer(value === question.correctAnswer);
  }

  function answerItem(itemId: string) {
    if (question.type !== "select-item") return;

    setSelectedItemId(itemId);
    recordAnswer(itemId === question.correctItemId);
  }

  function selectOrderStep(stepId: string) {
    if (question.type !== "order" || hasAnswered) return;

    setOrderedStepIds((current) => {
      if (current.includes(stepId)) return current;
      return [...current, stepId];
    });
  }

  function submitOrder() {
    if (question.type !== "order" || hasAnswered) return;
    if (orderedStepIds.length !== question.steps.length) return;

    const correct = orderedStepIds.every(
      (stepId, index) => stepId === question.correctOrder[index],
    );

    recordAnswer(correct);
  }

  function resetCurrentQuestionState() {
    setHasAnswered(false);
    setIsCorrect(false);
    setSelectedAnswerIndex(null);
    setSelectedBoolean(null);
    setSelectedItemId(null);
    setOrderedStepIds([]);
  }

  function goToNextQuestion() {
    if (!hasAnswered) return;

    if (questionIndex === panel.questions.length - 1) {
      setShowResults(true);
      return;
    }

    setQuestionIndex((current) => current + 1);
    resetCurrentQuestionState();
  }

  function retakeTest() {
    setQuestionIndex(0);
    setScore(0);
    setShowResults(false);
    resetCurrentQuestionState();
  }

  if (showResults) {
    return (
      <KnowledgeResults
        score={score}
        total={panel.questions.length}
        onRetake={retakeTest}
        onStartPractice={onStartPractice}
        onComplete={onComplete}
      />
    );
  }

  return (
    <View style={styles.knowledgePanel}>
      <View style={styles.knowledgeHeader}>
        <Text style={styles.knowledgeEyebrow}>{panel.title}</Text>
        <Text style={styles.knowledgeCounter}>
          Question {questionNumber} of {panel.questions.length}
        </Text>
      </View>

      <View style={styles.knowledgeProgressTrack}>
        <View
          style={[
            styles.knowledgeProgressFill,
            { width: `${(questionNumber / panel.questions.length) * 100}%` },
          ]}
        />
      </View>

      {questionIndex === 0 && (
        <Text style={styles.knowledgeIntro}>{panel.intro}</Text>
      )}

      <KnowledgeQuestionView
        question={question}
        hasAnswered={hasAnswered}
        isCorrect={isCorrect}
        selectedAnswerIndex={selectedAnswerIndex}
        selectedBoolean={selectedBoolean}
        selectedItemId={selectedItemId}
        orderedStepIds={orderedStepIds}
        onAnswerChoice={answerChoice}
        onAnswerTrueFalse={answerTrueFalse}
        onAnswerItem={answerItem}
        onSelectOrderStep={selectOrderStep}
        onResetOrder={() => setOrderedStepIds([])}
        onSubmitOrder={submitOrder}
      />

      {hasAnswered && (
        <>
          <FeedbackCard isCorrect={isCorrect} explanation={explanation} />

          <Pressable
            style={({ pressed }) => [
              styles.knowledgeNextButton,
              pressed && styles.actionButtonPressed,
            ]}
            onPress={goToNextQuestion}
          >
            <Text style={styles.knowledgeNextButtonText}>
              {questionIndex === panel.questions.length - 1
                ? "See my results"
                : "Next question"}
            </Text>
          </Pressable>
        </>
      )}
    </View>
  );
}

type KnowledgeQuestionViewProps = {
  question: KnowledgeQuestion;
  hasAnswered: boolean;
  isCorrect: boolean;
  selectedAnswerIndex: number | null;
  selectedBoolean: boolean | null;
  selectedItemId: string | null;
  orderedStepIds: string[];
  onAnswerChoice: (index: number) => void;
  onAnswerTrueFalse: (value: boolean) => void;
  onAnswerItem: (itemId: string) => void;
  onSelectOrderStep: (stepId: string) => void;
  onResetOrder: () => void;
  onSubmitOrder: () => void;
};

function KnowledgeQuestionView({
  question,
  hasAnswered,
  isCorrect,
  selectedAnswerIndex,
  selectedBoolean,
  selectedItemId,
  orderedStepIds,
  onAnswerChoice,
  onAnswerTrueFalse,
  onAnswerItem,
  onSelectOrderStep,
  onResetOrder,
  onSubmitOrder,
}: KnowledgeQuestionViewProps) {
  switch (question.type) {
    case "multiple-choice":
    case "scenario":
      return (
        <ChoiceKnowledgeQuestion
          prompt={question.prompt}
          answers={question.answers}
          correctAnswerIndex={question.correctAnswerIndex}
          selectedAnswerIndex={selectedAnswerIndex}
          hasAnswered={hasAnswered}
          isCorrect={isCorrect}
          onSelect={onAnswerChoice}
          scenario={question.type === "scenario"}
        />
      );

    case "true-false":
      return (
        <TrueFalseKnowledgeQuestionView
          prompt={question.prompt}
          correctAnswer={question.correctAnswer}
          selectedBoolean={selectedBoolean}
          hasAnswered={hasAnswered}
          onSelect={onAnswerTrueFalse}
        />
      );

    case "select-item":
      return (
        <SelectItemKnowledgeQuestionView
          question={question}
          selectedItemId={selectedItemId}
          hasAnswered={hasAnswered}
          onSelect={onAnswerItem}
        />
      );

    case "order":
      return (
        <OrderKnowledgeQuestionView
          question={question}
          orderedStepIds={orderedStepIds}
          hasAnswered={hasAnswered}
          onSelectStep={onSelectOrderStep}
          onReset={onResetOrder}
          onSubmit={onSubmitOrder}
        />
      );

    default:
      return null;
  }
}

type ChoiceKnowledgeQuestionProps = {
  prompt: string;
  answers: string[];
  correctAnswerIndex: number;
  selectedAnswerIndex: number | null;
  hasAnswered: boolean;
  isCorrect: boolean;
  onSelect: (index: number) => void;
  scenario: boolean;
};

function ChoiceKnowledgeQuestion({
  prompt,
  answers,
  correctAnswerIndex,
  selectedAnswerIndex,
  hasAnswered,
  isCorrect,
  onSelect,
  scenario,
}: ChoiceKnowledgeQuestionProps) {
  return (
    <View>
      <View style={styles.knowledgePromptCard}>
        <Text style={styles.knowledgePromptEmoji}>
          {scenario ? "🧠" : "🐷"}
        </Text>
        <Text style={styles.knowledgePrompt}>{prompt}</Text>
      </View>

      <View style={styles.answerList}>
        {answers.map((answer, index) => {
          const isSelected = selectedAnswerIndex === index;
          const showCorrect = hasAnswered && index === correctAnswerIndex;
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
              onPress={() => onSelect(index)}
            >
              <View style={styles.answerLetter}>
                <Text style={styles.answerLetterText}>
                  {String.fromCharCode(65 + index)}
                </Text>
              </View>

              <Text style={styles.answerText}>{answer}</Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

type TrueFalseKnowledgeQuestionViewProps = {
  prompt: string;
  correctAnswer: boolean;
  selectedBoolean: boolean | null;
  hasAnswered: boolean;
  onSelect: (value: boolean) => void;
};

function TrueFalseKnowledgeQuestionView({
  prompt,
  correctAnswer,
  selectedBoolean,
  hasAnswered,
  onSelect,
}: TrueFalseKnowledgeQuestionViewProps) {
  return (
    <View>
      <View style={styles.knowledgePromptCard}>
        <Text style={styles.knowledgePromptEmoji}>⚖️</Text>
        <Text style={styles.knowledgePrompt}>{prompt}</Text>
      </View>

      <View style={styles.trueFalseRow}>
        {[true, false].map((value) => {
          const isSelected = selectedBoolean === value;
          const showCorrect = hasAnswered && value === correctAnswer;
          const showIncorrect =
            hasAnswered && isSelected && value !== correctAnswer;

          return (
            <Pressable
              key={String(value)}
              disabled={hasAnswered}
              style={[
                styles.trueFalseButton,
                showCorrect && styles.correctAnswer,
                showIncorrect && styles.incorrectAnswer,
              ]}
              onPress={() => onSelect(value)}
            >
              <Text style={styles.trueFalseEmoji}>{value ? "✓" : "×"}</Text>
              <Text style={styles.trueFalseText}>
                {value ? "True" : "False"}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

type SelectItemKnowledgeQuestionViewProps = {
  question: SelectItemKnowledgeQuestion;
  selectedItemId: string | null;
  hasAnswered: boolean;
  onSelect: (itemId: string) => void;
};

function SelectItemKnowledgeQuestionView({
  question,
  selectedItemId,
  hasAnswered,
  onSelect,
}: SelectItemKnowledgeQuestionViewProps) {
  const total = question.items.reduce((sum, item) => sum + item.price, 0);

  return (
    <View>
      <View style={styles.knowledgePromptCard}>
        <Text style={styles.knowledgePromptEmoji}>🛒</Text>
        <Text style={styles.knowledgePrompt}>{question.prompt}</Text>
      </View>

      <View style={styles.miniBudgetSummary}>
        <Text style={styles.miniBudgetSummaryText}>
          Limit: ${question.budgetLimit.toFixed(0)}
        </Text>
        <Text style={styles.miniBudgetOverText}>
          Total: ${total.toFixed(0)}
        </Text>
      </View>

      <View style={styles.itemChoiceList}>
        {question.items.map((item) => {
          const isSelected = selectedItemId === item.id;
          const showCorrect = hasAnswered && item.id === question.correctItemId;
          const showIncorrect = hasAnswered && isSelected && !showCorrect;

          return (
            <Pressable
              key={item.id}
              disabled={hasAnswered}
              style={[
                styles.itemChoiceButton,
                showCorrect && styles.correctAnswer,
                showIncorrect && styles.incorrectAnswer,
              ]}
              onPress={() => onSelect(item.id)}
            >
              <Text style={styles.itemChoiceEmoji}>{item.emoji}</Text>
              <Text style={styles.itemChoiceName}>{item.name}</Text>
              <Text style={styles.itemChoicePrice}>
                ${item.price.toFixed(0)}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

type OrderKnowledgeQuestionViewProps = {
  question: OrderKnowledgeQuestion;
  orderedStepIds: string[];
  hasAnswered: boolean;
  onSelectStep: (stepId: string) => void;
  onReset: () => void;
  onSubmit: () => void;
};

function OrderKnowledgeQuestionView({
  question,
  orderedStepIds,
  hasAnswered,
  onSelectStep,
  onReset,
  onSubmit,
}: OrderKnowledgeQuestionViewProps) {
  const availableSteps = question.steps.filter(
    (step) => !orderedStepIds.includes(step.id),
  );

  return (
    <View>
      <View style={styles.knowledgePromptCard}>
        <Text style={styles.knowledgePromptEmoji}>🔢</Text>
        <Text style={styles.knowledgePrompt}>{question.prompt}</Text>
      </View>

      <View style={styles.orderAnswerArea}>
        {orderedStepIds.length === 0 ? (
          <Text style={styles.orderPlaceholder}>
            Your order will appear here.
          </Text>
        ) : (
          orderedStepIds.map((stepId, index) => {
            const step = question.steps.find(
              (candidate) => candidate.id === stepId,
            );

            return (
              <View key={stepId} style={styles.orderedStepRow}>
                <View style={styles.orderNumberCircle}>
                  <Text style={styles.orderNumberText}>{index + 1}</Text>
                </View>
                <Text style={styles.orderedStepText}>{step?.text}</Text>
              </View>
            );
          })
        )}
      </View>

      {!hasAnswered && (
        <>
          <View style={styles.orderChoices}>
            {availableSteps.map((step) => (
              <Pressable
                key={step.id}
                style={styles.orderChoiceButton}
                onPress={() => onSelectStep(step.id)}
              >
                <Text style={styles.orderChoiceText}>{step.text}</Text>
              </Pressable>
            ))}
          </View>

          <View style={styles.orderActionRow}>
            <Pressable style={styles.orderResetButton} onPress={onReset}>
              <Text style={styles.orderResetButtonText}>Reset</Text>
            </Pressable>

            <Pressable
              disabled={orderedStepIds.length !== question.steps.length}
              style={[
                styles.orderSubmitButton,
                orderedStepIds.length !== question.steps.length &&
                  styles.orderSubmitButtonDisabled,
              ]}
              onPress={onSubmit}
            >
              <Text style={styles.orderSubmitButtonText}>Check order</Text>
            </Pressable>
          </View>
        </>
      )}
    </View>
  );
}

function FeedbackCard({
  isCorrect,
  explanation,
}: {
  isCorrect: boolean;
  explanation: string;
}) {
  return (
    <View
      style={[
        styles.quizFeedback,
        isCorrect ? styles.correctFeedback : styles.incorrectFeedback,
      ]}
    >
      <Text style={styles.feedbackEmoji}>{isCorrect ? "🐷" : "🤔"}</Text>

      <View style={styles.feedbackTextContainer}>
        <Text style={styles.feedbackTitle}>
          {isCorrect ? "Correct!" : "Not quite"}
        </Text>
        <Text style={styles.feedbackBody}>{explanation}</Text>
      </View>
    </View>
  );
}

function KnowledgeResults({
  score,
  total,
  onRetake,
  onStartPractice,
  onComplete,
}: {
  score: number;
  total: number;
  onRetake: () => void;
  onStartPractice: () => void;
  onComplete: () => void;
}) {
  const percent = score / total;
  const message =
    percent === 1
      ? "Perfect score! You understand the full impact of a purchase."
      : percent >= 0.8
        ? "Great job. You are ready to apply this to a real budget."
        : percent >= 0.6
          ? "Good start. Review the explanations and try it once more."
          : "This is exactly what practice is for. Retake it and slow down on each decision.";

  return (
    <View style={styles.resultsPanel}>
      <Text style={styles.resultsEmoji}>{percent >= 0.8 ? "🎉" : "🐷"}</Text>
      <Text style={styles.resultsTitle}>Test complete</Text>
      <Text style={styles.resultsScore}>
        {score} / {total}
      </Text>
      <Text style={styles.resultsMessage}>{message}</Text>

      <Pressable
        style={({ pressed }) => [
          styles.actionPrimaryButton,
          pressed && styles.actionButtonPressed,
        ]}
        onPress={onStartPractice}
      >
        <Text style={styles.actionPrimaryButtonText}>
          Practice with Budget Note
        </Text>
      </Pressable>

      <Pressable
        style={({ pressed }) => [
          styles.actionSecondaryButton,
          pressed && styles.actionButtonPressed,
        ]}
        onPress={onRetake}
      >
        <Text style={styles.actionSecondaryButtonText}>Retake test</Text>
      </Pressable>

      <Pressable
        style={({ pressed }) => [
          styles.finishLessonButton,
          pressed && styles.actionButtonPressed,
        ]}
        onPress={onComplete}
      >
        <Text style={styles.finishLessonButtonText}>Finish lesson</Text>
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
  finishLessonButton: {
    paddingVertical: 14,
    alignItems: "center",
  },
  finishLessonButtonText: {
    color: "#AAB4AE",
    fontSize: 15,
    fontWeight: "800",
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
  knowledgePanel: {
    minHeight: 520,
    backgroundColor: "#202622",
    borderRadius: 26,
    borderWidth: 1,
    borderColor: "#40613A",
    padding: 18,
  },
  knowledgeHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  knowledgeEyebrow: {
    color: "#8AC769",
    fontSize: 14,
    fontWeight: "900",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  knowledgeCounter: {
    color: "#AAB4AE",
    fontSize: 12,
    fontWeight: "700",
  },
  knowledgeProgressTrack: {
    height: 6,
    backgroundColor: "#343D38",
    borderRadius: 999,
    overflow: "hidden",
    marginBottom: 14,
  },
  knowledgeProgressFill: {
    height: "100%",
    backgroundColor: "#72A956",
    borderRadius: 999,
  },
  knowledgeIntro: {
    color: "#C7D0CA",
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 14,
  },
  knowledgePromptCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFF9EE",
    borderRadius: 20,
    padding: 16,
    marginBottom: 16,
  },
  knowledgePromptEmoji: {
    fontSize: 40,
    marginRight: 12,
  },
  knowledgePrompt: {
    flex: 1,
    color: "#171A18",
    fontSize: 18,
    lineHeight: 25,
    fontWeight: "800",
  },
  knowledgeNextButton: {
    minHeight: 54,
    backgroundColor: "#5D9447",
    borderRadius: 15,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 14,
  },
  knowledgeNextButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "800",
  },
  trueFalseRow: {
    flexDirection: "row",
    gap: 12,
  },
  trueFalseButton: {
    flex: 1,
    minHeight: 130,
    backgroundColor: "#292F2C",
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "#3B4540",
    alignItems: "center",
    justifyContent: "center",
  },
  trueFalseEmoji: {
    color: "#FFFFFF",
    fontSize: 38,
    fontWeight: "900",
  },
  trueFalseText: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "800",
    marginTop: 8,
  },
  miniBudgetSummary: {
    flexDirection: "row",
    justifyContent: "space-between",
    backgroundColor: "#171C19",
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
  },
  miniBudgetSummaryText: {
    color: "#8AC769",
    fontSize: 15,
    fontWeight: "800",
  },
  miniBudgetOverText: {
    color: "#F17870",
    fontSize: 15,
    fontWeight: "800",
  },
  itemChoiceList: {
    gap: 8,
  },
  itemChoiceButton: {
    minHeight: 58,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#292F2C",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#3B4540",
    paddingHorizontal: 14,
  },
  itemChoiceEmoji: {
    fontSize: 24,
    marginRight: 10,
  },
  itemChoiceName: {
    flex: 1,
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "700",
  },
  itemChoicePrice: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "900",
  },
  orderAnswerArea: {
    minHeight: 180,
    backgroundColor: "#171C19",
    borderRadius: 16,
    padding: 12,
    justifyContent: "center",
    marginBottom: 12,
  },
  orderPlaceholder: {
    color: "#7F8A84",
    fontSize: 14,
    textAlign: "center",
  },
  orderedStepRow: {
    minHeight: 42,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 6,
  },
  orderNumberCircle: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: "#5D9447",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },
  orderNumberText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "900",
  },
  orderedStepText: {
    flex: 1,
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "700",
  },
  orderChoices: {
    gap: 8,
  },
  orderChoiceButton: {
    minHeight: 50,
    backgroundColor: "#292F2C",
    borderRadius: 13,
    borderWidth: 1,
    borderColor: "#3B4540",
    justifyContent: "center",
    paddingHorizontal: 14,
  },
  orderChoiceText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "700",
  },
  orderActionRow: {
    flexDirection: "row",
    gap: 10,
    marginTop: 12,
  },
  orderResetButton: {
    minHeight: 48,
    paddingHorizontal: 20,
    backgroundColor: "#303733",
    borderRadius: 13,
    alignItems: "center",
    justifyContent: "center",
  },
  orderResetButtonText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "800",
  },
  orderSubmitButton: {
    flex: 1,
    minHeight: 48,
    backgroundColor: "#5D9447",
    borderRadius: 13,
    alignItems: "center",
    justifyContent: "center",
  },
  orderSubmitButtonDisabled: {
    backgroundColor: "#343C38",
  },
  orderSubmitButtonText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "800",
  },
  resultsPanel: {
    minHeight: 500,
    backgroundColor: "#1C2420",
    borderRadius: 26,
    borderWidth: 1,
    borderColor: "#40613A",
    padding: 24,
    alignItems: "center",
    justifyContent: "center",
  },
  resultsEmoji: {
    fontSize: 72,
    marginBottom: 14,
  },
  resultsTitle: {
    color: "#FFFFFF",
    fontSize: 28,
    fontWeight: "900",
  },
  resultsScore: {
    color: "#8AC769",
    fontSize: 54,
    fontWeight: "900",
    marginVertical: 14,
  },
  resultsMessage: {
    color: "#D4DDD7",
    fontSize: 16,
    lineHeight: 24,
    textAlign: "center",
    marginBottom: 24,
  },
});
