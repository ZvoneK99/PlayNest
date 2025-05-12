import React, { useContext } from "react";
import { AuthContext } from "./AuthContext";
import LoggedInTabs from "./components/LoggedInTabs";
import LoggedOutView from "./components/LoggedOutView";
import RegisterView from "./components/RegisterView";
import WhackAMole from "./components/WhackAMole"; // Samo WhackAMole ostaje

import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";

const Stack = createStackNavigator();

export default function Navigation() {
  const { isLoggedIn } = useContext(AuthContext);

  return (
    <NavigationContainer>
      {isLoggedIn ? (
        <Stack.Navigator>
          <Stack.Screen
            name="Dobrodošli na sustav"
            component={LoggedInTabs}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="WhackAMole"
            component={WhackAMole}
            options={{ title: "Whack a Mole" }}
          />
        </Stack.Navigator>
      ) : (
        <Stack.Navigator>
          <Stack.Screen
            name="Login"
            component={LoggedOutView}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="Register"
            component={RegisterView}
            options={{ title: "Registracija" }}
          />
        </Stack.Navigator>
      )}
    </NavigationContainer>
  );
}
