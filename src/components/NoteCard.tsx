import { useRef, useState } from "react";
import {
  Dimensions,
  Platform,
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
  const [deleteHovered, setDeleteHovered] = useState(false);
  const [draftTitle, setDraftTitle] = useState(
    budget.budgetName || "Untitled Note",
  );

  const isDesktopWeb =
    Platform.OS === "web" && Dimensions.get("window").width >= 768;

  function handleDelete() {
    swipeableRef.current?.close();
    onDelete();
  }

  function handlePress() {
    if (isEditing) return;

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

  function CardContent() {
    return (
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
          </View>
        </View>

        <Text style={styles.cardSubtitle}>{formatNoteDate(budget)}</Text>
      </Pressable>
    );
  }

  if (isDesktopWeb) {
    return (
      <View style={styles.webContainer}>
        <View style={{ flex: 1 }}>
          <CardContent />
        </View>

        <Pressable
          style={[
            styles.webDeleteButton,
            deleteHovered && styles.webDeleteButtonHovered,
          ]}
          onHoverIn={() => setDeleteHovered(true)}
          onHoverOut={() => setDeleteHovered(false)}
          onPress={handleDelete}
        >
          <Text
            style={[
              styles.webDeleteText,
              deleteHovered && styles.webDeleteTextHovered,
            ]}
          >
            Delete
          </Text>
        </Pressable>
      </View>
    );
  }

  return (
    <Swipeable
      ref={swipeableRef}
      renderRightActions={() => (
        <View style={styles.deleteActionWrapper}>
          <Pressable style={styles.deleteAction} onPress={handleDelete}>
            <Text style={styles.deleteActionText}>Delete</Text>
          </Pressable>
        </View>
      )}
      overshootRight={false}
    >
      <CardContent />
    </Swipeable>
  );
}

const styles = StyleSheet.create({
  webContainer: {
    flexDirection: "row",
    alignItems: "stretch",
  },

  webDeleteButton: {
    marginLeft: 8,
    backgroundColor: "#243342",
    borderColor: "#3B4D5F",
    borderWidth: 1,
    borderRadius: 18,
    paddingHorizontal: 12,
    marginBottom: 14,
    justifyContent: "center",
    alignItems: "center",
  },

  webDeleteButtonHovered: {
    backgroundColor: "#3A1C1C",
    borderColor: "#FF6B6B",
  },

  webDeleteText: {
    color: "#8A98A8",
    fontWeight: "900",
  },

  webDeleteTextHovered: {
    color: "#FF6B6B",
  },

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
    fontWeight: "900",
  },
});
