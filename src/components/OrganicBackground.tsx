import React from "react";
import { View, StyleSheet, Dimensions } from "react-native";
import Svg, { Path } from "react-native-svg";

const { width, height } = Dimensions.get("window");

// 1. Base Color: Soft, matte off-white
export const BACKGROUND_COLOR = "#F0F0F3";

// 2. Pattern Visibility: Increased for visibility
const LINE_COLOR = "#2D3436";
const LINE_OPACITY = 0.15; // Increased from 0.06
const STROKE_WIDTH = 2; // Increased from 1.5

export const OrganicBackground = () => {
  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      <View
        style={[StyleSheet.absoluteFill, { backgroundColor: BACKGROUND_COLOR }]}
      />

      <Svg height={height} width={width} style={StyleSheet.absoluteFill}>
        {/* TOP LEFT: Sweeping Curves */}
        <Path
          d="M0 150 C 60 160, 120 100, 150 0"
          stroke={LINE_COLOR}
          strokeWidth={STROKE_WIDTH}
          fill="none"
          opacity={LINE_OPACITY}
        />
        <Path
          d="M0 200 C 90 220, 180 120, 220 0"
          stroke={LINE_COLOR}
          strokeWidth={STROKE_WIDTH}
          fill="none"
          opacity={LINE_OPACITY}
        />

        {/* TOP RIGHT: Framing the Bell/Chat */}
        <Path
          d={`M${width} 120 C ${width - 60} 130, ${width - 120} 80, ${
            width - 150
          } 0`}
          stroke={LINE_COLOR}
          strokeWidth={STROKE_WIDTH}
          fill="none"
          opacity={LINE_OPACITY}
        />

        {/* SIDES: Creating the 'Gutter' effect */}
        <Path
          d="M -20 400 Q 40 600, -20 800"
          stroke={LINE_COLOR}
          strokeWidth={STROKE_WIDTH}
          fill="none"
          opacity={LINE_OPACITY}
        />
        <Path
          d={`M ${width + 20} 500 Q ${width - 50} 700, ${width + 20} 900`}
          stroke={LINE_COLOR}
          strokeWidth={STROKE_WIDTH}
          fill="none"
          opacity={LINE_OPACITY}
        />
      </Svg>
    </View>
  );
};
