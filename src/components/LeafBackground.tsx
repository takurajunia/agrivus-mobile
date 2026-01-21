import React from "react";
import { View, StyleSheet, Dimensions } from "react-native";
import Svg, { Path, G } from "react-native-svg";

const { width, height } = Dimensions.get("window");

// --- CONFIGURATION ---
export const BACKGROUND_COLOR = "#F0F0F3"; // Base matte off-white
const LEAF_COLOR = "#B0BEC5"; // Slightly darker grey for better definition
const OPACITY_BASE = 0.15; // Subtle watermark feel

// --- LEAF SHAPES (SVG PATHS) ---
const PATHS = {
  // Classic Oval Leaf
  simple: "M0 30 Q 15 0, 30 30 T 60 30 Q 45 60, 30 30 T 0 30 L 0 30",

  // Monstera / Swiss Cheese Leaf
  monstera: `
    M30,80 C10,70 0,50 10,30 C15,15 30,0 50,10 C70,0 85,15 90,30 
    C100,50 90,70 70,80 C65,75 60,70 50,75 C40,70 35,75 30,80
    M30,40 Q35,35 40,40 M60,40 Q65,35 70,40 M45,25 Q50,20 55,25
  `,

  // Fern / Palm Frond
  fern: `
    M10,80 Q25,60 30,40 Q35,20 30,0
    M30,10 L45,15 M30,20 L50,25 M30,30 L55,35 M30,40 L50,45 M30,50 L45,55
    M30,10 L15,15 M30,20 L10,25 M30,30 L5,35 M30,40 L10,45 M30,50 L15,55
  `,
};

// --- LEAF GENERATOR ---
// Helper to render a specific leaf at a position
const Leaf = ({ type, x, y, scale, rotation, opacity }: any) => {
  const path = PATHS[type as keyof typeof PATHS] || PATHS.simple;
  return (
    <G transform={`translate(${x}, ${y}) rotate(${rotation}) scale(${scale})`}>
      <Path
        d={path}
        fill="none"
        stroke={LEAF_COLOR}
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity={opacity}
      />
      {/* Add a subtle fill for depth if desired, uncomment below */}
      {/* <Path d={path} fill={LEAF_COLOR} opacity={opacity * 0.3} /> */}
    </G>
  );
};

export const LeafBackground = () => {
  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      {/* 1. Base Layer */}
      <View
        style={[StyleSheet.absoluteFill, { backgroundColor: BACKGROUND_COLOR }]}
      />

      {/* 2. Leaf Clusters */}
      <Svg height={height} width={width} style={StyleSheet.absoluteFill}>
        {/* === TOP LEFT CLUSTER === */}
        {/* Large Monstera anchoring the corner */}
        <Leaf
          type="monstera"
          x={-20}
          y={-20}
          scale={2.5}
          rotation={135}
          opacity={0.12}
        />
        {/* Ferns fanning out */}
        <Leaf
          type="fern"
          x={-10}
          y={80}
          scale={1.8}
          rotation={160}
          opacity={0.15}
        />
        <Leaf
          type="fern"
          x={80}
          y={-10}
          scale={1.8}
          rotation={110}
          opacity={0.15}
        />
        {/* Small fillers */}
        <Leaf
          type="simple"
          x={60}
          y={60}
          scale={1.2}
          rotation={135}
          opacity={0.1}
        />
        <Leaf
          type="simple"
          x={120}
          y={20}
          scale={1.0}
          rotation={90}
          opacity={0.08}
        />
        <Leaf
          type="simple"
          x={20}
          y={140}
          scale={0.8}
          rotation={180}
          opacity={0.08}
        />
        <Leaf
          type="monstera"
          x={100}
          y={100}
          scale={1.0}
          rotation={150}
          opacity={0.05}
        />

        {/* === BOTTOM RIGHT CLUSTER === */}
        {/* Large Monstera anchoring the corner */}
        <Leaf
          type="monstera"
          x={width + 10}
          y={height + 10}
          scale={3.0}
          rotation={-45}
          opacity={0.12}
        />
        {/* Ferns fanning out */}
        <Leaf
          type="fern"
          x={width - 40}
          y={height - 120}
          scale={2.0}
          rotation={-20}
          opacity={0.15}
        />
        <Leaf
          type="fern"
          x={width - 120}
          y={height - 20}
          scale={2.0}
          rotation={-70}
          opacity={0.15}
        />
        {/* Small fillers */}
        <Leaf
          type="simple"
          x={width - 80}
          y={height - 80}
          scale={1.4}
          rotation={-45}
          opacity={0.1}
        />
        <Leaf
          type="simple"
          x={width - 150}
          y={height - 50}
          scale={1.0}
          rotation={-90}
          opacity={0.08}
        />
        <Leaf
          type="simple"
          x={width - 50}
          y={height - 180}
          scale={0.9}
          rotation={0}
          opacity={0.08}
        />
        <Leaf
          type="monstera"
          x={width - 120}
          y={height - 140}
          scale={1.2}
          rotation={-30}
          opacity={0.05}
        />

        {/* === SIDE ACCENTS (Subtle) === */}
        <Leaf
          type="simple"
          x={-20}
          y={height / 2}
          scale={1.5}
          rotation={90}
          opacity={0.05}
        />
        <Leaf
          type="simple"
          x={width + 20}
          y={height / 2.5}
          scale={1.5}
          rotation={-90}
          opacity={0.05}
        />
      </Svg>
    </View>
  );
};
