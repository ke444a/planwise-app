import { View, ScrollView } from "react-native";
import tw from "twrnc";
import UserChatBox from "../UserChatBox";
import ModelActivityBox from "./ModelActivityBox";
import AiLoadingIndicator from "../AiLoadingIndicator";
import { useState } from "react";

interface ChatWindowProps {
    messages: IChatMessage[];
    date: Date;
    isGeneratingSchedule: boolean;
    userMaxStamina: number;
    currentStamina: number;
}


const ChatWindow = ({ messages, date, isGeneratingSchedule, userMaxStamina, currentStamina }: ChatWindowProps) => {  
    const [staminaUsed, setStaminaUsed] = useState(currentStamina);
    
    return (
        <ScrollView style={tw`flex-1 px-4`}>
            {messages.map((message, index) => (
                <View key={index}>
                    {message.role === "user" ? 
                        <UserChatBox text={message.content} /> : 
                        <ModelActivityBox 
                            activities={JSON.parse(message.content) as IActivity[]} 
                            userMaxStamina={userMaxStamina}
                            date={date}
                            staminaUsed={staminaUsed}
                            onAddStaminaUsed={(stamina: number) => setStaminaUsed(prev => prev + stamina)}
                        />}
                </View>
            ))}
            {isGeneratingSchedule && <AiLoadingIndicator message={messages.length > 2 ? "Refining your schedule" : undefined} />}
        </ScrollView>
    );
};

export default ChatWindow;
