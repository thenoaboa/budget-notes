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

export type MultipleChoiceKnowledgeQuestion = {
  id: string;
  type: "multiple-choice";
  prompt: string;
  answers: string[];
  correctAnswerIndex: number;
  explanation: string;
};

export type TrueFalseKnowledgeQuestion = {
  id: string;
  type: "true-false";
  prompt: string;
  correctAnswer: boolean;
  explanation: string;
};

export type SelectItemKnowledgeQuestion = {
  id: string;
  type: "select-item";
  prompt: string;
  budgetLimit: number;
  items: {
    id: string;
    name: string;
    price: number;
    emoji: string;
  }[];
  correctItemId: string;
  explanation: string;
};

export type OrderKnowledgeQuestion = {
  id: string;
  type: "order";
  prompt: string;
  steps: {
    id: string;
    text: string;
  }[];
  correctOrder: string[];
  explanation: string;
};

export type ScenarioKnowledgeQuestion = {
  id: string;
  type: "scenario";
  prompt: string;
  answers: string[];
  correctAnswerIndex: number;
  explanation: string;
};

export type KnowledgeQuestion =
  | MultipleChoiceKnowledgeQuestion
  | TrueFalseKnowledgeQuestion
  | SelectItemKnowledgeQuestion
  | OrderKnowledgeQuestion
  | ScenarioKnowledgeQuestion;

export type KnowledgeTestPanel = {
  type: "knowledge-test";
  title: string;
  intro: string;
  questions: KnowledgeQuestion[];
};

export type LessonPanel =
  | StoryPanel
  | ExpensesPanel
  | CalculationPanel
  | PrinciplePanel
  | QuizPanel
  | ActionPanel
  | KnowledgeTestPanel;

export type BillLesson = {
  id: string;
  lessonNumber: number;
  title: string;
  description: string;
  durationMinutes: number;
  panels: LessonPanel[];
};

export type PracticeQuestion = KnowledgeQuestion & {
  lessonId: string;
  lessonNumber: number;
  lessonTitle: string;
};

export const billLessons: BillLesson[] = [
  {
    id: "can-i-afford-this",
    lessonNumber: 1,
    title: "Can I Afford This?",
    description:
      "Learn the difference between being able to buy something and truly being able to afford it.",
    durationMinutes: 5,
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
          { name: "Gas", amount: 60, emoji: "⛽" },
          { name: "Phone bill", amount: 50, emoji: "📱" },
          { name: "Birthday gift", amount: 40, emoji: "🎁" },
          { name: "Groceries", amount: 80, emoji: "🛒" },
        ],
      },
      {
        type: "calculation",
        text: "You could pay for them, but you cannot afford the full impact.",
        rows: [
          { label: "Money available", amount: 300, highlight: "positive" },
          { label: "Shoes", amount: -120, highlight: "negative" },
          { label: "Other needs", amount: -230, highlight: "negative" },
          { label: "Left over", amount: -50, highlight: "negative" },
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
        body: "You can open one of your budgets now, or test what you learned first.",
        primaryButtonText: "Open my budgets",
        secondaryButtonText: "Test my knowledge",
      },
      {
        type: "knowledge-test",
        title: "Test Your Knowledge",
        intro:
          "Answer five different question types to practice the lesson in new ways.",
        questions: [
          {
            id: "afford-multiple-choice",
            type: "multiple-choice",
            prompt:
              "What should you compare before deciding whether you can afford something?",
            answers: [
              "The price and your available spending money",
              "The price and the store name",
              "The color and the brand",
              "The item and your wishlist",
            ],
            correctAnswerIndex: 0,
            explanation:
              "A purchase is affordable only when its full cost fits within the money you can actually use.",
          },
          {
            id: "afford-true-false",
            type: "true-false",
            prompt:
              "You have $50 available and your planned purchases total $47. You are currently within your limit.",
            correctAnswer: true,
            explanation:
              "The purchases are $3 below the limit, so the plan currently fits.",
          },
          {
            id: "afford-select-item",
            type: "select-item",
            prompt:
              "Your list is $8 over budget. Which single item could you remove to get back within the limit?",
            budgetLimit: 40,
            items: [
              { id: "snacks", name: "Snacks", price: 6, emoji: "🍿" },
              { id: "shirt", name: "Shirt", price: 22, emoji: "👕" },
              {
                id: "charger",
                name: "Phone charger",
                price: 10,
                emoji: "🔌",
              },
              { id: "drink", name: "Drink", price: 4, emoji: "🥤" },
              {
                id: "notebook",
                name: "Notebook",
                price: 6,
                emoji: "📓",
              },
            ],
            correctItemId: "charger",
            explanation:
              "The list totals $48. Removing the $10 charger lowers the total to $38, which fits the $40 limit.",
          },
          {
            id: "afford-order",
            type: "order",
            prompt: "Tap the spending-decision steps in the correct order.",
            steps: [
              { id: "review", text: "Review the final total" },
              { id: "choose", text: "Choose what you want to buy" },
              { id: "limit", text: "Set how much you can spend" },
              { id: "adjust", text: "Adjust the list if needed" },
            ],
            correctOrder: ["limit", "choose", "review", "adjust"],
            explanation:
              "Set the limit first, build the list, review the total, and then make adjustments.",
          },
          {
            id: "afford-scenario",
            type: "scenario",
            prompt:
              "You have $100 available. Your list totals $92, but you forgot about $12 in sales tax. What should you do?",
            answers: [
              "Buy everything because the listed prices are below $100",
              "Remove or reduce something so the full cost fits",
              "Ignore the tax",
              "Increase the budget without checking your finances",
            ],
            correctAnswerIndex: 1,
            explanation:
              "The full cost is $104, so the plan is $4 over the amount available.",
          },
        ],
      },
    ],
  },
];

export const mixedReviewQuestions: PracticeQuestion[] = [
  {
    id: "mixed-target-sale",
    type: "scenario",
    lessonId: "mixed-review",
    lessonNumber: 0,
    lessonTitle: "Mixed Review",
    prompt:
      "You planned to spend $60 at a store. Your cart is $56 before tax. What is the safest next step?",
    answers: [
      "Check the estimated tax before checking out",
      "Add another item because you still have $4",
      "Ignore the budget because the items are on sale",
      "Raise the limit after buying everything",
    ],
    correctAnswerIndex: 0,
    explanation:
      "The listed total is not always the final total. Tax could push the cart over your $60 limit.",
  },
  {
    id: "mixed-phone-bill",
    type: "true-false",
    lessonId: "mixed-review",
    lessonNumber: 0,
    lessonTitle: "Mixed Review",
    prompt:
      "Having enough money in your account today automatically means a purchase is affordable.",
    correctAnswer: false,
    explanation:
      "Money in the account may already be needed for bills, food, transportation, or other planned expenses.",
  },
  {
    id: "mixed-weekend-choice",
    type: "multiple-choice",
    lessonId: "mixed-review",
    lessonNumber: 0,
    lessonTitle: "Mixed Review",
    prompt:
      "You have $45 of uncommitted spending money left. Which plan keeps you within that amount?",
    answers: [
      "$18 dinner, $12 movie ticket, and $9 snacks",
      "$25 dinner, $15 movie ticket, and $10 snacks",
      "$30 dinner and $20 shopping",
      "$40 dinner and $8 parking",
    ],
    correctAnswerIndex: 0,
    explanation:
      "The first plan totals $39. Every other option is more than the $45 available.",
  },
  {
    id: "mixed-remove-item",
    type: "select-item",
    lessonId: "mixed-review",
    lessonNumber: 0,
    lessonTitle: "Mixed Review",
    prompt:
      "Your cart totals $67 and your limit is $60. Which one item could you remove to get within the limit?",
    budgetLimit: 60,
    items: [
      { id: "soap", name: "Soap", price: 5, emoji: "🧼" },
      { id: "candle", name: "Candle", price: 9, emoji: "🕯️" },
      { id: "batteries", name: "Batteries", price: 6, emoji: "🔋" },
      { id: "snack", name: "Snack", price: 3, emoji: "🍫" },
    ],
    correctItemId: "candle",
    explanation:
      "You are $7 over. Removing the $9 candle lowers the total to $58.",
  },
  {
    id: "mixed-plan-order",
    type: "order",
    lessonId: "mixed-review",
    lessonNumber: 0,
    lessonTitle: "Mixed Review",
    prompt: "Put these steps in the best order before making a purchase.",
    steps: [
      { id: "check-needs", text: "Check what the remaining money must cover" },
      { id: "buy", text: "Make the purchase" },
      { id: "set-limit", text: "Set a spending limit" },
      { id: "check-total", text: "Review the full total" },
    ],
    correctOrder: ["set-limit", "check-needs", "check-total", "buy"],
    explanation:
      "Set the limit, protect the money needed elsewhere, review the full total, and then decide whether to buy.",
  },
  {
    id: "mixed-friend-invite",
    type: "scenario",
    lessonId: "mixed-review",
    lessonNumber: 0,
    lessonTitle: "Mixed Review",
    prompt:
      "A friend invites you out, but the money left in your account is reserved for gas until payday. What is the best response?",
    answers: [
      "Spend the gas money and solve it later",
      "Check whether a cheaper option fits without touching the gas money",
      "Use a credit card so it does not affect the account today",
      "Ignore the gas expense because it is not due yet",
    ],
    correctAnswerIndex: 1,
    explanation:
      "Money reserved for a need is not available spending money. A cheaper plan may still work without creating another problem.",
  },
  {
    id: "mixed-discount",
    type: "true-false",
    lessonId: "mixed-review",
    lessonNumber: 0,
    lessonTitle: "Mixed Review",
    prompt:
      "A discounted item is automatically a smart purchase because it costs less than normal.",
    correctAnswer: false,
    explanation:
      "A discount only changes the price. The purchase still needs to fit your plan and be worth buying.",
  },
  {
    id: "mixed-full-impact",
    type: "multiple-choice",
    lessonId: "mixed-review",
    lessonNumber: 0,
    lessonTitle: "Mixed Review",
    prompt: "Which number gives the clearest picture of a purchase's impact?",
    answers: [
      "The sticker price only",
      "The price after discounts only",
      "The full cost compared with available spending money",
      "The amount currently in the checking account",
    ],
    correctAnswerIndex: 2,
    explanation:
      "The full cost must be compared with money that is genuinely available after other needs are protected.",
  },
  {
    id: "mixed-small-items",
    type: "scenario",
    lessonId: "mixed-review",
    lessonNumber: 0,
    lessonTitle: "Mixed Review",
    prompt:
      "Several small items push your list $11 over budget. What should you do first?",
    answers: [
      "Review the least important items and remove enough to fit",
      "Keep everything because each item is inexpensive",
      "Increase the budget without checking anything",
      "Ignore the difference because it is close",
    ],
    correctAnswerIndex: 0,
    explanation:
      "Small purchases still add up. Removing lower-priority items protects the spending limit.",
  },
  {
    id: "mixed-leftover",
    type: "true-false",
    lessonId: "mixed-review",
    lessonNumber: 0,
    lessonTitle: "Mixed Review",
    prompt:
      "Leaving some room below your spending limit can protect you from tax, price changes, or forgotten costs.",
    correctAnswer: true,
    explanation:
      "A small buffer makes the plan more realistic and reduces the chance of going over.",
  },
];

export function getBillLessonById(id: string): BillLesson | undefined {
  return billLessons.find((lesson) => lesson.id === id);
}

export function getKnowledgeTestPanel(
  lesson: BillLesson,
): KnowledgeTestPanel | undefined {
  return lesson.panels.find(
    (panel): panel is KnowledgeTestPanel => panel.type === "knowledge-test",
  );
}

export function getPracticeQuestionsForLesson(
  lessonId: string,
): PracticeQuestion[] {
  const lesson = getBillLessonById(lessonId);

  if (!lesson) {
    return [];
  }

  const test = getKnowledgeTestPanel(lesson);

  if (!test) {
    return [];
  }

  return test.questions.map((question) => ({
    ...question,
    lessonId: lesson.id,
    lessonNumber: lesson.lessonNumber,
    lessonTitle: lesson.title,
  }));
}

export function getMixedReviewQuestions(): PracticeQuestion[] {
  return [...mixedReviewQuestions];
}

export function shufflePracticeQuestions(
  questions: PracticeQuestion[],
): PracticeQuestion[] {
  const shuffled = [...questions];

  for (let index = shuffled.length - 1; index > 0; index -= 1) {
    const randomIndex = Math.floor(Math.random() * (index + 1));
    [shuffled[index], shuffled[randomIndex]] = [
      shuffled[randomIndex],
      shuffled[index],
    ];
  }

  return shuffled;
}
