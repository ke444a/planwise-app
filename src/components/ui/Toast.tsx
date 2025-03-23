import { Text } from "react-native";
import tw from "twrnc";
import Animated, { 
    useAnimatedStyle, 
    withSequence, 
    withTiming,
    withDelay,
    Easing
} from "react-native-reanimated";
import { useEffect } from "react";
import { Dimensions } from "react-native";

interface ToastProps {
    message: string;
    isVisible: boolean;
    onHide: () => void;
    duration?: number;
}

const { width: SCREEN_WIDTH } = Dimensions.get("window");

export const Toast = ({ 
    message, 
    isVisible, 
    onHide,
    duration = 2000 
}: ToastProps) => {
    useEffect(() => {
        if (isVisible) {
            const timer = setTimeout(() => {
                onHide();
            }, duration);
            return () => clearTimeout(timer);
        }
    }, [isVisible, duration, onHide]);

    const animatedStyle = useAnimatedStyle(() => {
        if (!isVisible) {
            return {
                opacity: 0,
                transform: [{ translateY: 20 }]
            };
        }

        return {
            opacity: withSequence(
                withTiming(1, { duration: 200, easing: Easing.out(Easing.ease) }),
                withDelay(
                    duration - 400,
                    withTiming(0, { duration: 200, easing: Easing.in(Easing.ease) })
                )
            ),
            transform: [{
                translateY: withSequence(
                    withTiming(0, { duration: 200, easing: Easing.out(Easing.ease) }),
                    withDelay(
                        duration - 400,
                        withTiming(20, { duration: 200, easing: Easing.in(Easing.ease) })
                    )
                )
            }]
        };
    }, [isVisible, duration]);

    if (!isVisible) return null;

    return (
        <Animated.View 
            style={[
                tw`absolute bottom-10 self-center p-3 bg-gray-600 rounded-xl`,
                { width: SCREEN_WIDTH - 40 },
                animatedStyle
            ]}
        >
            <Text style={tw`text-white text-lg font-medium text-center`}>
                {message}
            </Text>
        </Animated.View>
    );
}; 