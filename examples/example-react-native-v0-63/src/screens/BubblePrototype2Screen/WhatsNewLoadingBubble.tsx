import { BoxedHexagon } from '@dominicstop/utils';
import React from 'react';
import {
  Animated,
  Easing,
  StyleProp,
  StyleSheet,
  ViewStyle
} from 'react-native';
import { useLazyRef } from './Temp';

function PulsingContainerView(
  props: React.PropsWithChildren<{
    delay: number;
    style: StyleProp<ViewStyle>;
  }>,
) {
  const animationScaleRef = useLazyRef(() => new Animated.Value(1));
  const animationOpacityRef = useLazyRef(() => new Animated.Value(1));

  React.useEffect(() => {
    const DURATION = 3000;
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.delay(props.delay),
        Animated.timing(animationScaleRef.current, {
          toValue: 0.8,
          duration: DURATION,
          easing: Easing.in(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(animationScaleRef.current, {
          toValue: 1,
          duration: DURATION,
          easing: Easing.out(Easing.ease),
          useNativeDriver: true,
        }),
      ]),
    );

    pulse.start();

    return () => pulse.stop(); // Cleanup on unmount
  }, [animationScaleRef.current]);

  React.useEffect(() => {
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.delay(props.delay),
        Animated.timing(animationOpacityRef.current, {
          toValue: 0.75,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(animationOpacityRef.current, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]),
    );

    pulse.start();

    return () => pulse.stop(); // Cleanup on unmount
  }, [animationOpacityRef.current]);

  const inheritedStyles = StyleSheet.flatten(props.style);
  return (
    <Animated.View
      style={[
        inheritedStyles,
        {
          opacity: animationOpacityRef.current,
        },
        {
          transform: [
            // @ts-ignore
            ...inheritedStyles.transform,
            {
              scale: animationScaleRef.current,
            },
          ],
        },
      ]}>
      {props.children}
    </Animated.View>
  );
}

export function WhatsNewLoadingBubble(props: {
  index: number;
  hexagon: BoxedHexagon;
}) {
  return (
    <PulsingContainerView
      delay={(props.index + 1) * 75}
      style={[
        styles.rootContainer,
        {
          width: props.hexagon.inCircle.diameter,
          borderRadius: props.hexagon.inCircle.diameter / 2,
          transform: [
            {
              translateX: props.hexagon.origin.x,
            },
            {
              translateY: props.hexagon.origin.y,
            },
          ],
        },
      ]}
    />
  );
}

const styles = StyleSheet.create({
  rootContainer: {
    overflow: 'hidden',
    position: 'absolute',
    backgroundColor: 'rgba(255,255,255,0.5)',
    aspectRatio: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
