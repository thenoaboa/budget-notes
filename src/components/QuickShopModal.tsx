import {
    Keyboard,
    KeyboardAvoidingView,
    Modal,
    Platform,
    Pressable,
    StyleSheet,
} from "react-native";

import { QuickShop } from "./QuickShop";

type QuickShopModalProps = {
  visible: boolean;
  onClose: () => void;
  onSave: (prices: string[]) => void | Promise<void>;
  onDiscard?: (prices: string[]) => void | Promise<void>;
};

export function QuickShopModal({
  visible,
  onClose,
  onSave,
}: QuickShopModalProps) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={() => {
        Keyboard.dismiss();
      }}
    >
      <KeyboardAvoidingView
        style={styles.backdrop}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <Pressable
          style={styles.backdropPressArea}
          onPress={Keyboard.dismiss}
        />

        <QuickShop
          active={visible}
          showCloseButton
          onClose={onClose}
          onSave={onSave}
        />
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: 18,
  },

  backdropPressArea: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0, 0, 0, 0.72)",
  },
});
