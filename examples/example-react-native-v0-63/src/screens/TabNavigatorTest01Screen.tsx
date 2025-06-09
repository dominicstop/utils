import React from 'react';
import { createAppContainer } from 'react-navigation';
import { createStackNavigator } from 'react-navigation-stack';
import { createBottomTabNavigator } from 'react-navigation-tabs';
import { View, Text } from 'react-native';

// Define some simple screens
const HomeScreen = () => (
  <View><Text>Home Screen</Text></View>
);

const SettingsScreen = () => (
  <View><Text>Settings Screen</Text></View>
);

const ProfileScreen = () => (
  <View><Text>Profile Screen</Text></View>
);

// Create a Tab Navigator
export const TabNavigatorTest01Navigator = createBottomTabNavigator(
  {
    Home: {
      screen: HomeScreen,
      navigationOptions: {
        tabBarLabel: 'Hello'
      },
    },
    Settings: SettingsScreen,
  },
  {
    tabBarOptions: {
      activeTintColor: 'tomato',
      inactiveTintColor: 'gray',
    },
  }
);