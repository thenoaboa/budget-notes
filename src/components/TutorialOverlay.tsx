import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";

type Props = {
  title: string;
  body: string;
  buttonText?: string;
  onNext: () => void;
  onSkip: () => void;

  inputValue?: string;
  onChangeInput?: (value: string) => void;
  inputPlaceholder?: string;
  showInput?: boolean;
};

export function TutorialOverlay({
  title,
  body,
  buttonText = "Next",
  onNext,
  onSkip,
  inputValue = "",
  onChangeInput,
  inputPlaceholder = "Weekly groceries",
  showInput = false,
}: Props) {
  return (
    <View style={styles.overlay} pointerEvents="auto">
      <View style={styles.dialogueWrapper}>
        <View style={styles.billBadge}>
          <Text style={styles.billIcon}>🐷</Text>

          <View>
            <Text style={styles.billName}>Bill</Text>
            <Text style={styles.billLabel}>Budget guide</Text>
          </View>
        </View>

        <View style={styles.card}>
          <View style={styles.speechTailBorder} />
          <View style={styles.speechTail} />

          <Text style={styles.title}>{title}</Text>

          <Text style={styles.body}>{body}</Text>

          {showInput && (
            <TextInput
              style={styles.input}
              value={inputValue}
              onChangeText={onChangeInput}
              placeholder={inputPlaceholder}
              placeholderTextColor="#7E91A3"
              autoCapitalize="sentences"
              returnKeyType="done"
              onSubmitEditing={onNext}
              accessibilityLabel="Budget name"
            />
          )}

          <View style={styles.buttonRow}>
            <Pressable
              style={styles.skipButton}
              onPress={onSkip}
              hitSlop={12}
              accessibilityRole="button"
              accessibilityLabel="Skip tutorial"
            >
              <Text style={styles.skipText}>
                {showInput ? "Skip for now" : "Skip"}
              </Text>
            </Pressable>

            <Pressable
              style={styles.nextButton}
              onPress={onNext}
              hitSlop={12}
              accessibilityRole="button"
              accessibilityLabel={buttonText}
            >
              <Text style={styles.nextButtonText}>{buttonText}</Text>
            </Pressable>
          </View>
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

  dialogueWrapper: {
    width: "100%",
    maxWidth: 430,
    alignSelf: "center",
  },

  billBadge: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    marginLeft: 12,
    marginBottom: 10,
  },

  billIcon: {
    fontSize: 44,
    marginRight: 10,
  },

  billName: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "900",
    lineHeight: 21,
  },

  billLabel: {
    color: "#9FB0BF",
    fontSize: 13,
    fontWeight: "700",
    marginTop: 1,
  },

  card: {
    position: "relative",
    backgroundColor: "#17232F",
    borderRadius: 24,
    borderWidth: 1,
    borderColor: "#2ECC71",
    padding: 22,
    zIndex: 100000,
    elevation: 100000,
  },

  speechTailBorder: {
    position: "absolute",
    top: -13,
    left: 34,
    width: 0,
    height: 0,
    borderLeftWidth: 13,
    borderRightWidth: 13,
    borderBottomWidth: 13,
    borderLeftColor: "transparent",
    borderRightColor: "transparent",
    borderBottomColor: "#2ECC71",
  },

  speechTail: {
    position: "absolute",
    top: -11,
    left: 35,
    width: 0,
    height: 0,
    borderLeftWidth: 12,
    borderRightWidth: 12,
    borderBottomWidth: 12,
    borderLeftColor: "transparent",
    borderRightColor: "transparent",
    borderBottomColor: "#17232F",
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
    marginBottom: 22,
  },

  input: {
    backgroundColor: "#101820",
    color: "#FFFFFF",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#3B4D5F",
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    fontWeight: "800",
    marginBottom: 22,
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
