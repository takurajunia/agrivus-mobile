import React from "react";
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  StyleProp,
  ViewStyle,
  GestureResponderEvent,
} from "react-native";

type ButtonProps = {
  title: string;
  onPress: (event: GestureResponderEvent) => void;
  style?: StyleProp<ViewStyle>;
  [key: string]: any;
};

const Button: React.FC<ButtonProps> = ({ title, onPress, style, ...props }) => (
  <TouchableOpacity style={[styles.button, style]} onPress={onPress} {...props}>
    <Text style={styles.text}>{title}</Text>
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  button: {
    backgroundColor: "#4CAF50",
    padding: 12,
    borderRadius: 6,
    alignItems: "center",
    marginVertical: 8,
  },
  text: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
});

export default Button;
