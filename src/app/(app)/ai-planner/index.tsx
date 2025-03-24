import { View, TouchableOpacity, Text } from "react-native";
import tw from "twrnc";
import { useState } from "react";
import { router, useLocalSearchParams } from "expo-router";
import AntDesign from "@expo/vector-icons/AntDesign";
import { useAiChat } from "@/hooks/useAiChat";
import ScreenWrapper from "@/components/ui/ScreenWrapper";
import { AiCapabilityList, ChatInput, ChatWindow } from "@/components/ai-chat";

const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
        day: "numeric",
        month: "long",
        year: "numeric"
    });
};

const AiPlannerScreen = () => {
    const [isConversationActive, setIsConversationActive] = useState(false);
    const { date, currentStamina, maxStamina } = useLocalSearchParams();
    const { messages, addMessage, generateSchedule, isGeneratingSchedule } = useAiChat(new Date(date as string));

    const handleSendMessage = (message: string) => {
        setIsConversationActive(true);
        const timestamp = Date.now();
        const newUserMessage: IChatMessage = { role: "user", content: message, timestamp };
        generateSchedule(message, timestamp + 1);
        addMessage(newUserMessage);
    };

    return (
        <ScreenWrapper>
            <View style={tw`flex-row justify-between items-center px-4 py-6`}>
                <View>
                    <Text style={tw`text-2xl font-semibold mb-1 text-gray-950 dark:text-white`}>Plan My Day</Text>
                    <Text style={tw`text-gray-500 dark:text-neutral-100 font-medium text-lg`}>{formatDate(date as string)}</Text>
                </View>
                <TouchableOpacity onPress={() => router.back()}>
                    <AntDesign name="closecircle" size={24} style={tw`text-gray-500 dark:text-neutral-100`} />
                </TouchableOpacity>
            </View>
            {isConversationActive ? 
                <ChatWindow 
                    messages={messages} 
                    isGeneratingSchedule={isGeneratingSchedule} 
                    date={new Date(date as string)} 
                    currentStamina={Number(currentStamina)}
                    userMaxStamina={Number(maxStamina)}
                /> : 
                <AiCapabilityList />}
            <ChatInput onSendMessage={handleSendMessage} />
        </ScreenWrapper>
    );
};

export default AiPlannerScreen;
