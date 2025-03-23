import ScreenWrapper from "@/components/ui/ScreenWrapper";
import { View, TouchableOpacity, Text } from "react-native";
import tw from "twrnc";
import { useState } from "react";
import { router } from "expo-router";
import AntDesign from "@expo/vector-icons/AntDesign";
import { useAiBacklog } from "@/hooks/useAiBacklog";
import { AiCapabilityList, ChatInput } from "@/components/ai-chat";
import BacklogChatWindow from "@/components/ai-chat/backlog/BacklogChatWindow";

const AiBacklogScreen = () => {
    const { messages, addMessage, generateBacklogItems } = useAiBacklog();
    const [isConversationActive, setIsConversationActive] = useState(false);

    const handleSendMessage = (message: string) => {
        setIsConversationActive(true);

        const timestamp = Date.now();
        addMessage({
            role: "user",
            content: message,
            timestamp
        });
        generateBacklogItems(message, timestamp + 1);
    };

    return (
        <ScreenWrapper>
            <View style={tw`flex-row justify-between items-center px-4 py-6`}>
                <Text style={tw`text-2xl font-semibold mb-1`}>Fill My Backlog</Text>
                <TouchableOpacity onPress={() => router.back()}>
                    <AntDesign name="closecircle" size={24} style={tw`text-gray-500`} />
                </TouchableOpacity>
            </View>
            {isConversationActive ? 
                <BacklogChatWindow messages={messages} /> : 
                <AiCapabilityList />}
            <ChatInput onSendMessage={handleSendMessage} />
        </ScreenWrapper>
    );
};

export default AiBacklogScreen;
