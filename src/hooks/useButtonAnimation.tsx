import { useSharedValue, useAnimatedStyle, withTiming } from "react-native-reanimated";

type Props = {
    shadowOffsetHeight: number;
};

export const useButtonPressAnimation = (props?: Props) => {
    const shadowOffsetHeight = props?.shadowOffsetHeight || 6;
    const translateY = useSharedValue(0);
    const shadowHeight = useSharedValue(shadowOffsetHeight);

    const animatedStyles = useAnimatedStyle(() => ({
        transform: [{ translateY: translateY.value }],
        shadowOffset: { width: 0, height: shadowHeight.value },
        shadowOpacity: 1,
        shadowRadius: 0
    }));

    const handlePressIn = () => {
        translateY.value = withTiming(shadowOffsetHeight, { duration: 200 });
        shadowHeight.value = withTiming(0, { duration: 200 });
    };

    const handlePressOut = () => {
        translateY.value = withTiming(0, { duration: 200 });
        shadowHeight.value = withTiming(shadowOffsetHeight, { duration: 200 });
    };

    return {
        animatedStyles,
        handlePressIn,
        handlePressOut,
    };
};
