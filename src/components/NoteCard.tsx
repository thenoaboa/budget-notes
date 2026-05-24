import { useRef, useState } from "react";
import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { Swipeable } from "react-native-gesture-handler";

import type { Budget } from "../types/budget";
import { formatNoteDate } from "../utils/budgetDates";

type Props = {
  budget: Budget;
  onPress: () => void;
  onPressIn?: () => void;
  onDelete: () => void;
  onRename: (newTitle: string) => void;
};

export function NoteCard({
  budget,
  onPress,
  onPressIn,
  onDelete,
  onRename,
}: Props) {
  const swipeableRef = useRef<Swipeable>(null);

  const [isEditing, setIsEditing] = useState(false);
  const [draftTitle, setDraftTitle] = useState(
    budget.budgetName || "Untitled Note",
  );

  function handleDelete() {
    swipeableRef.current?.close();
    onDelete();
  }

  function handlePressIn() {
    if (isEditing) {
      return;
    }

    onPressIn?.();
  }

  function handlePress() {
    if (isEditing) {
      return;
    }

    swipeableRef.current?.close();
    onPress();
  }

  function saveTitle() {
    const cleanedTitle = draftTitle.trim() || "Untitled";
    setDraftTitle(cleanedTitle);
    setIsEditing(false);
    onRename(cleanedTitle);
  }

  function renderRightActions() {
    return (
      <Pressable style={styles.deleteAction} onPress={handleDelete}>
        <Text style={styles.deleteActionText}>Delete</Text>
      </Pressable>
    );
  }

  return (
    <Swipeable
      ref={swipeableRef}
      renderRightActions={renderRightActions}
      overshootRight={false}
    >
      <Pressable
        style={styles.card}
        onPressIn={handlePressIn}
        onPress={handlePress}
      >
        <View style={styles.titleRow}>
          {isEditing ? (
            <TextInput
              style={styles.cardTitleInput}
              value={draftTitle}
              onChangeText={setDraftTitle}
              onBlur={saveTitle}
              onSubmitEditing={saveTitle}
              autoFocus
              selectTextOnFocus
              returnKeyType="done"
            />
          ) : (
            <Text style={styles.cardTitle} numberOfLines={1}>
              {budget.budgetName || "Untitled Note"}
            </Text>
          )}

          <Pressable
            style={styles.editIconButton}
            onPress={() => setIsEditing(true)}
          >
            <Text style={styles.editIcon}>✎</Text>
          </Pressable>
        </View>

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

  titleRow: {
    flexDirection: "row",
    alignItems: "center",
  },

  cardTitle: {
    color: "#FFFFFF",
    fontSize: 24,
    fontWeight: "900",
    maxWidth: "88%",
  },

  cardTitleInput: {
    color: "#FFFFFF",
    fontSize: 24,
    fontWeight: "900",
    padding: 0,
    maxWidth: "88%",
  },

  editIconButton: {
    marginLeft: 8,
    padding: 4,
  },

  editIcon: {
    color: "#8A98A8",
    fontSize: 17,
    fontWeight: "800",
    opacity: 0.55,
    transform: [{ scaleX: -1 }],
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
