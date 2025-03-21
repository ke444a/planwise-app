import { View, Text, TouchableOpacity } from "react-native";
import tw from "twrnc";

interface PrioritySectionProps {
    selectedPriority: ActivityPriority;
    onPriorityChange: (_priority: ActivityPriority) => void;
}

interface PriorityOption {
    value: ActivityPriority;
    label: string;
    emoji: string;
}

const PRIORITY_OPTIONS: PriorityOption[] = [
    {
        value: "must_do",
        label: "Must Do Now",
        emoji: "🔥"
    },
    {
        value: "get_it_done",
        label: "Get It Done",
        emoji: "⚡️"
    },
    {
        value: "nice_to_have",
        label: "Nice to Do",
        emoji: "📍"
    },
    {
        value: "routine",
        label: "Routine",
        emoji: "🔄"
    }
];

export const PrioritySection = ({
    selectedPriority,
    onPriorityChange
}: PrioritySectionProps) => {
    return (
        <View>
            <Text style={tw`text-2xl font-semibold text-gray-950 mb-4`}>How Urgent?</Text>
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
        </View>
    );
}; 