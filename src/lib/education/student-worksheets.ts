export type StudentWorksheetSection =
  | { kind: "instructions"; title: string; text: string }
  | { kind: "requirements"; title: string; items: string[] }
  | { kind: "table"; title: string; columns: string[]; rows: string[][] }
  | {
      kind: "multiple-choice";
      title: string;
      question: string;
      options: string[];
    }
  | { kind: "calculations"; title: string; rows: string[] }
  | { kind: "prompt"; title: string; text: string; lines?: number };

export type StudentWorksheet = {
  id: string;
  number: number;
  title: string;
  duration: string;
  subtitle: string;
  sections: StudentWorksheetSection[];
};

export const STUDENT_WORKSHEETS: StudentWorksheet[] = [
  {
    id: "grocery-challenge",
    number: 1,
    title: "The Grocery Challenge",
    duration: "10–15 min",
    subtitle:
      "Feed your family for $60 without forgetting the things they need.",
    sections: [
      {
        kind: "instructions",
        title: "Part 1 — Build your grocery plan",
        text: "You have $60. Choose at least one protein, one fruit, and one vegetable. Grains and optional treats are allowed if they fit your budget.",
      },
      {
        kind: "requirements",
        title: "Your plan must include",
        items: [
          "At least 1 protein",
          "At least 1 fruit",
          "At least 1 vegetable",
          "Stay within $60",
        ],
      },
      {
        kind: "table",
        title: "Choose your groceries",
        columns: ["Choose", "Item", "Category", "Price"],
        rows: [
          ["☐", "Chicken", "Protein", "$12.00"],
          ["☐", "Ground Beef", "Protein", "$10.00"],
          ["☐", "Rice", "Grain", "$4.00"],
          ["☐", "Bread", "Grain", "$3.50"],
          ["☐", "Apples", "Fruit", "$5.00"],
          ["☐", "Bananas", "Fruit", "$3.00"],
          ["☐", "Carrots", "Vegetable", "$3.50"],
          ["☐", "Broccoli", "Vegetable", "$4.00"],
          ["☐", "Frozen Pizza", "Optional", "$8.00"],
          ["☐", "Cookies", "Optional", "$4.50"],
          ["☐", "Soda", "Optional", "$5.00"],
        ],
      },
      {
        kind: "calculations",
        title: "Check your first plan",
        rows: ["Subtotal", "Money available: $60.00", "Money remaining"],
      },
      {
        kind: "instructions",
        title: "WAIT FOR YOUR TEACHER — Surprise!",
        text: "Sales tax is now added at 8.25%. Recalculate your plan. If your total is too high, change your choices before continuing.",
      },
      {
        kind: "calculations",
        title: "Add the tax",
        rows: [
          "Subtotal",
          "Sales tax (8.25%)",
          "New total",
          "Money remaining from $60.00",
        ],
      },
      {
        kind: "prompt",
        title: "Think about it",
        text: "What did you decide not to buy so you could stay within your budget?",
        lines: 3,
      },
    ],
  },
  {
    id: "needs-and-wants",
    number: 2,
    title: "Needs vs. Wants",
    duration: "10 min",
    subtitle: "Decide which expenses should come first when money is limited.",
    sections: [
      {
        kind: "instructions",
        title: "Make each decision",
        text: "For every expense, mark whether it is a NEED right now or a WANT. Then write a short reason for your choice.",
      },
      {
        kind: "table",
        title: "Need or want?",
        columns: ["Expense", "Price", "Need", "Want", "Why?"],
        rows: [
          ["Groceries for the week", "$45.00", "☐", "☐", "________________"],
          ["Replacement school shoes", "$35.00", "☐", "☐", "________________"],
          ["New video game", "$40.00", "☐", "☐", "________________"],
          ["Cold medicine", "$12.00", "☐", "☐", "________________"],
          ["Movie theater ticket", "$15.00", "☐", "☐", "________________"],
          [
            "A second pair of headphones",
            "$25.00",
            "☐",
            "☐",
            "________________",
          ],
        ],
      },
      {
        kind: "prompt",
        title: "Think about it",
        text: "Can the same item be a need for one person and a want for another person? Give an example.",
        lines: 4,
      },
    ],
  },
  {
    id: "first-budget",
    number: 3,
    title: "Build Your First Budget",
    duration: "15–20 min",
    subtitle: "Give your $100 a plan without spending more than you have.",
    sections: [
      {
        kind: "instructions",
        title: "Plan your $100",
        text: "Choose one food option, one transportation option, and at least $20 in savings. Then decide whether you can afford any entertainment.",
      },
      {
        kind: "requirements",
        title: "Your budget must",
        items: [
          "Include food",
          "Include transportation",
          "Save at least $20",
          "Stay within $100",
        ],
      },
      {
        kind: "table",
        title: "Choose your expenses",
        columns: ["Choose", "Item", "Category", "Price"],
        rows: [
          ["☐", "Lunch groceries", "Food", "$20.00"],
          ["☐", "Buy lunch out", "Food", "$40.00"],
          ["☐", "Bus pass", "Transportation", "$20.00"],
          ["☐", "Rideshare trips", "Transportation", "$45.00"],
          ["☐", "Save $20", "Savings", "$20.00"],
          ["☐", "Save $30", "Savings", "$30.00"],
          ["☐", "Movie ticket", "Entertainment", "$15.00"],
          ["☐", "New game", "Entertainment", "$25.00"],
          ["☐", "Extra snacks", "Entertainment", "$10.00"],
        ],
      },
      {
        kind: "calculations",
        title: "Finish your budget",
        rows: [
          "Money available: $100.00",
          "Money planned",
          "Savings",
          "Money left",
        ],
      },
      {
        kind: "prompt",
        title: "Think about it",
        text: "How did your food and transportation choices affect what you could afford for entertainment?",
        lines: 4,
      },
    ],
  },
  {
    id: "unexpected-expense",
    number: 4,
    title: "The Unexpected Expense",
    duration: "10–15 min",
    subtitle: "Repair a budget after an important surprise expense appears.",
    sections: [
      {
        kind: "instructions",
        title: "Your original $120 plan",
        text: "You already planned the expenses below. Essentials cannot be removed. Your job is to repair the plan after the surprise expense appears.",
      },
      {
        kind: "table",
        title: "Original plan",
        columns: ["Planned", "Item", "Type", "Price"],
        rows: [
          ["✓", "Groceries", "Required", "$35.00"],
          ["✓", "Bus pass", "Required", "$20.00"],
          ["✓", "Phone service", "Required", "$15.00"],
          ["✓", "Save $20", "Savings", "$20.00"],
          ["✓", "Movie ticket", "Optional", "$15.00"],
          ["✓", "Extra snacks", "Optional", "$10.00"],
        ],
      },
      {
        kind: "instructions",
        title: "Surprise — Something changed!",
        text: "You now need $25 of unexpected medicine. Add it to the plan. You must keep all required expenses, stay within $120, and keep at least $10 in savings.",
      },
      {
        kind: "table",
        title: "Repair your plan",
        columns: ["Keep?", "Item", "Type", "Price"],
        rows: [
          ["✓", "Groceries", "Required", "$35.00"],
          ["✓", "Bus pass", "Required", "$20.00"],
          ["✓", "Phone service", "Required", "$15.00"],
          ["☐ $20  ☐ $10", "Savings", "Choose one", "$20 / $10"],
          ["☐", "Movie ticket", "Optional", "$15.00"],
          ["☐", "Extra snacks", "Optional", "$10.00"],
          ["✓", "Unexpected medicine", "Required", "$25.00"],
        ],
      },
      {
        kind: "calculations",
        title: "Check your repaired budget",
        rows: [
          "Money available: $120.00",
          "New total",
          "Savings protected",
          "Money remaining",
        ],
      },
      {
        kind: "prompt",
        title: "Think about it",
        text: "What did you change? Why were optional expenses easier to change than required expenses?",
        lines: 4,
      },
    ],
  },
  {
    id: "dont-spend-it-all",
    number: 5,
    title: "You Don't Have to Spend It All",
    duration: "10 min",
    subtitle: "Practice stopping before your money reaches zero.",
    sections: [
      {
        kind: "instructions",
        title: "Keep some options open",
        text: "You have $50. Your three essential expenses already cost $30. You may choose something you want, but finish with at least $10 still available.",
      },
      {
        kind: "requirements",
        title: "Your goal",
        items: [
          "Keep all required essentials",
          "Spend no more than $40 total",
          "Finish with at least $10 available",
        ],
      },
      {
        kind: "table",
        title: "Your choices",
        columns: ["Choose", "Item", "Type", "Price"],
        rows: [
          ["✓", "School supplies", "Required", "$12.00"],
          ["✓", "Lunch", "Required", "$10.00"],
          ["✓", "Bus fare", "Required", "$8.00"],
          ["☐", "New shirt", "Optional", "$20.00"],
          ["☐", "Movie and snacks", "Optional", "$18.00"],
          ["☐", "New game", "Optional", "$15.00"],
          ["☐", "Special drink", "Optional", "$5.00"],
        ],
      },
      {
        kind: "calculations",
        title: "Finish your plan",
        rows: [
          "Money available: $50.00",
          "Money spent",
          "Money kept available",
        ],
      },
      {
        kind: "prompt",
        title: "Think about it",
        text: "Why can leaving money unspent be a complete financial decision instead of an unfinished budget?",
        lines: 4,
      },
    ],
  },
  {
    id: "overspending",
    number: 6,
    title: "What Happens When You Overspend?",
    duration: "10–15 min",
    subtitle: "See what happens when a plan costs more money than you have.",
    sections: [
      {
        kind: "instructions",
        title: "The problem",
        text: "You have $80, but the starting plan costs $100. Before repairing it, think about what overspending can do.",
      },
      {
        kind: "multiple-choice",
        title: "Choose one answer",
        question: "What can happen if you spend the full $100 anyway?",
        options: [
          "Nothing changes",
          "You may use future money or owe a fee",
          "You automatically receive more money",
        ],
      },
      {
        kind: "table",
        title: "Starting plan",
        columns: ["Starting", "Item", "Type", "Price"],
        rows: [
          ["✓", "Lunch groceries", "Required", "$25.00"],
          ["✓", "Bus pass", "Required", "$20.00"],
          ["✓", "Save $15", "Savings", "$15.00"],
          ["✓", "New game", "Want", "$30.00"],
          ["✓", "Extra snacks", "Want", "$10.00"],
        ],
      },
      {
        kind: "instructions",
        title: "Repair the plan",
        text: "Required expenses must stay. Change wants or savings until the plan is within $80, and keep at least $10 saved.",
      },
      {
        kind: "table",
        title: "Make your new plan",
        columns: ["Keep?", "Item", "Type", "Price"],
        rows: [
          ["✓", "Lunch groceries", "Required", "$25.00"],
          ["✓", "Bus pass", "Required", "$20.00"],
          ["☐ $15  ☐ $10", "Savings", "Choose one", "$15 / $10"],
          ["☐", "New game", "Want", "$30.00"],
          ["☐", "Extra snacks", "Want", "$10.00"],
        ],
      },
      {
        kind: "calculations",
        title: "Check your repaired plan",
        rows: [
          "Money available: $80.00",
          "New total",
          "Savings",
          "Money remaining",
        ],
      },
      {
        kind: "prompt",
        title: "Think about it",
        text: "If you borrow to cover a shortage, how can that reduce the money you have available in the future?",
        lines: 4,
      },
    ],
  },
];

export function getStudentWorksheet(lessonId: string | undefined) {
  return STUDENT_WORKSHEETS.find((worksheet) => worksheet.id === lessonId);
}
