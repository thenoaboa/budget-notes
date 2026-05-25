// Save as: src/components/BudgetTitleCard.tsx

import { StyleSheet, Text, TextInput, View } from "react-native";

type Props = {
  noteTitle: string;
  setNoteTitle: (value: string) => void;
};

export function BudgetTitleCard({ noteTitle, setNoteTitle }: Props) {
  return (
    <View style={styles.card}>
      <Text style={styles.label}>Budget Title</Text>

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
    backgroundColor: "#1B2633",
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: "#344657",
    marginBottom: 14,
  },

  label: {
    color: "#8A98A8",
    fontSize: 13,
    fontWeight: "800",
    marginBottom: 10,
    letterSpacing: 0.3,
  },

  input: {
    backgroundColor: "#2A3948",
    color: "#FFFFFF",
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 14,
    fontSize: 22,
    fontWeight: "900",
  },
});
