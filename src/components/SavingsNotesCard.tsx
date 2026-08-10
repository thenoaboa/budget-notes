// Save as: src/components/SavingsNoteCard.tsx

import { useMemo, useRef, useState } from "react";
import {
  Dimensions,
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { Swipeable } from "react-native-gesture-handler";

import type { SavingsNote } from "../types/savingsNote";

type Props = {
  note: SavingsNote;
  onPress: () => void;
  onDelete: () => void;
  onRename: (newName: string) => void;
  onDuplicate: () => void;
};

function parseMoney(value?: string) {
  const cleanedValue = (value || "").replace(/[^0-9.-]/g, "");
  const parsedValue = Number.parseFloat(cleanedValue);

  return Number.isFinite(parsedValue) ? parsedValue : 0;
}

function formatMoney(value: number) {
  return value.toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
  });
}

export function SavingsNotesCard({
  note,
  onPress,
  onDelete,
  onRename,
  onDuplicate,
}: Props) {
  const swipeableRef = useRef<Swipeable>(null);

  const [isEditing, setIsEditing] = useState(false);
  const [draftName, setDraftName] = useState(note.name || "");
  const [showMenu, setShowMenu] = useState(false);
  const [showCopyConfirm, setShowCopyConfirm] = useState(false);
  const [deleteHovered, setDeleteHovered] = useState(false);

  const stats = useMemo(() => {
    const targetAmount = parseMoney(note.targetAmount);
    const savedAmount = parseMoney(note.savedAmount);
    const remainingAmount = Math.max(targetAmount - savedAmount, 0);

    const rawPercent =
      targetAmount > 0 ? (savedAmount / targetAmount) * 100 : 0;

    return {
      targetAmount,
      savedAmount,
      remainingAmount,
      progressPercent: Math.round(rawPercent),
      barPercent: Math.min(Math.max(rawPercent, 0), 100),
      isComplete: targetAmount > 0 && savedAmount >= targetAmount,
    };
  }, [note.savedAmount, note.targetAmount]);

  const isDesktopWeb =
    Platform.OS === "web" && Dimensions.get("window").width >= 768;

  function handlePress() {
    if (isEditing) return;

    swipeableRef.current?.close();
    onPress();
  }

  function handleDelete() {
    swipeableRef.current?.close();
    onDelete();
  }

  function startEditing() {
    swipeableRef.current?.close();
    setDraftName(note.name || "");
    setIsEditing(true);
  }

  function saveName() {
    const cleanedName = draftName.trim();
    const currentName = (note.name || "").trim();

    setDraftName(cleanedName);
    setIsEditing(false);

    if (cleanedName === currentName) return;

    onRename(cleanedName);
  }

  function renderModals() {
    return (
      <>
        <Modal
          visible={showMenu}
          transparent
          animationType="fade"
          onRequestClose={() => setShowMenu(false)}
        >
          <Pressable
            style={styles.modalBackdrop}
            onPress={() => setShowMenu(false)}
          >
            <Pressable
              style={styles.menuModal}
              onPress={(event) => event.stopPropagation?.()}
            >
              <Pressable
                style={styles.menuModalItem}
                onPress={() => {
                  setShowMenu(false);
                  startEditing();
                }}
              >
                <Text style={styles.menuModalText}>Rename</Text>
              </Pressable>

              <Pressable
                style={styles.menuModalItem}
                onPress={() => {
                  setShowMenu(false);
                  setShowCopyConfirm(true);
                }}
              >
                <Text style={styles.menuModalText}>Duplicate</Text>
              </Pressable>
            </Pressable>
          </Pressable>
        </Modal>

        <Modal
          visible={showCopyConfirm}
          transparent
          animationType="fade"
          onRequestClose={() => setShowCopyConfirm(false)}
        >
          <Pressable
            style={styles.modalBackdrop}
            onPress={() => setShowCopyConfirm(false)}
          >
            <Pressable
              style={styles.copyModal}
              onPress={(event) => event.stopPropagation?.()}
            >
              <Text style={styles.copyConfirmTitle}>Copy savings note?</Text>

              <Text style={styles.copyConfirmText}>
                This creates another savings goal with the same progress.
              </Text>

              <View style={styles.copyConfirmButtons}>
                <Pressable onPress={() => setShowCopyConfirm(false)}>
                  <Text style={styles.copyCancelText}>Cancel</Text>
                </Pressable>

                <Pressable
                  onPress={() => {
                    setShowCopyConfirm(false);
                    onDuplicate();
                  }}
                >
                  <Text style={styles.copyConfirmButtonText}>Copy</Text>
                </Pressable>
              </View>
            </Pressable>
          </Pressable>
        </Modal>
      </>
    );
  }

  function renderCardContent() {
    return (
      <Pressable style={styles.card} onPress={handlePress}>
        <View style={styles.topRow}>
          <View style={styles.titleArea}>
            {isEditing ? (
              <TextInput
                style={styles.cardTitleInput}
                value={draftName}
                onChangeText={setDraftName}
                onBlur={saveName}
                onSubmitEditing={saveName}
                selectTextOnFocus
                returnKeyType="done"
                placeholder="Add goal name"
                placeholderTextColor="#6F89A6"
                autoFocus
              />
            ) : (
              <Text
                style={styles.cardTitle}
                numberOfLines={1}
                onPress={startEditing}
              >
                {(note.name || "").trim() || "Untitled Savings Goal"}
              </Text>
            )}
          </View>

          <Pressable
            style={styles.menuButton}
            onPress={(event) => {
              event.stopPropagation?.();
              setShowMenu(true);
            }}
          >
            <Text style={styles.menuButtonText}>⋮</Text>
          </Pressable>
        </View>

        <View style={styles.amountRow}>
          <View style={styles.savedColumn}>
            <Text
              style={styles.savedAmount}
              numberOfLines={1}
              adjustsFontSizeToFit
              minimumFontScale={0.65}
            >
              {formatMoney(stats.savedAmount)}
            </Text>

            <Text style={styles.savedLabel}>saved</Text>
          </View>

          <View style={styles.totalColumn}>
            <Text style={styles.totalText}>
              <Text style={styles.totalMuted}>of </Text>
              {formatMoney(stats.targetAmount)}
            </Text>

            <Text style={styles.totalLabel}>goal</Text>
          </View>
        </View>

        <View style={styles.progressTrack}>
          <View
            style={[styles.progressFill, { width: `${stats.barPercent}%` }]}
          />
        </View>

        <View style={styles.footerRow}>
          <Text style={styles.footerText}>{stats.progressPercent}% saved</Text>

          <Text
            style={stats.isComplete ? styles.completeText : styles.footerText}
          >
            {stats.isComplete
              ? "✓ Goal reached"
              : `${formatMoney(stats.remainingAmount)} left`}
          </Text>
        </View>
      </Pressable>
    );
  }

  if (isDesktopWeb) {
    return (
      <>
        <View style={styles.webContainer}>
          <View style={{ flex: 1 }}>{renderCardContent()}</View>

          <Pressable
            style={[
              styles.webDeleteButton,
              deleteHovered && styles.webDeleteButtonHovered,
            ]}
            onHoverIn={() => setDeleteHovered(true)}
            onHoverOut={() => setDeleteHovered(false)}
            onPress={handleDelete}
          >
            <Text
              style={[
                styles.webDeleteText,
                deleteHovered && styles.webDeleteTextHovered,
              ]}
            >
              Delete
            </Text>
          </Pressable>
        </View>

        {renderModals()}
      </>
    );
  }

  return (
    <>
      <Swipeable
        ref={swipeableRef}
        renderRightActions={() => (
          <View style={styles.deleteActionWrapper}>
            <Pressable style={styles.deleteAction} onPress={handleDelete}>
              <Text style={styles.deleteActionText}>Delete</Text>
            </Pressable>
          </View>
        )}
        overshootRight={false}
      >
        {renderCardContent()}
      </Swipeable>

      {renderModals()}
    </>
  );
}

const styles = StyleSheet.create({
  webContainer: {
    flexDirection: "row",
    alignItems: "stretch",
  },

  webDeleteButton: {
    marginLeft: 8,
    backgroundColor: "#243342",
    borderColor: "#3B4D5F",
    borderWidth: 1,
    borderRadius: 18,
    paddingHorizontal: 12,
    marginBottom: 14,
    justifyContent: "center",
    alignItems: "center",
  },

  webDeleteButtonHovered: {
    backgroundColor: "#3A1C1C",
    borderColor: "#FF6B6B",
  },

  webDeleteText: {
    color: "#8A98A8",
    fontWeight: "900",
  },

  webDeleteTextHovered: {
    color: "#FF6B6B",
  },

  card: {
    backgroundColor: "#1C2A3F",
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: "#2E5F8F",
    marginBottom: 14,
  },

  topRow: {
    flexDirection: "row",
    alignItems: "center",
    minHeight: 24,
  },

  titleArea: {
    flex: 1,
    minWidth: 0,
  },

  cardTitle: {
    color: "#FFFFFF",
    fontSize: 17,
    fontWeight: "900",
    paddingRight: 10,
  },

  cardTitleInput: {
    color: "#FFFFFF",
    fontSize: 17,
    fontWeight: "900",
    padding: 0,
    paddingRight: 10,
  },

  menuButton: {
    width: 30,
    height: 30,
    alignItems: "flex-end",
    justifyContent: "center",
    marginLeft: 8,
  },

  menuButtonText: {
    color: "#A9D3FF",
    fontSize: 24,
    fontWeight: "900",
    lineHeight: 24,
  },

  amountRow: {
    marginTop: 18,
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: 8,
  },

  savedColumn: {
    flex: 1,
    minWidth: 0,
  },

  savedAmount: {
    color: "#4EA8FF",
    fontSize: 25,
    fontWeight: "900",
    letterSpacing: -0.7,
    lineHeight: 29,
  },

  savedLabel: {
    color: "#D7EBFF",
    fontSize: 16,
    fontWeight: "800",
    marginTop: 2,
  },

  totalColumn: {
    alignItems: "flex-end",
    flexShrink: 0,
    maxWidth: 150,
  },

  totalText: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "900",
  },

  totalMuted: {
    color: "#D7EBFF",
    fontSize: 15,
    fontWeight: "800",
  },

  totalLabel: {
    color: "#D7EBFF",
    fontSize: 14,
    fontWeight: "800",
    marginTop: 1,
  },

  progressTrack: {
    height: 7,
    borderRadius: 999,
    backgroundColor: "#31445D",
    overflow: "hidden",
    marginTop: 14,
  },

  progressFill: {
    height: "100%",
    borderRadius: 999,
    backgroundColor: "#4EA8FF",
  },

  footerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 10,
    gap: 12,
  },

  footerText: {
    color: "#D7EBFF",
    fontSize: 13,
    fontWeight: "700",
  },

  completeText: {
    color: "#4EA8FF",
    fontSize: 14,
    fontWeight: "900",
  },

  deleteActionWrapper: {
    paddingLeft: 12,
    marginBottom: 14,
  },

  deleteAction: {
    backgroundColor: "#3A1C1C",
    borderColor: "#FF6B6B",
    borderWidth: 1,
    justifyContent: "center",
    alignItems: "center",
    width: 90,
    height: "100%",
    borderRadius: 18,
  },

  deleteActionText: {
    color: "#FF6B6B",
    fontWeight: "900",
  },

  modalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.45)",
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },

  menuModal: {
    width: "100%",
    maxWidth: 320,
    backgroundColor: "#243342",
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "#3B4D5F",
    overflow: "hidden",
  },

  menuModalItem: {
    paddingVertical: 18,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#3B4D5F",
  },

  menuModalText: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "900",
  },

  copyModal: {
    width: "100%",
    maxWidth: 340,
    backgroundColor: "#243342",
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "#3B4D5F",
    padding: 18,
  },

  copyConfirmTitle: {
    color: "#FFFFFF",
    fontSize: 20,
    fontWeight: "900",
    marginBottom: 8,
  },

  copyConfirmText: {
    color: "#CAD3DD",
    fontSize: 15,
    fontWeight: "700",
    lineHeight: 21,
    marginBottom: 18,
  },

  copyConfirmButtons: {
    flexDirection: "row",
    justifyContent: "flex-end",
    alignItems: "center",
    gap: 20,
  },

  copyCancelText: {
    color: "#CAD3DD",
    fontSize: 16,
    fontWeight: "900",
  },

  copyConfirmButtonText: {
    color: "#4EA8FF",
    fontSize: 16,
    fontWeight: "900",
  },
});
