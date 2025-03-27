import { View, Text, ScrollView } from "react-native";
import tw from "twrnc";
import { Ionicons } from "@expo/vector-icons";

interface AiCapability {
    title: string;
    example: string;
    index: number;
}

const AiCapabilityCard = ({ title, example, index }: AiCapability) => {
    return (
        <View style={tw`bg-white rounded-2xl mb-4 items-center w-full gap-y-4 p-5`}>
            {index === 0 && <Ionicons name="flash-outline" size={36} style={tw`text-gray-700`} />}
            {index === 1 && <Ionicons name="chatbubbles-outline" size={36} style={tw`text-gray-700`} />}
            <Text style={tw`text-gray-950 font-medium text-lg text-center`}>{title}</Text>
            <Text style={tw`text-gray-700 text-base italic text-center`}>"{example}"</Text>
        </View>
    );
};

const AiCapabilityList = ({ capabilities }: { capabilities: AiCapability[] }) => {
    return (
        <ScrollView style={tw`flex-1 px-4`} showsVerticalScrollIndicator={false} contentContainerStyle={tw`gap-y-4`}>
            {capabilities.map((capability, index) => (
                <AiCapabilityCard key={index} title={capability.title} example={capability.example} index={capability.index} />
            ))}
        </ScrollView>
    );
};

export default AiCapabilityList;