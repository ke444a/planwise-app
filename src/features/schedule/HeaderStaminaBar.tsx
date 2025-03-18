import { View, Text, StyleSheet } from "react-native";
import tw from "twrnc";
import Ionicons from "@expo/vector-icons/Ionicons";

interface StaminaBarProps {
    currentStamina: number;
    maxStamina: number;
}

const HeaderStaminaBar = ({ currentStamina, maxStamina }: StaminaBarProps) => {
    const percentage = (currentStamina / maxStamina) * 100;

    return (
        <View style={[tw`flex-row items-center rounded-full py-1 bg-white w-full shrink relative`, styles.staminaBarShadow]}>
            <View style={tw.style("absolute left-0 top-0 bottom-0 right-0 bg-red-200 rounded-full", { width: `${percentage}%` })} />
            <Ionicons name="flash" size={20} style={tw`text-gray-950 ml-4 mr-2`} />
            <Text style={tw`text-gray-950 font-medium relative text-lg`}>{currentStamina}/{maxStamina} SP</Text>
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
