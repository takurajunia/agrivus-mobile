import React from "react";
import { View, Text, StyleSheet } from "react-native";

type HeaderProps = {
  title: string;
};

const Header: React.FC<HeaderProps> = ({ title }) => (
  <View style={styles.header}>
    <Text style={styles.title}>{title}</Text>
  </View>
);

const styles = StyleSheet.create({
  header: {
    backgroundColor: "#4CAF50",
    padding: 16,
    alignItems: "center",
  },
  title: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "bold",
  },
});

export default Header;
