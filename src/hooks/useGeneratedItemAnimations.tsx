import { 
    useAnimatedStyle, 
    withTiming, 
    useSharedValue,
    interpolate,
    Easing,
    withSpring
} from "react-native-reanimated";
import { useEffect, useState, useCallback } from "react";

export const useGeneratedItemAnimations = (status: string) => {
    const [showOptions, setShowOptions] = useState(false);
    const animation = useSharedValue(0);
    const pressAnimation = useSharedValue(1);

    // Add new shared value for status transitions
    const statusTransition = useSharedValue(status === "idle" ? 1 : 0);

    const handlePressIn = useCallback(() => {
        pressAnimation.value = withSpring(0.97, {
            damping: 15,
            stiffness: 400,
        });
    }, [pressAnimation]);

    const handlePressOut = useCallback(() => {
        pressAnimation.value = withSpring(1, {
            damping: 15,
            stiffness: 400,
        });
    }, [pressAnimation]);

    const handleToggleOptions = useCallback(() => {
        if (status === "idle") {
            setShowOptions(!showOptions);
            animation.value = withTiming(showOptions ? 0 : 1, {
                duration: 200,
                easing: Easing.bezier(0.4, 0, 0.2, 1),
            });
        }
    }, [animation, showOptions, status]);

    // Update pressStyle to have more subtle opacity
    const pressStyle = useAnimatedStyle(() => {
        return {
            transform: [
                { scale: pressAnimation.value },
                { translateY: interpolate(pressAnimation.value, [0.97, 1], [1, 0]) }
            ],
            opacity: interpolate(
                statusTransition.value,
                [0, 1],
                [0.9, 1]  // Changed from [0.8, 1] to be more subtle
            ),
        };
    }, [pressAnimation]);

    const optionsStyle = useAnimatedStyle(() => {
        return {
            opacity: animation.value,
            height: interpolate(
                animation.value,
                [0, 1],
                [0, 60],
            ),
            transform: [{
                translateY: interpolate(
                    animation.value,
                    [0, 1],
                    [-20, 0],
                ),
            }],
        };
    }, [animation]);

    // Update contentStyle for more subtle transitions
    const contentStyle = useAnimatedStyle(() => {
        return {
            opacity: interpolate(
                statusTransition.value,
                [0, 1],
                [0.85, 1]  // Changed from [0.6, 1] to be more subtle
            ),
            transform: [{
                scale: interpolate(
                    statusTransition.value,
                    [0, 1],
                    [0.99, 1]  // Changed from [0.98, 1] to be more subtle
                )
            }]
        };
    });

    // Update status effect to handle transitions
    useEffect(() => {
        statusTransition.value = withTiming(
            status === "idle" ? 1 : 0,
            {
                duration: 300,
                easing: Easing.bezier(0.4, 0, 0.2, 1),
            }
        );

        if (status !== "idle") {
            setShowOptions(false);
            animation.value = withTiming(0, {
                duration: 200,
                easing: Easing.bezier(0.4, 0, 0.2, 1),
            });
        }
    }, [status, animation, statusTransition]);

    return {
        showOptions,
        animation,
        pressAnimation,
        handlePressIn,
        handlePressOut,
        handleToggleOptions,
        pressStyle,
        optionsStyle,
        contentStyle,
    };
};