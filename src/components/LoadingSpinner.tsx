import React from "react";
import { View, ActivityIndicator, StyleSheet } from "react-native";

type LoadingSpinnerProps = {
  size?: "small" | "large";
  color?: string;
};

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = "large",
  color = "#4CAF50",
}) => (
  <View style={styles.container}>
    <ActivityIndicator size={size} color={color} />
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});

export default LoadingSpinner;
