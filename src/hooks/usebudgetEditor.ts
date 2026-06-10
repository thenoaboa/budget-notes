// Save as: src/hooks/useBudgetEditor.ts

import { useFocusEffect } from "expo-router";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Alert, Platform, TextInput } from "react-native";

import {
  autoSaveBudgetById,
  loadBudgetById,
  mapStoredItemsToEditorItems,
} from "../storage/budgetEditorStorage";

import type { BudgetItem } from "../types/budgetEditor";

import {
  budgetStatusStyles,
  getAffirmingMessage,
  getSubtotal,
  getTaxAmount,
} from "../utils/budgetEditorCalculations";

import { getCreatedDateFromId } from "../utils/budgetEditorDates";

function createEmptyItem(): BudgetItem {
  return {
    id: Date.now(),
    name: "",
    amount: "",
    quantity: 1,
    included: true,
  };
}

export function useBudgetEditor(budgetId: string | undefined) {
  const [noteTitle, setNoteTitle] = useState("");
  const [receiptNote, setReceiptNote] = useState("");

  const [createdAt, setCreatedAt] = useState("");
  const [lastEditedAt, setLastEditedAt] = useState("");

  const [startingMoney, setStartingMoney] = useState("");

  const [salesTaxEnabled, setSalesTaxEnabled] = useState(false);
  const [taxRate, setTaxRate] = useState("8.25");

  const [items, setItems] = useState<BudgetItem[]>([]);

  const [showAddItemOverlay, setShowAddItemOverlay] = useState(false);
  const [draftItem, setDraftItem] = useState<BudgetItem>(createEmptyItem());

  const [selectedReceiptItemId, setSelectedReceiptItemId] = useState<
    number | null
  >(null);

  const [hasLoaded, setHasLoaded] = useState(false);

  const skipNextAutoSaveRef = useRef(true);

  const startingMoneyRef = useRef<TextInput>(null);
  const taxRateRef = useRef<TextInput>(null);

  const itemNameRefs = useRef<Record<number, TextInput | null>>({});
  const itemAmountRefs = useRef<Record<number, TextInput | null>>({});

  const moneyAvailableIsEmpty = startingMoney.trim() === "";

  const loadBudget = useCallback(async () => {
    if (!budgetId) return;

    try {
      const existingBudget = await loadBudgetById(budgetId);

      if (existingBudget) {
        setNoteTitle(
          existingBudget.budgetName === "Untitled"
            ? ""
            : existingBudget.budgetName || "",
        );

        setReceiptNote(existingBudget.receiptNote || "");

        setCreatedAt(
          existingBudget.createdAt || getCreatedDateFromId(budgetId),
        );

        setLastEditedAt(existingBudget.updatedAt || "");
        setStartingMoney(existingBudget.amount || "");
        setSalesTaxEnabled(existingBudget.salesTaxEnabled ?? false);
        setTaxRate(existingBudget.taxRate || "8.25");

        setItems(
          mapStoredItemsToEditorItems(existingBudget.spendingItems || []),
        );
      } else {
        setCreatedAt(getCreatedDateFromId(budgetId));
      }
    } catch (error) {
      console.log("Load budget failed:", error);
      setCreatedAt(getCreatedDateFromId(budgetId));
    } finally {
      setHasLoaded(true);
    }
  }, [budgetId]);

  useEffect(() => {
    loadBudget();
  }, [loadBudget]);

  useFocusEffect(
    useCallback(() => {
      loadBudget();
    }, [loadBudget]),
  );

  useEffect(() => {
    async function autoSaveBudget() {
      if (!budgetId || !hasLoaded) return;

      if (skipNextAutoSaveRef.current) {
        skipNextAutoSaveRef.current = false;
        return;
      }

      try {
        const savedDates = await autoSaveBudgetById({
          budgetId,
          noteTitle,
          receiptNote,
          startingMoney,
          items,
          createdAt,
          salesTaxEnabled,
          taxRate,
        });

        const savedCreatedAt =
          savedDates.createdAt || createdAt || getCreatedDateFromId(budgetId);

        const savedUpdatedAt = savedDates.updatedAt || new Date().toISOString();

        setCreatedAt(savedCreatedAt);
        setLastEditedAt(savedUpdatedAt);
      } catch (error) {
        console.log("Auto-save failed:", error);
      }
    }

    autoSaveBudget();
  }, [
    budgetId,
    hasLoaded,
    noteTitle,
    receiptNote,
    startingMoney,
    items,
    createdAt,
    salesTaxEnabled,
    taxRate,
  ]);
  async function saveBudgetNow() {
    if (!budgetId) return;

    const savedDates = await autoSaveBudgetById({
      budgetId,
      noteTitle,
      receiptNote,
      startingMoney,
      items,
      createdAt,
      salesTaxEnabled,
      taxRate,
    });

    const savedCreatedAt =
      savedDates.createdAt || createdAt || getCreatedDateFromId(budgetId);

    const savedUpdatedAt = savedDates.updatedAt || new Date().toISOString();

    setCreatedAt(savedCreatedAt);
    setLastEditedAt(savedUpdatedAt);
  }
  function addItem() {
    const newItem = createEmptyItem();

    setItems((prev) => [newItem, ...prev]);

    setTimeout(() => {
      itemAmountRefs.current[newItem.id]?.focus();
    }, 100);
  }

  function openAddItemOverlay() {
    setDraftItem(createEmptyItem());
    setShowAddItemOverlay(true);
  }

  function closeAddItemOverlay() {
    setShowAddItemOverlay(false);
  }

  function addItemFromDraft() {
    const hasName = draftItem.name.trim() !== "";
    const hasAmount = draftItem.amount.trim() !== "";

    if (!hasName && !hasAmount) {
      setShowAddItemOverlay(false);
      return;
    }

    setItems((prev) => [
      {
        ...draftItem,
        id: draftItem.id || Date.now(),
        quantity: draftItem.quantity || 1,
        included: draftItem.included ?? true,
      },
      ...prev,
    ]);

    setShowAddItemOverlay(false);
    setDraftItem(createEmptyItem());
  }

  function openReceiptItemOverlay(itemId: number) {
    setSelectedReceiptItemId(itemId);
  }

  function closeReceiptItemOverlay() {
    setSelectedReceiptItemId(null);
  }

  function updateItem(id: number, field: "name" | "amount", value: string) {
    setItems((prev) =>
      prev.map((item) =>
        item.id === id
          ? {
              ...item,
              [field]: value,
            }
          : item,
      ),
    );
  }

  function increaseQuantity(id: number) {
    setItems((prev) =>
      prev.map((item) =>
        item.id === id
          ? {
              ...item,
              quantity: item.quantity + 1,
            }
          : item,
      ),
    );
  }

  function resetQuantity(id: number) {
    setItems((prev) =>
      prev.map((item) =>
        item.id === id
          ? {
              ...item,
              quantity: 1,
            }
          : item,
      ),
    );
  }

  function toggleIncluded(id: number) {
    setItems((prev) =>
      prev.map((item) =>
        item.id === id
          ? {
              ...item,
              included: !item.included,
            }
          : item,
      ),
    );
  }

  function reorderItems(updatedItems: BudgetItem[]) {
    setItems(updatedItems);
  }

  function deleteItem(id: number) {
    const removeItem = () => {
      setItems((prev) => prev.filter((item) => item.id !== id));

      delete itemNameRefs.current[id];
      delete itemAmountRefs.current[id];

      if (selectedReceiptItemId === id) {
        setSelectedReceiptItemId(null);
      }
    };

    if (Platform.OS === "web") {
      const confirmed = window.confirm(
        "Are you sure you want to remove this item?",
      );

      if (confirmed) {
        removeItem();
      }

      return;
    }

    Alert.alert("Delete item?", "Are you sure you want to remove this item?", [
      {
        text: "Cancel",
        style: "cancel",
      },
      {
        text: "Delete",
        style: "destructive",
        onPress: removeItem,
      },
    ]);
  }

  function focusNextItemOrAddCurrent(itemId: number) {
    const currentIndex = items.findIndex(
      (currentItem) => currentItem.id === itemId,
    );

    const isTopItem = currentIndex === 0;

    if (isTopItem) {
      addItem();
      return;
    }

    const nextItem = items[currentIndex - 1];

    if (nextItem) {
      itemAmountRefs.current[nextItem.id]?.focus();
    } else {
      addItem();
    }
  }

  const subtotal = useMemo(() => {
    return getSubtotal(items);
  }, [items]);

  const taxAmount = useMemo(() => {
    return getTaxAmount(subtotal, salesTaxEnabled, taxRate);
  }, [subtotal, salesTaxEnabled, taxRate]);

  const totalSpent = subtotal + taxAmount;

  const starting = parseFloat(startingMoney) || 0;

  const safeToSpend = starting - totalSpent;
  const remainingPercent = starting > 0 ? (safeToSpend / starting) * 100 : 100;

  const status = useMemo(() => {
    if (moneyAvailableIsEmpty) {
      return "green";
    }

    if (safeToSpend < 0) {
      return "red";
    }

    if (safeToSpend === 0) {
      return "green";
    }

    if (remainingPercent <= 20) {
      return "yellow";
    }

    return "green";
  }, [safeToSpend, remainingPercent, moneyAvailableIsEmpty]);

  const messageStatus = useMemo(() => {
    if (moneyAvailableIsEmpty) {
      return "green";
    }

    if (safeToSpend < 0) {
      return "red";
    }

    if (remainingPercent <= 20) {
      return "yellow";
    }

    return "green";
  }, [safeToSpend, remainingPercent, moneyAvailableIsEmpty]);

  const affirmingMessage = useMemo(() => {
    const hasEnteredItems = items.some(
      (item) => item.name.trim() !== "" || item.amount.trim() !== "",
    );

    if (hasEnteredItems && !moneyAvailableIsEmpty && safeToSpend === 0) {
      return "Everything is accounted for.";
    }

    return getAffirmingMessage(
      safeToSpend,
      messageStatus,
      moneyAvailableIsEmpty,
    );
  }, [safeToSpend, messageStatus, moneyAvailableIsEmpty, items]);

  const headerSubtext = moneyAvailableIsEmpty
    ? "Add money available below"
    : safeToSpend < 0
      ? "over budget"
      : "safe to spend";

  const currentStyle = budgetStatusStyles[status];

  const headerTextColor = moneyAvailableIsEmpty
    ? "#FFFFFF"
    : currentStyle.textColor;

  const selectedReceiptItem =
    items.find((item) => item.id === selectedReceiptItemId) || null;

  return {
    noteTitle,
    setNoteTitle,

    receiptNote,
    setReceiptNote,

    createdAt,
    lastEditedAt,

    startingMoney,
    setStartingMoney,

    salesTaxEnabled,
    setSalesTaxEnabled,

    taxRate,
    setTaxRate,

    items,
    setItems,
    saveBudgetNow,

    addItem,
    updateItem,
    increaseQuantity,
    resetQuantity,
    toggleIncluded,
    reorderItems,
    deleteItem,
    focusNextItemOrAddCurrent,

    showAddItemOverlay,
    draftItem,
    setDraftItem,
    openAddItemOverlay,
    closeAddItemOverlay,
    addItemFromDraft,

    selectedReceiptItemId,
    selectedReceiptItem,
    openReceiptItemOverlay,
    closeReceiptItemOverlay,

    startingMoneyRef,
    taxRateRef,

    itemNameRefs,
    itemAmountRefs,

    subtotal,
    taxAmount,
    totalSpent,

    safeToSpend,

    affirmingMessage,
    headerSubtext,

    currentStyle,
    headerTextColor,
  };
}
