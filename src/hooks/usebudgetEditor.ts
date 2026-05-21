// Save as: src/hooks/useBudgetEditor.ts

import { useEffect, useMemo, useRef, useState } from "react";
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
  getBudgetStatus,
  getSubtotal,
  getTaxAmount,
} from "../utils/budgetEditorCalculations";

import { getCreatedDateFromId } from "../utils/budgetEditorDates";

export function useBudgetEditor(budgetId: string | undefined) {
  const [noteTitle, setNoteTitle] = useState("");
  const [createdAt, setCreatedAt] = useState("");
  const [lastEditedAt, setLastEditedAt] = useState("");

  const [startingMoney, setStartingMoney] = useState("");

  const [salesTaxEnabled, setSalesTaxEnabled] = useState(false);
  const [taxRate, setTaxRate] = useState("8.25");

  // FIXED:
  // New notes now start completely empty
  const [items, setItems] = useState<BudgetItem[]>([]);

  const [hasLoaded, setHasLoaded] = useState(false);

  const skipNextAutoSaveRef = useRef(true);

  const startingMoneyRef = useRef<TextInput>(null);
  const taxRateRef = useRef<TextInput>(null);

  const itemNameRefs = useRef<Record<number, TextInput | null>>({});
  const itemAmountRefs = useRef<Record<number, TextInput | null>>({});

  const moneyAvailableIsEmpty = startingMoney.trim() === "";

  useEffect(() => {
    async function loadBudget() {
      if (!budgetId) return;

      try {
        const existingBudget = await loadBudgetById(budgetId);

        if (existingBudget) {
          setNoteTitle(
            existingBudget.budgetName === "Untitled"
              ? ""
              : existingBudget.budgetName || "",
          );

          setCreatedAt(
            existingBudget.createdAt || getCreatedDateFromId(budgetId),
          );

          setLastEditedAt(existingBudget.updatedAt || "");

          setStartingMoney(existingBudget.amount || "");

          setSalesTaxEnabled(existingBudget.salesTaxEnabled ?? false);

          setTaxRate(existingBudget.taxRate || "8.25");

          if (
            existingBudget.spendingItems &&
            existingBudget.spendingItems.length > 0
          ) {
            setItems(mapStoredItemsToEditorItems(existingBudget.spendingItems));
          }
        } else {
          setCreatedAt(getCreatedDateFromId(budgetId));
        }
      } catch (error) {
        console.log("Load budget failed:", error);

        setCreatedAt(getCreatedDateFromId(budgetId));
      } finally {
        setHasLoaded(true);
      }
    }

    loadBudget();
  }, [budgetId]);

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
          startingMoney,
          items,
          createdAt,
          salesTaxEnabled,
          taxRate,
        });

        setCreatedAt(savedDates.createdAt);
        setLastEditedAt(savedDates.updatedAt);
      } catch (error) {
        console.log("Auto-save failed:", error);
      }
    }

    autoSaveBudget();
  }, [
    budgetId,
    hasLoaded,
    noteTitle,
    startingMoney,
    items,
    createdAt,
    salesTaxEnabled,
    taxRate,
  ]);

  function addItem() {
    const newId = Date.now();

    setItems((prev) => [
      ...prev,
      {
        id: newId,
        name: "",
        amount: "",
        quantity: 1,
        included: true,
      },
    ]);

    setTimeout(() => {
      itemAmountRefs.current[newId]?.focus();
    }, 100);
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

  function deleteItem(id: number) {
    const removeItem = () => {
      setItems((prev) => prev.filter((item) => item.id !== id));

      delete itemNameRefs.current[id];
      delete itemAmountRefs.current[id];
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

    const nextItem = items[currentIndex + 1];

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

  const status = useMemo(() => {
    return getBudgetStatus(safeToSpend, moneyAvailableIsEmpty);
  }, [safeToSpend, moneyAvailableIsEmpty]);

  const affirmingMessage = useMemo(() => {
    return getAffirmingMessage(safeToSpend, status, moneyAvailableIsEmpty);
  }, [safeToSpend, status, moneyAvailableIsEmpty]);

  const headerSubtext = moneyAvailableIsEmpty
    ? "Add money available below"
    : "safe to spend";

  const currentStyle = budgetStatusStyles[status];

  const headerTextColor = moneyAvailableIsEmpty
    ? "#FFFFFF"
    : currentStyle.textColor;

  return {
    noteTitle,
    setNoteTitle,

    createdAt,
    lastEditedAt,

    startingMoney,
    setStartingMoney,

    salesTaxEnabled,
    setSalesTaxEnabled,

    taxRate,
    setTaxRate,

    items,

    addItem,
    updateItem,
    increaseQuantity,
    resetQuantity,
    toggleIncluded,
    deleteItem,
    focusNextItemOrAddCurrent,

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
