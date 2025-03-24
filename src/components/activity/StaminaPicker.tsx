import { View, Text, TouchableOpacity } from "react-native";
import tw from "twrnc";
import Ionicons from "@expo/vector-icons/Ionicons";
import { ACTIVITY_STAMINA_COSTS } from "@/libs/constants";

interface StaminaPickerProps {
    value: number;
    onValueChange: (_value: number) => void;
}

export const StaminaPicker = ({ value, onValueChange }: StaminaPickerProps) => {
    const staminaOptions = [
        ACTIVITY_STAMINA_COSTS.slice(0, 4),
        ACTIVITY_STAMINA_COSTS.slice(4)
    ];

    return (
        <View>
            {staminaOptions.map((row, rowIndex) => (
                <View key={rowIndex} style={tw`flex-row gap-2 mb-2`}>
                    {row.map((option) => (
                        <TouchableOpacity
                            key={option}
                            style={[
                                tw`flex-1 flex-row py-3 rounded-xl items-center justify-center border-2 border-gray-300`,
                                value === option ? tw`bg-purple-100` : tw`bg-slate-200`
                            ]}
                            onPress={() => onValueChange(option)}
                            testID={`stamina-option-${option}`}
                        >
                            <View style={tw`relative w-5 h-5`}>
                                <Ionicons name="flash" size={20} style={tw`text-gray-600 absolute`} />
                                {option >= 6 && <Ionicons name="flash" size={20} style={tw`text-gray-600 absolute -left-1.5`} />}
                            </View>
                            <Text style={tw`text-base font-medium text-gray-950 ml-0.5`}>
                                {option}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </View>
            ))}
        </View>
    );
};