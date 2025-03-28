import ScreenWrapper from "@/components/ui/ScreenWrapper";
import { View, TouchableOpacity, Text } from "react-native";
import tw, { useAppColorScheme } from "twrnc";
import { useState } from "react";
import { router } from "expo-router";
import AntDesign from "@expo/vector-icons/AntDesign";
import { useAiBacklog } from "@/hooks/useAiBacklog";
import { ChatInput } from "@/components/ai-chat";
import BacklogChatWindow from "@/components/ai-chat/backlog/BacklogChatWindow";
import BacklogCapabilityList from "@/components/ai-chat/backlog/BacklogCapabilityList";

const AiBacklogScreen = () => {
    useAppColorScheme(tw);
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
                <Text style={tw`text-2xl font-semibold mb-1 text-gray-950 dark:text-white`}>Fill My Backlog</Text>
                <TouchableOpacity onPress={() => router.back()} testID="ai-backlog-close-button">
                    <AntDesign name="closecircle" size={24} style={tw`text-gray-500 dark:text-white`} />
                </TouchableOpacity>
            </View>
            {isConversationActive ? 
                <BacklogChatWindow messages={messages} /> : 
                <BacklogCapabilityList />}
            <ChatInput onSendMessage={handleSendMessage} />
        </ScreenWrapper>
    );
};

export default AiBacklogScreen;
