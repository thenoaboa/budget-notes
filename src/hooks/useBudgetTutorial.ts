// Save as: src/hooks/useBudgetTutorial.ts

import AsyncStorage from "@react-native-async-storage/async-storage";
import { useEffect, useRef, useState } from "react";

import {
  trackTutorialCompleted,
  trackTutorialSkipped,
  trackTutorialStarted,
} from "../utils/budgetAnalytics";

export type TutorialStep =
  | "hidden"
  | "budgetPopup"
  | "budgetHighlight"
  | "addItemPopup"
  | "addItemHighlight"
  | "donePopup";

const TUTORIAL_STORAGE_KEY = "budget-note-tutorial-complete-v2";

type CaptureFn = ((eventName: string, properties?: any) => void) | undefined;

type Snapshot = {
  itemCount: number;
  salesTaxEnabled: boolean;
};

export function useBudgetTutorial(
  capture: CaptureFn,
  getSnapshot: () => Snapshot,
) {
  const [tutorialStep, setTutorialStep] = useState<TutorialStep>("hidden");

  const hasCheckedTutorialRef = useRef(false);

  useEffect(() => {
    if (hasCheckedTutorialRef.current) return;

    hasCheckedTutorialRef.current = true;

    async function loadTutorial() {
      const completed = await AsyncStorage.getItem(TUTORIAL_STORAGE_KEY);

      if (!completed) {
        trackTutorialStarted(capture);
        setTutorialStep("budgetPopup");
      }
    }

    loadTutorial();
  }, []);

  async function completeTutorial() {
    trackTutorialCompleted(capture, getSnapshot());

    await AsyncStorage.setItem(TUTORIAL_STORAGE_KEY, "true");

    setTutorialStep("hidden");
  }

  async function skipTutorial() {
    trackTutorialSkipped(capture, tutorialStep, getSnapshot());

    await AsyncStorage.setItem(TUTORIAL_STORAGE_KEY, "true");

    setTutorialStep("hidden");
  }

  return {
    tutorialStep,
    setTutorialStep,
    completeTutorial,
    skipTutorial,
  };
}
