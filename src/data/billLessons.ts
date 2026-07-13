export type StoryPanel = {
  type: "story";
  speaker: "shopper" | "bill";
  text: string;
  characterEmoji: string;
  itemEmoji?: string;
  price?: number;
  secondaryText?: string;
};

export type ExpensesPanel = {
  type: "expenses";
  text: string;
  expenses: {
    name: string;
    amount: number;
    emoji: string;
  }[];
};

export type CalculationPanel = {
  type: "calculation";
  text: string;
  rows: {
    label: string;
    amount: number;
    highlight?: "positive" | "negative";
  }[];
};

export type PrinciplePanel = {
  type: "principle";
  title: string;
  body: string;
  billText?: string;
};

export type QuizPanel = {
  type: "quiz";
  question: string;
  answers: string[];
  correctAnswerIndex: number;
  correctMessage: string;
  incorrectMessage: string;
};

export type ActionPanel = {
  type: "action";
  title: string;
  body: string;
  primaryButtonText: string;
  secondaryButtonText: string;
};

export type LessonPanel =
  | StoryPanel
  | ExpensesPanel
  | CalculationPanel
  | PrinciplePanel
  | QuizPanel
  | ActionPanel;

export type BillLesson = {
  id: string;
  lessonNumber: number;
  title: string;
  description: string;
  durationMinutes: number;
  panels: LessonPanel[];
};

export const billLessons: BillLesson[] = [
  {
    id: "can-i-afford-this",
    lessonNumber: 1,
    title: "Can I Afford This?",
    description:
      "Learn the difference between being able to buy something and truly being able to afford it.",
    durationMinutes: 3,
    panels: [
      {
        type: "story",
        speaker: "shopper",
        characterEmoji: "🧑",
        itemEmoji: "👟",
        price: 120,
        text: "I have $300 left.",
        secondaryText: "These shoes are only $120.",
      },
      {
        type: "story",
        speaker: "shopper",
        characterEmoji: "🧑",
        itemEmoji: "✨",
        text: "So I can afford them... right?",
        secondaryText: "🐷 Let's slow down.",
      },
      {
        type: "expenses",
        text: "What else does that $300 need to cover?",
        expenses: [
          {
            name: "Gas",
            amount: 60,
            emoji: "⛽",
          },
          {
            name: "Phone bill",
            amount: 50,
            emoji: "📱",
          },
          {
            name: "Birthday gift",
            amount: 40,
            emoji: "🎁",
          },
          {
            name: "Groceries",
            amount: 80,
            emoji: "🛒",
          },
        ],
      },
      {
        type: "calculation",
        text: "You could pay for them, but you cannot afford the full impact.",
        rows: [
          {
            label: "Money available",
            amount: 300,
            highlight: "positive",
          },
          {
            label: "Shoes",
            amount: -120,
            highlight: "negative",
          },
          {
            label: "Other needs",
            amount: -230,
            highlight: "negative",
          },
          {
            label: "Left over",
            amount: -50,
            highlight: "negative",
          },
        ],
      },
      {
        type: "principle",
        title:
          "Being able to buy something is not the same as being able to afford it.",
        body: "Check what your remaining money already needs to cover before adding another purchase.",
        billText: "Smart choices today mean less stress tomorrow.",
      },
      {
        type: "quiz",
        question: "What should you check before buying the shoes?",
        answers: [
          "The price only",
          "The money currently in your account",
          "Everything your remaining money still needs to cover",
        ],
        correctAnswerIndex: 2,
        correctMessage:
          "Exactly. That is how you see the full impact of the purchase.",
        incorrectMessage:
          "That matters, but it does not show the complete impact on your money.",
      },
      {
        type: "action",
        title: "Now check one purchase you are considering.",
        body: "Open one of your budgets and see what would be left after adding the purchase.",
        primaryButtonText: "Open my budgets",
        secondaryButtonText: "Finish lesson",
      },
    ],
  },
];

export function getBillLessonById(id: string): BillLesson | undefined {
  return billLessons.find((lesson) => lesson.id === id);
}
