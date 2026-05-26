import { Pressable, StyleSheet, Text, View } from "react-native";

type Props = {
  title: string;
  body: string;
  buttonText?: string;
  onNext: () => void;
  onSkip: () => void;
};

export function TutorialOverlay({
  title,
  body,
  buttonText = "Next",
  onNext,
  onSkip,
}: Props) {
  return (
    <View style={styles.overlay}>
      <View style={styles.card}>
        <Text style={styles.title}>{title}</Text>

        <Text style={styles.body}>{body}</Text>

        <View style={styles.buttonRow}>
          <Pressable onPress={onSkip}>
            <Text style={styles.skipText}>Skip</Text>
          </Pressable>

          <Pressable style={styles.nextButton} onPress={onNext}>
            <Text style={styles.nextButtonText}>{buttonText}</Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.72)",
    justifyContent: "center",
    paddingHorizontal: 24,
    zIndex: 9999,
  },

  card: {
    backgroundColor: "#17232F",
    borderRadius: 24,
    borderWidth: 1,
    borderColor: "#2ECC71",
    padding: 22,
  },

  title: {
    color: "#FFFFFF",
    fontSize: 24,
    fontWeight: "900",
    marginBottom: 12,
  },

  body: {
    color: "#CAD3DD",
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 28,
  },

  buttonRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  skipText: {
    color: "#93A4B4",
    fontSize: 16,
    fontWeight: "700",
  },

  nextButton: {
    backgroundColor: "#2ECC71",
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 999,
  },

  nextButtonText: {
    color: "#101820",
    fontSize: 16,
    fontWeight: "900",
  },
});
