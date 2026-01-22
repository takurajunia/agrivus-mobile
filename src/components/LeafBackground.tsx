import React from "react";
import { View, StyleSheet, Dimensions } from "react-native";
import Svg, { Path, G } from "react-native-svg";
import { LinearGradient } from "expo-linear-gradient";

const { width, height } = Dimensions.get("window");

// --- SOPHISTICATED PALETTE ---
export const BACKGROUND_COLOR = "#E9EAEF"; // Cool, matte base
const PATTERN_COLOR = "#94A3B8"; // slightly darker, cooler grey for visibility
const OPACITY = 0.18; // Visibility
const STROKE = 1.5; // Finer lines for smaller scale

export const LeafBackground = () => {
  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      {/* 1. Base Layer */}
      <LinearGradient
        colors={[BACKGROUND_COLOR, "#B7E1A1"]}
        style={StyleSheet.absoluteFill}
      />

      {/* 2. Vector Leaf Pattern - Zoomed Out (Smaller Scale, More Repetition) */}
      <Svg height={height} width={width} style={StyleSheet.absoluteFill}>
        {/* === TOP LEFT: Large Monstera === */}
        <G opacity={OPACITY} transform="translate(-20, -20) scale(0.8)">
          <Path
            d="M 50 30 C 80 10, 150 0, 180 50 C 200 80, 200 150, 160 190 
               C 140 210, 100 230, 60 210 C 30 190, 0 150, 20 100
               C 30 70, 40 50, 50 30"
            stroke={PATTERN_COLOR}
            strokeWidth={STROKE}
            fill="none"
          />
          {/* Veins */}
          <Path
            d="M 50 30 Q 110 110, 100 210"
            stroke={PATTERN_COLOR}
            strokeWidth={STROKE}
            fill="none"
          />
          <Path
            d="M 70 60 L 40 70"
            stroke={PATTERN_COLOR}
            strokeWidth={STROKE}
          />
          <Path
            d="M 85 90 L 50 110"
            stroke={PATTERN_COLOR}
            strokeWidth={STROKE}
          />
          <Path
            d="M 100 130 L 60 150"
            stroke={PATTERN_COLOR}
            strokeWidth={STROKE}
          />
          {/* Right side veins */}
          <Path
            d="M 80 70 L 120 60"
            stroke={PATTERN_COLOR}
            strokeWidth={STROKE}
          />
          <Path
            d="M 95 100 L 140 90"
            stroke={PATTERN_COLOR}
            strokeWidth={STROKE}
          />
          <Path
            d="M 105 140 L 150 130"
            stroke={PATTERN_COLOR}
            strokeWidth={STROKE}
          />
        </G>

        {/* === TOP CENTER: Hanging Vine === */}
        <G
          opacity={OPACITY * 0.8}
          transform={`translate(${width * 0.45}, -10) scale(0.6)`}
        >
          {/* Main stem */}
          <Path
            d="M 0 0 Q 20 50, -10 100 T 10 200"
            stroke={PATTERN_COLOR}
            strokeWidth={STROKE}
            fill="none"
          />
          {/* Leaves on vine */}
          <Path
            d="M 10 30 Q 30 10, 40 40 Q 20 50, 10 30"
            stroke={PATTERN_COLOR}
            strokeWidth={STROKE}
            fill="none"
          />
          <Path
            d="M -5 70 Q -25 50, -35 80 Q -15 90, -5 70"
            stroke={PATTERN_COLOR}
            strokeWidth={STROKE}
            fill="none"
          />
          <Path
            d="M 5 120 Q 25 100, 35 130 Q 15 140, 5 120"
            stroke={PATTERN_COLOR}
            strokeWidth={STROKE}
            fill="none"
          />
          <Path
            d="M 0 170 Q -20 150, -30 180 Q -10 190, 0 170"
            stroke={PATTERN_COLOR}
            strokeWidth={STROKE}
            fill="none"
          />
        </G>

        {/* === TOP RIGHT: Elegant Fern === */}
        <G
          opacity={OPACITY}
          transform={`translate(${width - 100}, -10) scale(0.7)`}
        >
          <Path
            d="M 150 0 Q 100 80, 20 150"
            stroke={PATTERN_COLOR}
            strokeWidth={STROKE}
            fill="none"
          />
          {/* Leaflets */}
          {[10, 30, 50, 70, 90, 110].map((y, i) => (
            <React.Fragment key={i}>
              <Path
                d={`M ${140 - y * 0.8} ${y} L ${180 - y * 0.6} ${y + 15}`}
                stroke={PATTERN_COLOR}
                strokeWidth={STROKE}
              />
              <Path
                d={`M ${135 - y * 0.8} ${y + 5} L ${100 - y * 0.8} ${y + 20}`}
                stroke={PATTERN_COLOR}
                strokeWidth={STROKE}
              />
            </React.Fragment>
          ))}
        </G>

        {/* === MIDDLE LEFT: Broad Leaf === */}
        <G
          opacity={OPACITY * 0.8}
          transform={`translate(-30, ${height * 0.25}) scale(0.65) rotate(45)`}
        >
          <Path
            d="M 0 0 C 50 -20, 120 20, 140 80 C 120 140, 50 160, 0 140 C -20 80, -20 40, 0 0"
            stroke={PATTERN_COLOR}
            strokeWidth={STROKE}
            fill="none"
          />
          <Path
            d="M 0 0 Q 60 70, 140 80"
            stroke={PATTERN_COLOR}
            strokeWidth={STROKE}
            fill="none"
          />
          {/* Vein details */}
          <Path
            d="M 40 40 L 60 20"
            stroke={PATTERN_COLOR}
            strokeWidth={STROKE}
          />
          <Path
            d="M 70 70 L 90 50"
            stroke={PATTERN_COLOR}
            strokeWidth={STROKE}
          />
          <Path
            d="M 100 100 L 120 80"
            stroke={PATTERN_COLOR}
            strokeWidth={STROKE}
          />
          <Path
            d="M 50 60 L 60 90"
            stroke={PATTERN_COLOR}
            strokeWidth={STROKE}
          />
          <Path
            d="M 80 90 L 90 120"
            stroke={PATTERN_COLOR}
            strokeWidth={STROKE}
          />
        </G>

        {/* === MIDDLE RIGHT: Delicate Branch === */}
        <G
          opacity={OPACITY * 0.7}
          transform={`translate(${width - 50}, ${height * 0.35}) scale(0.6) rotate(-110)`}
        >
          <Path
            d="M 0 0 Q 30 100, 10 200"
            stroke={PATTERN_COLOR}
            strokeWidth={STROKE}
            fill="none"
          />
          {[20, 60, 100, 140, 180].map((y, i) => (
            <React.Fragment key={i}>
              <Path
                d={`M 5 ${y} Q 35 ${y - 10}, 45 ${y + 10} Q 25 ${y + 20}, 5 ${y} `}
                stroke={PATTERN_COLOR}
                strokeWidth={STROKE}
                fill="none"
              />
              <Path
                d={`M -5 ${y + 20} Q -35 ${y + 10}, -45 ${y + 30} Q -25 ${y + 40}, -5 ${y + 20}`}
                stroke={PATTERN_COLOR}
                strokeWidth={STROKE}
                fill="none"
              />
            </React.Fragment>
          ))}
        </G>

        {/* === CENTER: Subtle Floating Leaves === */}
        <G
          opacity={OPACITY * 0.5}
          transform={`translate(${width * 0.2}, ${height * 0.5}) scale(0.4) rotate(15)`}
        >
          <Path
            d="M 0 50 Q 50 0, 100 50 Q 50 100, 0 50"
            stroke={PATTERN_COLOR}
            strokeWidth={STROKE}
            fill="none"
          />
          <Path
            d="M 0 50 L 100 50"
            stroke={PATTERN_COLOR}
            strokeWidth={STROKE}
            fill="none"
          />
        </G>
        <G
          opacity={OPACITY * 0.5}
          transform={`translate(${width * 0.7}, ${height * 0.55}) scale(0.35) rotate(-30)`}
        >
          <Path
            d="M 0 50 Q 50 0, 100 50 Q 50 100, 0 50"
            stroke={PATTERN_COLOR}
            strokeWidth={STROKE}
            fill="none"
          />
          <Path
            d="M 0 50 L 100 50"
            stroke={PATTERN_COLOR}
            strokeWidth={STROKE}
            fill="none"
          />
        </G>

        {/* === BOTTOM LEFT: Upward Palm === */}
        <G
          opacity={OPACITY * 0.9}
          transform={`translate(0, ${height - 50}) scale(0.9) rotate(-15)`}
        >
          <Path
            d="M 0 200 C 20 150, 40 100, 100 0"
            stroke={PATTERN_COLOR}
            strokeWidth={STROKE}
            fill="none"
          />
          {/* Fan leaves */}
          <Path
            d="M 80 40 Q 40 60, 10 50"
            stroke={PATTERN_COLOR}
            strokeWidth={STROKE}
            fill="none"
          />
          <Path
            d="M 85 50 Q 50 90, 20 100"
            stroke={PATTERN_COLOR}
            strokeWidth={STROKE}
            fill="none"
          />
          <Path
            d="M 90 70 Q 70 120, 40 150"
            stroke={PATTERN_COLOR}
            strokeWidth={STROKE}
            fill="none"
          />
          <Path
            d="M 95 30 Q 130 50, 160 30"
            stroke={PATTERN_COLOR}
            strokeWidth={STROKE}
            fill="none"
          />
          <Path
            d="M 90 50 Q 130 90, 150 110"
            stroke={PATTERN_COLOR}
            strokeWidth={STROKE}
            fill="none"
          />
        </G>

        {/* === BOTTOM RIGHT: Detailed Monstera === */}
        <G
          opacity={OPACITY}
          transform={`translate(${width - 40}, ${height - 40}) scale(0.8) rotate(-20)`}
        >
          <Path
            d="M 0 0 C -40 30, -80 80, -60 140 C -40 180, 20 200, 60 180 C 100 160, 120 100, 100 50 C 80 10, 40 -20, 0 0"
            stroke={PATTERN_COLOR}
            strokeWidth={STROKE}
            fill="none"
          />
          <Path
            d="M 0 0 Q 20 100, 30 190"
            stroke={PATTERN_COLOR}
            strokeWidth={STROKE}
            fill="none"
          />
          {/* Slits/Cuts represented by gaps or just internal details for now */}
          <Path
            d="M -20 40 L 10 50"
            stroke={PATTERN_COLOR}
            strokeWidth={STROKE}
          />
          <Path
            d="M -30 80 L 15 90"
            stroke={PATTERN_COLOR}
            strokeWidth={STROKE}
          />
          <Path
            d="M -25 120 L 20 130"
            stroke={PATTERN_COLOR}
            strokeWidth={STROKE}
          />
          <Path
            d="M 40 40 L 10 50"
            stroke={PATTERN_COLOR}
            strokeWidth={STROKE}
          />
          <Path
            d="M 50 80 L 15 90"
            stroke={PATTERN_COLOR}
            strokeWidth={STROKE}
          />
          <Path
            d="M 55 120 L 20 130"
            stroke={PATTERN_COLOR}
            strokeWidth={STROKE}
          />
        </G>
      </Svg>
    </View>
  );
};
