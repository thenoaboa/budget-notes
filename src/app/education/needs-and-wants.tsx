import Ionicons from "@expo/vector-icons/Ionicons";
import { useRouter } from "expo-router";
import { useState } from "react";
import { Pressable, SafeAreaView, StyleSheet, Text, View } from "react-native";
import { markLessonComplete } from "../../lib/educationProgress";

type Choice = "Need" | "Want";

type ScenarioItem = {
  id: string;
  name: string;
  emoji: string;
  price: string;
  answer: Choice;
  explanation: string;
};

const ITEMS: ScenarioItem[] = [
  {
    id: "groceries",
    name: "Groceries for the week",
    emoji: "🥦",
    price: "$45.00",
    answer: "Need",
    explanation: "Food is necessary for your health and daily life.",
  },
  {
    id: "shoes",
    name: "Replacement school shoes",
    emoji: "👟",
    price: "$35.00",
    answer: "Need",
    explanation:
      "Your current shoes no longer fit, so replacing them is necessary.",
  },
  {
    id: "game",
    name: "New video game",
    emoji: "🎮",
    price: "$40.00",
    answer: "Want",
    explanation:
      "The game may be fun, but you can live safely without purchasing it.",
  },
  {
    id: "medicine",
    name: "Cold medicine",
    emoji: "💊",
    price: "$12.00",
    answer: "Need",
    explanation:
      "Medicine that protects your health is more important than optional spending.",
  },
  {
    id: "movie",
    name: "Movie theater ticket",
    emoji: "🎟️",
    price: "$15.00",
    answer: "Want",
    explanation:
      "Entertainment is enjoyable, but it is not required for daily life.",
  },
  {
    id: "headphones",
    name: "A second pair of headphones",
    emoji: "🎧",
    price: "$25.00",
    answer: "Want",
    explanation:
      "Because you already have working headphones, another pair is optional.",
  },
];

export default function NeedsAndWantsScreen() {
  const router = useRouter();

  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedChoice, setSelectedChoice] = useState<Choice | null>(null);
  const [correctAnswers, setCorrectAnswers] = useState(0);
  const [complete, setComplete] = useState(false);

  const currentItem = ITEMS[currentIndex];
  const answerIsCorrect = selectedChoice === currentItem.answer;
  const progressPercent = ((currentIndex + 1) / ITEMS.length) * 100;

  function chooseAnswer(choice: Choice) {
    if (selectedChoice) {
      return;
    }

    setSelectedChoice(choice);

    if (choice === currentItem.answer) {
      setCorrectAnswers((current) => current + 1);
    }
  }

  function continueLesson() {
    if (!selectedChoice) {
      return;
    }

    if (currentIndex === ITEMS.length - 1) {
      void markLessonComplete("needs-and-wants");
      setComplete(true);
      return;
    }

    setCurrentIndex((current) => current + 1);
    setSelectedChoice(null);
  }

  function resetLesson() {
    setCurrentIndex(0);
    setSelectedChoice(null);
    setCorrectAnswers(0);
    setComplete(false);
  }

  if (complete) {
    return (
      <SafeAreaView style={styles.screen}>
        <View style={styles.completionContainer}>
          <View style={styles.completionIcon}>
            <Ionicons name="checkmark" size={52} color="#101820" />
          </View>

          <Text style={styles.completionTitle}>Lesson Complete!</Text>

          <Text style={styles.completionText}>
            You practiced deciding which expenses should come first when money
            is limited.
          </Text>

          <View style={styles.resultsCard}>
            <View style={styles.resultRow}>
              <Text style={styles.resultLabel}>Questions completed</Text>
              <Text style={styles.resultValue}>{ITEMS.length}</Text>
            </View>

            <View style={styles.resultRow}>
              <Text style={styles.resultLabel}>Correct decisions</Text>
              <Text style={styles.resultValueGreen}>
                {correctAnswers} of {ITEMS.length}
              </Text>
            </View>
          </View>

          <View style={styles.reflectionCard}>
            <Text style={styles.reflectionLabel}>Remember</Text>

            <Text style={styles.reflectionQuestion}>
              A need is something necessary for health, safety, or daily life. A
              want can still be important, but it can usually wait.
            </Text>
          </View>

          <Pressable
            style={({ pressed }) => [
              styles.primaryButton,
              pressed && styles.pressed,
            ]}
            onPress={resetLesson}
          >
            <Text style={styles.primaryButtonText}>Try Again</Text>
          </Pressable>

          <Pressable
            style={({ pressed }) => [
              styles.secondaryButton,
              pressed && styles.pressed,
            ]}
            onPress={() => router.back()}
          >
            <Text style={styles.secondaryButtonText}>Return to Curriculum</Text>
          </Pressable>
        </View>
      </SafeAreaView>
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
          accessibilityLabel="Return to curriculum"
        >
          <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
        </Pressable>

        <Text style={styles.headerTitle}>Needs vs. Wants</Text>

        <Pressable
          onPress={resetLesson}
          hitSlop={10}
          accessibilityRole="button"
          accessibilityLabel="Reset lesson"
        >
          <Text style={styles.resetText}>Reset</Text>
        </Pressable>
      </View>

      <View style={styles.progressSection}>
        <View style={styles.progressLabels}>
          <Text style={styles.progressText}>
            Decision {currentIndex + 1} of {ITEMS.length}
          </Text>

          <Text style={styles.scoreText}>{correctAnswers} correct</Text>
        </View>

        <View style={styles.progressTrack}>
          <View
            style={[styles.progressFill, { width: `${progressPercent}%` }]}
          />
        </View>
      </View>

      <View style={styles.content}>
        <View style={styles.instructionsCard}>
          <Text style={styles.instructionsTitle}>Your money is limited</Text>

          <Text style={styles.instructionsText}>
            Decide whether each expense is something you need right now or
            something you want.
          </Text>
        </View>

        <View style={styles.itemCard}>
          <Text style={styles.itemEmoji}>{currentItem.emoji}</Text>
          <Text style={styles.itemName}>{currentItem.name}</Text>
          <Text style={styles.itemPrice}>{currentItem.price}</Text>
        </View>

        <Text style={styles.question}>Is this a need or a want?</Text>

        <View style={styles.choiceRow}>
          {(["Need", "Want"] as Choice[]).map((choice) => {
            const isSelected = selectedChoice === choice;
            const isCorrectChoice =
              selectedChoice !== null && choice === currentItem.answer;
            const isWrongChoice = isSelected && choice !== currentItem.answer;

            return (
              <Pressable
                key={choice}
                style={({ pressed }) => [
                  styles.choiceButton,
                  choice === "Need" ? styles.needButton : styles.wantButton,
                  isCorrectChoice && styles.correctChoice,
                  isWrongChoice && styles.wrongChoice,
                  pressed && !selectedChoice && styles.pressedCard,
                ]}
                onPress={() => chooseAnswer(choice)}
                accessibilityRole="button"
                accessibilityState={{ selected: isSelected }}
              >
                <Ionicons
                  name={
                    choice === "Need"
                      ? "shield-checkmark-outline"
                      : "sparkles-outline"
                  }
                  size={28}
                  color="#FFFFFF"
                />

                <Text style={styles.choiceText}>{choice}</Text>
              </Pressable>
            );
          })}
        </View>

        {selectedChoice && (
          <View
            style={[
              styles.feedbackCard,
              answerIsCorrect
                ? styles.feedbackCorrect
                : styles.feedbackIncorrect,
            ]}
          >
            <Ionicons
              name={answerIsCorrect ? "checkmark-circle" : "information-circle"}
              size={25}
              color={answerIsCorrect ? "#2ECC71" : "#F5C451"}
            />

            <View style={styles.feedbackContent}>
              <Text style={styles.feedbackTitle}>
                {answerIsCorrect
                  ? "Good decision!"
                  : `This situation is a ${currentItem.answer.toLowerCase()}.`}
              </Text>

              <Text style={styles.feedbackText}>{currentItem.explanation}</Text>
            </View>
          </View>
        )}

        <Pressable
          disabled={!selectedChoice}
          style={({ pressed }) => [
            styles.continueButton,
            !selectedChoice && styles.continueButtonDisabled,
            pressed && selectedChoice && styles.pressed,
          ]}
          onPress={continueLesson}
        >
          <Text
            style={[
              styles.continueButtonText,
              !selectedChoice && styles.continueButtonTextDisabled,
            ]}
          >
            {currentIndex === ITEMS.length - 1
              ? "Finish Lesson"
              : "Next Decision"}
          </Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#101820",
  },

  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 14,
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

  headerTitle: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "900",
  },

  resetText: {
    width: 42,
    color: "#B56CFF",
    fontSize: 14,
    fontWeight: "900",
    textAlign: "right",
  },

  progressSection: {
    backgroundColor: "#1B2738",
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: "#344657",
    paddingHorizontal: 18,
    paddingVertical: 14,
  },

  progressLabels: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 9,
  },

  progressText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "800",
  },

  scoreText: {
    color: "#2ECC71",
    fontSize: 14,
    fontWeight: "800",
  },

  progressTrack: {
    height: 8,
    backgroundColor: "#2A3848",
    borderRadius: 999,
    overflow: "hidden",
  },

  progressFill: {
    height: "100%",
    backgroundColor: "#B56CFF",
    borderRadius: 999,
  },

  content: {
    flex: 1,
    padding: 16,
  },

  instructionsCard: {
    backgroundColor: "#1B2738",
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "#344657",
    padding: 17,
  },

  instructionsTitle: {
    color: "#FFFFFF",
    fontSize: 20,
    fontWeight: "900",
    marginBottom: 7,
  },

  instructionsText: {
    color: "#AAB5C1",
    fontSize: 14,
    fontWeight: "600",
    lineHeight: 20,
  },

  itemCard: {
    alignItems: "center",
    justifyContent: "center",
    minHeight: 190,
    backgroundColor: "#1B2738",
    borderRadius: 22,
    borderWidth: 1,
    borderColor: "#344657",
    marginTop: 18,
    padding: 20,
  },

  itemEmoji: {
    fontSize: 57,
  },

  itemName: {
    color: "#FFFFFF",
    fontSize: 21,
    fontWeight: "900",
    textAlign: "center",
    marginTop: 13,
  },

  itemPrice: {
    color: "#B56CFF",
    fontSize: 20,
    fontWeight: "900",
    marginTop: 7,
  },

  question: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "900",
    textAlign: "center",
    marginTop: 20,
    marginBottom: 13,
  },

  choiceRow: {
    flexDirection: "row",
    gap: 12,
  },

  choiceButton: {
    flex: 1,
    minHeight: 82,
    borderRadius: 17,
    borderWidth: 2,
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
  },

  needButton: {
    backgroundColor: "#1D5943",
    borderColor: "#2ECC71",
  },

  wantButton: {
    backgroundColor: "#4A3265",
    borderColor: "#B56CFF",
  },

  correctChoice: {
    borderColor: "#FFFFFF",
    borderWidth: 3,
  },

  wrongChoice: {
    backgroundColor: "#69363D",
    borderColor: "#FF7676",
  },

  choiceText: {
    color: "#FFFFFF",
    fontSize: 17,
    fontWeight: "900",
  },

  feedbackCard: {
    flexDirection: "row",
    borderRadius: 16,
    borderWidth: 1,
    padding: 14,
    marginTop: 15,
  },

  feedbackCorrect: {
    backgroundColor: "#183C32",
    borderColor: "#286349",
  },

  feedbackIncorrect: {
    backgroundColor: "#4A4024",
    borderColor: "#776634",
  },

  feedbackContent: {
    flex: 1,
    marginLeft: 10,
  },

  feedbackTitle: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "900",
  },

  feedbackText: {
    color: "#C5CED7",
    fontSize: 13,
    fontWeight: "600",
    lineHeight: 18,
    marginTop: 3,
  },

  continueButton: {
    minHeight: 54,
    backgroundColor: "#B56CFF",
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    marginTop: "auto",
  },

  continueButtonDisabled: {
    backgroundColor: "#2A3848",
  },

  continueButtonText: {
    color: "#101820",
    fontSize: 16,
    fontWeight: "900",
  },

  continueButtonTextDisabled: {
    color: "#718090",
  },

  completionContainer: {
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: 22,
    paddingVertical: 30,
  },

  completionIcon: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: "#2ECC71",
    alignItems: "center",
    justifyContent: "center",
    alignSelf: "center",
  },

  completionTitle: {
    color: "#FFFFFF",
    fontSize: 29,
    fontWeight: "900",
    textAlign: "center",
    marginTop: 22,
  },

  completionText: {
    color: "#AAB5C1",
    fontSize: 15,
    fontWeight: "600",
    lineHeight: 22,
    textAlign: "center",
    marginTop: 10,
  },

  resultsCard: {
    backgroundColor: "#1B2738",
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "#344657",
    padding: 17,
    marginTop: 25,
  },

  resultRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 7,
  },

  resultLabel: {
    color: "#AAB5C1",
    fontSize: 14,
    fontWeight: "700",
  },

  resultValue: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "900",
  },

  resultValueGreen: {
    color: "#2ECC71",
    fontSize: 15,
    fontWeight: "900",
  },

  reflectionCard: {
    backgroundColor: "#243342",
    borderRadius: 17,
    padding: 16,
    marginTop: 14,
  },

  reflectionLabel: {
    color: "#B56CFF",
    fontSize: 12,
    fontWeight: "900",
    textTransform: "uppercase",
    letterSpacing: 0.8,
  },

  reflectionQuestion: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "700",
    lineHeight: 21,
    marginTop: 7,
  },

  primaryButton: {
    minHeight: 54,
    backgroundColor: "#B56CFF",
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 22,
  },

  primaryButtonText: {
    color: "#101820",
    fontSize: 16,
    fontWeight: "900",
  },

  secondaryButton: {
    minHeight: 52,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#465769",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 11,
  },

  secondaryButtonText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "800",
  },

  pressedCard: {
    transform: [{ scale: 0.98 }],
  },

  pressed: {
    opacity: 0.7,
  },
});
