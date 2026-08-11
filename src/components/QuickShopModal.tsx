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

import AsyncStorage from "@react-native-async-storage/async-storage";
import { Swipeable } from "react-native-gesture-handler";
import {
    clearQuickShopDraft,
    loadQuickShopDraft,
    saveQuickShopDraft,
    type QuickShopItem,
} from "../storage/budgetStorage";

type QuickShopModalProps = {
  visible: boolean;
  onClose: () => void;
  onSave: (prices: string[]) => void | Promise<void>;
  onDiscard: (prices: string[]) => void | Promise<void>;
};

const INPUT_ACCESSORY_ID = "quick-shop-number-pad";
const QUICK_SHOP_HISTORY_KEY = "quick-shop-history-v1";
const QUICK_SHOP_TAX_KEY = "quick-shop-tax-v1";

type QuickShopHistoryEntry = {
  id: string;
  createdAt: string;
  items: QuickShopItem[];
  subtotal?: number;
  taxEnabled?: boolean;
  taxRate?: number;
  total: number;
};

export function QuickShopModal({
  visible,
  onClose,
  onSave,
  onDiscard,
}: QuickShopModalProps) {
  const inputRef = useRef<TextInput>(null);
  const scrollRef = useRef<ScrollView>(null);

  const [items, setItems] = useState<QuickShopItem[]>([]);
  const [currentDigits, setCurrentDigits] = useState("");
  const [editingItemId, setEditingItemId] = useState<string | null>(null);

  const [lastEdit, setLastEdit] = useState<{
    itemId: string;
    previousAmount: string;
  } | null>(null);

  const [lastDeleted, setLastDeleted] = useState<{
    item: QuickShopItem;
    index: number;
  } | null>(null);

  const [replaceOnNextDigit, setReplaceOnNextDigit] = useState(false);
  const [draftReady, setDraftReady] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [history, setHistory] = useState<QuickShopHistoryEntry[]>([]);
  const [selectedHistoryId, setSelectedHistoryId] = useState<string | null>(
    null,
  );

  const [taxEnabled, setTaxEnabled] = useState(true);
  const [taxRate, setTaxRate] = useState("8.25");
  const [showTaxEditor, setShowTaxEditor] = useState(false);

  async function loadHistory() {
    try {
      const raw = await AsyncStorage.getItem(QUICK_SHOP_HISTORY_KEY);
      const parsed = raw ? JSON.parse(raw) : [];
      setHistory(Array.isArray(parsed) ? parsed : []);
    } catch {
      setHistory([]);
    }
  }

  async function loadTaxSettings() {
    try {
      const raw = await AsyncStorage.getItem(QUICK_SHOP_TAX_KEY);

      if (!raw) {
        return;
      }

      const parsed = JSON.parse(raw);

      if (typeof parsed?.enabled === "boolean") {
        setTaxEnabled(parsed.enabled);
      }

      if (
        typeof parsed?.rate === "number" &&
        Number.isFinite(parsed.rate) &&
        parsed.rate >= 0
      ) {
        setTaxRate(String(parsed.rate));
      }
    } catch {
      // Keep the defaults if saved tax settings cannot be read.
    }
  }

  async function saveTaxSettings(enabled: boolean, rateText: string) {
    const parsedRate = Number(rateText);

    await AsyncStorage.setItem(
      QUICK_SHOP_TAX_KEY,
      JSON.stringify({
        enabled,
        rate: Number.isFinite(parsedRate) && parsedRate >= 0 ? parsedRate : 0,
      }),
    );
  }

  async function writeHistory(nextHistory: QuickShopHistoryEntry[]) {
    setHistory(nextHistory);
    await AsyncStorage.setItem(
      QUICK_SHOP_HISTORY_KEY,
      JSON.stringify(nextHistory),
    );
  }

  async function addToHistory(historyItems: QuickShopItem[]) {
    if (historyItems.length === 0) return;

    const historySubtotal = historyItems.reduce((sum, item) => {
      const value = Number(item.amount);
      return sum + (Number.isFinite(value) ? value : 0);
    }, 0);

    const numericTaxRate = Number(taxRate);
    const safeTaxRate =
      Number.isFinite(numericTaxRate) && numericTaxRate >= 0
        ? numericTaxRate
        : 0;
    const historyTaxAmount = taxEnabled
      ? historySubtotal * (safeTaxRate / 100)
      : 0;

    const entry: QuickShopHistoryEntry = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      createdAt: new Date().toISOString(),
      items: historyItems,
      subtotal: historySubtotal,
      taxEnabled,
      taxRate: safeTaxRate,
      total: historySubtotal + historyTaxAmount,
    };

    await writeHistory([entry, ...history]);
  }

  async function deleteHistoryEntry(entryId: string) {
    const nextHistory = history.filter((entry) => entry.id !== entryId);
    await writeHistory(nextHistory);

    if (selectedHistoryId === entryId) {
      setSelectedHistoryId(null);
    }
  }

  function formatHistoryDate(isoDate: string) {
    const date = new Date(isoDate);
    const now = new Date();
    const sameDay = date.toDateString() === now.toDateString();

    if (sameDay) {
      return `Today · ${date.toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
      })}`;
    }

    return date.toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
  }

  useEffect(() => {
    if (!visible) {
      setDraftReady(false);
      setEditingItemId(null);
      return;
    }

    let cancelled = false;

    async function loadDraft() {
      setDraftReady(false);
      setShowHistory(false);
      setSelectedHistoryId(null);
      setShowTaxEditor(false);
      await Promise.all([loadHistory(), loadTaxSettings()]);

      const savedDraft = await loadQuickShopDraft();

      if (cancelled) {
        return;
      }

      setItems(savedDraft.items);
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
      items,
      currentDigits,
    });
  }, [items, currentDigits, visible, draftReady]);

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

  const total = items.reduce((sum, item) => {
    const value = Number(item.amount);

    return sum + (Number.isFinite(value) ? value : 0);
  }, 0);

  const activeAmount =
    currentDigits && !editingItemId ? Number(currentAmount) : 0;

  const subtotal = total + (Number.isFinite(activeAmount) ? activeAmount : 0);

  const numericTaxRate = Number(taxRate);
  const safeTaxRate =
    Number.isFinite(numericTaxRate) && numericTaxRate >= 0 ? numericTaxRate : 0;

  const taxAmount = taxEnabled ? subtotal * (safeTaxRate / 100) : 0;
  const grandTotal = subtotal + taxAmount;

  function handleChangeText(value: string) {
    const digitsOnly = value.replace(/\D/g, "");

    if (editingItemId && replaceOnNextDigit) {
      // If the user entered a new digit, replace the loaded old price.
      if (digitsOnly.length > currentDigits.length) {
        const newDigits = digitsOnly.slice(currentDigits.length);

        setCurrentDigits(newDigits);
        setReplaceOnNextDigit(false);
        return;
      }

      // Backspace still edits the loaded value normally.
      setCurrentDigits(digitsOnly);
      return;
    }

    setCurrentDigits(digitsOnly);
  }

  function addCurrentPrice() {
    if (!currentDigits) {
      return;
    }

    const amount = digitsToAmount(currentDigits);

    if (editingItemId) {
      const itemBeingEdited = items.find((item) => item.id === editingItemId);

      if (itemBeingEdited) {
        setLastEdit({
          itemId: editingItemId,
          previousAmount: itemBeingEdited.amount,
        });
      }

      setLastDeleted(null);

      setItems((current) =>
        current.map((item) =>
          item.id === editingItemId
            ? {
                ...item,
                amount,
              }
            : item,
        ),
      );

      setEditingItemId(null);
      setReplaceOnNextDigit(false);
      setCurrentDigits("");

      requestAnimationFrame(() => {
        inputRef.current?.focus();
      });

      return;
    }

    setLastEdit(null);
    setLastDeleted(null);

    setItems((current) => [
      ...current,
      {
        id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        amount,
        inCart: false,
      },
    ]);

    setCurrentDigits("");

    requestAnimationFrame(() => {
      inputRef.current?.focus();

      scrollRef.current?.scrollToEnd({
        animated: true,
      });
    });
  }

  function startEditingItem(item: QuickShopItem) {
    const cents = Math.round(Number(item.amount) * 100);

    if (!Number.isFinite(cents)) {
      return;
    }

    // Must happen directly from the tap for iPhone Safari/PWA.
    inputRef.current?.focus();

    setEditingItemId(item.id);
    setCurrentDigits(String(cents));
    setReplaceOnNextDigit(true);
  }

  function removeLastPrice() {
    if (currentDigits) {
      setCurrentDigits("");
      setEditingItemId(null);
      setReplaceOnNextDigit(false);
      inputRef.current?.focus();
      return;
    }

    if (lastDeleted) {
      setItems((current) => {
        const restoredItems = [...current];
        const restoreIndex = Math.min(
          Math.max(lastDeleted.index, 0),
          restoredItems.length,
        );

        restoredItems.splice(restoreIndex, 0, lastDeleted.item);

        return restoredItems;
      });

      setLastDeleted(null);
      return;
    }

    if (lastEdit) {
      setItems((current) =>
        current.map((item) =>
          item.id === lastEdit.itemId
            ? {
                ...item,
                amount: lastEdit.previousAmount,
              }
            : item,
        ),
      );

      setLastEdit(null);
      return;
    }

    setItems((current) => current.slice(0, -1));

    requestAnimationFrame(() => {
      inputRef.current?.focus();
    });
  }

  function toggleItemInCart(itemId: string) {
    setItems((current) =>
      current.map((item) =>
        item.id === itemId
          ? {
              ...item,
              inCart: !item.inCart,
            }
          : item,
      ),
    );
  }

  function confirmDeleteItem(itemId: string) {
    const deleteConfirmedItem = () => {
      setItems((current) => {
        const deletedIndex = current.findIndex((item) => item.id === itemId);

        if (deletedIndex === -1) {
          return current;
        }

        const deletedItem = current[deletedIndex];

        setLastDeleted({
          item: deletedItem,
          index: deletedIndex,
        });

        // Deleting is now the most recent undoable action.
        setLastEdit(null);

        return current.filter((item) => item.id !== itemId);
      });

      if (editingItemId === itemId) {
        setEditingItemId(null);
        setReplaceOnNextDigit(false);
        setCurrentDigits("");
      }
    };

    if (Platform.OS === "web") {
      const confirmed = window.confirm("Delete this price?");

      if (confirmed) {
        deleteConfirmedItem();
      }

      return;
    }

    Alert.alert(
      "Delete price?",
      "Are you sure you want to remove this price from Quick Shop?",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Delete",
          style: "destructive",
          onPress: deleteConfirmedItem,
        },
      ],
    );
  }

  function renderLeftActions(item: QuickShopItem) {
    return (
      <View style={[styles.cartAction, item.inCart && styles.cartActionUndo]}>
        <Text
          style={[
            styles.cartActionText,
            item.inCart && styles.cartActionTextUndo,
          ]}
        >
          {item.inCart ? "Undo" : "Got It"}
        </Text>
      </View>
    );
  }

  function renderRightActions(itemId: string) {
    return (
      <Pressable
        style={styles.deleteAction}
        onPress={() => confirmDeleteItem(itemId)}
      >
        <Text style={styles.deleteActionText}>Delete</Text>
      </Pressable>
    );
  }

  async function handleSave() {
    const finalPrices =
      currentDigits.length > 0 && !editingItemId
        ? [...items.map((item) => item.amount), digitsToAmount(currentDigits)]
        : items.map((item) => item.amount);

    if (finalPrices.length === 0) {
      return;
    }

    Keyboard.dismiss();

    async function confirmSave() {
      await onSave(finalPrices);
      await clearQuickShopDraft();

      setItems([]);
      setCurrentDigits("");
      setEditingItemId(null);
      setLastEdit(null);
      setLastDeleted(null);
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
    const historyItems = [...items];

    if (currentDigits.length > 0 && !editingItemId) {
      historyItems.push({
        id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        amount: digitsToAmount(currentDigits),
        inCart: false,
      });
    }

    if (historyItems.length === 0) {
      return;
    }

    Keyboard.dismiss();

    // Discard now means: archive this Quick Shop in History, then clear the active shop.
    // It stays inside Quick Shop and does not send anything to Recently Deleted.
    await addToHistory(historyItems);
    await clearQuickShopDraft();

    setItems([]);
    setCurrentDigits("");
    setEditingItemId(null);
    setLastEdit(null);
    setLastDeleted(null);
    setReplaceOnNextDigit(false);

    requestAnimationFrame(() => {
      inputRef.current?.focus();
    });
  }

  async function restoreHistoryEntry(entry: QuickShopHistoryEntry) {
    const hasActiveQuickShop = items.length > 0 || currentDigits.length > 0;

    async function doRestore() {
      Keyboard.dismiss();

      // If Quick Shop currently has data, archive it to History before replacing it.
      const currentHistoryItems = [...items];

      if (currentDigits.length > 0 && !editingItemId) {
        currentHistoryItems.push({
          id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
          amount: digitsToAmount(currentDigits),
          inCart: false,
        });
      }

      if (currentHistoryItems.length > 0) {
        await addToHistory(currentHistoryItems);
      }

      const restoredItems = entry.items.map((item) => ({
        ...item,
        id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      }));

      setItems(restoredItems);
      setCurrentDigits("");
      setEditingItemId(null);

      if (typeof entry.taxEnabled === "boolean") {
        setTaxEnabled(entry.taxEnabled);
      }

      if (
        typeof entry.taxRate === "number" &&
        Number.isFinite(entry.taxRate) &&
        entry.taxRate >= 0
      ) {
        setTaxRate(String(entry.taxRate));
      }
      setLastEdit(null);
      setLastDeleted(null);
      setReplaceOnNextDigit(false);
      setSelectedHistoryId(null);
      setShowHistory(false);

      await saveQuickShopDraft({
        items: restoredItems,
        currentDigits: "",
      });

      requestAnimationFrame(() => {
        inputRef.current?.focus();
      });
    }

    if (!hasActiveQuickShop) {
      await doRestore();
      return;
    }

    const message =
      "Quick Shop already has prices in it. Your current Quick Shop will be saved to History before this one is restored.";

    if (Platform.OS === "web") {
      const confirmed = window.confirm(`Restore Quick Shop?\n\n${message}`);

      if (confirmed) {
        await doRestore();
      }

      return;
    }

    Alert.alert("Restore Quick Shop?", message, [
      {
        text: "Cancel",
        style: "cancel",
      },
      {
        text: "Restore",
        onPress: () => {
          void doRestore();
        },
      },
    ]);
  }

  function openHistory() {
    Keyboard.dismiss();
    setSelectedHistoryId(null);
    setShowHistory(true);
  }

  function closeHistory() {
    setSelectedHistoryId(null);
    setShowHistory(false);

    requestAnimationFrame(() => {
      inputRef.current?.focus();
    });
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
              <Text style={styles.title}>
                {showHistory ? "History" : "Quick Shop"}
              </Text>
              <Text style={styles.subtitle}>
                {showHistory
                  ? "Your past Quick Shops."
                  : "Enter prices as you shop."}
              </Text>
            </View>

            <View style={styles.headerActions}>
              {showHistory ? (
                <Pressable
                  style={({ pressed }) => [
                    styles.historyButton,
                    pressed && styles.pressed,
                  ]}
                  onPress={closeHistory}
                  accessibilityRole="button"
                  accessibilityLabel="Back to Quick Shop"
                >
                  <Text style={styles.historyButtonText}>‹</Text>
                </Pressable>
              ) : (
                <Pressable
                  style={({ pressed }) => [
                    styles.historyButton,
                    pressed && styles.pressed,
                  ]}
                  onPress={openHistory}
                  accessibilityRole="button"
                  accessibilityLabel="Open Quick Shop history"
                >
                  <Text style={styles.receiptIcon}>▤</Text>
                </Pressable>
              )}

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
          </View>

          {showHistory ? (
            <View style={styles.historyPanel}>
              {history.length === 0 ? (
                <View style={styles.emptyHistory}>
                  <Text style={styles.emptyHistoryTitle}>
                    No Quick Shops yet
                  </Text>
                  <Text style={styles.emptyHistoryText}>
                    Discard a Quick Shop and it will appear here.
                  </Text>
                </View>
              ) : selectedHistoryId ? (
                (() => {
                  const selected = history.find(
                    (entry) => entry.id === selectedHistoryId,
                  );
                  if (!selected) return null;

                  return (
                    <View style={styles.historyDetail}>
                      <Pressable onPress={() => setSelectedHistoryId(null)}>
                        <Text style={styles.historyBackText}>
                          ‹ All History
                        </Text>
                      </Pressable>

                      <Text style={styles.historyDetailDate}>
                        {formatHistoryDate(selected.createdAt)}
                      </Text>

                      <ScrollView style={styles.historyDetailScroll}>
                        {selected.items.map((item, index) => (
                          <View key={item.id} style={styles.historyPriceRow}>
                            <Text style={styles.historyPriceNumber}>
                              {String(index + 1).padStart(2, "0")}
                            </Text>
                            <Text style={styles.historyPriceText}>
                              {formatMoney(item.amount)}
                            </Text>
                          </View>
                        ))}
                      </ScrollView>

                      <View style={styles.historyTotalRow}>
                        <Text style={styles.historyTotalLabel}>TOTAL</Text>
                        <Text style={styles.historyTotalAmount}>
                          {formatMoney(selected.total.toFixed(2))}
                        </Text>
                      </View>

                      <View style={styles.historyActionRow}>
                        <Pressable
                          style={({ pressed }) => [
                            styles.deleteHistoryButton,
                            pressed && styles.pressed,
                          ]}
                          onPress={() => void deleteHistoryEntry(selected.id)}
                        >
                          <Text style={styles.deleteHistoryButtonText}>
                            Delete
                          </Text>
                        </Pressable>

                        <Pressable
                          style={({ pressed }) => [
                            styles.restoreHistoryButton,
                            pressed && styles.pressed,
                          ]}
                          onPress={() => void restoreHistoryEntry(selected)}
                        >
                          <Text style={styles.restoreHistoryButtonText}>
                            Restore
                          </Text>
                        </Pressable>
                      </View>
                    </View>
                  );
                })()
              ) : (
                <ScrollView showsVerticalScrollIndicator={false}>
                  {history.map((entry) => (
                    <Pressable
                      key={entry.id}
                      style={({ pressed }) => [
                        styles.historyRow,
                        pressed && styles.pressed,
                      ]}
                      onPress={() => setSelectedHistoryId(entry.id)}
                    >
                      <View>
                        <Text style={styles.historyDate}>
                          {formatHistoryDate(entry.createdAt)}
                        </Text>
                        <Text style={styles.historyItemCount}>
                          {entry.items.length}{" "}
                          {entry.items.length === 1 ? "price" : "prices"}
                        </Text>
                      </View>

                      <Text style={styles.historyAmount}>
                        {formatMoney(entry.total.toFixed(2))}
                      </Text>
                    </Pressable>
                  ))}
                </ScrollView>
              )}
            </View>
          ) : (
            <>
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
                  {items.map((item, index) => (
                    <Swipeable
                      key={`${item.id}-${item.inCart ?? false}`}
                      renderLeftActions={() => renderLeftActions(item)}
                      renderRightActions={() => renderRightActions(item.id)}
                      onSwipeableOpen={(direction) => {
                        if (direction === "left") {
                          toggleItemInCart(item.id);
                        }
                      }}
                      overshootLeft={false}
                      overshootRight={false}
                    >
                      <Pressable
                        style={[
                          styles.priceRow,
                          editingItemId === item.id && styles.priceRowEditing,
                        ]}
                        onPress={(event) => {
                          event.stopPropagation?.();
                          startEditingItem(item);
                        }}
                      >
                        <Text style={styles.priceNumber}>
                          {String(index + 1).padStart(2, "0")}
                        </Text>

                        <Text
                          style={[
                            styles.priceText,
                            item.inCart && styles.priceTextInCart,
                            editingItemId === item.id &&
                              styles.priceTextEditing,
                          ]}
                        >
                          {editingItemId === item.id && currentDigits
                            ? formatMoney(digitsToAmount(currentDigits))
                            : formatMoney(item.amount)}
                        </Text>
                      </Pressable>
                    </Swipeable>
                  ))}
                </ScrollView>

                <Pressable
                  style={styles.activePriceRow}
                  onPress={() => inputRef.current?.focus()}
                >
                  <Text style={styles.activeIndicator}>
                    {editingItemId ? "✎" : "›"}
                  </Text>

                  <Text style={styles.activePrice}>
                    {currentDigits ? formatMoney(currentAmount) : "$0.00"}
                  </Text>

                  <View style={styles.cursor} />
                </Pressable>

                <View style={styles.totalDivider} />

                <View style={styles.totalRow}>
                  <Text style={styles.totalLabel}>TOTAL</Text>

                  <View style={styles.totalValueBlock}>
                    <Text style={styles.totalAmount}>
                      {formatMoney(grandTotal.toFixed(2))}
                    </Text>

                    <Pressable
                      onPress={(event) => {
                        event.stopPropagation?.();
                        setShowTaxEditor((current) => !current);
                      }}
                      style={({ pressed }) => pressed && styles.pressed}
                      accessibilityRole="button"
                      accessibilityLabel="Edit Quick Shop tax"
                    >
                      <Text style={styles.taxSummaryText}>
                        {taxEnabled
                          ? `incl. ${safeTaxRate.toFixed(2)}% tax`
                          : "tax off"}
                      </Text>
                    </Pressable>
                  </View>
                </View>

                {showTaxEditor ? (
                  <View style={styles.taxEditor}>
                    <Pressable
                      onPress={(event) => {
                        event.stopPropagation?.();
                        const nextEnabled = !taxEnabled;
                        setTaxEnabled(nextEnabled);
                        void saveTaxSettings(nextEnabled, taxRate);
                      }}
                      style={({ pressed }) => [
                        styles.taxToggle,
                        taxEnabled && styles.taxToggleEnabled,
                        pressed && styles.pressed,
                      ]}
                    >
                      <Text
                        style={[
                          styles.taxToggleText,
                          taxEnabled && styles.taxToggleTextEnabled,
                        ]}
                      >
                        {taxEnabled ? "Tax On" : "Tax Off"}
                      </Text>
                    </Pressable>

                    <View style={styles.taxRateWrap}>
                      <TextInput
                        value={taxRate}
                        onChangeText={(value) => {
                          const cleaned = value
                            .replace(/[^0-9.]/g, "")
                            .replace(/(\..*)\./g, "$1");

                          setTaxRate(cleaned);
                        }}
                        onBlur={() => {
                          const parsedRate = Number(taxRate);
                          const normalized =
                            Number.isFinite(parsedRate) && parsedRate >= 0
                              ? parsedRate.toFixed(2)
                              : "0.00";

                          setTaxRate(normalized);
                          void saveTaxSettings(taxEnabled, normalized);
                        }}
                        keyboardType={
                          Platform.OS === "ios" ? "decimal-pad" : "numeric"
                        }
                        inputMode="decimal"
                        selectTextOnFocus
                        style={styles.taxRateInput}
                        maxLength={6}
                        accessibilityLabel="Quick Shop tax rate"
                      />
                      <Text style={styles.taxPercent}>%</Text>
                    </View>
                  </View>
                ) : null}
              </View>

              <View style={styles.helperRow}>
                <Text style={styles.helperText}>Type 489 for $4.89</Text>

                {items.length > 0 || currentDigits ? (
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
                  disabled={items.length === 0 && !currentDigits}
                  style={({ pressed }) => [
                    styles.discardButton,
                    items.length === 0 &&
                      !currentDigits &&
                      styles.discardButtonDisabled,
                    pressed &&
                      (items.length > 0 || currentDigits) &&
                      styles.pressed,
                  ]}
                  onPress={handleDiscard}
                >
                  <Text style={styles.discardButtonText}>Discard</Text>
                </Pressable>

                <Pressable
                  disabled={items.length === 0 && !currentDigits}
                  style={({ pressed }) => [
                    styles.saveButton,
                    items.length === 0 &&
                      !currentDigits &&
                      styles.saveButtonDisabled,
                    pressed &&
                      (items.length > 0 || currentDigits) &&
                      styles.pressed,
                  ]}
                  onPress={handleSave}
                >
                  <Text style={styles.saveButtonText}>Save as Budget</Text>
                </Pressable>
              </View>
            </>
          )}

          {!showHistory && (
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
          )}
        </Pressable>

        {Platform.OS === "ios" && !showHistory && (
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
    justifyContent: "flex-start",
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

  headerActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginLeft: -30,
  },

  historyButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#243342",
    borderWidth: 1,
    borderColor: "#3B4D5F",
    alignItems: "center",
    justifyContent: "center",
  },

  historyButtonText: {
    color: "#CAD3DD",
    fontSize: 28,
    fontWeight: "800",
    lineHeight: 30,
  },

  receiptIcon: {
    color: "#CAD3DD",
    fontSize: 20,
    fontWeight: "900",
  },

  historyPanel: {
    backgroundColor: "#F4F4F4",
    borderRadius: 18,
    padding: 16,
    minHeight: 330,
    maxHeight: 520,
  },

  emptyHistory: {
    flex: 1,
    minHeight: 280,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24,
  },

  emptyHistoryTitle: {
    color: "#312A38",
    fontSize: 18,
    fontWeight: "900",
  },

  emptyHistoryText: {
    color: "#8A8190",
    fontSize: 13,
    fontWeight: "700",
    textAlign: "center",
    marginTop: 6,
  },

  historyRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#D8D2DD",
  },

  historyDate: {
    color: "#312A38",
    fontSize: 14,
    fontWeight: "900",
  },

  historyItemCount: {
    color: "#8A8190",
    fontSize: 12,
    fontWeight: "700",
    marginTop: 3,
  },

  historyAmount: {
    color: "#6F35B5",
    fontSize: 20,
    fontWeight: "900",
    fontVariant: ["tabular-nums"],
  },

  historyDetail: {
    minHeight: 300,
  },

  historyBackText: {
    color: "#6F35B5",
    fontSize: 14,
    fontWeight: "900",
    marginBottom: 10,
  },

  historyDetailDate: {
    color: "#554D61",
    fontSize: 13,
    fontWeight: "900",
    marginBottom: 8,
  },

  historyDetailScroll: {
    maxHeight: 250,
  },

  historyPriceRow: {
    flexDirection: "row",
    alignItems: "center",
    minHeight: 34,
  },

  historyPriceNumber: {
    width: 32,
    color: "#AAA2B2",
    fontSize: 12,
    fontWeight: "800",
  },

  historyPriceText: {
    color: "#312A38",
    fontSize: 18,
    fontWeight: "800",
    fontVariant: ["tabular-nums"],
  },

  historyTotalRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderTopWidth: 1,
    borderTopColor: "#AAA2B2",
    paddingTop: 12,
    marginTop: 10,
  },

  historyTotalLabel: {
    color: "#554D61",
    fontSize: 14,
    fontWeight: "900",
    letterSpacing: 1,
  },

  historyTotalAmount: {
    color: "#6F35B5",
    fontSize: 24,
    fontWeight: "900",
    fontVariant: ["tabular-nums"],
  },

  historyActionRow: {
    flexDirection: "row",
    gap: 10,
    marginTop: 16,
  },

  deleteHistoryButton: {
    flex: 1,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#FF6B6B",
    backgroundColor: "#3A1C1C",
    paddingVertical: 11,
    alignItems: "center",
    justifyContent: "center",
  },

  deleteHistoryButtonText: {
    color: "#FF6B6B",
    fontSize: 13,
    fontWeight: "900",
  },

  restoreHistoryButton: {
    flex: 1,
    borderRadius: 12,
    backgroundColor: "#2ECC71",
    paddingVertical: 11,
    alignItems: "center",
    justifyContent: "center",
  },

  restoreHistoryButtonText: {
    color: "#101820",
    fontSize: 13,
    fontWeight: "900",
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
    backgroundColor: "#F4F4F4",
    borderRadius: 18,
    paddingHorizontal: 18,
    paddingTop: 18,
    paddingBottom: 16,
    flexShrink: 1,
    minHeight: 220,
    maxHeight: 390,
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
    maxHeight: 250,
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
    flex: 1,
    color: "#312A38",
    fontSize: 20,
    fontWeight: "800",
    fontVariant: ["tabular-nums"],
  },

  priceTextInCart: {
    color: "#8A98A8",
    textDecorationLine: "line-through",
    opacity: 0.55,
  },

  priceRowEditing: {
    backgroundColor: "rgba(155, 93, 229, 0.10)",
    borderRadius: 10,
  },

  priceTextEditing: {
    color: "#6F35B5",
  },

  cartAction: {
    width: 90,
    minHeight: 35,
    backgroundColor: "#173326",
    borderColor: "#2ECC71",
    borderWidth: 1,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginVertical: 2,
  },

  cartActionText: {
    color: "#2ECC71",
    fontWeight: "900",
  },

  cartActionUndo: {
    backgroundColor: "#3A3218",
    borderColor: "#F4C542",
  },

  cartActionTextUndo: {
    color: "#F4C542",
  },

  deleteAction: {
    width: 90,
    minHeight: 35,
    backgroundColor: "#3A1C1C",
    borderColor: "#FF6B6B",
    borderWidth: 1,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginVertical: 2,
  },

  deleteActionText: {
    color: "#FF6B6B",
    fontWeight: "900",
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

  totalValueBlock: {
    alignItems: "flex-end",
  },

  totalAmount: {
    color: "#6F35B5",
    fontSize: 26,
    fontWeight: "900",
    fontVariant: ["tabular-nums"],
  },

  taxSummaryText: {
    color: "#8A8190",
    fontSize: 10,
    fontWeight: "800",
    marginTop: 2,
  },

  taxEditor: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8,
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: "#DED8E3",
  },

  taxToggle: {
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#AAA2B2",
    backgroundColor: "#ECE9EF",
    paddingHorizontal: 10,
    paddingVertical: 7,
  },

  taxToggleEnabled: {
    borderColor: "#6F35B5",
    backgroundColor: "rgba(111, 53, 181, 0.10)",
  },

  taxToggleText: {
    color: "#8A8190",
    fontSize: 11,
    fontWeight: "900",
  },

  taxToggleTextEnabled: {
    color: "#6F35B5",
  },

  taxRateWrap: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#CFC7D8",
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 8,
    marginLeft: 2,
  },

  taxRateInput: {
    flex: 1,
    color: "#312A38",
    fontSize: 13,
    fontWeight: "900",
    textAlign: "right",
    paddingVertical: 6,
    minWidth: 46,
  },

  taxPercent: {
    color: "#8A8190",
    fontSize: 12,
    fontWeight: "900",
    marginLeft: 2,
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
