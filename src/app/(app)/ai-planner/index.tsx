import { View, TouchableOpacity, Text } from "react-native";
import tw from "twrnc";
import { useState } from "react";
import { router, useLocalSearchParams } from "expo-router";
import AntDesign from "@expo/vector-icons/AntDesign";
import { useAiChat, IChatMessage } from "@/hooks/useAiChat";
import { useUserStore } from "@/libs/userStore";
import { useGetUserQuery } from "@/api/users/getUser";
import { IError } from "@/context/AppContext";
import ErrorModal from "@/components/ui/ErrorModal";
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
    const { user } = useUserStore();
    const { data: userData, isPending, error } = useGetUserQuery(user?.uid);
    const { messages, addMessage, generateSchedule } = useAiChat(userData?.onboardingInfo);
    const [isConversationActive, setIsConversationActive] = useState(false);
    const { date } = useLocalSearchParams();

    if (isPending) {
        return null;
    }
    if (error) {
        const errorObj: IError = {
            message: "Error retrieving user data. Please try again later."
        };
        return <ErrorModal error={errorObj} handleModalClose={() => {}} />;
    }

    const handleSendMessage = (message: string) => {
        setIsConversationActive(true);
        const timestamp = Date.now();
        const newUserMessage: IChatMessage = { role: "user", content: message, timestamp };
        addMessage(newUserMessage);
        generateSchedule(message, timestamp + 1);
    };

    return (
        <ScreenWrapper>
            <View style={tw`flex-row justify-between items-center px-4 py-6`}>
                <View>
                    <Text style={tw`text-2xl font-semibold mb-1`}>Plan My Day</Text>
                    <Text style={tw`text-gray-500 font-medium text-lg`}>{formatDate(date as string)}</Text>
                </View>
                <TouchableOpacity onPress={() => router.back()}>
                    <AntDesign name="closecircle" size={24} style={tw`text-gray-500`} />
                </TouchableOpacity>
            </View>
            {isConversationActive ? 
                <ChatWindow messages={messages} date={new Date(date as string)} /> : 
                <AiCapabilityList />}
            <ChatInput onSendMessage={handleSendMessage} />
        </ScreenWrapper>
    );
};

export default AiPlannerScreen;
