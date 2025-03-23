import { View, StyleSheet } from "react-native";
import tw from "twrnc";
import Ionicons from "@expo/vector-icons/Ionicons";
import Animated, { FadeIn, FadeOut } from "react-native-reanimated";

interface StaminaBarProps {
    currentStamina: number;
    maxStamina: number;
}

const HeaderStaminaBar = ({ currentStamina, maxStamina }: StaminaBarProps) => {
    const percentage = Math.min((currentStamina / maxStamina) * 100, 100);

    return (
        <View style={[tw`flex-row items-center rounded-full py-1 bg-white w-full shrink relative`, styles.staminaBarShadow]}>
            <Animated.View 
                style={tw.style("absolute left-0 top-0 bottom-0 right-0 bg-purple-200 rounded-full", { width: `${percentage}%` })}
                entering={FadeIn.duration(300)}
                exiting={FadeOut.duration(300)}
                key={`stamina-${currentStamina}`}
            />
            <Ionicons name="flash" size={20} style={tw`text-gray-950 ml-4 mr-2`} />
            <Animated.Text 
                style={tw`text-gray-950 font-medium relative text-lg`}
                entering={FadeIn.duration(300)}
                exiting={FadeOut.duration(300)}
                key={`stamina-text-${currentStamina}`}
            >
                {currentStamina}/{maxStamina} SP
            </Animated.Text>
        </View>
    );
};

const styles = StyleSheet.create({
    staminaBarShadow: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4
    }
});

export default HeaderStaminaBar;
