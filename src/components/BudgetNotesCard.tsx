// Save as: src/components/BudgetNotesCard.tsx

import { StyleSheet, Text, TextInput, View } from "react-native";

type Props = {
  receiptNote: string;
  setReceiptNote: (value: string) => void;
};

export function BudgetNotesCard({ receiptNote, setReceiptNote }: Props) {
  return (
    <View style={styles.notesCard}>
      <Text style={styles.notesMirror}>
        {receiptNote.length > 0 ? `${receiptNote}\n` : "Notes..."}
      </Text>

      <TextInput
        style={styles.notesInput}
        value={receiptNote}
        onChangeText={setReceiptNote}
        placeholder="Note..."
        placeholderTextColor="#6F7F8F"
        multiline
        textAlignVertical="top"
        selectionColor="#2ECC71"
        underlineColorAndroid="transparent"
        scrollEnabled={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  notesCard: {
    marginTop: 19,
    backgroundColor: "#17232F",
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "#2D3D4D",
    paddingHorizontal: 14,
    paddingTop: 14,
    paddingBottom: 14,
    minHeight: 116,
  },

  notesMirror: {
    minHeight: 88,
    color: "transparent",
    fontSize: 15,
    fontWeight: "600",
    lineHeight: 21,
  },

  notesInput: {
    position: "absolute",
    top: 14,
    left: 14,
    right: 14,
    bottom: 14,
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "600",
    lineHeight: 21,
    padding: 0,
    borderWidth: 0,
    outlineStyle: "none" as any,
    overflow: "hidden",
  },
});
