import React from "react";
import { View, Text, StyleSheet, Image, TouchableOpacity } from "react-native";
import * as ImagePicker from "expo-image-picker";

type ImageUploadProps = {
  image: string | null;
  setImage: (uri: string) => void;
};

const ImageUpload: React.FC<ImageUploadProps> = ({ image, setImage }) => {
  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });
    if (!result.canceled && result.assets && result.assets.length > 0) {
      setImage(result.assets[0].uri);
    }
  };
  return (
    <View style={styles.container}>
      {image ? (
        <Image source={{ uri: image }} style={styles.image} />
      ) : (
        <Text>No image selected</Text>
      )}
      <TouchableOpacity onPress={pickImage} style={styles.button}>
        <Text style={styles.buttonText}>Pick an image</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    marginVertical: 8,
  },
  image: {
    width: 200,
    height: 150,
    borderRadius: 8,
    marginBottom: 8,
  },
  button: {
    backgroundColor: "#4CAF50",
    padding: 10,
    borderRadius: 6,
  },
  buttonText: {
    color: "#fff",
    fontWeight: "bold",
  },
});

export default ImageUpload;
