import React from 'react';
import { View, Text } from 'react-native';
import * as Reanimated from 'react-native-reanimated'
import Animated from 'react-native-reanimated';

import {createAppContainer} from 'react-navigation';
import {createBottomTabNavigator} from 'react-navigation-tabs';
import {SafeAreaProvider} from 'react-native-safe-area-context';
import AnimatedTabBar, {TabsConfig, BubbleTabBarItemConfig, BubbleTabBarIconProps} from '@gorhom/animated-tabbar';


const TabRoutes = {
  HOME: 'HOME',
  LOANS: 'LOANS',
  QR_SCAN: 'QR_SCAN',
  CARD: 'CARD',
  MORE: 'MORE',
};

const TabRouteTitle = {
  [TabRoutes.HOME]: 'Home',
  [TabRoutes.LOANS]: 'Loans',
  [TabRoutes.QR_SCAN]: 'QR Scan',
  [TabRoutes.CARD]: 'Card',
  [TabRoutes.MORE]: 'More',
};


const Icon: React.FC<BubbleTabBarIconProps> = (props) => {
  return (
    <Animated.View style={{
      width: props.size,
      height: props.size,
      borderRadius: props.size / 2,
      backgroundColor: props.color,
    }}/>
  );
};

const commonTabBarConfig: Pick<BubbleTabBarItemConfig, 
  | 'labelStyle'
  | 'icon'
  | 'background'
> = {
  labelStyle: {
    color: 'white',
  },
  icon: {
    component: Icon,
    activeColor: 'white',
    inactiveColor: 'rgb(187,39,26)',
  },
  background: {
    activeColor: 'rgb(187,39,26)',
    inactiveColor: 'rgba(223,215,243,0)',
  },
};

const tabs: TabsConfig<BubbleTabBarItemConfig> = {
  [TabRoutes.HOME]: {
    title: TabRouteTitle[TabRoutes.HOME],
    ...commonTabBarConfig,
  },
  [TabRoutes.LOANS]: {
    title: TabRouteTitle[TabRoutes.LOANS],
    ...commonTabBarConfig,
  },
  [TabRoutes.QR_SCAN]: {
    title: TabRouteTitle[TabRoutes.QR_SCAN],
    ...commonTabBarConfig,
  },
  [TabRoutes.CARD]: {
    title: TabRouteTitle[TabRoutes.CARD],
    ...commonTabBarConfig,
  },
  [TabRoutes.MORE]: {
    title: TabRouteTitle[TabRoutes.MORE],
    ...commonTabBarConfig,
  },
};


function TestScreen01(){
    return (
      <View>
        <Text>
          {'Hello 1'}
        </Text>
      </View>
    );
};

function TestScreen02(){
  return (
    <View>
      <Text>
        {'Hello 2'}
      </Text>
    </View>
  );
};

function TestScreen03(){
  return (
    <View>
      <Text>
        {'Hello 2'}
      </Text>
    </View>
  );
};

function TestScreen04(){
  return (
    <View>
      <Text>
        {'Hello 2'}
      </Text>
    </View>
  );
};

function TestScreen05(){
  return (
    <View>
      <Text>
        {'Hello 2'}
      </Text>
    </View>
  );
};

export const TabNavigatorTest02Navigator = createBottomTabNavigator(
  {
    [TabRoutes.HOME]: {
      screen: TestScreen01,
      navigationOptions: {
        title: TabRouteTitle[TabRoutes.HOME],
        tabBarLabel: TabRouteTitle[TabRoutes.HOME],
      },
    },
    [TabRoutes.LOANS]: {
      screen: TestScreen03,
      navigationOptions: {
        tabBarLabel: TabRouteTitle[TabRoutes.LOANS],
      },
    },
    [TabRoutes.QR_SCAN]: {
      screen: TestScreen05,
      navigationOptions: {
        tabBarLabel: TabRouteTitle[TabRoutes.QR_SCAN],
      },
    },
    [TabRoutes.CARD]: {
      screen: TestScreen01,
      navigationOptions: {
        tabBarLabel: TabRouteTitle[TabRoutes.CARD],
      },
    },
    [TabRoutes.MORE]: {
      screen: TestScreen04,
      
      navigationOptions: {
        tabBarLabel: TabRouteTitle[TabRoutes.MORE],
      },
    },
  },
  {
    tabBarComponent: props => <AnimatedTabBar 
      tabs={tabs}
      isReactNavigation5={true} 
      {...props} 
    />,
  },
);