import { Pressable, StyleSheet, Text } from "react-native";
import { Swipeable } from "react-native-gesture-handler";

import type { Budget } from "../types/budget";
import { formatNoteDate } from "../utils/budgetDates";

type Props = {
  budget: Budget;
  onPress: () => void;
  onDelete: () => void;
};

export function NoteCard({ budget, onPress, onDelete }: Props) {
  function renderRightActions() {
    return (
      <Pressable style={styles.deleteAction} onPress={onDelete}>
        <Text style={styles.deleteActionText}>Delete</Text>
      </Pressable>
    );
  }

  return (
    <Swipeable renderRightActions={renderRightActions}>
      <Pressable style={styles.card} onPress={onPress}>
        <Text style={styles.cardTitle}>
          {budget.budgetName || "Untitled Note"}
        </Text>

        <Text style={styles.cardSubtitle}>{formatNoteDate(budget)}</Text>
      </Pressable>
    </Swipeable>
  );
}

const styles = StyleSheet.create({
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
