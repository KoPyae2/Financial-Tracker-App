import { View, Text } from 'react-native'
import React from 'react'
import { FontAwesome } from '@expo/vector-icons'
import Animated, { 
    useAnimatedStyle, 
    withSpring, 
    withTiming,
    withSequence,
    useSharedValue, 
    withDelay,
    Easing,
    withRepeat,
    interpolate,
    Extrapolate
} from 'react-native-reanimated'

export default function ChartItem({
    item,
    themeColors,
    chartData,
    theme,
    index
}: {
    item: any,
    themeColors: any,
    chartData: any,
    theme: any,
    index: number
}) {
    const height = useSharedValue(0);
    const scale = useSharedValue(0);
    const opacity = useSharedValue(0);
    const bounce = useSharedValue(0);

    React.useEffect(() => {
        const delay = index * 150;

        height.value = 0;
        scale.value = 0;
        opacity.value = 0;
        bounce.value = 0;

        opacity.value = withDelay(
            delay,
            withTiming(1, { 
                duration: 500,
                easing: Easing.bezier(0.25, 0.1, 0.25, 1)
            })
        );
        
        height.value = withDelay(
            delay,
            withSpring(item.percentage, {
                damping: 12,
                stiffness: 90,
                mass: 0.5,
                restDisplacementThreshold: 0.1
            })
        );

        scale.value = withDelay(
            delay,
            withSequence(
                withSpring(1.2, {
                    damping: 12,
                    stiffness: 100,
                    mass: 0.5
                }),
                withSpring(1, {
                    damping: 12,
                    stiffness: 100,
                    mass: 0.5
                })
            )
        );

        bounce.value = withDelay(
            delay + 800,
            withRepeat(
                withSequence(
                    withTiming(1, { 
                        duration: 1500,
                        easing: Easing.bezier(0.25, 0.1, 0.25, 1)
                    }),
                    withTiming(0, { 
                        duration: 1500,
                        easing: Easing.bezier(0.25, 0.1, 0.25, 1)
                    })
                ),
                -1,
                true
            )
        );
    }, [item.percentage, index]);

    const barStyle = useAnimatedStyle(() => {
        const bounceInterpolation = interpolate(
            bounce.value,
            [0, 1],
            [1, 1.02],
            Extrapolate.CLAMP
        );

        return {
            height: `${height.value}%`,
            opacity: opacity.value,
            transform: [{ scaleY: bounceInterpolation }]
        };
    });

    const textStyle = useAnimatedStyle(() => ({
        opacity: opacity.value,
        transform: [{ scale: scale.value }]
    }));

    const iconStyle = useAnimatedStyle(() => ({
        opacity: opacity.value,
        transform: [
            { scale: scale.value },
            { translateY: interpolate(bounce.value, [0, 1], [0, -2], Extrapolate.CLAMP) }
        ]
    }));

    return (
        <View
            className="max-h-[86%] flex-col items-center justify-end ms-4"
            style={{
                width: Math.max(40, 80 / chartData.length),
            }}
        >
            <Animated.Text
                style={[
                    {
                        color: themeColors.text.primary,
                    },
                    textStyle
                ]}
                className="-top-2 text-xs font-medium"
            >
                {item.percentage}%
            </Animated.Text>
            
            <Animated.View
                style={[
                    {
                        backgroundColor: theme === 'dark'
                            ? `${item.color}40`
                            : `${item.color}30`,
                        width: 24,
                        borderRadius: 12,
                    },
                    barStyle
                ]}
            />

            <Animated.View
                style={[
                    { 
                        flexDirection: 'column',
                        alignItems: 'center',
                        marginBottom: -38
                    },
                    iconStyle
                ]}
            >
                <FontAwesome
                    name={item.icon as any}
                    size={20}
                    color={item.color}
                />
                <Text
                    style={{ color: themeColors.text.secondary }}
                    className="mt-1 text-xs"
                >
                    {item.count}
                </Text>
            </Animated.View>
        </View>
    )
}