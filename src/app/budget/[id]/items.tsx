// Save as: src/app/budget/[id]/items.tsx

import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useMemo, useState } from "react";
import {
  Keyboard,
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

import { AddItemOverlay } from "../../../components/AddItemOverlay";
import { SpendingItemRow } from "../../../components/SpendingItemCard";
import { useBudgetEditor } from "../../../hooks/usebudgetEditor";

export default function BudgetItemsScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();

  const budgetId = Array.isArray(id) ? id[0] : id;

  const editor = useBudgetEditor(budgetId);

  const [searchQuery, setSearchQuery] = useState("");
  const [keyboardVisible, setKeyboardVisible] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [showToastMessage, setShowToastMessage] = useState(false);

  useEffect(() => {
    const showEvent =
      Platform.OS === "ios" ? "keyboardWillShow" : "keyboardDidShow";

    const hideEvent =
      Platform.OS === "ios" ? "keyboardWillHide" : "keyboardDidHide";

    const showSubscription = Keyboard.addListener(showEvent, () => {
      setKeyboardVisible(true);
    });

    const hideSubscription = Keyboard.addListener(hideEvent, () => {
      setKeyboardVisible(false);
    });

    return () => {
      showSubscription.remove();
      hideSubscription.remove();
    };
  }, []);

  const offItems = useMemo(
    () => editor.items.filter((item) => !item.included),
    [editor.items],
  );

  const filteredOffItems = useMemo(() => {
    const normalizedSearch = searchQuery.trim().toLowerCase();

    if (!normalizedSearch) {
      return offItems;
    }

    return offItems.filter((item) =>
      item.name.toLowerCase().includes(normalizedSearch),
    );
  }, [offItems, searchQuery]);

  const hasSearchQuery = searchQuery.trim().length > 0;

  const showNoOffItemsMessage = offItems.length === 0;

  const showNoSearchResults =
    hasSearchQuery && offItems.length > 0 && filteredOffItems.length === 0;

  function showToast(message: string) {
    setToastMessage(message);
    setShowToastMessage(true);

    setTimeout(() => {
      setShowToastMessage(false);
    }, 900);
  }

  function restoreItem(itemId: number) {
    editor.toggleIncluded(itemId);
    showToast("Item restored");
  }

  function openAddOffItemOverlay() {
    editor.setDraftItem({
      id: Date.now(),
      name: "",
      amount: "",
      quantity: 1,
      included: false,
      isFood: false,
      note: "",
      link: "",
    });

    editor.openAddItemOverlay();
  }

  function addOffItemFromDraft() {
    const hasName = editor.draftItem.name.trim() !== "";
    const hasAmount = editor.draftItem.amount.trim() !== "";

    if (!hasName && !hasAmount) {
      editor.closeAddItemOverlay();
      return;
    }

    const newItem = {
      ...editor.draftItem,
      id: editor.draftItem.id || Date.now(),
      quantity: editor.draftItem.quantity || 1,
      included: false,
      isFood: editor.draftItem.isFood ?? false,
      note: editor.draftItem.note ?? "",
      link: editor.draftItem.link ?? "",
    };

    editor.setItems((currentItems) => [newItem, ...currentItems]);

    editor.closeAddItemOverlay();

    editor.setDraftItem({
      id: Date.now(),
      name: "",
      amount: "",
      quantity: 1,
      included: false,
      isFood: false,
      note: "",
      link: "",
    });
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.page}>
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.topBar}>
            <TouchableOpacity
              onPress={() => router.back()}
              accessibilityRole="button"
              accessibilityLabel="Go back"
            >
              <Text style={styles.backLink}>← Back</Text>
            </TouchableOpacity>

            <TextInput
              style={styles.searchInput}
              placeholder="Search off items"
              placeholderTextColor="#8FA0B3"
              value={searchQuery}
              onChangeText={setSearchQuery}
              returnKeyType="search"
            />
          </View>

          <TouchableOpacity
            style={styles.addButton}
            onPress={openAddOffItemOverlay}
          >
            <Text style={styles.addButtonText}>+ Add Item</Text>
          </TouchableOpacity>

          {showNoOffItemsMessage && (
            <View style={styles.messageCard}>
              <Text style={styles.messageTitle}>No off items yet.</Text>

              <Text style={styles.messageText}>
                Items you switch off will appear here.
              </Text>
            </View>
          )}

          {showNoSearchResults && (
            <View style={styles.messageCard}>
              <Text style={styles.messageTitle}>No matches found.</Text>

              <Text style={styles.messageText}>
                Try searching for a different item name.
              </Text>
            </View>
          )}

          {filteredOffItems.map((item) => (
            <SpendingItemRow
              key={item.id}
              item={item}
              itemNameRefs={editor.itemNameRefs}
              itemAmountRefs={editor.itemAmountRefs}
              updateItem={editor.updateItem}
              increaseQuantity={editor.increaseQuantity}
              resetQuantity={editor.resetQuantity}
              toggleIncluded={restoreItem}
              deleteItem={editor.deleteItem}
              focusNextItemOrAddCurrent={editor.focusNextItemOrAddCurrent}
              isDragging={false}
            />
          ))}
        </ScrollView>

        {showToastMessage && (
          <View style={styles.toast}>
            <Text style={styles.toastText}>{toastMessage}</Text>
          </View>
        )}

        {/*
{!keyboardVisible && (
  <View style={styles.bannerContainer}>
    <View style={styles.bannerPlaceholder}>
      <Text style={styles.bannerLabel}>ADVERTISEMENT</Text>
      <Text style={styles.bannerText}>Banner ad goes here</Text>
    </View>
  </View>
)}
*/}

        <AddItemOverlay
          visible={editor.showAddItemOverlay}
          draftItem={editor.draftItem}
          setDraftItem={editor.setDraftItem}
          onClose={editor.closeAddItemOverlay}
          onAdd={addOffItemFromDraft}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#101820",
  },

  page: {
    flex: 1,
    backgroundColor: "#101820",
    paddingHorizontal: 16,
  },

  scroll: {
    flex: 1,
    backgroundColor: "#101820",
  },

  scrollContent: {
    paddingTop: 12,
    paddingBottom: 16,
    backgroundColor: "#101820",
  },

  topBar: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 14,
    gap: 10,
  },

  backLink: {
    color: "#9BA8B8",
    fontSize: 18,
    fontWeight: "900",
  },

  searchInput: {
    flex: 1,
    minWidth: 0,
    height: 52,
    backgroundColor: "#182638",
    borderRadius: 18,
    paddingHorizontal: 16,
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "800",
    borderWidth: 1,
    borderColor: "#2D4562",
  },

  addButton: {
    backgroundColor: "#2ECC71",
    borderRadius: 16,
    paddingVertical: 15,
    alignItems: "center",
    marginBottom: 14,
  },

  addButtonText: {
    color: "#101820",
    fontSize: 17,
    fontWeight: "900",
  },

  messageCard: {
    backgroundColor: "#18261D",
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: "#2ECC71",
    marginBottom: 14,
  },

  messageTitle: {
    color: "#FFFFFF",
    fontSize: 20,
    fontWeight: "900",
    marginBottom: 6,
  },

  messageText: {
    color: "#CAD3DD",
    fontSize: 15,
    fontWeight: "700",
    lineHeight: 21,
  },

  toast: {
    position: "absolute",
    top: "45%",
    alignSelf: "center",
    backgroundColor: "rgba(0, 0, 0, 0.75)",
    paddingHorizontal: 26,
    paddingVertical: 14,
    borderRadius: 18,
    zIndex: 999,
  },

  toastText: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "900",
  },

  bannerContainer: {
    backgroundColor: "#101820",
    paddingHorizontal: 10,
    paddingTop: 6,
    paddingBottom: 6,
  },

  bannerPlaceholder: {
    height: 52,
    backgroundColor: "#1B2633",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#344657",
    alignItems: "center",
    justifyContent: "center",
  },

  bannerLabel: {
    color: "#738191",
    fontSize: 9,
    fontWeight: "800",
    letterSpacing: 1,
    marginBottom: 2,
  },

  bannerText: {
    color: "#CAD3DD",
    fontSize: 14,
    fontWeight: "700",
  },
});
