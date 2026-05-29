// Save as: src/components/BudgetTitleCard.tsx

import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";

type Props = {
  noteTitle: string;
  setNoteTitle: (value: string) => void;
  onShare?: () => void;
};

export function BudgetTitleCard({ noteTitle, setNoteTitle, onShare }: Props) {
  return (
    <View style={styles.card}>
      <View style={styles.row}>
        <TextInput
          style={styles.input}
          placeholder="Add title"
          placeholderTextColor="#8A98A8"
          value={noteTitle}
          onChangeText={setNoteTitle}
          returnKeyType="done"
        />

        {false && (
          <Pressable
            style={styles.shareButton}
            onPress={onShare}
            disabled={!onShare}
          >
            <Text style={styles.shareButtonText}>↑</Text>
          </Pressable>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#1B2633",
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: "#26394C",
    marginBottom: 12,
  },

  row: {
    flexDirection: "row",
    alignItems: "center",
    width: "100%",
  },

  input: {
    flex: 1,
    minWidth: 0,
    color: "#FFFFFF",
    fontSize: 17,
    fontWeight: "900",
    padding: 0,
    textAlign: "left",
    marginRight: 12,
  },

  shareButton: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: "#243342",
    borderWidth: 1,
    borderColor: "#3B4D5F",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },

  shareButtonText: {
    color: "#CAD3DD",
    fontSize: 18,
    fontWeight: "900",
  },
});
