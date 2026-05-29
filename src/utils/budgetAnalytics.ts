// Save as: src/utils/budgetAnalytics.ts

type CaptureFn =
  | ((eventName: string, properties?: Record<string, unknown>) => void)
  | undefined;

type EditorAnalyticsSnapshot = {
  itemCount: number;
  salesTaxEnabled: boolean;
  totalSpent?: number;
};

export function trackTutorialStarted(capture: CaptureFn) {
  capture?.("tutorial_started", {
    tutorialVersion: "budget_v2",
    source: "budget_screen",
  });
}

export function trackTutorialCompleted(
  capture: CaptureFn,
  snapshot: EditorAnalyticsSnapshot,
) {
  capture?.("tutorial_completed", {
    tutorialVersion: "budget_v2",
    itemCount: snapshot.itemCount,
    salesTaxEnabled: snapshot.salesTaxEnabled,
  });
}

export function trackTutorialSkipped(
  capture: CaptureFn,
  step: string,
  snapshot: EditorAnalyticsSnapshot,
) {
  capture?.("tutorial_skipped", {
    tutorialVersion: "budget_v2",
    step,
    itemCount: snapshot.itemCount,
    salesTaxEnabled: snapshot.salesTaxEnabled,
  });
}

export function trackTutorialStepCompleted(capture: CaptureFn, step: string) {
  capture?.("tutorial_step_completed", {
    tutorialVersion: "budget_v2",
    step,
  });
}

export function trackSalesTaxChanged(
  capture: CaptureFn,
  enabled: boolean,
  snapshot: EditorAnalyticsSnapshot,
) {
  capture?.(enabled ? "sales_tax_enabled" : "sales_tax_disabled", {
    itemCount: snapshot.itemCount,
    totalSpent: snapshot.totalSpent,
  });
}

export function trackItemAdded(
  capture: CaptureFn,
  data: {
    existingItems: number;
    salesTaxEnabled: boolean;
    hasName: boolean;
    hasAmount: boolean;
    quantity: number;
  },
) {
  capture?.("item_added", data);
}

export function trackItemDeleted(
  capture: CaptureFn,
  data: {
    itemCountBeforeDelete: number;
    itemCountAfterDelete: number;
    salesTaxEnabled: boolean;
  },
) {
  capture?.("item_deleted", data);
}

export function trackItemEdited(
  capture: CaptureFn,
  data: {
    itemCount: number;
    source: string;
  },
) {
  capture?.("item_edited", data);
}

export function trackReceiptEdited(
  capture: CaptureFn,
  snapshot: Required<EditorAnalyticsSnapshot>,
) {
  capture?.("receipt_edited", {
    itemCount: snapshot.itemCount,
    salesTaxEnabled: snapshot.salesTaxEnabled,
    totalSpent: snapshot.totalSpent,
  });
}
