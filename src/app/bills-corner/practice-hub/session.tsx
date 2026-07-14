import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import {
    ActivityIndicator,
    Pressable,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    View,
} from "react-native";

import {
    PracticeQuestion,
    getMixedReviewQuestions,
    getPracticeQuestionsForLesson,
    shufflePracticeQuestions,
} from "@/data/billLessons";
import { recordBillPracticeResult } from "@/storage/billLessonProgress";
import {
    MAX_PRACTICE_COINS,
    getBillPracticeState,
    spendBillPracticeCoin,
} from "@/storage/billPracticeState";

const SESSION_LENGTH = 5;

type AnswerValue = string | number | boolean | string[];

function isAnswerCorrect(
  question: PracticeQuestion,
  answer: AnswerValue,
): boolean {
  switch (question.type) {
    case "multiple-choice":
    case "scenario":
      return answer === question.correctAnswerIndex;

    case "true-false":
      return answer === question.correctAnswer;

    case "select-item":
      return answer === question.correctItemId;

    case "order":
      return (
        Array.isArray(answer) &&
        answer.length === question.correctOrder.length &&
        answer.every((stepId, index) => stepId === question.correctOrder[index])
      );
  }
}

export default function PracticeSessionScreen() {
  const params = useLocalSearchParams<{
    mode?: string | string[];
    lessonId?: string | string[];
  }>();

  const mode = Array.isArray(params.mode) ? params.mode[0] : params.mode;
  const lessonId = Array.isArray(params.lessonId)
    ? params.lessonId[0]
    : params.lessonId;

  const questions = useMemo(() => {
    const source =
      mode === "lesson" && lessonId
        ? getPracticeQuestionsForLesson(lessonId)
        : getMixedReviewQuestions();

    return shufflePracticeQuestions(source).slice(0, SESSION_LENGTH);
  }, [lessonId, mode]);

  const [questionIndex, setQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<AnswerValue | null>(
    null,
  );
  const [orderSelection, setOrderSelection] = useState<string[]>([]);
  const [answerSubmitted, setAnswerSubmitted] = useState(false);
  const [wasCorrect, setWasCorrect] = useState(false);
  const [correctAnswers, setCorrectAnswers] = useState(0);
  const [coins, setCoins] = useState(MAX_PRACTICE_COINS);
  const [coinsLoaded, setCoinsLoaded] = useState(false);
  const [finished, setFinished] = useState(false);

  const currentQuestion = questions[questionIndex];

  useEffect(() => {
    let active = true;

    async function loadCoins() {
      const state = await getBillPracticeState();

      if (active) {
        setCoins(state.coinsRemaining);
        setCoinsLoaded(true);
      }
    }

    void loadCoins();

    return () => {
      active = false;
    };
  }, []);

  const submitAnswer = async () => {
    if (!currentQuestion || selectedAnswer === null || answerSubmitted) {
      return;
    }

    const correct = isAnswerCorrect(currentQuestion, selectedAnswer);

    setWasCorrect(correct);
    setAnswerSubmitted(true);

    if (correct) {
      setCorrectAnswers((current) => current + 1);
    } else {
      const nextState = await spendBillPracticeCoin();
      setCoins(nextState.coinsRemaining);
    }
  };

  const moveToNextQuestion = async () => {
    const isLastQuestion = questionIndex >= questions.length - 1;
    const nextCorrectTotal = correctAnswers;

    if (isLastQuestion) {
      setFinished(true);

      if (mode === "lesson" && lessonId) {
        await recordBillPracticeResult(
          lessonId,
          nextCorrectTotal,
          questions.length,
        );
      }

      return;
    }

    setQuestionIndex((current) => current + 1);
    setSelectedAnswer(null);
    setOrderSelection([]);
    setAnswerSubmitted(false);
    setWasCorrect(false);
  };

  const selectOrderStep = (stepId: string) => {
    if (answerSubmitted || orderSelection.includes(stepId)) {
      return;
    }

    const nextOrder = [...orderSelection, stepId];
    setOrderSelection(nextOrder);
    setSelectedAnswer(nextOrder);
  };

  const resetOrder = () => {
    if (answerSubmitted) {
      return;
    }

    setOrderSelection([]);
    setSelectedAnswer(null);
  };

  if (!coinsLoaded) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator />
          <Text style={styles.loadingText}>Loading practice...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (questions.length === 0) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyEmoji}>🐷</Text>
          <Text style={styles.emptyTitle}>No practice questions yet</Text>
          <Text style={styles.emptyBody}>
            Complete a lesson with a knowledge test first.
          </Text>
          <Pressable style={styles.primaryButton} onPress={() => router.back()}>
            <Text style={styles.primaryButtonText}>Go back</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  if (finished) {
    const score = Math.round((correctAnswers / questions.length) * 100);

    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.resultsContainer}>
          <Text style={styles.resultsEmoji}>{score >= 80 ? "🎉" : "🐷"}</Text>
          <Text style={styles.resultsTitle}>Practice complete</Text>
          <Text style={styles.resultsScore}>{score}%</Text>
          <Text style={styles.resultsBody}>
            You answered {correctAnswers} of {questions.length} correctly.
          </Text>
          <Text style={styles.resultsCoins}>
            Coins remaining: {coins} of {MAX_PRACTICE_COINS}
          </Text>

          <Pressable
            style={styles.primaryButton}
            onPress={() => router.replace("/bills-corner/practice-hub")}
          >
            <Text style={styles.primaryButtonText}>Back to Practice</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.topBar}>
          <Pressable
            style={({ pressed }) => [
              styles.closeButton,
              pressed && styles.buttonPressed,
            ]}
            onPress={() => router.back()}
          >
            <Text style={styles.closeButtonText}>✕</Text>
          </Pressable>

          <View style={styles.progressTrack}>
            <View
              style={[
                styles.progressFill,
                {
                  width: `${((questionIndex + 1) / questions.length) * 100}%`,
                },
              ]}
            />
          </View>

          <Text style={styles.coinCount}>🪙 {coins}</Text>
        </View>

        <Text style={styles.lessonLabel}>{currentQuestion.lessonTitle}</Text>
        <Text style={styles.questionCount}>
          Question {questionIndex + 1} of {questions.length}
        </Text>
        <Text style={styles.prompt}>{currentQuestion.prompt}</Text>

        <View style={styles.answersContainer}>
          {(currentQuestion.type === "multiple-choice" ||
            currentQuestion.type === "scenario") &&
            currentQuestion.answers.map((answer, index) => (
              <AnswerButton
                key={answer}
                label={answer}
                selected={selectedAnswer === index}
                disabled={answerSubmitted}
                onPress={() => setSelectedAnswer(index)}
              />
            ))}

          {currentQuestion.type === "true-false" && (
            <>
              <AnswerButton
                label="True"
                selected={selectedAnswer === true}
                disabled={answerSubmitted}
                onPress={() => setSelectedAnswer(true)}
              />
              <AnswerButton
                label="False"
                selected={selectedAnswer === false}
                disabled={answerSubmitted}
                onPress={() => setSelectedAnswer(false)}
              />
            </>
          )}

          {currentQuestion.type === "select-item" &&
            currentQuestion.items.map((item) => (
              <AnswerButton
                key={item.id}
                label={`${item.emoji} ${item.name} — $${item.price.toFixed(2)}`}
                selected={selectedAnswer === item.id}
                disabled={answerSubmitted}
                onPress={() => setSelectedAnswer(item.id)}
              />
            ))}

          {currentQuestion.type === "order" && (
            <>
              <View style={styles.orderSelection}>
                <Text style={styles.orderTitle}>Your order</Text>
                {orderSelection.length === 0 ? (
                  <Text style={styles.orderEmpty}>
                    Tap the steps below in order.
                  </Text>
                ) : (
                  orderSelection.map((stepId, index) => {
                    const step = currentQuestion.steps.find(
                      (item) => item.id === stepId,
                    );

                    return (
                      <Text key={stepId} style={styles.orderSelectedStep}>
                        {index + 1}. {step?.text}
                      </Text>
                    );
                  })
                )}
              </View>

              {currentQuestion.steps.map((step) => (
                <AnswerButton
                  key={step.id}
                  label={step.text}
                  selected={orderSelection.includes(step.id)}
                  disabled={answerSubmitted || orderSelection.includes(step.id)}
                  onPress={() => selectOrderStep(step.id)}
                />
              ))}

              {!answerSubmitted && orderSelection.length > 0 && (
                <Pressable style={styles.resetButton} onPress={resetOrder}>
                  <Text style={styles.resetButtonText}>Reset order</Text>
                </Pressable>
              )}
            </>
          )}
        </View>

        {answerSubmitted && (
          <View
            style={[
              styles.feedbackCard,
              wasCorrect ? styles.correctFeedback : styles.incorrectFeedback,
            ]}
          >
            <Text style={styles.feedbackTitle}>
              {wasCorrect ? "Correct" : "Not quite"}
            </Text>
            <Text style={styles.feedbackText}>
              {currentQuestion.explanation}
            </Text>

            {!wasCorrect && (
              <Text style={styles.coinLostText}>
                One coin was used. You have {coins} remaining.
              </Text>
            )}
          </View>
        )}

        {!answerSubmitted ? (
          <Pressable
            style={({ pressed }) => [
              styles.primaryButton,
              selectedAnswer === null && styles.disabledButton,
              pressed && selectedAnswer !== null && styles.buttonPressed,
            ]}
            disabled={selectedAnswer === null}
            onPress={() => void submitAnswer()}
          >
            <Text style={styles.primaryButtonText}>Check answer</Text>
          </Pressable>
        ) : (
          <Pressable
            style={({ pressed }) => [
              styles.primaryButton,
              pressed && styles.buttonPressed,
            ]}
            onPress={() => void moveToNextQuestion()}
          >
            <Text style={styles.primaryButtonText}>
              {questionIndex === questions.length - 1
                ? "See results"
                : "Next question"}
            </Text>
          </Pressable>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

type AnswerButtonProps = {
  label: string;
  selected: boolean;
  disabled: boolean;
  onPress: () => void;
};

function AnswerButton({
  label,
  selected,
  disabled,
  onPress,
}: AnswerButtonProps) {
  return (
    <Pressable
      style={({ pressed }) => [
        styles.answerButton,
        selected && styles.answerButtonSelected,
        disabled && !selected && styles.answerButtonDisabled,
        pressed && !disabled && styles.buttonPressed,
      ]}
      disabled={disabled}
      onPress={onPress}
    >
      <Text
        style={[
          styles.answerButtonText,
          selected && styles.answerButtonTextSelected,
        ]}
      >
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#111513",
  },
  content: {
    flexGrow: 1,
    padding: 20,
    paddingBottom: 40,
  },
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 28,
  },
  closeButton: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  closeButtonText: {
    color: "#FFFFFF",
    fontSize: 24,
    fontWeight: "700",
  },
  progressTrack: {
    flex: 1,
    height: 10,
    borderRadius: 5,
    backgroundColor: "#29302C",
    overflow: "hidden",
    marginHorizontal: 12,
  },
  progressFill: {
    height: "100%",
    borderRadius: 5,
    backgroundColor: "#7CB55B",
  },
  coinCount: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "700",
  },
  lessonLabel: {
    color: "#7CB55B",
    fontSize: 13,
    fontWeight: "800",
    textTransform: "uppercase",
  },
  questionCount: {
    color: "#8F9A94",
    fontSize: 13,
    marginTop: 5,
  },
  prompt: {
    color: "#FFFFFF",
    fontSize: 25,
    lineHeight: 33,
    fontWeight: "800",
    marginTop: 18,
    marginBottom: 24,
  },
  answersContainer: {
    gap: 12,
  },
  answerButton: {
    backgroundColor: "#1B211E",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#344039",
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  answerButtonSelected: {
    borderColor: "#7CB55B",
    backgroundColor: "#29352F",
  },
  answerButtonDisabled: {
    opacity: 0.5,
  },
  answerButtonText: {
    color: "#D9DFDB",
    fontSize: 15,
    lineHeight: 21,
    fontWeight: "600",
  },
  answerButtonTextSelected: {
    color: "#FFFFFF",
  },
  orderSelection: {
    backgroundColor: "#171C19",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#2A332E",
    padding: 16,
    marginBottom: 4,
  },
  orderTitle: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "700",
    marginBottom: 8,
  },
  orderEmpty: {
    color: "#8F9A94",
    fontSize: 13,
  },
  orderSelectedStep: {
    color: "#D9DFDB",
    fontSize: 14,
    lineHeight: 21,
  },
  resetButton: {
    alignSelf: "flex-start",
    paddingVertical: 8,
  },
  resetButtonText: {
    color: "#7CB55B",
    fontSize: 13,
    fontWeight: "700",
  },
  feedbackCard: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
    marginTop: 20,
  },
  correctFeedback: {
    backgroundColor: "#203025",
    borderColor: "#4E7D3A",
  },
  incorrectFeedback: {
    backgroundColor: "#302421",
    borderColor: "#7D4D42",
  },
  feedbackTitle: {
    color: "#FFFFFF",
    fontSize: 17,
    fontWeight: "800",
  },
  feedbackText: {
    color: "#D1D8D4",
    fontSize: 14,
    lineHeight: 20,
    marginTop: 6,
  },
  coinLostText: {
    color: "#E0B96A",
    fontSize: 13,
    fontWeight: "700",
    marginTop: 10,
  },
  primaryButton: {
    backgroundColor: "#4E7D3A",
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 54,
    paddingHorizontal: 18,
    marginTop: 24,
  },
  primaryButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "800",
  },
  disabledButton: {
    opacity: 0.4,
  },
  buttonPressed: {
    opacity: 0.75,
    transform: [{ scale: 0.99 }],
  },
  loadingContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 30,
  },
  loadingText: {
    color: "#AAB4AE",
    fontSize: 13,
    marginTop: 10,
  },
  emptyContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 30,
  },
  emptyEmoji: {
    fontSize: 50,
  },
  emptyTitle: {
    color: "#FFFFFF",
    fontSize: 23,
    fontWeight: "800",
    textAlign: "center",
    marginTop: 16,
  },
  emptyBody: {
    color: "#AAB4AE",
    fontSize: 15,
    lineHeight: 22,
    textAlign: "center",
    marginTop: 8,
  },
  resultsContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 30,
  },
  resultsEmoji: {
    fontSize: 58,
  },
  resultsTitle: {
    color: "#FFFFFF",
    fontSize: 26,
    fontWeight: "800",
    marginTop: 18,
  },
  resultsScore: {
    color: "#7CB55B",
    fontSize: 56,
    fontWeight: "900",
    marginTop: 12,
  },
  resultsBody: {
    color: "#D1D8D4",
    fontSize: 15,
    textAlign: "center",
    marginTop: 8,
  },
  resultsCoins: {
    color: "#AAB4AE",
    fontSize: 14,
    marginTop: 8,
  },
});
