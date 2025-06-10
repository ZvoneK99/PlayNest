import React, { useContext } from "react";
import { AuthContext } from "./AuthContext";
import LoggedInTabs from "./components/LoggedInTabs";
import LoggedOutView from "./components/LoggedOutView";
import RegisterView from "./components/RegisterView";
import GamesScreen from "./components/GamesScreen";
import NewGameScreen from "./components/NewGameScreen";
import GameOneScreen from "./components/GameOneScreen";
import TicTacToeScreen from "./components/TicTacToeScreen";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";

const Stack = createStackNavigator();

export default function Navigation() {
  const { isLoggedIn, loading } = useContext(AuthContext);

  if (loading) return null; // ili spinner dok traje provjera sesije

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
            name="GamesScreen"
            component={GamesScreen}
            options={{ title: "Odaberi igru" }}
          />
          <Stack.Screen
            name="NewGameScreen"
            component={NewGameScreen}
            options={{ title: "Igra zbrajanja" }}
          />
          <Stack.Screen
            name="GameOne"
            component={GameOneScreen}
            options={{ title: "Igra pogađanja" }}
          />
          <Stack.Screen
            name="TicTacToe"
            component={TicTacToeScreen}
            options={{ title: "Križić-Kružić" }}
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