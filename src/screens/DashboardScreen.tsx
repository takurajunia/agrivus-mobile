import React from "react";
import { View, Text, Button } from "react-native";
import { useAuth } from "../contexts/AuthContext";
import { StackNavigationProp } from "@react-navigation/stack";

type DashboardScreenProps = {
  navigation: StackNavigationProp<any>;
};

const DashboardScreen: React.FC<DashboardScreenProps> = ({ navigation }) => {
  const auth = useAuth();
  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      <Text>Dashboard</Text>
      <Button title="Logout" onPress={auth.logout} />
    </View>
  );
};
export default DashboardScreen;
