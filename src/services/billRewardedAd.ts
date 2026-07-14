import mobileAds, {
  AdEventType,
  RewardedAd,
  RewardedAdEventType,
  TestIds,
} from "react-native-google-mobile-ads";

let initializationPromise: Promise<unknown> | null = null;

async function initializeAds(): Promise<void> {
  if (!initializationPromise) {
    initializationPromise = mobileAds().initialize();
  }

  await initializationPromise;
}

export async function showBillRewardedAd(): Promise<boolean> {
  await initializeAds();

  // Keep Google's rewarded test unit while developing.
  // Replace this with your own rewarded ad-unit ID before release.
  const rewardedAd = RewardedAd.createForAdRequest(TestIds.REWARDED, {
    requestNonPersonalizedAdsOnly: true,
  });

  return new Promise<boolean>((resolve) => {
    let rewardEarned = false;
    let settled = false;

    const finish = (earned: boolean) => {
      if (settled) {
        return;
      }

      settled = true;
      clearTimeout(timeout);
      unsubscribeLoaded();
      unsubscribeRewarded();
      unsubscribeClosed();
      unsubscribeError();
      resolve(earned);
    };

    const unsubscribeLoaded = rewardedAd.addAdEventListener(
      RewardedAdEventType.LOADED,
      () => {
        void rewardedAd.show();
      },
    );

    const unsubscribeRewarded = rewardedAd.addAdEventListener(
      RewardedAdEventType.EARNED_REWARD,
      () => {
        rewardEarned = true;
      },
    );

    const unsubscribeClosed = rewardedAd.addAdEventListener(
      AdEventType.CLOSED,
      () => {
        finish(rewardEarned);
      },
    );

    const unsubscribeError = rewardedAd.addAdEventListener(
      AdEventType.ERROR,
      (error) => {
        console.warn("Rewarded ad failed:", error);
        finish(false);
      },
    );

    const timeout = setTimeout(() => {
      finish(false);
    }, 30000);

    rewardedAd.load();
  });
}
