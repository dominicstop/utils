/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow strict-local
 */

import * as React from 'react';

import {
  SafeAreaView,
  StyleSheet,
  ScrollView,
  View,
  Text,
  StatusBar,
} from 'react-native';
import { TouchableOpacity } from 'react-native-gesture-handler';

import { createAppContainer } from 'react-navigation';
import { createStackNavigator } from 'react-navigation-stack';
import { BubbleSelectTest01Screen } from './src/screens/BubbleSelectTest01Screen';
import { TabNavigatorTest01Navigator } from './src/screens/TabNavigatorTest01Screen';
import { TabNavigatorTest02Navigator } from './src/screens/TabNavigatorTest02Screen';
import { BubblesPrototypeScreen } from './src/screens/BubblesPrototypeScreen';

class HomeScreen extends React.Component {
  render() {
    return (
      <View style={styles.rootContainer}>
        <TouchableOpacity
          style={styles.buttonContainer}
          onPress={() => {
            this.props.navigation.navigate('bubbleSelect')
          }}
        >
          <Text>
            {'BubbleSelectTest'}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.buttonContainer}
          onPress={() => {
            this.props.navigation.navigate('tabNavigatorTest01')
          }}
        >
          <Text>
            {'tabNavigatorTest01'}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.buttonContainer}
          onPress={() => {
            this.props.navigation.navigate('tabNavigatorTest02')
          }}
        >
          <Text>
            {'tabNavigatorTest02'}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.buttonContainer}
          onPress={() => {
            this.props.navigation.navigate('bubblesPrototype')
          }}
        >
          <Text>
            {'bubblesPrototype'}
          </Text>
        </TouchableOpacity>
      </View>
    );
  }
}

const AppNavigator = createStackNavigator(
    {
      Home: {
        screen: HomeScreen,
      },
      bubblesPrototype: {
        screen: BubblesPrototypeScreen,
      },
      'bubbleSelect': {
        screen: BubbleSelectTest01Screen,
      },
      'tabNavigatorTest01': TabNavigatorTest01Navigator,
      'tabNavigatorTest02': TabNavigatorTest02Navigator,
    },
    {
      initialRouteName: 'Home',
    }
);

const AppContainer = createAppContainer(AppNavigator);

const App = () => {
  return (
    <AppContainer/>
  );
};

const styles = StyleSheet.create({
  rootContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonContainer: {
    padding: 24,
    backgroundColor: 'rgba(255,0,0,0.1)'
  },
});


export default App;
