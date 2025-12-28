import React from "react";
import { View, Text, StyleSheet } from "react-native";

type BoostBadgeProps = {
  label: string;
};

const BoostBadge: React.FC<BoostBadgeProps> = ({ label }) => (
  <View style={styles.badge}>
    <Text style={styles.text}>{label}</Text>
  </View>
);

const styles = StyleSheet.create({
  badge: {
    backgroundColor: "#FFD700",
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 4,
    alignSelf: "flex-start",
    margin: 4,
  },
  text: {
    color: "#333",
    fontWeight: "bold",
    fontSize: 12,
  },
});

export default BoostBadge;
