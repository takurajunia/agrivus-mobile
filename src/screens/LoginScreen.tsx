import React from "react";
import { View, Text, Button } from "react-native";
import { useAuth } from "../contexts/AuthContext";
import { StackNavigationProp } from "@react-navigation/stack";

type LoginScreenProps = {
  navigation: StackNavigationProp<any>;
};

const LoginScreen: React.FC<LoginScreenProps> = ({ navigation }) => {
  const auth = useAuth();
  const handleLogin = () => {
    auth.login({ name: "Demo User" });
    navigation.replace("Dashboard");
  };
  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      <Text>Login Screen</Text>
      <Button title="Login" onPress={handleLogin} />
    </View>
  );
};
export default LoginScreen;
