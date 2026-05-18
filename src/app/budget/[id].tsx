import AsyncStorage from "@react-native-async-storage/async-storage";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useMemo, useRef, useState } from "react";
import {
    Alert,
    KeyboardAvoidingView,
    Platform,
    Pressable,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";

type Item = {
  id: number;
  name: string;
  amount: string;
  quantity: number;
  included: boolean;
};

type StoredSpendingItem = {
  id: string;
  amount: string;
  name: string;
  quantity: string;
  included: boolean;
};

type StoredBudget = {
  id: string;
  budgetName: string;
  amount: string;
  spendingItems: StoredSpendingItem[];
  notes: string;
  createdAt?: string;
  updatedAt?: string;
};

export default function BudgetScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();

  const budgetId = Array.isArray(id) ? id[0] : id;

  const [noteTitle, setNoteTitle] = useState("");
  const [createdAt, setCreatedAt] = useState("");
  const [lastEditedAt, setLastEditedAt] = useState("");
  const [startingMoney, setStartingMoney] = useState("");
  const [salesTaxEnabled, setSalesTaxEnabled] = useState(false);
  const [taxRate, setTaxRate] = useState("8.25");

  const [items, setItems] = useState<Item[]>([
    { id: 1, name: "", amount: "", quantity: 1, included: true },
  ]);

  const [hasLoaded, setHasLoaded] = useState(false);
  const skipNextAutoSaveRef = useRef(true);

  const startingMoneyRef = useRef<TextInput>(null);
  const taxRateRef = useRef<TextInput>(null);
  const itemNameRefs = useRef<Record<number, TextInput | null>>({});
  const itemAmountRefs = useRef<Record<number, TextInput | null>>({});

  const moneyAvailableIsEmpty = startingMoney.trim() === "";

  function getCreatedDateFromId(idValue: string | undefined) {
    if (!idValue) return new Date().toISOString();

    const timestamp = Number(idValue);

    if (!Number.isNaN(timestamp)) {
      return new Date(timestamp).toISOString();
    }

    return new Date().toISOString();
  }

  function formatNoteTime(createdDate: string, editedDate: string) {
    const dateToUse = editedDate || createdDate;

    if (!dateToUse) return "Not edited yet";

    const date = new Date(dateToUse);

    const formattedDate = date.toLocaleDateString();
    const formattedTime = date.toLocaleTimeString([], {
      hour: "numeric",
      minute: "2-digit",
    });

    if (editedDate) {
      return `Last edited ${formattedDate} at ${formattedTime}`;
    }

    return `Created ${formattedDate} at ${formattedTime}`;
  }

  function createNewNote() {
    const newId = Date.now().toString();
    router.push(`/budget/${newId}` as any);
  }

  useEffect(() => {
    async function loadBudget() {
      if (!budgetId) return;

      try {
        const savedBudgets = await AsyncStorage.getItem("budgets");
        const parsedBudgets: StoredBudget[] = savedBudgets
          ? JSON.parse(savedBudgets)
          : [];

        const existingBudget = parsedBudgets.find(
          (budget) => budget.id === budgetId,
        );

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

          if (
            existingBudget.spendingItems &&
            existingBudget.spendingItems.length > 0
          ) {
            setItems(
              existingBudget.spendingItems.map((item, index) => ({
                id: Number(item.id) || Date.now() + index,
                name: item.name || "",
                amount: item.amount || "",
                quantity: Number(item.quantity) || 1,
                included: item.included ?? true,
              })),
            );
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
        const savedBudgets = await AsyncStorage.getItem("budgets");
        const parsedBudgets: StoredBudget[] = savedBudgets
          ? JSON.parse(savedBudgets)
          : [];

        const hasContent =
          noteTitle.trim() !== "" ||
          startingMoney.trim() !== "" ||
          items.some(
            (item) => item.name.trim() !== "" || item.amount.trim() !== "",
          );

        if (!hasContent) {
          const filteredBudgets = parsedBudgets.filter(
            (budget) => budget.id !== budgetId,
          );

          await AsyncStorage.setItem(
            "budgets",
            JSON.stringify(filteredBudgets),
          );

          setLastEditedAt("");
          return;
        }

        const existingBudget = parsedBudgets.find(
          (budget) => budget.id === budgetId,
        );

        const newCreatedAt =
          existingBudget?.createdAt ||
          createdAt ||
          getCreatedDateFromId(budgetId);

        const newUpdatedAt = existingBudget ? new Date().toISOString() : "";

        setCreatedAt(newCreatedAt);
        setLastEditedAt(newUpdatedAt);

        const budgetToSave: StoredBudget = {
          id: budgetId,
          budgetName: noteTitle.trim() || "Untitled",
          amount: startingMoney,
          spendingItems: items.map((item) => ({
            id: item.id.toString(),
            amount: item.amount,
            name: item.name,
            quantity: item.quantity.toString(),
            included: item.included,
          })),
          notes: "",
          createdAt: newCreatedAt,
          updatedAt: newUpdatedAt,
        };

        const existingIndex = parsedBudgets.findIndex(
          (budget) => budget.id === budgetId,
        );

        const updatedBudgets = [...parsedBudgets];

        if (existingIndex >= 0) {
          updatedBudgets[existingIndex] = budgetToSave;
        } else {
          updatedBudgets.unshift(budgetToSave);
        }

        await AsyncStorage.setItem("budgets", JSON.stringify(updatedBudgets));
      } catch (error) {
        console.log("Auto-save failed:", error);
      }
    }

    autoSaveBudget();
  }, [budgetId, hasLoaded, noteTitle, startingMoney, items, createdAt]);

  const addItem = () => {
    const newId = Date.now();

    setItems((prev) => [
      ...prev,
      { id: newId, name: "", amount: "", quantity: 1, included: true },
    ]);

    setTimeout(() => {
      itemNameRefs.current[newId]?.focus();
    }, 100);
  };

  const updateItem = (id: number, field: "name" | "amount", value: string) => {
    setItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, [field]: value } : item)),
    );
  };

  const increaseQuantity = (id: number) => {
    setItems((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, quantity: item.quantity + 1 } : item,
      ),
    );
  };

  const resetQuantity = (id: number) => {
    setItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, quantity: 1 } : item)),
    );
  };

  const toggleIncluded = (id: number) => {
    setItems((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, included: !item.included } : item,
      ),
    );
  };

  const deleteItem = (id: number) => {
    Alert.alert("Delete item?", "Are you sure you want to remove this item?", [
      {
        text: "Cancel",
        style: "cancel",
      },
      {
        text: "Delete",
        style: "destructive",
        onPress: () => {
          setItems((prev) => prev.filter((item) => item.id !== id));

          delete itemNameRefs.current[id];
          delete itemAmountRefs.current[id];
        },
      },
    ]);
  };

  const subtotal = useMemo(() => {
    return items.reduce((total, item) => {
      if (!item.included) return total;

      const amount = parseFloat(item.amount) || 0;
      return total + amount * item.quantity;
    }, 0);
  }, [items]);

  const taxAmount = useMemo(() => {
    if (!salesTaxEnabled) return 0;
    return subtotal * ((parseFloat(taxRate) || 0) / 100);
  }, [subtotal, salesTaxEnabled, taxRate]);

  const totalSpent = subtotal + taxAmount;
  const starting = parseFloat(startingMoney) || 0;
  const safeToSpend = starting - totalSpent;

  const status = useMemo(() => {
    if (moneyAvailableIsEmpty) return "green";
    if (safeToSpend < 0) return "red";
    if (safeToSpend <= 50) return "yellow";
    return "green";
  }, [safeToSpend, moneyAvailableIsEmpty]);

  const affirmingMessage = useMemo(() => {
    if (moneyAvailableIsEmpty) {
      return "Make your money go further";
    }

    const greenMessages = [
      "You’re still okay.",
      "You’ve got enough.",
      "You still have room.",
      "There’s still breathing room.",
      "You’re in a good spot.",
    ];

    const yellowMessages = [
      "Things are tightening up.",
      "Keep an eye on the next few purchases.",
      "Might be smart to slow down.",
      "You still have options.",
      "Small choices help here.",
    ];

    const redMessages = [
      "Let’s protect what’s left.",
      "Focus on essentials for now.",
      "This week needs extra care.",
      "Take a second before spending more.",
      "You can still adjust.",
    ];

    const pool =
      status === "red"
        ? redMessages
        : status === "yellow"
          ? yellowMessages
          : greenMessages;

    const index = Math.abs(Math.round(safeToSpend)) % pool.length;
    return pool[index];
  }, [safeToSpend, status, moneyAvailableIsEmpty]);

  const headerSubtext = moneyAvailableIsEmpty
    ? "Add money available below"
    : "safe to spend";

  const statusStyles = {
    green: {
      backgroundColor: "#123527",
      borderColor: "#2ECC71",
      textColor: "#2ECC71",
    },
    yellow: {
      backgroundColor: "#3A3114",
      borderColor: "#F1C40F",
      textColor: "#F1C40F",
    },
    red: {
      backgroundColor: "#3A1C1C",
      borderColor: "#FF6B6B",
      textColor: "#FF6B6B",
    },
  };

  const currentStyle = statusStyles[status];

  const headerTextColor = moneyAvailableIsEmpty
    ? "#FFFFFF"
    : currentStyle.textColor;

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        keyboardVerticalOffset={20}
      >
        <View style={styles.page}>
          <ScrollView
            style={styles.scroll}
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
          >
            <View
              style={[
                styles.headerCard,
                {
                  backgroundColor: currentStyle.backgroundColor,
                  borderColor: currentStyle.borderColor,
                },
              ]}
            >
              <Text style={[styles.headerMessage, { color: headerTextColor }]}>
                {affirmingMessage}
              </Text>

              <Text style={[styles.headerAmount, { color: headerTextColor }]}>
                ${safeToSpend.toFixed(2)}
              </Text>

              <Text style={[styles.headerSubtext, { color: headerTextColor }]}>
                {headerSubtext}
              </Text>
            </View>

            <Text style={styles.label}>Money available</Text>

            <TextInput
              ref={startingMoneyRef}
              style={styles.mainInput}
              placeholder="$0.00"
              placeholderTextColor="#8A98A8"
              keyboardType="decimal-pad"
              returnKeyType={salesTaxEnabled ? "next" : "done"}
              value={startingMoney}
              onChangeText={setStartingMoney}
              onSubmitEditing={() => {
                if (salesTaxEnabled) {
                  taxRateRef.current?.focus();
                }
              }}
            />

            <View style={styles.taxRow}>
              <TouchableOpacity
                style={[
                  styles.taxToggle,
                  salesTaxEnabled && styles.taxToggleActive,
                ]}
                onPress={() => setSalesTaxEnabled((prev) => !prev)}
              >
                <Text
                  style={[
                    styles.taxToggleText,
                    salesTaxEnabled && styles.taxToggleTextActive,
                  ]}
                >
                  Sales tax {salesTaxEnabled ? "on" : "off"}
                </Text>
              </TouchableOpacity>

              {salesTaxEnabled && (
                <TextInput
                  ref={taxRateRef}
                  style={styles.taxInput}
                  placeholder="8.25"
                  placeholderTextColor="#8A98A8"
                  keyboardType="decimal-pad"
                  returnKeyType="done"
                  value={taxRate}
                  onChangeText={setTaxRate}
                />
              )}
            </View>

            <Text style={styles.label}>Things you may buy</Text>

            {items.map((item) => (
              <View
                key={item.id}
                style={[styles.itemCard, !item.included && styles.itemExcluded]}
              >
                <TextInput
                  ref={(ref) => {
                    itemNameRefs.current[item.id] = ref;
                  }}
                  style={styles.itemNameInput}
                  placeholder="Item name"
                  placeholderTextColor="#8A98A8"
                  value={item.name}
                  returnKeyType="next"
                  onSubmitEditing={() =>
                    itemAmountRefs.current[item.id]?.focus()
                  }
                  blurOnSubmit={false}
                  onChangeText={(text) => updateItem(item.id, "name", text)}
                />

                <View style={styles.itemControlsRow}>
                  <TextInput
                    ref={(ref) => {
                      itemAmountRefs.current[item.id] = ref;
                    }}
                    style={styles.itemAmountInput}
                    placeholder="$0"
                    placeholderTextColor="#8A98A8"
                    keyboardType="decimal-pad"
                    returnKeyType="next"
                    value={item.amount}
                    onChangeText={(text) => updateItem(item.id, "amount", text)}
                    onSubmitEditing={() => {
                      const currentIndex = items.findIndex(
                        (currentItem) => currentItem.id === item.id,
                      );

                      const nextItem = items[currentIndex + 1];

                      if (nextItem) {
                        itemNameRefs.current[nextItem.id]?.focus();
                      } else {
                        addItem();
                      }
                    }}
                  />

                  <TouchableOpacity
                    style={styles.quantityButton}
                    onPress={() => increaseQuantity(item.id)}
                    onLongPress={() => resetQuantity(item.id)}
                  >
                    <Text style={styles.quantityButtonText}>
                      x{item.quantity}
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[
                      styles.includeButton,
                      !item.included && styles.includeButtonOff,
                    ]}
                    onPress={() => toggleIncluded(item.id)}
                  >
                    <Text
                      style={[
                        styles.includeButtonText,
                        !item.included && styles.includeButtonTextOff,
                      ]}
                    >
                      {item.included ? "In" : "Out"}
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.deleteButton}
                    onPress={() => deleteItem(item.id)}
                  >
                    <Text style={styles.deleteButtonText}>×</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))}

            <TouchableOpacity style={styles.addButton} onPress={addItem}>
              <Text style={styles.addButtonText}>+ Add Item</Text>
            </TouchableOpacity>

            <View style={styles.summaryBox}>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryText}>Items</Text>
                <Text style={styles.summaryText}>${subtotal.toFixed(2)}</Text>
              </View>

              {salesTaxEnabled && (
                <View style={styles.summaryRow}>
                  <Text style={styles.summaryText}>Estimated tax</Text>
                  <Text style={styles.summaryText}>
                    ${taxAmount.toFixed(2)}
                  </Text>
                </View>
              )}

              <View style={styles.summaryRow}>
                <Text style={styles.summaryTotal}>Planned total</Text>
                <Text style={styles.summaryTotal}>
                  ${totalSpent.toFixed(2)}
                </Text>
              </View>

              <View
                style={[
                  styles.statusNote,
                  {
                    backgroundColor: currentStyle.backgroundColor,
                    borderColor: currentStyle.borderColor,
                  },
                ]}
              >
                <Text
                  style={[
                    styles.statusNoteText,
                    { color: currentStyle.textColor },
                  ]}
                >
                  {affirmingMessage}
                </Text>
              </View>
            </View>

            <View style={styles.bottomSection}>
              <View style={styles.bottomTopRow}>
                <Pressable
                  style={styles.bottomIconButton}
                  onPress={() => router.push("/" as any)}
                >
                  <Text style={styles.bottomIconText}>‹</Text>
                </Pressable>

                <TextInput
                  style={styles.bottomTitleInput}
                  placeholder="Untitled"
                  placeholderTextColor="#5F6B78"
                  value={noteTitle}
                  onChangeText={setNoteTitle}
                  textAlign="center"
                />

                <Pressable
                  style={styles.bottomIconButton}
                  onPress={createNewNote}
                >
                  <Text style={styles.bottomIconText}>+</Text>
                </Pressable>
              </View>

              <Text style={styles.lastEditedText}>
                {formatNoteTime(createdAt, lastEditedAt)}
              </Text>
            </View>
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#101820",
  },

  keyboardView: {
    flex: 1,
  },

  page: {
    flex: 1,
    backgroundColor: "#101820",
    paddingHorizontal: 16,
  },

  scroll: {
    flex: 1,
    backgroundColor: "#101820",
  },

  scrollContent: {
    paddingTop: 12,
    paddingBottom: 80,
    backgroundColor: "#101820",
  },

  headerCard: {
    paddingVertical: 18,
    paddingHorizontal: 18,
    borderRadius: 24,
    borderWidth: 1,
    marginBottom: 18,
  },

  headerMessage: {
    fontSize: 14,
    fontWeight: "700",
    marginBottom: 4,
  },

  headerAmount: {
    fontSize: 42,
    fontWeight: "900",
  },

  headerSubtext: {
    fontSize: 15,
    fontWeight: "700",
  },

  label: {
    color: "#F4F7FA",
    fontSize: 15,
    fontWeight: "800",
    marginBottom: 8,
  },

  mainInput: {
    backgroundColor: "#243342",
    color: "#FFFFFF",
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 22,
    fontWeight: "800",
    borderWidth: 1,
    borderColor: "#3B4D5F",
    marginBottom: 14,
  },

  taxRow: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 18,
  },

  taxToggle: {
    flex: 1,
    backgroundColor: "#243342",
    borderRadius: 14,
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: "#3B4D5F",
  },

  taxToggleActive: {
    backgroundColor: "#123527",
    borderColor: "#2ECC71",
  },

  taxToggleText: {
    color: "#CAD3DD",
    fontSize: 15,
    fontWeight: "800",
  },

  taxToggleTextActive: {
    color: "#2ECC71",
  },

  taxInput: {
    width: 80,
    backgroundColor: "#243342",
    color: "#FFFFFF",
    borderRadius: 14,
    paddingVertical: 12,
    paddingHorizontal: 12,
    fontSize: 15,
    fontWeight: "800",
    borderWidth: 1,
    borderColor: "#3B4D5F",
    textAlign: "center",
  },

  itemCard: {
    backgroundColor: "#1B2633",
    borderRadius: 16,
    padding: 8,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#344657",
    gap: 8,
  },

  itemExcluded: {
    opacity: 0.45,
  },

  itemNameInput: {
    width: "100%",
    backgroundColor: "#2A3948",
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "800",
    paddingVertical: 13,
    paddingHorizontal: 12,
    borderRadius: 12,
  },

  itemControlsRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },

  itemAmountInput: {
    flex: 1,
    minWidth: 85,
    backgroundColor: "#2A3948",
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "800",
    paddingVertical: 12,
    paddingHorizontal: 10,
    borderRadius: 12,
  },

  quantityButton: {
    width: 50,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: "#2A3948",
    alignItems: "center",
    justifyContent: "center",
  },

  quantityButtonText: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "900",
  },

  includeButton: {
    width: 52,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: "#123527",
    alignItems: "center",
  },

  includeButtonOff: {
    backgroundColor: "#333D47",
  },

  includeButtonText: {
    color: "#2ECC71",
    fontSize: 13,
    fontWeight: "900",
  },

  includeButtonTextOff: {
    color: "#A7B1BD",
  },

  deleteButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: "#2A3948",
    alignItems: "center",
    justifyContent: "center",
  },

  deleteButtonText: {
    color: "#A7B1BD",
    fontSize: 24,
    lineHeight: 26,
  },

  addButton: {
    backgroundColor: "#2ECC71",
    borderRadius: 16,
    paddingVertical: 15,
    alignItems: "center",
    marginTop: 6,
    marginBottom: 18,
  },

  addButtonText: {
    color: "#101820",
    fontSize: 17,
    fontWeight: "900",
  },

  summaryBox: {
    backgroundColor: "#1B2633",
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: "#344657",
  },

  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },

  summaryText: {
    color: "#CAD3DD",
    fontSize: 15,
    fontWeight: "700",
  },

  summaryTotal: {
    color: "#FFFFFF",
    fontSize: 17,
    fontWeight: "900",
  },

  statusNote: {
    marginTop: 10,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 12,
    borderWidth: 1,
  },

  statusNoteText: {
    fontSize: 14,
    fontWeight: "800",
  },

  bottomSection: {
    marginTop: 24,
    marginBottom: 40,
  },

  bottomTopRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  bottomIconButton: {
    width: 42,
    height: 42,
    borderRadius: 14,
    backgroundColor: "#2A3948",
    alignItems: "center",
    justifyContent: "center",
  },

  bottomIconText: {
    color: "#2ECC71",
    fontSize: 30,
    fontWeight: "900",
    lineHeight: 32,
  },

  bottomTitleInput: {
    flex: 1,
    color: "#FFFFFF",
    fontSize: 30,
    fontWeight: "900",
    letterSpacing: -0.7,
    paddingHorizontal: 10,
    paddingVertical: 8,
    textAlign: "center",
  },

  lastEditedText: {
    color: "#8A98A8",
    fontSize: 12,
    fontWeight: "700",
    textAlign: "center",
    marginTop: 4,
  },
});
