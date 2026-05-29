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
    <View style={styles.overlay} pointerEvents="auto">
      <View style={styles.card}>
        <Text style={styles.title}>{title}</Text>

        <Text style={styles.body}>{body}</Text>

        <View style={styles.buttonRow}>
          <Pressable style={styles.skipButton} onPress={onSkip} hitSlop={12}>
            <Text style={styles.skipText}>Skip</Text>
          </Pressable>

          <Pressable style={styles.nextButton} onPressIn={onNext} hitSlop={12}>
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
    zIndex: 99999,
    elevation: 99999,
  },

  card: {
    backgroundColor: "#17232F",
    borderRadius: 24,
    borderWidth: 1,
    borderColor: "#2ECC71",
    padding: 22,
    zIndex: 100000,
    elevation: 100000,
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

  skipButton: {
    paddingVertical: 12,
    paddingRight: 18,
  },

  skipText: {
    color: "#93A4B4",
    fontSize: 16,
    fontWeight: "700",
  },

  nextButton: {
    backgroundColor: "#2ECC71",
    paddingHorizontal: 28,
    paddingVertical: 14,
    borderRadius: 999,
    minWidth: 92,
    alignItems: "center",
    justifyContent: "center",
  },

  nextButtonText: {
    color: "#101820",
    fontSize: 16,
    fontWeight: "900",
  },
});
