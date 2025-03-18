import { View, Text, TouchableOpacity } from "react-native";
import tw from "twrnc";
import Ionicons from "@expo/vector-icons/Ionicons";
import Entypo from "@expo/vector-icons/Entypo";
import { useState } from "react";
import Animated, {
    useAnimatedStyle,
    useSharedValue,
    withTiming,
    Easing,
} from "react-native-reanimated";

interface UserChatBoxProps {
    text: string;
}

const UserChatBox = ({ text }: UserChatBoxProps) => {
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
        <View style={tw`bg-slate-200 rounded-xl p-4 mb-6`}>
            <View style={tw`flex flex-row justify-between items-center`}>
                <View style={tw`flex-row items-center mb-2`}>
                    <Ionicons name="person" size={20} style={tw`text-gray-950`} />
                    <Text style={tw`text-gray-950 font-medium ml-1 text-lg`}>You</Text>
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

export default UserChatBox;