import React from 'react';
import { StyleSheet, View, Image, Pressable, Animated, StyleProp, ViewStyle } from 'react-native';
import { BoxedHexagon } from './BoxedHexagon';
import { useLazyRef } from './Temp';
import { FadeInViewOnMount } from './FadeInViewOnMount';
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
      onPressOut={handlePressOut}>
      <Animated.View
        style={[
          inheritedStyles,
          {
            opacity: animationOpacityRef.current,
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
    </AnimatedPressable>
  );
}

export function WhatsNewBubble(props: {
  index: number;
  whatsNewEntry: WhatsNewEntry;
  hexagon: BoxedHexagon;
  onPress?: (args: {
    index: number;
    articleURL: string;
    hexagon: BoxedHexagon;
  }) => void;
}) {
  return (
    <ScalablePressable
      style={[
        styles.rootContainer,
        {
          width: props.hexagon.inCircle.diameter,
          borderRadius: props.hexagon.inCircle.diameter / 2,
          transform: [
            {
              translateX: props.hexagon.origin.x + 7,
            },
            {
              translateY: props.hexagon.origin.y + 7,
            },
          ],
          alignItems: 'center',
          justifyContent: 'center',
        },
      ]}
      onPress={() => {
        props.onPress?.({
          index: props.index,
          articleURL: props.whatsNewEntry.promoID,
          hexagon: props.hexagon,
        });
      }}
    >
      <FadeInViewOnMount duration={500} delay={props.index * 50}>
        <Image
          style={{
            flex: 1,
            aspectRatio: 1,
          }}
          source={{uri: props.whatsNewEntry.imagePreviewURL}}
        />
      </FadeInViewOnMount>
    </ScalablePressable>
  );
}

const styles = StyleSheet.create({
  rootContainer: {
    overflow: 'hidden',
    position: 'absolute',
    backgroundColor: 'rgba(255,255,255,0.25)',
    aspectRatio: 1,
  },
});
