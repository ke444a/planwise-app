import { IChatMessage } from "@/hooks/useAiChat";
import { View, ScrollView } from "react-native";
import tw from "twrnc";
import UserChatBox from "./UserChatBox";
import ModelChatBox from "./ModelChatBox";

interface ChatWindowProps {
    messages: IChatMessage[];
}

const ChatWindow = ({ messages }: ChatWindowProps) => {
    return (
        <ScrollView style={tw`flex-1 px-4`}>
            {messages.map((message, index) => (
                <View key={index}>
                    {message.role === "user" ? (
                        <UserChatBox text={message.content} />
                    ) : (
                        <ModelChatBox text={message.content} />
                    )}
                </View>
            ))}
        </ScrollView>
    );
};

export default ChatWindow;
