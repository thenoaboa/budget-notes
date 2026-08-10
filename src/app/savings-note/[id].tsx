import * as Clipboard from "expo-clipboard";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import {
    KeyboardAvoidingView,
    Linking,
    Modal,
    Platform,
    Pressable,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    View,
} from "react-native";

import {
    duplicateSavingsNoteById,
    loadSavingsNotes,
    updateSavingsNoteById,
} from "../../storage/savingsStorage";
import type { SavingsContribution, SavingsNote } from "../../types/savingsNote";

const SAVINGS_BLUE = "#4EA8FF";

function parseMoney(value?: string) {
  const cleaned = (value || "").replace(/[^0-9.-]/g, "");
  const parsed = Number.parseFloat(cleaned);
  return Number.isFinite(parsed) ? parsed : 0;
}

function formatMoney(value: number) {
  return value.toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
  });
}

function sanitizeMoney(value: string) {
  const cleaned = value.replace(/[^0-9.]/g, "");
  const parts = cleaned.split(".");
  return parts.length <= 1
    ? cleaned
    : `${parts[0]}.${parts.slice(1).join("").slice(0, 2)}`;
}

export default function SavingsNoteScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const noteId = Array.isArray(id) ? id[0] : id;

  const [note, setNote] = useState<SavingsNote | null>(null);
  const [showMenu, setShowMenu] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showRenameModal, setShowRenameModal] = useState(false);
  const [toast, setToast] = useState("");

  const [addAmount, setAddAmount] = useState("");
  const [addNote, setAddNote] = useState("");
  const [nameDraft, setNameDraft] = useState("");
  const [goalDraft, setGoalDraft] = useState("");
  const [savedDraft, setSavedDraft] = useState("");

  useEffect(() => {
    async function loadNote() {
      if (!noteId) return;
      const notes = await loadSavingsNotes();
      setNote(notes.find((item) => item.id === noteId) || null);
    }

    loadNote();
  }, [noteId]);

  const stats = useMemo(() => {
    const target = parseMoney(note?.targetAmount);
    const saved = parseMoney(note?.savedAmount);
    const remaining = Math.max(target - saved, 0);
    const rawPercent = target > 0 ? (saved / target) * 100 : 0;

    return {
      target,
      saved,
      remaining,
      percent: Math.round(rawPercent),
      barPercent: Math.min(Math.max(rawPercent, 0), 100),
      complete: target > 0 && saved >= target,
    };
  }, [note]);

  async function persist(updates: Partial<SavingsNote>) {
    if (!noteId) return;
    const updated = await updateSavingsNoteById(noteId, updates);
    if (updated) setNote(updated);
  }

  async function addSavings() {
    const amount = parseMoney(addAmount);
    if (!note || amount <= 0) return;

    const contribution: SavingsContribution = {
      id: `${Date.now()}-${Math.random()}`,
      amount: amount.toFixed(2),
      note: addNote.trim(),
      createdAt: new Date().toISOString(),
    };

    await persist({
      savedAmount: (stats.saved + amount).toFixed(2),
      contributions: [contribution, ...(note.contributions || [])],
    });

    setAddAmount("");
    setAddNote("");
    setShowAddModal(false);
  }

  async function saveGoal() {
    await persist({
      targetAmount: goalDraft,
      savedAmount: savedDraft,
    });
    setShowEditModal(false);
  }

  async function saveName() {
    await persist({ name: nameDraft.trim() });
    setShowRenameModal(false);
  }

  async function duplicateNote() {
    if (!noteId) return;
    const copy = await duplicateSavingsNoteById(noteId);
    if (!copy) return;
    router.replace(`/savings-note/${copy.id}` as any);
  }

  async function shareNote() {
    if (!note) return;

    const text = `${note.name || "Savings Note"}\n\nSaved: ${formatMoney(
      stats.saved,
    )}\nGoal: ${formatMoney(stats.target)}\nProgress: ${
      stats.percent
    }%\nRemaining: ${formatMoney(stats.remaining)}`;

    await Clipboard.setStringAsync(text);
    setShowMenu(false);
    setToast("Copied to Clipboard");
    setTimeout(() => setToast(""), 900);
  }

  function openLink() {
    const value = note?.itemLink?.trim();
    if (!value) return;
    Linking.openURL(/^https?:\/\//i.test(value) ? value : `https://${value}`);
  }

  if (!note) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.loading}>
          <Text style={styles.loadingText}>Loading savings note...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <View style={styles.page}>
          <View style={styles.headerRow}>
            <Pressable onPress={() => router.back()}>
              <Text style={styles.backText}>← Savings</Text>
            </Pressable>

            <Pressable onPress={() => setShowMenu((value) => !value)}>
              <Text style={styles.menuDots}>⋮</Text>
            </Pressable>

            {showMenu && (
              <View style={styles.menu}>
                <Pressable
                  style={styles.menuItem}
                  onPress={() => {
                    setShowMenu(false);
                    setNameDraft(note.name || "");
                    setShowRenameModal(true);
                  }}
                >
                  <Text style={styles.menuText}>Rename</Text>
                </Pressable>

                <Pressable
                  style={styles.menuItem}
                  onPress={() => {
                    setShowMenu(false);
                    setGoalDraft(note.targetAmount);
                    setSavedDraft(note.savedAmount);
                    setShowEditModal(true);
                  }}
                >
                  <Text style={styles.menuText}>Edit Goal</Text>
                </Pressable>

                <Pressable style={styles.menuItem} onPress={duplicateNote}>
                  <Text style={styles.menuText}>Duplicate</Text>
                </Pressable>

                <Pressable style={styles.menuItem} onPress={shareNote}>
                  <Text style={styles.menuText}>Share</Text>
                </Pressable>
              </View>
            )}
          </View>

          <ScrollView contentContainerStyle={styles.content}>
            <View style={styles.goalCard}>
              <Text style={styles.goalName}>
                {(note.name || "").trim() || "Untitled Savings Goal"}
              </Text>
              <Text style={styles.savedAmount}>{formatMoney(stats.saved)}</Text>
              <Text style={styles.savedLabel}>
                saved of {formatMoney(stats.target)}
              </Text>

              <View style={styles.progressTrack}>
                <View
                  style={[
                    styles.progressFill,
                    { width: `${stats.barPercent}%` },
                  ]}
                />
              </View>

              <View style={styles.progressRow}>
                <Text style={styles.progressText}>{stats.percent}% saved</Text>
                <Text style={styles.progressText}>
                  {stats.complete
                    ? "✓ Goal reached"
                    : `${formatMoney(stats.remaining)} left`}
                </Text>
              </View>
            </View>

            <Pressable
              style={styles.addButton}
              onPress={() => setShowAddModal(true)}
            >
              <Text style={styles.addButtonText}>+ Add Savings</Text>
            </Pressable>

            <View style={styles.sectionCard}>
              <Text style={styles.sectionTitle}>Goal Details</Text>
              <Text style={styles.label}>Goal link</Text>
              <View style={styles.linkRow}>
                <TextInput
                  style={styles.linkInput}
                  value={note.itemLink || ""}
                  onChangeText={(value) => {
                    setNote({ ...note, itemLink: value });
                    persist({ itemLink: value });
                  }}
                  placeholder="Paste a product or goal link"
                  placeholderTextColor="#6F89A6"
                  autoCapitalize="none"
                />
                {!!note.itemLink?.trim() && (
                  <Pressable style={styles.openButton} onPress={openLink}>
                    <Text style={styles.openButtonText}>Open</Text>
                  </Pressable>
                )}
              </View>

              <Text style={styles.label}>Notes</Text>
              <TextInput
                style={styles.notesInput}
                value={note.notes || ""}
                onChangeText={(value) => {
                  setNote({ ...note, notes: value });
                  persist({ notes: value });
                }}
                placeholder="Why this goal matters or anything you want to remember..."
                placeholderTextColor="#6F89A6"
                multiline
                textAlignVertical="top"
              />
            </View>

            <View style={styles.sectionCard}>
              <Text style={styles.sectionTitle}>Savings History</Text>
              {(note.contributions || []).length === 0 ? (
                <Text style={styles.emptyText}>
                  Your contributions will appear here.
                </Text>
              ) : (
                (note.contributions || []).map((entry) => (
                  <View key={entry.id} style={styles.historyRow}>
                    <View style={styles.flex}>
                      <Text style={styles.historyAmount}>
                        +{formatMoney(parseMoney(entry.amount))}
                      </Text>
                      {!!entry.note?.trim() && (
                        <Text style={styles.historyNote}>{entry.note}</Text>
                      )}
                    </View>
                    <Text style={styles.historyDate}>
                      {new Date(entry.createdAt).toLocaleDateString()}
                    </Text>
                  </View>
                ))
              )}
            </View>
          </ScrollView>

          {!!toast && (
            <View style={styles.toast}>
              <Text style={styles.toastText}>{toast}</Text>
            </View>
          )}

          <Modal visible={showAddModal} transparent animationType="fade">
            <View style={styles.modalBackdrop}>
              <View style={styles.modalCard}>
                <Text style={styles.modalTitle}>Add savings</Text>
                <TextInput
                  style={styles.modalInput}
                  value={addAmount}
                  onChangeText={(value) => setAddAmount(sanitizeMoney(value))}
                  placeholder="$0.00"
                  placeholderTextColor="#6F89A6"
                  keyboardType="decimal-pad"
                  autoFocus
                />
                <TextInput
                  style={styles.modalInput}
                  value={addNote}
                  onChangeText={setAddNote}
                  placeholder="Note (optional)"
                  placeholderTextColor="#6F89A6"
                />
                <Pressable style={styles.primaryButton} onPress={addSavings}>
                  <Text style={styles.primaryButtonText}>Add Savings</Text>
                </Pressable>
                <Pressable
                  style={styles.cancelButton}
                  onPress={() => setShowAddModal(false)}
                >
                  <Text style={styles.cancelText}>Cancel</Text>
                </Pressable>
              </View>
            </View>
          </Modal>

          <Modal visible={showEditModal} transparent animationType="fade">
            <View style={styles.modalBackdrop}>
              <View style={styles.modalCard}>
                <Text style={styles.modalTitle}>Edit goal</Text>
                <TextInput
                  style={styles.modalInput}
                  value={goalDraft}
                  onChangeText={(value) => setGoalDraft(sanitizeMoney(value))}
                  placeholder="Goal amount"
                  placeholderTextColor="#6F89A6"
                  keyboardType="decimal-pad"
                />
                <TextInput
                  style={styles.modalInput}
                  value={savedDraft}
                  onChangeText={(value) => setSavedDraft(sanitizeMoney(value))}
                  placeholder="Saved amount"
                  placeholderTextColor="#6F89A6"
                  keyboardType="decimal-pad"
                />
                <Pressable style={styles.primaryButton} onPress={saveGoal}>
                  <Text style={styles.primaryButtonText}>Save</Text>
                </Pressable>
                <Pressable
                  style={styles.cancelButton}
                  onPress={() => setShowEditModal(false)}
                >
                  <Text style={styles.cancelText}>Cancel</Text>
                </Pressable>
              </View>
            </View>
          </Modal>

          <Modal visible={showRenameModal} transparent animationType="fade">
            <View style={styles.modalBackdrop}>
              <View style={styles.modalCard}>
                <Text style={styles.modalTitle}>Rename savings note</Text>
                <TextInput
                  style={styles.modalInput}
                  value={nameDraft}
                  onChangeText={setNameDraft}
                  placeholder="Emergency Fund"
                  placeholderTextColor="#6F89A6"
                  autoFocus
                  onSubmitEditing={saveName}
                />
                <Pressable style={styles.primaryButton} onPress={saveName}>
                  <Text style={styles.primaryButtonText}>Save</Text>
                </Pressable>
                <Pressable
                  style={styles.cancelButton}
                  onPress={() => setShowRenameModal(false)}
                >
                  <Text style={styles.cancelText}>Cancel</Text>
                </Pressable>
              </View>
            </View>
          </Modal>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#101820" },
  flex: { flex: 1 },
  page: { flex: 1, backgroundColor: "#101820", paddingHorizontal: 16 },
  loading: { flex: 1, alignItems: "center", justifyContent: "center" },
  loadingText: { color: "#A9D3FF", fontSize: 16, fontWeight: "800" },
  headerRow: {
    position: "relative",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 14,
    zIndex: 20,
  },
  backText: { color: SAVINGS_BLUE, fontSize: 16, fontWeight: "900" },
  menuDots: { color: "#FFFFFF", fontSize: 28, fontWeight: "900" },
  menu: {
    position: "absolute",
    top: 52,
    right: 0,
    width: 180,
    backgroundColor: "#182638",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#2D4562",
    zIndex: 50,
  },
  menuItem: { paddingHorizontal: 16, paddingVertical: 14 },
  menuText: { color: "#FFFFFF", fontSize: 15, fontWeight: "800" },
  content: { paddingBottom: 80 },
  goalCard: {
    backgroundColor: "#1C2A3F",
    borderRadius: 22,
    borderWidth: 1,
    borderColor: "#2E5F8F",
    padding: 20,
  },
  goalName: { color: "#FFFFFF", fontSize: 28, fontWeight: "900" },
  savedAmount: {
    color: SAVINGS_BLUE,
    fontSize: 38,
    fontWeight: "900",
    marginTop: 28,
  },
  savedLabel: { color: "#D7EBFF", fontSize: 16, fontWeight: "800" },
  progressTrack: {
    height: 12,
    backgroundColor: "#31445D",
    borderRadius: 999,
    overflow: "hidden",
    marginTop: 24,
  },
  progressFill: { height: "100%", backgroundColor: SAVINGS_BLUE },
  progressRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 12,
    gap: 12,
  },
  progressText: { color: "#D7EBFF", fontSize: 15, fontWeight: "800" },
  addButton: {
    backgroundColor: SAVINGS_BLUE,
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: "center",
    marginTop: 18,
  },
  addButtonText: { color: "#101820", fontSize: 17, fontWeight: "900" },
  sectionCard: {
    backgroundColor: "#182638",
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "#2D4562",
    padding: 16,
    marginTop: 16,
  },
  sectionTitle: {
    color: "#FFFFFF",
    fontSize: 20,
    fontWeight: "900",
    marginBottom: 16,
  },
  label: { color: "#D7EBFF", fontSize: 14, fontWeight: "800", marginBottom: 7 },
  linkRow: { flexDirection: "row", gap: 8, marginBottom: 16 },
  linkInput: {
    flex: 1,
    backgroundColor: "#243342",
    color: "#FFFFFF",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#3B5875",
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  openButton: {
    borderWidth: 1,
    borderColor: SAVINGS_BLUE,
    borderRadius: 14,
    paddingHorizontal: 14,
    justifyContent: "center",
  },
  openButtonText: { color: SAVINGS_BLUE, fontWeight: "900" },
  notesInput: {
    minHeight: 130,
    backgroundColor: "#243342",
    color: "#FFFFFF",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#3B5875",
    padding: 14,
  },
  emptyText: { color: "#8A98A8", fontSize: 15, fontWeight: "700" },
  historyRow: {
    flexDirection: "row",
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: "#2D4562",
    paddingVertical: 13,
  },
  historyAmount: { color: SAVINGS_BLUE, fontSize: 17, fontWeight: "900" },
  historyNote: {
    color: "#CAD3DD",
    fontSize: 14,
    fontWeight: "700",
    marginTop: 3,
  },
  historyDate: { color: "#8A98A8", fontSize: 13, fontWeight: "700" },
  toast: {
    position: "absolute",
    top: "45%",
    alignSelf: "center",
    backgroundColor: "rgba(0,0,0,0.75)",
    paddingHorizontal: 26,
    paddingVertical: 14,
    borderRadius: 18,
  },
  toastText: { color: "#FFFFFF", fontSize: 18, fontWeight: "900" },
  modalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.55)",
    justifyContent: "center",
    paddingHorizontal: 20,
  },
  modalCard: {
    backgroundColor: "#101820",
    borderRadius: 24,
    padding: 18,
    borderWidth: 1,
    borderColor: "#2D4562",
  },
  modalTitle: {
    color: "#FFFFFF",
    fontSize: 20,
    fontWeight: "900",
    marginBottom: 14,
  },
  modalInput: {
    backgroundColor: "#182638",
    color: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#2D4562",
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 13,
    fontSize: 16,
    fontWeight: "800",
    marginBottom: 12,
  },
  primaryButton: {
    backgroundColor: SAVINGS_BLUE,
    borderRadius: 16,
    paddingVertical: 14,
    alignItems: "center",
  },
  primaryButtonText: { color: "#101820", fontSize: 16, fontWeight: "900" },
  cancelButton: { paddingVertical: 12, alignItems: "center" },
  cancelText: { color: "#AAB7C4", fontSize: 15, fontWeight: "700" },
});
