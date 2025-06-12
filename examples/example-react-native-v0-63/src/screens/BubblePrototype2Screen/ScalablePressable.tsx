
import React from 'react';

import {
  Animated,
  StyleProp,
  StyleSheet,
  ViewStyle,
  Pressable
} from 'react-native';

import { useLazyRef } from './Temp';


const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export function ScalablePressable(
  props: React.PropsWithChildren<{
    style?: StyleProp<ViewStyle>;
    onPress?: () => void;
  }>,
) {
  const animationScaleRef = useLazyRef(() => new Animated.Value(1));
  const animationOpacityRef = useLazyRef(() => new Animated.Value(1));

  const handlePressIn = () => {
    const animation = Animated.parallel([
      Animated.spring(animationScaleRef.current, {
        toValue: 0.9,
        useNativeDriver: true,
        speed: 50,
        bounciness: 0,
      }),
      Animated.timing(animationOpacityRef.current, {
        toValue: 0.5,
        duration: 250,
        useNativeDriver: true,
      })
    ]);

    animation.start();
  };

  const handlePressOut = () => {
    const animation = Animated.parallel([
      Animated.spring(animationScaleRef.current, {
        toValue: 1,
        useNativeDriver: true,
        speed: 50,
        bounciness: 0,
      }),
      Animated.timing(animationOpacityRef.current, {
        toValue: 1,
        duration: 250,
        useNativeDriver: true,
      })
    ]);

    animation.start();
  };

  const inheritedStyles = StyleSheet.flatten(props.style);

  return (
    <AnimatedPressable
      onPress={props.onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      style={[
        inheritedStyles,
        {
          opacity: animationOpacityRef.current,
          transform: [
            {
              scale: animationScaleRef.current,
            },
          ],
        },
      ]}
    >
      {props.children}
    </AnimatedPressable>
  );
}
