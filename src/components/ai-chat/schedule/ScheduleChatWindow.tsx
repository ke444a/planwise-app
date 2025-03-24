import { View, ScrollView } from "react-native";
import tw from "twrnc";
import UserChatBox from "../UserChatBox";
import ModelActivityBox from "./ModelActivityBox";
import AiLoadingIndicator from "../AiLoadingIndicator";
import { useState } from "react";
import ModelChatBox from "../ModelChatBox";

interface ChatWindowProps {
    messages: IChatMessage[];
    date: Date;
    isGeneratingSchedule: boolean;
    userMaxStamina: number;
    currentStamina: number;
}




const ChatWindow = ({ messages, date, isGeneratingSchedule, userMaxStamina, currentStamina }: ChatWindowProps) => {  
    const [staminaUsed, setStaminaUsed] = useState(currentStamina);

    const renderModelMessage = (content: string) => {
        const activities = JSON.parse(content) as IActivityGenAI[];
        if (activities && activities.length > 0) {
            return <ModelActivityBox
                activities={activities}
                userMaxStamina={userMaxStamina}
                date={date}
                staminaUsed={staminaUsed}
                onAddStaminaUsed={(stamina: number) => setStaminaUsed(prev => prev + stamina)}
            />;
        }
        return <ModelChatBox text={"Sorry, I couldn't figure out what you wanted to add to your backlog. Could you please try again?"} />;
    };

    
    return (
        <ScrollView style={tw`flex-1 px-4`}>
            {messages.map((message, index) => (
                <View key={index}>
                    {message.role === "user" ? 
                        <UserChatBox text={message.content} /> : 
                        renderModelMessage(message.content)}
                </View>
            ))}
            {isGeneratingSchedule && <AiLoadingIndicator message={messages.length > 2 ? "Refining your schedule" : undefined} />}
        </ScrollView>
    );
};

export default ChatWindow;
