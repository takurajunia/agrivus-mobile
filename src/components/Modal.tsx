import React, { ReactNode } from "react";
import {
  View,
  Text,
  StyleSheet,
  Modal as RNModal,
  TouchableOpacity,
} from "react-native";

type ModalProps = {
  visible: boolean;
  onClose: () => void;
  children: ReactNode;
};

const Modal: React.FC<ModalProps> = ({ visible, onClose, children }) => (
  <RNModal visible={visible} transparent animationType="slide">
    <View style={styles.overlay}>
      <View style={styles.modal}>
        {children}
        <TouchableOpacity onPress={onClose} style={styles.closeButton}>
          <Text style={styles.closeText}>Close</Text>
        </TouchableOpacity>
      </View>
    </View>
  </RNModal>
);

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modal: {
    backgroundColor: "#fff",
    borderRadius: 8,
    padding: 24,
    width: "80%",
    alignItems: "center",
  },
  closeButton: {
    marginTop: 16,
    padding: 8,
    backgroundColor: "#4CAF50",
    borderRadius: 6,
  },
  closeText: {
    color: "#fff",
    fontWeight: "bold",
  },
});

export default Modal;
