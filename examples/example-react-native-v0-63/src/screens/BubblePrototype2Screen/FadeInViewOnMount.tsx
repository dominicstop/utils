import React from 'react';
import { Animated, ViewStyle, StyleProp } from 'react-native';
import { useLazyRef } from './Temp';


type FadeInViewProps = React.PropsWithChildren<{
    style?: StyleProp<ViewStyle>;
    duration?: number;
    delay?: number;
}>;

export function FadeInViewOnMount({
    children,
    style,
    duration = 500,
    delay = 0,
}: FadeInViewProps) {
    const opacityRef = useLazyRef(() => new Animated.Value(0));

    React.useEffect(() => {
        Animated.timing(opacityRef.current, {
            toValue: 1,
            duration,
            delay,
            useNativeDriver: true,
        }).start();
    }, [duration, delay]);

    return (
        <Animated.View style={[style, { opacity: opacityRef.current }]}>
            {children}
        </Animated.View>
    );
}
