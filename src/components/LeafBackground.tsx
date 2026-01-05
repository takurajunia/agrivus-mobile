import React from "react";
import { View, StyleSheet, ViewStyle } from "react-native";
import { Leaf } from "lucide-react-native";
import { theme } from "../theme/tokens";

type LeafPatternType = "auth" | "dashboard" | "list" | "detail" | "form";

type LeafBackgroundProps = {
  pattern?: LeafPatternType;
  children: React.ReactNode;
  style?: ViewStyle;
};

/**
 * LeafBackground Component
 * Adds decorative leaf patterns to screens based on the design system
 */
const LeafBackground: React.FC<LeafBackgroundProps> = ({
  pattern = "dashboard",
  children,
  style,
}) => {
  const config = theme.leafPatterns[pattern] || theme.leafPatterns.dashboard;

  return (
    <View style={[styles.container, style]}>
      {/* Leaf decorations */}
      {config.positions.map((pos: any, index: number) => (
        <View
          key={index}
          style={[
            styles.leafContainer,
            {
              opacity: config.opacity,
              ...(pos.top !== undefined && { top: pos.top }),
              ...(pos.bottom !== undefined && { bottom: pos.bottom }),
              ...(pos.left !== undefined && { left: pos.left }),
              ...(pos.right !== undefined && { right: pos.right }),
              transform: [{ rotate: `${pos.rotation}deg` }],
            } as ViewStyle,
          ]}
        >
          <Leaf
            size={pos.size}
            color={theme.colors.primary[500]}
            strokeWidth={1.5}
          />
        </View>
      ))}

      {/* Actual content */}
      <View style={styles.content}>{children}</View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    position: "relative",
  },
  leafContainer: {
    position: "absolute",
    zIndex: 0,
  },
  content: {
    flex: 1,
    zIndex: 1,
  },
});

export default LeafBackground;
