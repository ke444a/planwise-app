import { View, Text } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import tw from "twrnc";
import Animated, { 
    useAnimatedStyle, 
    withRepeat, 
    withSequence, 
    withTiming,
    withDelay
} from "react-native-reanimated";

const AiLoadingIndicator = ({ message }: { message?: string }) => {
    const baseSequence = withSequence(
        withTiming(1, { duration: 300 }),
        withTiming(1, { duration: 300 }),
        withTiming(0, { duration: 300 }),
        withTiming(0, { duration: 300 })
    );

    const dot1Animation = useAnimatedStyle(() => ({
        opacity: withRepeat(
            withDelay(0, baseSequence),
            -1,
            false
        ),
    }));

    const dot2Animation = useAnimatedStyle(() => ({
        opacity: withRepeat(
            withDelay(300, baseSequence),
            -1,
            false
        ),
    }));

    const dot3Animation = useAnimatedStyle(() => ({
        opacity: withRepeat(
            withDelay(600, baseSequence),
            -1,
            false
        ),
    }));

    const fadingAnimation = useAnimatedStyle(() => ({
        opacity: withRepeat(
            withSequence(
                withTiming(0.7, { duration: 500 }),
                withTiming(1, { duration: 500 })
            ),
            -1,
            true
        ),
    }));

    return (
        <Animated.View style={[fadingAnimation]}>
            <View style={tw`flex-row items-center my-4`}>
                <MaterialCommunityIcons name="robot" size={24} style={tw`text-gray-600 dark:text-neutral-100`} />
                <View style={tw`ml-2 flex-row items-center`}>
                    <Text style={tw`text-gray-600 dark:text-neutral-100 font-medium text-lg`}>
                        {message || "Wait a moment. I'm thinking"}
                    </Text>
                    <Animated.Text style={[tw`text-gray-600 dark:text-neutral-100 font-medium text-lg`, dot1Animation]}>.</Animated.Text>
                    <Animated.Text style={[tw`text-gray-600 dark:text-neutral-100 font-medium text-lg`, dot2Animation]}>.</Animated.Text>
                    <Animated.Text style={[tw`text-gray-600 dark:text-neutral-100 font-medium text-lg`, dot3Animation]}>.</Animated.Text>
                </View>
            </View>
        </Animated.View>
    );
};

export default AiLoadingIndicator;