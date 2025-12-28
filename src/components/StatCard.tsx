import React from "react";
import { View, Text, StyleSheet } from "react-native";

type StatCardProps = {
  label: string;
  value: string | number;
};

const StatCard: React.FC<StatCardProps> = ({ label, value }) => (
  <View style={styles.card}>
    <Text style={styles.value}>{value}</Text>
    <Text style={styles.label}>{label}</Text>
  </View>
);

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#f5f5f5",
    borderRadius: 8,
    padding: 16,
    alignItems: "center",
    margin: 8,
  },
  value: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#4CAF50",
  },
  label: {
    fontSize: 14,
    color: "#888",
  },
});

export default StatCard;
