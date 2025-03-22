import { View, ScrollView } from "react-native";
import tw from "twrnc";
import UserChatBox from "../UserChatBox";
import ModelActivityBox from "./ModelActivityBox";
import { convertFromJsonToActivity } from "@/utils/convertFromJsonToActivity";

interface ChatWindowProps {
    messages: IChatMessage[];
    date: Date;
}

const ChatWindow = ({ messages, date }: ChatWindowProps) => {    
    return (
        <ScrollView style={tw`flex-1 px-4`}>
            {messages.map((message, index) => (
                <View key={index}>
                    {message.role === "user" ? 
                        <UserChatBox text={message.content} /> : 
                        <ModelActivityBox 
                            activities={convertFromJsonToActivity(JSON.parse(message.content))} 
                            date={date} 
                        />}
                </View>
            ))}
        </ScrollView>
    );
};

export default ChatWindow;
