import React, { useState } from "react";
import {
  ActivityIndicator,
  StyleSheet,
  View,
  type StyleProp,
  type ViewStyle,
} from "react-native";
import { Image, type ImageContentFit } from "expo-image";
import { neumorphicColors } from "../theme/neumorphic";

interface OptimizedImageProps {
  uri: string;
  style?: StyleProp<ViewStyle>;
  contentFit?: ImageContentFit;
}

export default function OptimizedImage({
  uri,
  style,
  contentFit = "cover",
}: OptimizedImageProps) {
  const [isLoading, setIsLoading] = useState(true);

  return (
    <View style={[styles.container, style]}>
      <Image
        source={{ uri }}
        style={StyleSheet.absoluteFillObject}
        contentFit={contentFit}
        cachePolicy="memory-disk"
        transition={120}
        onLoadEnd={() => setIsLoading(false)}
      />
      {isLoading ? (
        <View style={styles.loaderOverlay}>
          <ActivityIndicator size="small" color={neumorphicColors.primary[600]} />
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    overflow: "hidden",
    backgroundColor: neumorphicColors.base.card,
  },
  loaderOverlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: `${neumorphicColors.base.card}AA`,
  },
});
