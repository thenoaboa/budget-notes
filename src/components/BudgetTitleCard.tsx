// Save as: src/components/BudgetTitleCard.tsx

import { StyleSheet, TextInput, View } from "react-native";

type Props = {
  noteTitle: string;
  setNoteTitle: (value: string) => void;
};

export function BudgetTitleCard({ noteTitle, setNoteTitle }: Props) {
  return (
    <View style={styles.card}>
      <TextInput
        style={styles.input}
        placeholder="Untitled Budget"
        placeholderTextColor="#8A98A8"
        value={noteTitle}
        onChangeText={setNoteTitle}
        returnKeyType="done"
      />
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

  input: {
    color: "#FFFFFF",
    fontSize: 22,
    fontWeight: "900",
    padding: 0,
  },
});
