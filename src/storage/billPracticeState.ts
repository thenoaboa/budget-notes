import AsyncStorage from "@react-native-async-storage/async-storage";

export const MAX_PRACTICE_COINS = 6;

export type BillPracticeState = {
  coinsRemaining: number;
};

const STORAGE_KEY = "budget-note-bill-practice-state";

export const EMPTY_PRACTICE_STATE: BillPracticeState = {
  coinsRemaining: MAX_PRACTICE_COINS,
};

function normalizeCoins(value: unknown): number {
  if (typeof value !== "number" || !Number.isFinite(value)) {
    return MAX_PRACTICE_COINS;
  }

  return Math.min(MAX_PRACTICE_COINS, Math.max(0, Math.floor(value)));
}

export async function getBillPracticeState(): Promise<BillPracticeState> {
  try {
    const saved = await AsyncStorage.getItem(STORAGE_KEY);

    if (!saved) {
      return { ...EMPTY_PRACTICE_STATE };
    }

    const parsed = JSON.parse(saved) as Partial<BillPracticeState>;

    return {
      coinsRemaining: normalizeCoins(parsed.coinsRemaining),
    };
  } catch (error) {
    console.warn("Unable to load Bill practice state:", error);
    return { ...EMPTY_PRACTICE_STATE };
  }
}

export async function saveBillPracticeCoins(
  coinsRemaining: number,
): Promise<BillPracticeState> {
  const next: BillPracticeState = {
    coinsRemaining: normalizeCoins(coinsRemaining),
  };

  try {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  } catch (error) {
    console.warn("Unable to save Bill practice coins:", error);
  }

  return next;
}

export async function spendBillPracticeCoin(): Promise<BillPracticeState> {
  const current = await getBillPracticeState();
  return saveBillPracticeCoins(current.coinsRemaining - 1);
}

export async function resetBillPracticeCoins(): Promise<BillPracticeState> {
  return saveBillPracticeCoins(MAX_PRACTICE_COINS);
}
