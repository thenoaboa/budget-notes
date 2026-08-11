import { useEffect, useRef, useState } from "react";
import {
    Alert,
    InputAccessoryView,
    Keyboard,
    KeyboardAvoidingView,
    Modal,
    Platform,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    View,
} from "react-native";

import {
    clearQuickShopDraft,
    loadQuickShopDraft,
    saveQuickShopDraft,
} from "../storage/budgetStorage";

type QuickShopModalProps = {
  visible: boolean;
  onClose: () => void;
  onSave: (prices: string[]) => void | Promise<void>;
  onDiscard: (prices: string[]) => void | Promise<void>;
};

const INPUT_ACCESSORY_ID = "quick-shop-number-pad";

export function QuickShopModal({
  visible,
  onClose,
  onSave,
  onDiscard,
}: QuickShopModalProps) {
  const inputRef = useRef<TextInput>(null);
  const scrollRef = useRef<ScrollView>(null);

  const [prices, setPrices] = useState<string[]>([]);
  const [currentDigits, setCurrentDigits] = useState("");
  const [draftReady, setDraftReady] = useState(false);

  useEffect(() => {
    if (!visible) {
      setDraftReady(false);
      return;
    }

    let cancelled = false;

    async function loadDraft() {
      setDraftReady(false);

      const savedDraft = await loadQuickShopDraft();

      if (cancelled) {
        return;
      }

      setPrices(savedDraft.prices);
      setCurrentDigits(savedDraft.currentDigits);
      setDraftReady(true);
    }

    void loadDraft();

    return () => {
      cancelled = true;
    };
  }, [visible]);

  useEffect(() => {
    if (!visible || !draftReady) {
      return;
    }

    void saveQuickShopDraft({
      prices,
      currentDigits,
    });
  }, [prices, currentDigits, visible, draftReady]);

  useEffect(() => {
    if (!visible || !draftReady) {
      return;
    }

    const timer = setTimeout(() => {
      inputRef.current?.focus();
    }, 300);

    return () => clearTimeout(timer);
  }, [visible, draftReady]);

  function digitsToAmount(digits: string) {
    if (!digits) {
      return "0.00";
    }

    const numericValue = Number(digits) / 100;

    return numericValue.toFixed(2);
  }

  function formatMoney(amount: string) {
    const value = Number(amount);

    if (!Number.isFinite(value)) {
      return "$0.00";
    }

    return value.toLocaleString("en-US", {
      style: "currency",
      currency: "USD",
    });
  }

  const currentAmount = digitsToAmount(currentDigits);

  const total = prices.reduce((sum, price) => {
    const value = Number(price);

    return sum + (Number.isFinite(value) ? value : 0);
  }, 0);

  function handleChangeText(value: string) {
    const digitsOnly = value.replace(/\D/g, "");

    setCurrentDigits(digitsOnly);
  }

  function addCurrentPrice() {
    if (!currentDigits) {
      return;
    }

    const amount = digitsToAmount(currentDigits);

    setPrices((current) => [...current, amount]);
    setCurrentDigits("");

    requestAnimationFrame(() => {
      inputRef.current?.focus();

      scrollRef.current?.scrollToEnd({
        animated: true,
      });
    });
  }

  function removeLastPrice() {
    if (currentDigits) {
      setCurrentDigits("");
      inputRef.current?.focus();
      return;
    }

    setPrices((current) => current.slice(0, -1));

    requestAnimationFrame(() => {
      inputRef.current?.focus();
    });
  }

  async function handleSave() {
    const finalPrices =
      currentDigits.length > 0
        ? [...prices, digitsToAmount(currentDigits)]
        : prices;

    if (finalPrices.length === 0) {
      return;
    }

    Keyboard.dismiss();

    async function confirmSave() {
      await onSave(finalPrices);
      await clearQuickShopDraft();

      setPrices([]);
      setCurrentDigits("");
    }

    if (Platform.OS === "web") {
      const confirmed = window.confirm(
        "Save as Budget?\n\nThis will turn your Quick Shop into a regular Budget Note. You can rename the items afterward.",
      );

      if (confirmed) {
        await confirmSave();
      }

      return;
    }

    Alert.alert(
      "Save as Budget?",
      "This will turn your Quick Shop into a regular Budget Note. You can rename the items afterward.",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Save as Budget",
          onPress: () => {
            void confirmSave();
          },
        },
      ],
    );
  }

  async function handleDiscard() {
    const finalPrices =
      currentDigits.length > 0
        ? [...prices, digitsToAmount(currentDigits)]
        : prices;

    if (finalPrices.length === 0) {
      return;
    }

    Keyboard.dismiss();

    await onDiscard(finalPrices);
    await clearQuickShopDraft();

    setPrices([]);
    setCurrentDigits("");
  }

  function handleClose() {
    Keyboard.dismiss();
    onClose();
  }

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={() => {
        Keyboard.dismiss();
      }}
    >
      <KeyboardAvoidingView
        style={styles.backdrop}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <Pressable
          style={styles.backdropPressArea}
          onPress={Keyboard.dismiss}
        />

        <Pressable style={styles.modalCard} onPress={Keyboard.dismiss}>
          <View style={styles.header}>
            <View>
              <Text style={styles.title}>Quick Shop</Text>
              <Text style={styles.subtitle}>Enter prices as you shop.</Text>
            </View>

            <Pressable
              style={({ pressed }) => [
                styles.closeButton,
                pressed && styles.pressed,
              ]}
              onPress={handleClose}
              accessibilityRole="button"
              accessibilityLabel="Close Quick Shop"
            >
              <Text style={styles.closeButtonText}>×</Text>
            </Pressable>
          </View>

          <View style={styles.receipt}>
            <Text style={styles.receiptTitle}>RECEIPT</Text>

            <View style={styles.receiptDivider} />

            <ScrollView
              ref={scrollRef}
              style={styles.receiptScroll}
              contentContainerStyle={styles.receiptContent}
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
            >
              {prices.map((price, index) => (
                <View style={styles.priceRow} key={`${price}-${index}`}>
                  <Text style={styles.priceNumber}>
                    {String(index + 1).padStart(2, "0")}
                  </Text>

                  <Text style={styles.priceText}>{formatMoney(price)}</Text>
                </View>
              ))}
            </ScrollView>

            <Pressable
              style={styles.activePriceRow}
              onPress={() => inputRef.current?.focus()}
            >
              <Text style={styles.activeIndicator}>›</Text>

              <Text style={styles.activePrice}>
                {currentDigits ? formatMoney(currentAmount) : "$0.00"}
              </Text>

              <View style={styles.cursor} />
            </Pressable>

            <View style={styles.totalDivider} />

            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>TOTAL</Text>

              <Text style={styles.totalAmount}>
                {formatMoney(
                  (total + (currentDigits ? Number(currentAmount) : 0)).toFixed(
                    2,
                  ),
                )}
              </Text>
            </View>
          </View>

          <View style={styles.helperRow}>
            <Text style={styles.helperText}>Type 489 for $4.89</Text>

            {prices.length > 0 || currentDigits ? (
              <Pressable
                onPress={removeLastPrice}
                style={({ pressed }) => pressed && styles.pressed}
              >
                <Text style={styles.undoText}>Undo</Text>
              </Pressable>
            ) : null}
          </View>

          <View style={styles.actionRow}>
            <Pressable
              disabled={prices.length === 0 && !currentDigits}
              style={({ pressed }) => [
                styles.discardButton,
                prices.length === 0 &&
                  !currentDigits &&
                  styles.discardButtonDisabled,
                pressed &&
                  (prices.length > 0 || currentDigits) &&
                  styles.pressed,
              ]}
              onPress={handleDiscard}
            >
              <Text style={styles.discardButtonText}>Discard</Text>
            </Pressable>

            <Pressable
              disabled={prices.length === 0 && !currentDigits}
              style={({ pressed }) => [
                styles.saveButton,
                prices.length === 0 &&
                  !currentDigits &&
                  styles.saveButtonDisabled,
                pressed &&
                  (prices.length > 0 || currentDigits) &&
                  styles.pressed,
              ]}
              onPress={handleSave}
            >
              <Text style={styles.saveButtonText}>Save as Budget</Text>
            </Pressable>
          </View>

          <TextInput
            ref={inputRef}
            value={currentDigits}
            onChangeText={handleChangeText}
            keyboardType={Platform.OS === "web" ? "default" : "number-pad"}
            inputMode={Platform.OS === "web" ? "numeric" : undefined}
            returnKeyType="next"
            enterKeyHint="next"
            blurOnSubmit={false}
            onSubmitEditing={addCurrentPrice}
            onBlur={() => {
              if (Platform.OS === "web" && currentDigits) {
                addCurrentPrice();

                setTimeout(() => {
                  inputRef.current?.focus();
                }, 50);
              }
            }}
            inputAccessoryViewID={
              Platform.OS === "ios" ? INPUT_ACCESSORY_ID : undefined
            }
            style={styles.hiddenInput}
            caretHidden
            contextMenuHidden
            maxLength={9}
          />
        </Pressable>

        {Platform.OS === "ios" && (
          <InputAccessoryView nativeID={INPUT_ACCESSORY_ID}>
            <View style={styles.keyboardAccessory}>
              <Text style={styles.keyboardHint}>Next price</Text>

              <Pressable
                style={({ pressed }) => [
                  styles.returnButton,
                  !currentDigits && styles.returnButtonDisabled,
                  pressed && currentDigits.length > 0 && styles.pressed,
                ]}
                disabled={!currentDigits}
                onPress={addCurrentPrice}
                accessibilityRole="button"
                accessibilityLabel="Add price and enter next price"
              >
                <Text style={styles.returnButtonText}>↵</Text>
              </Pressable>
            </View>
          </InputAccessoryView>
        )}
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: 18,
  },

  backdropPressArea: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0, 0, 0, 0.72)",
  },

  modalCard: {
    backgroundColor: "#182638",
    borderRadius: 24,
    borderWidth: 1,
    borderColor: "#344657",
    padding: 18,
    maxHeight: "88%",
    minHeight: 0,
  },

  header: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    marginBottom: 16,
  },

  title: {
    color: "#FFFFFF",
    fontSize: 24,
    fontWeight: "900",
  },

  subtitle: {
    color: "#8A98A8",
    fontSize: 14,
    fontWeight: "700",
    marginTop: 3,
  },

  closeButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#243342",
    borderWidth: 1,
    borderColor: "#3B4D5F",
    alignItems: "center",
    justifyContent: "center",
  },

  closeButtonText: {
    color: "#CAD3DD",
    fontSize: 26,
    fontWeight: "700",
    lineHeight: 28,
  },

  receipt: {
    backgroundColor: "#F4F0E8",
    borderRadius: 18,
    paddingHorizontal: 18,
    paddingTop: 18,
    paddingBottom: 16,
    flexShrink: 1,
    minHeight: 220,
  },

  receiptTitle: {
    color: "#554D61",
    fontSize: 13,
    fontWeight: "900",
    letterSpacing: 2,
    textAlign: "center",
  },

  receiptDivider: {
    height: 1,
    backgroundColor: "#CFC7D8",
    marginTop: 13,
    marginBottom: 8,
  },

  receiptScroll: {
    flexGrow: 1,
    flexShrink: 1,
    minHeight: 70,
  },

  receiptContent: {
    paddingVertical: 5,
    flexGrow: 1,
    justifyContent: "flex-end",
  },

  priceRow: {
    flexDirection: "row",
    alignItems: "center",
    minHeight: 35,
  },

  priceNumber: {
    width: 32,
    color: "#AAA2B2",
    fontSize: 12,
    fontWeight: "800",
  },

  priceText: {
    color: "#312A38",
    fontSize: 20,
    fontWeight: "800",
    fontVariant: ["tabular-nums"],
  },

  activePriceRow: {
    minHeight: 42,
    flexDirection: "row",
    alignItems: "center",
    marginTop: 4,
    flexShrink: 0,
  },

  activeIndicator: {
    width: 32,
    color: "#9B5DE5",
    fontSize: 24,
    fontWeight: "900",
  },

  activePrice: {
    color: "#6F35B5",
    fontSize: 22,
    fontWeight: "900",
    fontVariant: ["tabular-nums"],
  },

  cursor: {
    width: 3,
    height: 24,
    borderRadius: 2,
    backgroundColor: "#9B5DE5",
    marginLeft: 3,
  },

  totalDivider: {
    height: 1,
    backgroundColor: "#AAA2B2",
    marginTop: 6,
    marginBottom: 14,
  },

  totalRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  totalLabel: {
    color: "#554D61",
    fontSize: 15,
    fontWeight: "900",
    letterSpacing: 1,
  },

  totalAmount: {
    color: "#6F35B5",
    fontSize: 26,
    fontWeight: "900",
    fontVariant: ["tabular-nums"],
  },

  helperRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 12,
    marginBottom: 14,
    paddingHorizontal: 2,
  },

  helperText: {
    color: "#8A98A8",
    fontSize: 12,
    fontWeight: "700",
  },

  undoText: {
    color: "#B784F4",
    fontSize: 13,
    fontWeight: "900",
  },

  actionRow: {
    flexDirection: "row",
    gap: 10,
  },

  discardButton: {
    flex: 0.8,
    backgroundColor: "#243342",
    borderRadius: 15,
    borderWidth: 1,
    borderColor: "#3B4D5F",
    paddingVertical: 14,
    alignItems: "center",
    justifyContent: "center",
  },

  discardButtonDisabled: {
    opacity: 0.35,
  },

  discardButtonText: {
    color: "#CAD3DD",
    fontSize: 14,
    fontWeight: "900",
  },

  saveButton: {
    flex: 1.2,
    backgroundColor: "#2ECC71",
    borderRadius: 15,
    paddingVertical: 14,
    alignItems: "center",
    justifyContent: "center",
  },

  saveButtonDisabled: {
    opacity: 0.35,
  },

  saveButtonText: {
    color: "#101820",
    fontSize: 14,
    fontWeight: "900",
  },

  hiddenInput: {
    position: "absolute",
    width: 1,
    height: 1,
    opacity: 0.01,
    bottom: 0,
    left: 0,
  },

  keyboardAccessory: {
    backgroundColor: "#182638",
    borderTopWidth: 1,
    borderTopColor: "#344657",
    paddingHorizontal: 14,
    paddingVertical: 8,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  keyboardHint: {
    color: "#8A98A8",
    fontSize: 13,
    fontWeight: "800",
  },

  returnButton: {
    width: 58,
    height: 38,
    borderRadius: 12,
    backgroundColor: "#9B5DE5",
    alignItems: "center",
    justifyContent: "center",
  },

  returnButtonDisabled: {
    opacity: 0.35,
  },

  returnButtonText: {
    color: "#FFFFFF",
    fontSize: 24,
    fontWeight: "900",
    lineHeight: 25,
  },

  pressed: {
    opacity: 0.7,
  },
});
