import React, { useContext } from "react";
import { AuthContext } from "./AuthContext";
import LoggedInView from "./components/LoggedInView";
import LoggedOutView from "./components/LoggedOutView";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";

const Stack = createStackNavigator();

export default Navigation = () => {
    const { isLoggedIn } = useContext(AuthContext);

    return (
        <NavigationContainer>
            <Stack.Navigator>
                {
                    isLoggedIn ? (
                        <Stack.Screen name="Dobrodošli na sustav" component={LoggedInView} />
                    ) : (
                        <Stack.Screen name="Prijavite se na sustav" component={LoggedOutView} />
                    )
                }
            </Stack.Navigator>
        </NavigationContainer>
    );
};