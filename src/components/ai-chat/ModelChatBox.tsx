import { View, Text, TouchableOpacity } from "react-native";
import tw from "twrnc";
import FontAwesome6 from "@expo/vector-icons/FontAwesome6";
import Entypo from "@expo/vector-icons/Entypo";
import { useState } from "react";
import Animated, {
    useAnimatedStyle,
    useSharedValue,
    withTiming,
    Easing,
} from "react-native-reanimated";

interface ModelChatBoxProps {
    text: string;
}

const ModelChatBox = ({ text }: ModelChatBoxProps) => {
    const [isOpen, setIsOpen] = useState(true);
    const height = useSharedValue(1);

    const toggleOpen = () => {
        setIsOpen(!isOpen);
        height.value = withTiming(isOpen ? 0 : 1, {
            duration: 150,
            easing: Easing.ease,
        });
    };

    const animatedStyle = useAnimatedStyle(() => {
        return {
            height: height.value === 0 ? 0 : "auto",
            opacity: height.value,
        };
    });

    return (
        <View style={tw`bg-purple-50 rounded-xl p-4 mb-6`}>
            <View style={tw`flex flex-row justify-between items-center`}>
                <View style={tw`flex-row items-center mb-2`}>
                    <FontAwesome6 name="robot" size={20} style={tw`text-gray-950`} />
                    <Text style={tw`text-gray-950 font-medium ml-2 text-lg`}>Assistant</Text>
                </View>
                <TouchableOpacity onPress={toggleOpen}>
                    <Entypo
                        name={isOpen ? "chevron-left" : "chevron-down"}
                        size={24}
                        style={tw`text-gray-950`}
                    />
                </TouchableOpacity>
            </View>
            <Animated.View style={[animatedStyle, { overflow: "hidden" }]}>
                <Text style={tw`text-gray-950 text-lg pt-4`}>{text}</Text>
            </Animated.View>
        </View>
    );
};

export default ModelChatBox;
