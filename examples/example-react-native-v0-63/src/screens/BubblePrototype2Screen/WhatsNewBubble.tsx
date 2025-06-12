import React from 'react';

import {
  Animated,
  Image,
  Pressable,
  StyleSheet,
} from 'react-native';

import { BoxedCircle, InterpolationHelpers } from '@dominicstop/utils';

import { FadeInViewOnMount } from './FadeInViewOnMount';
import { useLazyRef } from './Temp';
import { WhatsNewEntry } from './WhatsNewService';
import { ScalablePressable } from './ScalablePressable';


export function WhatsNewBubble(props: {
  index: number;
  totalCircles: number;
  whatsNewEntry: WhatsNewEntry;
  circle: BoxedCircle;
  circleTransformed?: BoxedCircle;
  isSelected: boolean;
  onPress?: (args: {
    index: number;
    whatsNewEntry: WhatsNewEntry;
  }) => void;
}) {

  const isSelectionActive = props.circleTransformed != null;

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

    const newOpacity = (() => {
      if(!isSelectionActive) {
        return 1;
      };

      return props.isSelected ? 1 : 0.7;
    })();

    const transformDelay = InterpolationHelpers.rangedLerpUsingInputValue(
      /* inputValue      : */ props.index + 1,
      /* inputValueStart : */ 1,
      /* inputValueEnd   : */ props.totalCircles,
      /* outputValueStart: */ 0,
      /* outputValueEnd  : */ 75,
    );

    const fadeDelay = InterpolationHelpers.rangedLerpUsingInputValue(
      /* inputValue      : */ props.index + 1,
      /* inputValueStart : */ 1,
      /* inputValueEnd   : */ props.totalCircles,
      /* outputValueStart: */ 0,
      /* outputValueEnd  : */ 250,
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
          delay: transformDelay,
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
          delay: transformDelay,
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
          delay: transformDelay + delayOffset,
          bounciness: bouncinessBase + bouncinessOffset,
          // @ts-ignore
          useNativeDriver: true,
        }
      ),
      Animated.timing(
        animationRefOpacity.current,
        {
          toValue: newOpacity,
          duration: (props.isSelected
            ? 300
            : 0.8 * 1000
          ),
          delay: (props.isSelected
            ? 0
            : fadeDelay
          ),
          useNativeDriver: true,
        },
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
      <ScalablePressable
        style={[
          styles.innerPressable,
          {
            borderRadius: props.circle.radius,
          },
        ]}
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
      </ScalablePressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  rootContainer: {
    position: 'absolute',
    aspectRatio: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  innerPressable: {
    flex: 1,
    overflow: 'hidden',
    backgroundColor: 'rgba(255,255,255,0.25)',
  },
});
