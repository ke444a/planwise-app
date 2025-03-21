import { View, Text } from "react-native";
import tw from "twrnc";
import { StaminaPicker } from "./ui/CustomSlider";

interface StaminaSectionProps {
    value: number;
    onValueChange: (_value: number) => void;
}

export const StaminaSection = ({ value, onValueChange }: StaminaSectionProps) => {
    return (
        <View style={tw`mb-8`}>
            <Text style={tw`text-2xl font-semibold text-gray-950 mb-4`}>
                How Much Stamina?
            </Text>
            <StaminaPicker
                value={value}
                onValueChange={onValueChange}
            />
        </View>
    );
}; 