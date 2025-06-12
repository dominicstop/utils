import React from 'react';

import {
  Animated,
  Image,
  Pressable,
  StyleProp,
  StyleSheet,
  TransformsStyle,
  ViewStyle
} from 'react-native';

import { BoxedCircle, BoxedHexagon, InterpolationHelpers } from '@dominicstop/utils';

import { FadeInViewOnMount } from './FadeInViewOnMount';
import { useLazyRef } from './Temp';
import { WhatsNewEntry } from './WhatsNewService';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

function ScalablePressable(
  props: React.PropsWithChildren<{
    style: StyleProp<ViewStyle>;
    onPress: () => void;
  }>,
) {
  const animationScaleRef = useLazyRef(() => new Animated.Value(1));
  const animationOpacityRef = useLazyRef(() => new Animated.Value(1));

  const handlePressIn = () => {
    Animated.spring(animationScaleRef.current, {
      toValue: 0.9,
      useNativeDriver: true,
      speed: 50,
      bounciness: 0,
    }).start();

    Animated.timing(animationOpacityRef.current, {
      toValue: 0.5,
      duration: 250,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(animationScaleRef.current, {
      toValue: 1,
      useNativeDriver: true,
      speed: 50,
      bounciness: 0,
    }).start();

    Animated.timing(animationOpacityRef.current, {
      toValue: 1,
      duration: 250,
      useNativeDriver: true,
    }).start();
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
            // @ts-ignore
            ...inheritedStyles.transform,

          ],
        },
      ]}
    >
      {props.children}
    </AnimatedPressable>
  );
}

export function WhatsNewBubble(props: {
  index: number;
  totalCircles: number;
  whatsNewEntry: WhatsNewEntry;
  circle: BoxedCircle;
  circleTransformed?: BoxedCircle;
  onPress?: (args: {
    index: number;
    whatsNewEntry: WhatsNewEntry;
  }) => void;
}) {

  const animationRefTranslateX = useLazyRef(() =>
    new Animated.Value(props.circle.origin.x)
  );

  const animationRefTranslateY = useLazyRef(() =>
    new Animated.Value(props.circle.origin.y)
  );

  const animationRefScale = useLazyRef(() =>
    new Animated.Value(1)
  );

  const animationRefOpacity = useLazyRef(() =>
    new Animated.Value(1)
  );

  // Note: Dominic
  //
  // * In this version of RN, `useNativeDriver` does not support animating
  //   the size of the views (only alpha, transforms, etc.).
  //
  // * We can use `react-native-reanimated@v1`, but it will have to be refactored in the
  //   when the RN version is upgraded; so we opted not to use it, and relied on transforms.
  //
  // * `props.circle` defines the initial size and position of the bubble; because of this,
  //   the bubble has a fixed width/height, and cannot be changed directly.
  //
  // * the bubbles are manually positioned; the bubble is then translated to the correct
  //   position based on `props.circle.origin`.
  //
  // * `props.circleTransformed` is the new size + position of the bubble. If it is not undefined,
  //   it means we want to resize + reposition the bubble.
  //
  // * we want to match the size + position of the bubble to `props.circleTransformed`
  //   based on initial the size and position of `props.circle`.
  //
  // * since the height + width cannot be changed, we do this via scaling and translating
  //   from `props.circle` to `props.circleTransformed`.
  //
  // * we calculate the scale factor amount and extra translation so that the bubble
  //   will be the same size + position as `props.circleTransformed`.
  //
  React.useEffect(() => {

    const scaleFactor = (() => {
      if(props.circleTransformed == null) {
        return 1;
      };

      return props.circleTransformed.diameter / props.circle.diameter;
    })();

    const newTranslateX = (() => {
      if(props.circleTransformed == null) {
        return props.circle.origin.x;
      };

      const deltaCenterX = props.circleTransformed.center.x - props.circle.center.x;
      return props.circle.origin.x + deltaCenterX;
    })();

    const newTranslateY = (() => {
      if(props.circleTransformed == null) {
        return props.circle.origin.y;
      };

      const deltaCenterY = props.circleTransformed.center.y - props.circle.center.y;
      return props.circle.origin.y + deltaCenterY;
    })();

    const delay = InterpolationHelpers.rangedLerpUsingInputValue(
      /* inputValue      : */ props.index + 1,
      /* inputValueStart : */ 1,
      /* inputValueEnd   : */ props.totalCircles,
      /* outputValueStart: */ 0,
      /* outputValueEnd  : */ 75,
    );

    const delayOffset = 25;
    const bouncinessBase = 7;
    const bouncinessOffset = 5;

    const animation = Animated.parallel([
      Animated.spring(
        animationRefTranslateX.current,
        {
          toValue: newTranslateX,
          useNativeDriver: true,
          delay: delay,
          bounciness: bouncinessBase,
          // @ts-ignore
          useNativeDriver: true,

        }
      ),
      Animated.spring(
        animationRefTranslateY.current,
        {
          toValue: newTranslateY,
          useNativeDriver: true,
          delay: delay,
          bounciness: bouncinessBase,
          // @ts-ignore
          useNativeDriver: true,
        }
      ),
      Animated.spring(
        animationRefScale.current,
        {
          toValue: scaleFactor,
          useNativeDriver: true,
          delay: delay + delayOffset,
          bounciness: bouncinessBase + bouncinessOffset,
          // @ts-ignore
          useNativeDriver: true,

        }
      ),
    ]);

    animation.start();
  }, [props.circleTransformed]);

  return (
    <Animated.View
      style={[
        styles.rootContainer,
        {
          opacity: animationRefOpacity.current,
          width: props.circle.diameter,
          borderRadius: props.circle.radius,
          transform: [
            {
              translateX: animationRefTranslateX.current
            },
            {
              translateY: animationRefTranslateY.current
            },
            {
              scale: animationRefScale.current
            },
          ],
        },
      ]}
    >
      <Pressable
        style={{ flex: 1 }}
        onPress={() => {
          props.onPress?.({
            index: props.index,
            whatsNewEntry: props.whatsNewEntry,
          });
        }}
      >
        <FadeInViewOnMount
          duration={500}
          delay={props.index * 50}
        >
          <Image
            style={{
              flex: 1,
              aspectRatio: 1,
            }}
            source={{ uri: props.whatsNewEntry.imagePreviewURL }}
          />
        </FadeInViewOnMount>
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  rootContainer: {
    overflow: 'hidden',
    position: 'absolute',
    backgroundColor: 'rgba(255,255,255,0.25)',
    aspectRatio: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
