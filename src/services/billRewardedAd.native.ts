const ADS_ENABLED = false;

export async function showBillRewardedAd(): Promise<boolean> {
  if (!ADS_ENABLED) {
    return false;
  }

  const {
    default: mobileAds,
    AdEventType,
    RewardedAd,
    RewardedAdEventType,
    TestIds,
  } = await import("react-native-google-mobile-ads");

  await mobileAds().initialize();

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
