import React from "react";
import { View, Text, StyleSheet } from "react-native";

const NotificationBell = ({ count = 0 }) => (
  <View style={styles.container}>
    <Text style={styles.bell}>🔔</Text>
    {count > 0 && (
      <View style={styles.badge}>
        <Text style={styles.badgeText}>{count}</Text>
      </View>
    )}
  </View>
);

const styles = StyleSheet.create({
  container: {
    position: "relative",
    padding: 8,
  },
  bell: {
    fontSize: 24,
  },
  badge: {
    position: "absolute",
    right: 2,
    top: 2,
    backgroundColor: "red",
    borderRadius: 8,
    paddingHorizontal: 4,
    paddingVertical: 1,
  },
  badgeText: {
    color: "#fff",
    fontSize: 10,
    fontWeight: "bold",
  },
});

export default NotificationBell;
