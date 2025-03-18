import { IChatMessage } from "@/hooks/useAiChat";
import { View, ScrollView } from "react-native";
import tw from "twrnc";
import UserChatBox from "./UserChatBox";
// import ModelChatBox from "./ModelChatBox";
import ModelActivityBox from "./ModelActivityBox";
import { convertFromJsonToActivity } from "@/utils/convertFromJsonToActivity";

interface ChatWindowProps {
    messages: IChatMessage[];
}

const ChatWindow = ({ messages }: ChatWindowProps) => {
    const renderMessage = (message: IChatMessage) => {
        switch (message.role) {
        case "user":
            return <UserChatBox text={message.content} />;
        // case "model":
        //     return <ModelChatBox text={message.content} />;
        case "schedule":
            return <ModelActivityBox activities={convertFromJsonToActivity(JSON.parse(message.content))} />;
        }
    };
    
    return (
        <ScrollView style={tw`flex-1 px-4`}>
            {messages.map((message, index) => (
                <View key={index}>
                    {renderMessage(message)}
                </View>
            ))}
        </ScrollView>
    );
};

export default ChatWindow;
