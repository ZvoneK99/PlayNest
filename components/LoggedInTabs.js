import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import LoggedInView from './LoggedInView';
import GamesScreen from './GamesScreen';
import Leaderboard from './Leaderboard';
import HomeScreen from './HomeScreen';

const Tab = createBottomTabNavigator();

export default function LoggedInTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ color, size }) => {
          let iconName;

          if (route.name === 'Profil') {
            iconName = 'person';
          } else if (route.name === 'Igrice') {
            iconName = 'gamepad';
          } else if (route.name === 'Ljestvica') {
            iconName = 'leaderboard';
          } else if (route.name === 'Početna') {
            iconName = 'home';
          }

          return <MaterialIcons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: 'navy',
        tabBarInactiveTintColor: 'gray',
      })}
    >
      <Tab.Screen name="Početna" component={HomeScreen} />
      <Tab.Screen name="Profil" component={LoggedInView} />
      <Tab.Screen name="Igrice" component={GamesScreen} />
      <Tab.Screen name="Ljestvica" component={Leaderboard} />
    </Tab.Navigator>
  );
}