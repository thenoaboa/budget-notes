import AsyncStorage from "@react-native-async-storage/async-storage";

export const MAX_PRACTICE_COINS = 3;
export const PRACTICE_COIN_RECHARGE_MS = 30 * 60 * 1000;

export type BillPracticeState = {
  coinsRemaining: number;
  rechargeStartedAt: number | null;
  nextCoinAt: number | null;
  fullRechargeAt: number | null;
};

type StoredBillPracticeState = {
  coinsRemaining: number;
  rechargeStartedAt: number | null;
};

const STORAGE_KEY = "budget-note-bill-practice-state";

export const EMPTY_PRACTICE_STATE: BillPracticeState = {
  coinsRemaining: MAX_PRACTICE_COINS,
  rechargeStartedAt: null,
  nextCoinAt: null,
  fullRechargeAt: null,
};

function normalizeCoins(value: unknown): number {
  if (typeof value !== "number" || !Number.isFinite(value)) {
    return MAX_PRACTICE_COINS;
  }

  return Math.min(MAX_PRACTICE_COINS, Math.max(0, Math.floor(value)));
}

function normalizeTimestamp(value: unknown): number | null {
  if (typeof value !== "number" || !Number.isFinite(value) || value <= 0) {
    return null;
  }

  return value;
}

function buildPracticeState(
  coinsRemaining: number,
  rechargeStartedAt: number | null,
): BillPracticeState {
  if (coinsRemaining >= MAX_PRACTICE_COINS) {
    return {
      coinsRemaining: MAX_PRACTICE_COINS,
      rechargeStartedAt: null,
      nextCoinAt: null,
      fullRechargeAt: null,
    };
  }

  const effectiveStart = rechargeStartedAt ?? Date.now();
  const coinsNeeded = MAX_PRACTICE_COINS - coinsRemaining;

  return {
    coinsRemaining,
    rechargeStartedAt: effectiveStart,
    nextCoinAt: effectiveStart + PRACTICE_COIN_RECHARGE_MS,
    fullRechargeAt: effectiveStart + coinsNeeded * PRACTICE_COIN_RECHARGE_MS,
  };
}

async function saveStoredState(state: StoredBillPracticeState): Promise<void> {
  try {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (error) {
    console.warn("Unable to save Bill practice state:", error);
  }
}

function applyRecharge(
  stored: StoredBillPracticeState,
  now: number,
): StoredBillPracticeState {
  const coinsRemaining = normalizeCoins(stored.coinsRemaining);

  if (coinsRemaining >= MAX_PRACTICE_COINS) {
    return {
      coinsRemaining: MAX_PRACTICE_COINS,
      rechargeStartedAt: null,
    };
  }

  const rechargeStartedAt = normalizeTimestamp(stored.rechargeStartedAt) ?? now;

  const elapsed = Math.max(0, now - rechargeStartedAt);
  const coinsEarned = Math.floor(elapsed / PRACTICE_COIN_RECHARGE_MS);

  if (coinsEarned <= 0) {
    return {
      coinsRemaining,
      rechargeStartedAt,
    };
  }

  const nextCoins = Math.min(MAX_PRACTICE_COINS, coinsRemaining + coinsEarned);

  if (nextCoins >= MAX_PRACTICE_COINS) {
    return {
      coinsRemaining: MAX_PRACTICE_COINS,
      rechargeStartedAt: null,
    };
  }

  return {
    coinsRemaining: nextCoins,
    rechargeStartedAt:
      rechargeStartedAt + coinsEarned * PRACTICE_COIN_RECHARGE_MS,
  };
}

export async function getBillPracticeState(): Promise<BillPracticeState> {
  const now = Date.now();

  try {
    const saved = await AsyncStorage.getItem(STORAGE_KEY);

    if (!saved) {
      return { ...EMPTY_PRACTICE_STATE };
    }

    const parsed = JSON.parse(saved) as Partial<StoredBillPracticeState>;

    const refreshed = applyRecharge(
      {
        coinsRemaining: normalizeCoins(parsed.coinsRemaining),
        rechargeStartedAt: normalizeTimestamp(parsed.rechargeStartedAt),
      },
      now,
    );

    await saveStoredState(refreshed);

    return buildPracticeState(
      refreshed.coinsRemaining,
      refreshed.rechargeStartedAt,
    );
  } catch (error) {
    console.warn("Unable to load Bill practice state:", error);
    return { ...EMPTY_PRACTICE_STATE };
  }
}

export async function spendBillPracticeCoin(): Promise<BillPracticeState> {
  const current = await getBillPracticeState();

  if (current.coinsRemaining <= 0) {
    return current;
  }

  const nextCoins = current.coinsRemaining - 1;
  const rechargeStartedAt = current.rechargeStartedAt ?? Date.now();

  const stored: StoredBillPracticeState = {
    coinsRemaining: nextCoins,
    rechargeStartedAt,
  };

  await saveStoredState(stored);

  return buildPracticeState(stored.coinsRemaining, stored.rechargeStartedAt);
}

export async function addBillPracticeCoin(
  amount = 1,
): Promise<BillPracticeState> {
  const current = await getBillPracticeState();

  const nextCoins = Math.min(
    MAX_PRACTICE_COINS,
    current.coinsRemaining + Math.max(0, Math.floor(amount)),
  );

  const rechargeStartedAt =
    nextCoins >= MAX_PRACTICE_COINS
      ? null
      : (current.rechargeStartedAt ?? Date.now());

  const stored: StoredBillPracticeState = {
    coinsRemaining: nextCoins,
    rechargeStartedAt,
  };

  await saveStoredState(stored);

  return buildPracticeState(stored.coinsRemaining, stored.rechargeStartedAt);
}

export async function resetBillPracticeCoins(): Promise<BillPracticeState> {
  const stored: StoredBillPracticeState = {
    coinsRemaining: MAX_PRACTICE_COINS,
    rechargeStartedAt: null,
  };

  await saveStoredState(stored);

  return { ...EMPTY_PRACTICE_STATE };
}
