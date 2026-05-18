import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFocusEffect, useRouter } from "expo-router";
import { useCallback, useMemo, useState } from "react";
import {
  Alert,
  NativeScrollEvent,
  NativeSyntheticEvent,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { Swipeable } from "react-native-gesture-handler";

type SpendingItem = {
  id: string;
  amount: string;
  name: string;
  quantity: string;
  included: boolean;
};

type Budget = {
  id: string;
  budgetName: string;
  amount: string;
  spendingItems: SpendingItem[];
  notes: string;
  createdAt?: string;
  updatedAt?: string;
};

export default function HomeScreen() {
  const router = useRouter();
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [searchVisible, setSearchVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  useFocusEffect(
    useCallback(() => {
      async function loadBudgets() {
        const savedBudgets = await AsyncStorage.getItem("budgets");
        const parsedBudgets: Budget[] = savedBudgets
          ? JSON.parse(savedBudgets)
          : [];

        setBudgets(parsedBudgets);
      }

      loadBudgets();
    }, []),
  );

  function createNewBudget() {
    const id = Date.now().toString();
    router.push(`/budget/${id}` as any);
  }

  async function deleteBudget(budgetId: string) {
    const updatedBudgets = budgets.filter((budget) => budget.id !== budgetId);

    setBudgets(updatedBudgets);
    await AsyncStorage.setItem("budgets", JSON.stringify(updatedBudgets));
  }

  function confirmDeleteBudget(budgetId: string) {
    Alert.alert("Delete note?", "Are you sure you want to delete this?", [
      { text: "No", style: "cancel" },
      {
        text: "Yes",
        style: "destructive",
        onPress: () => deleteBudget(budgetId),
      },
    ]);
  }

  function renderRightActions(budgetId: string) {
    return (
      <Pressable
        style={styles.deleteAction}
        onPress={() => confirmDeleteBudget(budgetId)}
      >
        <Text style={styles.deleteActionText}>Delete</Text>
      </Pressable>
    );
  }

  function getFallbackDateFromId(id: string) {
    const timestamp = Number(id);

    if (!Number.isNaN(timestamp)) {
      return new Date(timestamp).toISOString();
    }

    return "";
  }

  function getSortDate(budget: Budget) {
    return (
      budget.updatedAt || budget.createdAt || getFallbackDateFromId(budget.id)
    );
  }

  function formatNoteDate(budget: Budget) {
    const editedDate = budget.updatedAt;
    const createdDate = budget.createdAt || getFallbackDateFromId(budget.id);
    const dateToUse = editedDate || createdDate;

    if (!dateToUse) return "No date yet";

    const date = new Date(dateToUse);

    const formattedDate = date.toLocaleDateString([], {
      month: "short",
      day: "numeric",
    });

    const formattedTime = date.toLocaleTimeString([], {
      hour: "numeric",
      minute: "2-digit",
    });

    if (editedDate) {
      return `Edited ${formattedDate} • ${formattedTime}`;
    }

    return `Created ${formattedDate} • ${formattedTime}`;
  }

  function handleScroll(event: NativeSyntheticEvent<NativeScrollEvent>) {
    const yOffset = event.nativeEvent.contentOffset.y;

    if (yOffset < -24) {
      setSearchVisible(true);
    }
  }

  const visibleBudgets = useMemo(() => {
    const normalizedSearch = searchQuery.trim().toLowerCase();

    const sortedBudgets = [...budgets].sort((a, b) => {
      const aTime = new Date(getSortDate(a)).getTime() || 0;
      const bTime = new Date(getSortDate(b)).getTime() || 0;

      return bTime - aTime;
    });

    if (!normalizedSearch) return sortedBudgets;

    return sortedBudgets.filter((budget) => {
      const createdDateText = budget.createdAt
        ? new Date(budget.createdAt).toLocaleString()
        : "";

      const updatedDateText = budget.updatedAt
        ? new Date(budget.updatedAt).toLocaleString()
        : "";

      const itemText = budget.spendingItems
        .map((item) => `${item.name} ${item.amount} x${item.quantity}`)
        .join(" ");

      const searchableText = [
        budget.budgetName,
        budget.amount,
        budget.notes,
        itemText,
        createdDateText,
        updatedDateText,
        formatNoteDate(budget),
      ]
        .join(" ")
        .toLowerCase();

      return searchableText.includes(normalizedSearch);
    });
  }, [budgets, searchQuery]);

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      onScroll={handleScroll}
      scrollEventThrottle={16}
      alwaysBounceVertical
    >
      <View style={styles.simpleHeader}>
        <Text style={styles.simpleTitle}>Your Notes</Text>

        <Text style={styles.simpleSubtitle}>
          Keep track of what you have and what you can spend.
        </Text>
      </View>

      <Pressable style={styles.newButton} onPress={createNewBudget}>
        <Text style={styles.newButtonText}>+ New Note</Text>
      </Pressable>

      {searchVisible && (
        <TextInput
          style={styles.searchInput}
          placeholder="Search notes..."
          placeholderTextColor="#8A98A8"
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      )}

      {visibleBudgets.length === 0 && (
        <View style={styles.emptyCard}>
          <Text style={styles.emptyTitle}>
            {searchQuery.trim() ? "No matches found." : "Nothing here yet."}
          </Text>

          <Text style={styles.emptyText}>
            {searchQuery.trim()
              ? "Try searching by title, item, amount, or date."
              : "Start a note when you want a clearer picture before spending."}
          </Text>
        </View>
      )}

      {visibleBudgets.map((budget) => (
        <Swipeable
          key={budget.id}
          renderRightActions={() => renderRightActions(budget.id)}
        >
          <Pressable
            style={styles.card}
            onPress={() => router.push(`/budget/${budget.id}` as any)}
          >
            <Text style={styles.cardTitle}>
              {budget.budgetName || "Untitled Note"}
            </Text>

            <Text style={styles.cardSubtitle}>{formatNoteDate(budget)}</Text>
          </Pressable>
        </Swipeable>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#101820",
  },

  content: {
    paddingHorizontal: 16,
    paddingTop: 58,
    paddingBottom: 120,
    backgroundColor: "#101820",
  },

  simpleHeader: {
    marginBottom: 22,
  },

  simpleTitle: {
    color: "#FFFFFF",
    fontSize: 42,
    fontWeight: "900",
    letterSpacing: -1,
  },

  simpleSubtitle: {
    color: "#8A98A8",
    fontSize: 16,
    fontWeight: "700",
    marginTop: 6,
    lineHeight: 22,
  },

  newButton: {
    backgroundColor: "#2ECC71",
    borderRadius: 16,
    paddingVertical: 15,
    alignItems: "center",
    marginBottom: 14,
  },

  newButtonText: {
    color: "#101820",
    fontSize: 17,
    fontWeight: "900",
  },

  searchInput: {
    backgroundColor: "#243342",
    color: "#FFFFFF",
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    fontWeight: "800",
    borderWidth: 1,
    borderColor: "#3B4D5F",
    marginBottom: 18,
  },

  emptyCard: {
    backgroundColor: "#1B2633",
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: "#344657",
    marginBottom: 14,
  },

  emptyTitle: {
    color: "#FFFFFF",
    fontSize: 20,
    fontWeight: "900",
    marginBottom: 6,
  },

  emptyText: {
    color: "#CAD3DD",
    fontSize: 15,
    fontWeight: "700",
    lineHeight: 21,
  },

  card: {
    backgroundColor: "#1B2633",
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: "#344657",
    marginBottom: 14,
  },

  cardTitle: {
    color: "#FFFFFF",
    fontSize: 24,
    fontWeight: "900",
  },

  cardSubtitle: {
    color: "#CAD3DD",
    fontSize: 15,
    fontWeight: "700",
    marginTop: 6,
  },

  deleteAction: {
    backgroundColor: "#3A1C1C",
    borderColor: "#FF6B6B",
    borderWidth: 1,
    justifyContent: "center",
    alignItems: "center",
    width: 90,
    marginBottom: 14,
    borderRadius: 18,
  },

  deleteActionText: {
    color: "#FF6B6B",
    fontWeight: "900",
  },
});
