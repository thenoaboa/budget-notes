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
        <View style={styles.leftSpacer} />

        <TextInput
          style={styles.input}
          placeholder="Untitled Budget"
          placeholderTextColor="#8A98A8"
          value={noteTitle}
          onChangeText={setNoteTitle}
          returnKeyType="done"
        />

        <Pressable style={styles.shareButton} onPress={onShare}>
          <Text style={styles.shareButtonText}>↑</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#2A3948",
    borderRadius: 18,
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderWidth: 1,
    borderColor: "#344657",
    marginBottom: 14,
  },

  row: {
    flexDirection: "row",
    alignItems: "center",
  },

  leftSpacer: {
    width: 34,
  },

  input: {
    flex: 1,
    color: "#FFFFFF",
    fontSize: 22,
    fontWeight: "900",
    padding: 0,
    textAlign: "center",
    marginHorizontal: 10,
  },

  shareButton: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: "#243342",
    borderWidth: 1,
    borderColor: "#3B4D5F",
    alignItems: "center",
    justifyContent: "center",
  },

  shareButtonText: {
    color: "#CAD3DD",
    fontSize: 18,
    fontWeight: "900",
  },
});
