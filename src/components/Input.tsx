import React from "react";
import { TextInput, StyleSheet, StyleProp, TextStyle } from "react-native";

type InputProps = {
  style?: StyleProp<TextStyle>;
  [key: string]: any;
};

const Input: React.FC<InputProps> = ({ style, ...props }) => (
  <TextInput style={[styles.input, style]} {...props} />
);

const styles = StyleSheet.create({
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 6,
    padding: 10,
    marginVertical: 8,
    fontSize: 16,
    backgroundColor: "#fff",
  },
});

export default Input;
