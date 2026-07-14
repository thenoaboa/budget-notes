import { router } from "expo-router";
import {
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { billLessons } from "@/data/billLessons";

export default function BillsCornerScreen() {
  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Text style={styles.billEmoji}>🐷</Text>

            <View style={styles.headerText}>
              <Text style={styles.title}>Bill&apos;s Corner</Text>

              <Text style={styles.subtitle}>
                Quick lessons for making smarter spending decisions.
              </Text>
            </View>
          </View>

          <Pressable
            style={({ pressed }) => [
              styles.closeButton,
              pressed && styles.closeButtonPressed,
            ]}
            onPress={() => router.back()}
            accessibilityRole="button"
            accessibilityLabel="Return to main menu"
          >
            <Text style={styles.closeButtonText}>✕</Text>
          </Pressable>
        </View>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Lessons</Text>

          <Text style={styles.sectionCount}>
            {billLessons.length} available
          </Text>
        </View>

        {billLessons.map((lesson) => (
          <Pressable
            key={lesson.id}
            style={({ pressed }) => [
              styles.lessonCard,
              pressed && styles.lessonCardPressed,
            ]}
            onPress={() => router.push(`/bills-corner/lessons/${lesson.id}`)}
            accessibilityRole="button"
            accessibilityLabel={`Open Lesson ${lesson.lessonNumber}: ${lesson.title}`}
          >
            <View style={styles.lessonNumber}>
              <Text style={styles.lessonNumberText}>{lesson.lessonNumber}</Text>
            </View>

            <View style={styles.lessonInformation}>
              <Text style={styles.lessonTitle}>{lesson.title}</Text>

              <Text style={styles.lessonDescription}>{lesson.description}</Text>

              <View style={styles.lessonMetadata}>
                <Text style={styles.metadataText}>
                  About {lesson.durationMinutes} min
                </Text>

                <Text style={styles.metadataDivider}>•</Text>

                <Text style={styles.metadataText}>
                  {lesson.panels.length} parts
                </Text>
              </View>
            </View>

            <Text style={styles.chevron}>›</Text>
          </Pressable>
        ))}

        <View style={styles.practiceSectionHeader}>
          <Text style={styles.sectionTitle}>Practice</Text>

          <View style={styles.comingSoonBadge}>
            <Text style={styles.comingSoonBadgeText}>COMING SOON</Text>
          </View>
        </View>

        <View
          style={styles.practiceCard}
          accessibilityRole="summary"
          accessibilityLabel="Practice with Bill. Coming soon."
        >
          <View style={styles.practiceIconContainer}>
            <Text style={styles.practiceIcon}>🎯</Text>
          </View>

          <View style={styles.practiceInformation}>
            <View style={styles.practiceTitleRow}>
              <Text style={styles.practiceTitle}>Practice with Bill</Text>

              <Text style={styles.lockIcon}>🔒</Text>
            </View>

            <Text style={styles.practiceDescription}>
              Review completed lessons and test your knowledge.
            </Text>

            <View style={styles.practiceFeatures}>
              <View style={styles.practiceFeature}>
                <Text style={styles.practiceFeatureIcon}>⭐</Text>
                <Text style={styles.practiceFeatureText}>Daily challenges</Text>
              </View>

              <View style={styles.practiceFeature}>
                <Text style={styles.practiceFeatureIcon}>🧠</Text>
                <Text style={styles.practiceFeatureText}>Mixed review</Text>
              </View>

              <View style={styles.practiceFeature}>
                <Text style={styles.practiceFeatureIcon}>🪙</Text>
                <Text style={styles.practiceFeatureText}>
                  Earn and use coins
                </Text>
              </View>
            </View>
          </View>
        </View>

        <View style={styles.comingSoonCard}>
          <Text style={styles.comingSoonEmoji}>📚</Text>

          <Text style={styles.comingSoonTitle}>More lessons coming soon</Text>

          <Text style={styles.comingSoonBody}>
            Bill is working on more ways to help you plan before you spend.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#111513",
  },

  content: {
    padding: 20,
    paddingBottom: 50,
  },

  header: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    marginBottom: 30,
  },

  headerLeft: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    paddingRight: 10,
  },

  billEmoji: {
    fontSize: 48,
    marginRight: 14,
  },

  headerText: {
    flex: 1,
  },

  title: {
    color: "#FFFFFF",
    fontSize: 28,
    fontWeight: "800",
  },

  subtitle: {
    color: "#AAB4AE",
    fontSize: 15,
    lineHeight: 21,
    marginTop: 5,
  },

  closeButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 8,
  },

  closeButtonPressed: {
    opacity: 0.6,
  },

  closeButtonText: {
    color: "#FFFFFF",
    fontSize: 26,
    fontWeight: "700",
    lineHeight: 28,
  },

  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },

  practiceSectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 18,
    marginBottom: 12,
  },

  sectionTitle: {
    color: "#FFFFFF",
    fontSize: 20,
    fontWeight: "700",
  },

  sectionCount: {
    color: "#7CB55B",
    fontSize: 13,
    fontWeight: "600",
  },

  lessonCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#1B211E",
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#2A332E",
    padding: 16,
    marginBottom: 14,
  },

  lessonCardPressed: {
    opacity: 0.75,
    transform: [{ scale: 0.99 }],
  },

  lessonNumber: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: "#4E7D3A",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 14,
  },

  lessonNumberText: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "800",
  },

  lessonInformation: {
    flex: 1,
  },

  lessonTitle: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 5,
  },

  lessonDescription: {
    color: "#AAB4AE",
    fontSize: 14,
    lineHeight: 20,
  },

  lessonMetadata: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 10,
  },

  metadataText: {
    color: "#7CB55B",
    fontSize: 12,
    fontWeight: "600",
  },

  metadataDivider: {
    color: "#59645E",
    marginHorizontal: 8,
  },

  chevron: {
    color: "#FFFFFF",
    fontSize: 32,
    marginLeft: 10,
  },

  comingSoonBadge: {
    backgroundColor: "#29352F",
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },

  comingSoonBadgeText: {
    color: "#7CB55B",
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 0.7,
  },

  practiceCard: {
    flexDirection: "row",
    alignItems: "flex-start",
    backgroundColor: "#171C19",
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#3A463F",
    borderStyle: "dashed",
    padding: 16,
    opacity: 0.88,
  },

  practiceIconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "#252D29",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 14,
  },

  practiceIcon: {
    fontSize: 25,
  },

  practiceInformation: {
    flex: 1,
  },

  practiceTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  practiceTitle: {
    flex: 1,
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "700",
  },

  lockIcon: {
    fontSize: 15,
    marginLeft: 10,
  },

  practiceDescription: {
    color: "#9AA59F",
    fontSize: 14,
    lineHeight: 20,
    marginTop: 5,
  },

  practiceFeatures: {
    marginTop: 13,
    gap: 8,
  },

  practiceFeature: {
    flexDirection: "row",
    alignItems: "center",
  },

  practiceFeatureIcon: {
    width: 24,
    fontSize: 14,
  },

  practiceFeatureText: {
    color: "#7F8A84",
    fontSize: 12,
    fontWeight: "600",
  },

  comingSoonCard: {
    alignItems: "center",
    backgroundColor: "#171C19",
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#252D29",
    borderStyle: "dashed",
    padding: 24,
    marginTop: 24,
  },

  comingSoonEmoji: {
    fontSize: 34,
    marginBottom: 10,
  },

  comingSoonTitle: {
    color: "#FFFFFF",
    fontSize: 17,
    fontWeight: "700",
  },

  comingSoonBody: {
    color: "#8F9A94",
    fontSize: 14,
    lineHeight: 20,
    textAlign: "center",
    marginTop: 7,
  },
});
