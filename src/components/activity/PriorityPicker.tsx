import { PRIORITY_OPTIONS } from "@/libs/constants";
import { View, Text, TouchableOpacity } from "react-native";
import tw from "twrnc";

interface PriorityPickerProps {
    selectedPriority: ActivityPriority;
    onPriorityChange: (_priority: ActivityPriority) => void;
}

export const PriorityPicker = ({
    selectedPriority,
    onPriorityChange
}: PriorityPickerProps) => {
    return (
        <View style={tw`flex-col gap-2`}>
            {PRIORITY_OPTIONS.map((option) => (
                <TouchableOpacity
                    key={option.value}
                    style={[
                        tw`flex-row items-center rounded-xl py-3 px-4 w-full border border-gray-300`,
                        selectedPriority === option.value ? tw`bg-purple-100` : tw`bg-slate-200`,
                    ]}
                    onPress={() => onPriorityChange(option.value)}
                >
                    <Text style={tw`text-lg mr-2`}>{option.emoji}</Text>
                    <Text style={tw`text-base font-medium text-gray-900`}>
                        {option.label}
                    </Text>
                </TouchableOpacity>
            ))}
        </View>
    );
}; 