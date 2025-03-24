import { View, ScrollView } from "react-native";
import tw from "twrnc";
import UserChatBox from "../UserChatBox";
import ModelBacklogBox from "./ModelBacklogBox";
import ModelChatBox from "../ModelChatBox";

interface ChatWindowProps {
    messages: IChatMessage[];
}


const renderModelMessage = (content: string) => {
    const items = JSON.parse(content) as IBacklogItemGenAI[];
    if (items && items.length > 0) {
        return <ModelBacklogBox items={items} />;
    }
    return <ModelChatBox text={"Sorry, I couldn't figure out what you wanted to add to your backlog. Could you please try again?"} />;
};

const BacklogChatWindow = ({ messages }: ChatWindowProps) => {    
    return (
        <ScrollView style={tw`flex-1 px-4`}>
            {messages.map((message, index) => (
                <View key={index}>
                    {message.role === "user" ? 
                        <UserChatBox text={message.content as string} /> : 
                        renderModelMessage(message.content as string)}
                </View>
            ))}
        </ScrollView>
    );
};

export default BacklogChatWindow;
