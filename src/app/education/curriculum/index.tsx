import Ionicons from "@expo/vector-icons/Ionicons";
import { useRouter } from "expo-router";
import {
    Alert,
    Platform,
    Pressable,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    View,
} from "react-native";

type Lesson = {
  id: string;
  title: string;
  description: string;
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
  duration: string;
  status: "available" | "coming-soon";
  route?: string;
};

const lessons: Lesson[] = [
  {
    id: "grocery-challenge",
    title: "The Grocery Challenge",
    description:
      "Stay within a grocery budget while deciding what your household needs.",
    icon: "cart-outline",
    color: "#2ECC71",
    duration: "10–15 min",
    status: "available",
    route: "/education/grocery-challenge",
  },
  {
    id: "needs-and-wants",
    title: "Needs vs. Wants",
    description:
      "Learn how to separate essential expenses from things you would simply like to have.",
    icon: "git-compare-outline",
    color: "#5DADE2",
    duration: "10 min",
    status: "coming-soon",
  },
  {
    id: "first-budget",
    title: "Build Your First Budget",
    description:
      "Give every dollar a purpose without spending more money than you have.",
    icon: "calculator-outline",
    color: "#B56CFF",
    duration: "15–20 min",
    status: "coming-soon",
  },
  {
    id: "unexpected-expense",
    title: "The Unexpected Expense",
    description:
      "Change your plan when a surprise expense appears after your budget is finished.",
    icon: "warning-outline",
    color: "#F5A623",
    duration: "10–15 min",
    status: "coming-soon",
  },
];

export default function CurriculumScreen() {
  const router = useRouter();

  function openLesson(lesson: Lesson) {
    if (lesson.status === "available" && lesson.route) {
      router.push(lesson.route as any);
      return;
    }

    const message = `${lesson.title} will be added soon.`;

    if (Platform.OS === "web") {
      window.alert(message);
      return;
    }

    Alert.alert("Coming Soon", message);
  }

  return (
    <SafeAreaView style={styles.screen}>
      <View style={styles.container}>
        <View style={styles.header}>
          <Pressable
            style={({ pressed }) => [
              styles.backButton,
              pressed && styles.pressed,
            ]}
            onPress={() => router.back()}
            hitSlop={10}
            accessibilityRole="button"
            accessibilityLabel="Return to Education Mode"
          >
            <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
          </Pressable>

          <Text style={styles.headerTitle}>Curriculum</Text>

          <View style={styles.headerSpacer} />
        </View>

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.introduction}>
            <Text style={styles.title}>Learn by doing.</Text>

            <Text style={styles.subtitle}>
              Complete real-life money challenges using Budget Note.
            </Text>
          </View>

          <View style={styles.progressCard}>
            <View style={styles.progressTop}>
              <View>
                <Text style={styles.progressLabel}>YOUR PROGRESS</Text>
                <Text style={styles.progressText}>
                  0 of 4 lessons completed
                </Text>
              </View>

              <View style={styles.progressIcon}>
                <Ionicons name="trophy-outline" size={25} color="#F5C451" />
              </View>
            </View>

            <View style={styles.progressTrack}>
              <View style={styles.progressFill} />
            </View>
          </View>

          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Starter Curriculum</Text>
            <Text style={styles.freeLabel}>FREE</Text>
          </View>

          <View style={styles.lessonList}>
            {lessons.map((lesson, index) => {
              const available = lesson.status === "available";

              return (
                <Pressable
                  key={lesson.id}
                  style={({ pressed }) => [
                    styles.lessonCard,
                    pressed && styles.pressedCard,
                  ]}
                  onPress={() => openLesson(lesson)}
                  accessibilityRole="button"
                  accessibilityLabel={`${lesson.title}, ${
                    available ? "available" : "coming soon"
                  }`}
                >
                  <View style={styles.lessonNumber}>
                    <Text style={styles.lessonNumberText}>{index + 1}</Text>
                  </View>

                  <View
                    style={[
                      styles.lessonIcon,
                      { borderColor: `${lesson.color}55` },
                    ]}
                  >
                    <Ionicons
                      name={lesson.icon}
                      size={27}
                      color={lesson.color}
                    />
                  </View>

                  <View style={styles.lessonContent}>
                    <View style={styles.lessonTitleRow}>
                      <Text style={styles.lessonTitle}>{lesson.title}</Text>

                      {!available && (
                        <View style={styles.soonBadge}>
                          <Text style={styles.soonBadgeText}>SOON</Text>
                        </View>
                      )}
                    </View>

                    <Text style={styles.lessonDescription}>
                      {lesson.description}
                    </Text>

                    <View style={styles.lessonDetails}>
                      <Ionicons name="time-outline" size={15} color="#8A98A8" />
                      <Text style={styles.lessonDuration}>
                        {lesson.duration}
                      </Text>
                    </View>
                  </View>

                  <Ionicons
                    name={available ? "chevron-forward" : "lock-closed-outline"}
                    size={21}
                    color={available ? "#8A98A8" : "#657383"}
                  />
                </Pressable>
              );
            })}
          </View>

          <Text style={styles.footerText}>
            More lessons and complete curriculum units are coming to Budget
            Note.
          </Text>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#101820",
  },

  container: {
    flex: 1,
    paddingHorizontal: 18,
    paddingTop: 12,
  },

  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 8,
  },

  backButton: {
    width: 42,
    height: 42,
    borderRadius: 13,
    backgroundColor: "#1B2738",
    borderWidth: 1,
    borderColor: "#344657",
    alignItems: "center",
    justifyContent: "center",
  },

  headerTitle: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "900",
  },

  headerSpacer: {
    width: 42,
  },

  scrollView: {
    flex: 1,
  },

  scrollContent: {
    paddingBottom: 40,
  },

  introduction: {
    marginTop: 28,
    marginBottom: 25,
  },

  title: {
    color: "#FFFFFF",
    fontSize: 29,
    fontWeight: "900",
    letterSpacing: -0.5,
  },

  subtitle: {
    color: "#AAB5C1",
    fontSize: 15,
    fontWeight: "600",
    lineHeight: 22,
    marginTop: 8,
  },

  progressCard: {
    backgroundColor: "#1B2738",
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "#344657",
    padding: 17,
    marginBottom: 28,
  },

  progressTop: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  progressLabel: {
    color: "#B56CFF",
    fontSize: 11,
    fontWeight: "900",
    letterSpacing: 1,
  },

  progressText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "800",
    marginTop: 5,
  },

  progressIcon: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: "#243342",
    alignItems: "center",
    justifyContent: "center",
  },

  progressTrack: {
    height: 8,
    backgroundColor: "#2A3848",
    borderRadius: 999,
    marginTop: 16,
    overflow: "hidden",
  },

  progressFill: {
    width: "0%",
    height: "100%",
    backgroundColor: "#B56CFF",
    borderRadius: 999,
  },

  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 13,
  },

  sectionTitle: {
    color: "#FFFFFF",
    fontSize: 19,
    fontWeight: "900",
  },

  freeLabel: {
    color: "#2ECC71",
    fontSize: 11,
    fontWeight: "900",
    backgroundColor: "#183C32",
    borderRadius: 999,
    paddingHorizontal: 9,
    paddingVertical: 4,
    marginLeft: 9,
    overflow: "hidden",
  },

  lessonList: {
    gap: 13,
  },

  lessonCard: {
    minHeight: 132,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#1B2738",
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "#344657",
    paddingHorizontal: 13,
    paddingVertical: 15,
  },

  pressedCard: {
    backgroundColor: "#243342",
    transform: [{ scale: 0.99 }],
  },

  lessonNumber: {
    position: "absolute",
    top: 9,
    left: 9,
    width: 21,
    height: 21,
    borderRadius: 11,
    backgroundColor: "#2A3848",
    alignItems: "center",
    justifyContent: "center",
  },

  lessonNumberText: {
    color: "#AAB5C1",
    fontSize: 11,
    fontWeight: "900",
  },

  lessonIcon: {
    width: 52,
    height: 52,
    borderRadius: 16,
    backgroundColor: "#243342",
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 13,
  },

  lessonContent: {
    flex: 1,
    paddingRight: 9,
  },

  lessonTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
  },

  lessonTitle: {
    color: "#FFFFFF",
    fontSize: 17,
    fontWeight: "900",
  },

  soonBadge: {
    backgroundColor: "#2A3848",
    borderRadius: 999,
    paddingHorizontal: 7,
    paddingVertical: 3,
    marginLeft: 7,
  },

  soonBadgeText: {
    color: "#8A98A8",
    fontSize: 9,
    fontWeight: "900",
  },

  lessonDescription: {
    color: "#AAB5C1",
    fontSize: 13,
    fontWeight: "600",
    lineHeight: 18,
    marginTop: 5,
  },

  lessonDetails: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 8,
  },

  lessonDuration: {
    color: "#8A98A8",
    fontSize: 12,
    fontWeight: "700",
    marginLeft: 5,
  },

  footerText: {
    color: "#748292",
    fontSize: 13,
    fontWeight: "600",
    textAlign: "center",
    lineHeight: 19,
    paddingHorizontal: 24,
    marginTop: 26,
  },

  pressed: {
    opacity: 0.7,
  },
});
