import { View, Text, ScrollView } from "react-native";
import tw from "twrnc";
import { Ionicons } from "@expo/vector-icons";

interface AiCapabilityCardProps {
    title: string;
    example: string;
}

const AiCapabilityCard = ({ title, example }: AiCapabilityCardProps) => {
    return (
        <View style={tw`bg-slate-200 rounded-xl p-5 mb-4`}>
            <Text style={tw`text-gray-950 text-lg mb-3`}>{title}</Text>
            <View style={tw`flex-row items-start`}>
                <Ionicons name="chatbubble-ellipses-outline" size={16} style={tw`text-gray-700 mr-1`} />
                <Text style={tw`text-gray-700 italic flex-1`}>
                    "{example}"
                </Text>
            </View>
        </View>
    );
};

const AI_CAPABILITIES = [
    {
        title: "I'll turn your plans into an optimized schedule based on your preferences and energy levels.",
        example: "Meeting at 10 AM, gym at 6 PM, and study in the evening"
    },
    {
        title: "You can tweak your schedule anytime - move tasks, add new ones, or send them to your backlog.",
        example: "Move my workout to 7 PM instead"
    },
    {
        title: "Some tasks don't need to be scheduled right away? No problem—I'll save them in your backlog.",
        example: "Throw trash"
    }
];

const AiCapabilityList = () => {
    return (
        <ScrollView style={tw`flex-1 px-4`} showsVerticalScrollIndicator={false}>
            {AI_CAPABILITIES.map((capability, index) => (
                <AiCapabilityCard key={index} title={capability.title} example={capability.example} />
            ))}
        </ScrollView>
    );
};

export default AiCapabilityList;