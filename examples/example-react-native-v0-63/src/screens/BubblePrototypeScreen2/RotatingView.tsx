import React from 'react';
import { Animated, Easing, StyleProp, ViewStyle } from 'react-native';
import { useLazyRef } from './Temp';

type RotatingViewProps = React.PropsWithChildren<{
    style?: StyleProp<ViewStyle>;
    rotateDuration?: number;
    scaleDuration?: number; 
}>;

export function RotatingView({
    children,
    style,
    rotateDuration = 2000,
    scaleDuration = 3000,
}: RotatingViewProps) {

    const rotateAnim = useLazyRef(() => new Animated.Value(0));
    const scaleAnim = useLazyRef(() => new Animated.Value(1));

    React.useEffect(() => {
        const rotateLoop = Animated.loop(
            Animated.timing(rotateAnim.current, {
                toValue: 1,
                duration: rotateDuration,
                easing: Easing.linear,
                useNativeDriver: true,
            })
        );

        const scaleLoop = Animated.loop(
            Animated.sequence([
                Animated.timing(scaleAnim.current, {
                    toValue: 1.1,
                    duration: scaleDuration,
                    easing: Easing.inOut(Easing.ease),
                    useNativeDriver: true,
                }),
                Animated.timing(scaleAnim.current, {
                    toValue: 1,
                    duration: scaleDuration,
                    easing: Easing.inOut(Easing.ease),
                    useNativeDriver: true,
                }),
            ])
        );

        rotateLoop.start();
        scaleLoop.start();

        return () => {
            rotateLoop.stop();
            scaleLoop.stop();
        };
    }, [rotateDuration, scaleDuration]);

    const rotateInterpolate = rotateAnim.current.interpolate({
        inputRange: [0, 1],
        outputRange: ['0deg', '360deg'],
    });
    
    return (
        <Animated.View
            style={[
                style,
                {
                    transform: [
                        { rotate: rotateInterpolate },
                        { scale: scaleAnim.current },
                    ],
                },
            ]}
        >
            {children}
        </Animated.View>
    );
}
