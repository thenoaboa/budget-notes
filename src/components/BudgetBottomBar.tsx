// Save as: src/components/BudgetBottomBar.tsx

import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";

type Props = {
  noteTitle: string;
  setNoteTitle: (value: string) => void;
  lastEditedText: string;
  onBack: () => void;
  onCreateNewNote: () => void;
};

export function BudgetBottomBar({
  noteTitle,
  setNoteTitle,
  lastEditedText,
  onBack,
  onCreateNewNote,
}: Props) {
  return (
    <View style={styles.bottomSection}>
      <View style={styles.bottomTopRow}>
        <Pressable style={styles.bottomIconButton} onPress={onBack}>
          <Text style={styles.bottomIconText}>‹</Text>
        </Pressable>

        <View style={styles.bottomTitleWrap}>
          <TextInput
            style={styles.bottomTitleInput}
            placeholder="Untitled"
            placeholderTextColor="#5F6B78"
            value={noteTitle}
            onChangeText={setNoteTitle}
            textAlign="center"
            numberOfLines={1}
            multiline={false}
          />
        </View>

        <Pressable style={styles.bottomIconButton} onPress={onCreateNewNote}>
          <Text style={styles.bottomIconText}>+</Text>
        </Pressable>
      </View>

      {lastEditedText !== "" && (
        <Text style={styles.lastEditedText}>{lastEditedText}</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  bottomSection: {
    marginTop: 24,
    marginBottom: 40,
  },

  bottomTopRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    width: "100%",
    gap: 12,
  },

  bottomTitleWrap: {
    flex: 1,
    minWidth: 0,
    alignItems: "center",
  },

  bottomTitleInput: {
    width: "100%",
    maxWidth: "100%",
    color: "#FFFFFF",
    fontSize: 30,
    fontWeight: "900",
    letterSpacing: -0.7,
    paddingHorizontal: 10,
    paddingVertical: 8,
    textAlign: "center",
    flexShrink: 1,
  },

  bottomIconButton: {
    width: 42,
    height: 42,
    borderRadius: 14,
    backgroundColor: "#2A3948",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },

  bottomIconText: {
    color: "#2ECC71",
    fontSize: 30,
    fontWeight: "900",
    lineHeight: 32,
  },

  lastEditedText: {
    color: "#8A98A8",
    fontSize: 12,
    fontWeight: "700",
    textAlign: "center",
    marginTop: 4,
  },
});
