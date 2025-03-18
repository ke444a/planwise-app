import { View, TouchableOpacity, Text, StyleSheet } from "react-native";
import tw from "twrnc";
import { useState } from "react";
import { useRouter, useLocalSearchParams } from "expo-router";
import AntDesign from "@expo/vector-icons/AntDesign";
import AiCapabilityList from "@/features/ai-planner/AiCapabilityList";
import ChatWindow from "@/features/ai-planner/ChatWindow";
import { useAiChat, IChatMessage } from "@/hooks/useAiChat";
import ChatInput from "@/features/ai-planner/ChatInput";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const AiPlannerScreen = () => {
    const { messages, addMessage, generateSchedule } = useAiChat();
    const [isConversationActive, setIsConversationActive] = useState(false);
    const router = useRouter();
    const { date } = useLocalSearchParams();
    const insets = useSafeAreaInsets();

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString("en-US", {
            day: "numeric",
            month: "long",
            year: "numeric"
        });
    };

    const handleSendMessage = async (message: string) => {
        setIsConversationActive(true);
        const timestamp = Date.now();
        const newUserMessage: IChatMessage = { role: "user", content: message, timestamp };
        addMessage(newUserMessage);
        await generateSchedule(message, timestamp + 1);
    };

    return (
        <View style={tw`flex-1 bg-purple-50`}>
            <View style={[tw`bg-purple-50`, { paddingTop: insets.top + 10 }]} />
            <View style={[
                tw`flex-1 bg-white rounded-t-3xl`,
                styles.scheduleContainerShadow
            ]}>
                <View style={tw`flex-row justify-between items-center px-4 py-6`}>
                    <View>
                        <Text style={tw`text-2xl font-semibold mb-1`}>Plan My Day</Text>
                        <Text style={tw`text-gray-500 font-medium text-lg`}>{formatDate(date as string)}</Text>
                    </View>
                    <TouchableOpacity 
                        onPress={() => router.back()} 
                    >
                        <AntDesign name="closecircle" size={32} style={tw`text-gray-500`} />
                    </TouchableOpacity>
                </View>
                {isConversationActive ? <ChatWindow messages={messages} /> : <AiCapabilityList />}
                <ChatInput onSendMessage={handleSendMessage} />
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    scheduleContainerShadow: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: -2 },
        shadowOpacity: 0.1,
        shadowRadius: 4
    }
});

export default AiPlannerScreen;
