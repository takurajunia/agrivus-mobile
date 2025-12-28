import "react-native-gesture-handler";
import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import { AuthProvider } from "./src/contexts/AuthContext";
import { ChatProvider } from "./src/contexts/ChatContext";
import { NotificationsProvider } from "./src/contexts/NotificationsContext";
import DashboardScreen from "./src/screens/DashboardScreen";
import LoginScreen from "./src/screens/LoginScreen";
import OrdersScreen from "./src/screens/OrdersScreen";
// ...import other screens as needed

const Stack = createStackNavigator();

export default function App() {
  return (
    <AuthProvider>
      <ChatProvider>
        <NotificationsProvider>
          <NavigationContainer>
            <Stack.Navigator initialRouteName="Login">
              <Stack.Screen name="Login" component={LoginScreen} />
              <Stack.Screen name="Dashboard" component={DashboardScreen} />
              <Stack.Screen name="Orders" component={OrdersScreen} />
              {/* Add other screens here */}
            </Stack.Navigator>
          </NavigationContainer>
        </NotificationsProvider>
      </ChatProvider>
    </AuthProvider>
  );
}
