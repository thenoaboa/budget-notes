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
          <Text style={styles.billEmoji}>🐷</Text>

          <View style={styles.headerText}>
            <Text style={styles.title}>Bill&apos;s Corner</Text>
            <Text style={styles.subtitle}>
              Quick lessons for making smarter spending decisions.
            </Text>
          </View>
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

        <View style={styles.comingSoonCard}>
          <Text style={styles.comingSoonEmoji}>📚</Text>
          <Text style={styles.comingSoonTitle}>More lessons coming soon</Text>
          <Text style={styles.comingSoonBody}>
            Future lessons can be added by creating another object inside
            billLessons.ts.
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
    alignItems: "center",
    marginBottom: 30,
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
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
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
  comingSoonCard: {
    alignItems: "center",
    backgroundColor: "#171C19",
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#252D29",
    borderStyle: "dashed",
    padding: 24,
    marginTop: 12,
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
