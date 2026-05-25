import { useRef, useState } from "react";
import {
  Alert,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { Swipeable } from "react-native-gesture-handler";

import type { Budget } from "../types/budget";
import { formatNoteDate } from "../utils/budgetDates";

type Props = {
  budget: Budget;
  onPress: () => void;
  onDelete: () => void;
  onRename: (newTitle: string) => void;
};

export function NoteCard({ budget, onPress, onDelete, onRename }: Props) {
  const swipeableRef = useRef<Swipeable>(null);

  const [isEditing, setIsEditing] = useState(false);
  const [draftTitle, setDraftTitle] = useState(
    budget.budgetName || "Untitled Note",
  );

  function handleDelete() {
    swipeableRef.current?.close();
    onDelete();
  }

  function handlePress() {
    if (isEditing) {
      return;
    }

    swipeableRef.current?.close();
    onPress();
  }

  function startEditing() {
    swipeableRef.current?.close();
    setIsEditing(true);
  }

  function saveTitle() {
    const cleanedTitle = draftTitle.trim() || "Untitled";

    setDraftTitle(cleanedTitle);
    setIsEditing(false);
    onRename(cleanedTitle);
  }

  async function handleShare() {
    try {
      const shareUrl =
        typeof window !== "undefined"
          ? `${window.location.origin}/budget/${budget.id}`
          : "";

      const shareTitle = budget.budgetName || "Budget Note";

      if (typeof navigator !== "undefined" && navigator.share) {
        await navigator.share({
          title: shareTitle,
          text: `Check out this budget: ${shareTitle}`,
          url: shareUrl,
        });

        return;
      }

      if (typeof navigator !== "undefined" && navigator.clipboard && shareUrl) {
        await navigator.clipboard.writeText(shareUrl);
        Alert.alert("Link copied", "Budget link copied to clipboard.");
        return;
      }

      Alert.alert(
        "Sharing unavailable",
        "Sharing is not available on this device.",
      );
    } catch (error) {
      console.log("Share failed:", error);
      Alert.alert("Share failed", "Something went wrong while sharing.");
    }
  }

  function renderRightActions() {
    return (
      <View style={styles.deleteActionWrapper}>
        <Pressable style={styles.deleteAction} onPress={handleDelete}>
          <Text style={styles.deleteActionText}>Delete</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <Swipeable
      ref={swipeableRef}
      renderRightActions={renderRightActions}
      overshootRight={false}
    >
      <Pressable style={styles.card} onPress={handlePress}>
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

          <View style={styles.iconRow}>
            <Pressable style={styles.editIconButton} onPress={startEditing}>
              <Text style={styles.editIcon}>✎</Text>
            </Pressable>

            <Pressable style={styles.shareButton} onPress={handleShare}>
              <Text style={styles.shareIcon}>↑</Text>
            </Pressable>
          </View>
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
    width: "100%",
  },

  cardTitle: {
    flex: 1,
    minWidth: 0,
    color: "#FFFFFF",
    fontSize: 24,
    fontWeight: "900",
    paddingRight: 10,
  },

  cardTitleInput: {
    flex: 1,
    minWidth: 0,
    color: "#FFFFFF",
    fontSize: 24,
    fontWeight: "900",
    padding: 0,
    paddingRight: 10,
  },

  iconRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    flexShrink: 0,
  },

  editIconButton: {
    width: 32,
    height: 32,

    alignItems: "center",
    justifyContent: "center",

    marginRight: 8,
  },

  editIcon: {
    color: "#8A98A8",
    fontSize: 24,
    fontWeight: "900",
    opacity: 0.9,
    transform: [{ scaleX: -1 }],
  },

  shareButton: {
    width: 30,
    height: 30,
    borderRadius: 9,
    backgroundColor: "#243342",
    borderWidth: 1,
    borderColor: "#3B4D5F",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },

  shareIcon: {
    color: "#CAD3DD",
    fontSize: 16,
    fontWeight: "900",
  },

  cardSubtitle: {
    color: "#CAD3DD",
    fontSize: 15,
    fontWeight: "700",
    marginTop: 6,
  },

  deleteActionWrapper: {
    paddingLeft: 12,
    marginBottom: 14,
  },

  deleteAction: {
    backgroundColor: "#3A1C1C",
    borderColor: "#FF6B6B",
    borderWidth: 1,
    justifyContent: "center",
    alignItems: "center",
    width: 90,
    height: "100%",
    borderRadius: 18,
  },

  deleteActionText: {
    color: "#FF6B6B",
    fontWeight: "800",
  },
});
