// Save as: src/app/budget/[id]/items.tsx

import { useLocalSearchParams, useRouter } from "expo-router";
import {
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  StyleSheet,
  Text,
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
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Text style={styles.backButtonText}>← Back To Budget</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.addButton} onPress={editor.addItem}>
            <Text style={styles.addButtonText}>+ Add Item</Text>
          </TouchableOpacity>

          <DraggableFlatList
            data={editor.items}
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
    paddingHorizontal: 16,
    paddingTop: 16,
  },

  list: {
    flex: 1,
  },

  listContent: {
    paddingBottom: 120,
  },

  backButton: {
    backgroundColor: "#123527",
    borderRadius: 14,
    paddingVertical: 13,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#2ECC71",
    marginBottom: 14,
  },

  backButtonText: {
    color: "#2ECC71",
    fontSize: 15,
    fontWeight: "900",
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
