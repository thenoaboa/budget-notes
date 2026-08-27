import Ionicons from "@expo/vector-icons/Ionicons";

export type LessonApproach = "standard" | "faith";

export type TeacherLesson = {
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
  faithConnection: {
    scripture: string;
    principle: string;
    discussionQuestion: string;
  };
};

export const LESSONS: TeacherLesson[] = [
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
    faithConnection: {
      scripture: "Luke 14:28",
      principle:
        "Wise stewardship includes counting the cost and planning before making a commitment.",
      discussionQuestion:
        "How did planning before buying help you take better care of what you were given?",
    },
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
    faithConnection: {
      scripture: "Philippians 4:11–12",
      principle:
        "Contentment helps us appreciate what we have without treating every desire as a necessity.",
      discussionQuestion:
        "How can contentment help you make a wise choice when you cannot have everything you want?",
    },
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
    faithConnection: {
      scripture: "Proverbs 21:5",
      principle:
        "Careful planning helps us use money purposefully instead of reacting without thinking.",
      discussionQuestion:
        "How can a thoughtful plan help you honor God with the money entrusted to you?",
    },
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
    faithConnection: {
      scripture: "Proverbs 21:20",
      principle:
        "Wisdom includes preparing resources for future needs instead of consuming everything immediately.",
      discussionQuestion:
        "How did saving beforehand give you more freedom when something unexpected happened?",
    },
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
    faithConnection: {
      scripture: "Hebrews 13:5",
      principle:
        "Contentment allows us to stop spending even when more money is available.",
      discussionQuestion:
        "What is the difference between enjoying what you have and always searching for something more?",
    },
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
    faithConnection: {
      scripture: "Proverbs 22:7",
      principle:
        "Debt can limit future choices, so wisdom asks us to understand the cost before borrowing.",
      discussionQuestion:
        "How can owing money to someone else reduce your ability to choose what to do with future money?",
    },
  },
];
