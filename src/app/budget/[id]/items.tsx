// Save as: src/app/budget/[id]/items.tsx

import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import DraggableFlatList, {
  RenderItemParams,
} from "react-native-draggable-flatlist";

import { SpendingItemRow } from "../../../components/SpendingItemCard";
import { useBudgetEditor } from "../../../hooks/usebudgetEditor";
import type { BudgetItem } from "../../../types/budgetEditor";

export default function BudgetItemsScreen() {
  const router = useRouter();

  const { id } = useLocalSearchParams();

  const budgetId = Array.isArray(id) ? id[0] : id;

  const editor = useBudgetEditor(budgetId);
  const [searchQuery, setSearchQuery] = useState("");

  function renderItem({ item, drag, isActive }: RenderItemParams<BudgetItem>) {
    return (
      <SpendingItemRow
        item={item}
        itemNameRefs={editor.itemNameRefs}
        itemAmountRefs={editor.itemAmountRefs}
        updateItem={editor.updateItem}
        increaseQuantity={editor.increaseQuantity}
        resetQuantity={editor.resetQuantity}
        toggleIncluded={editor.toggleIncluded}
        deleteItem={editor.deleteItem}
        focusNextItemOrAddCurrent={editor.focusNextItemOrAddCurrent}
        onDragItem={drag}
        isDragging={isActive}
      />
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        keyboardVerticalOffset={20}
      >
        <View style={styles.page}>
          <View style={styles.topBar}>
            <TouchableOpacity onPress={() => router.back()}>
              <Text style={styles.backLink}>← Back</Text>
            </TouchableOpacity>

            <TextInput
              style={styles.searchInput}
              placeholder="Search items"
              placeholderTextColor="#8FA0B3"
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>
          <TouchableOpacity style={styles.addButton} onPress={editor.addItem}>
            <Text style={styles.addButtonText}>+ Add Item</Text>
          </TouchableOpacity>

          <DraggableFlatList
            data={editor.items.filter((item) =>
              item.name.toLowerCase().includes(searchQuery.toLowerCase()),
            )}
            keyExtractor={(item) => String(item.id)}
            renderItem={renderItem}
            onDragEnd={({ data }) => editor.reorderItems(data)}
            style={styles.list}
            contentContainerStyle={styles.listContent}
            keyboardShouldPersistTaps="handled"
            activationDistance={1}
          />
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#101820",
  },

  keyboardView: {
    flex: 1,
  },

  page: {
    flex: 1,
    backgroundColor: "#101820",
    paddingHorizontal: 20,
    paddingTop: 12,
  },

  list: {
    flex: 1,
  },

  listContent: {
    paddingBottom: 120,
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
});
