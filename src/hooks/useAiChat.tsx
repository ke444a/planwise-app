import { useAppContext } from "@/context/AppContext";
import { getApp } from "@react-native-firebase/app";
import { getVertexAI, getGenerativeModel } from "@react-native-firebase/vertexai";
import { useCallback, useState } from "react";

export interface IChatMessage {
    role: "user" | "model";
    content: string;
    timestamp: number;
}

export const useAiChat = () => {
    const [messages, setMessages] = useState<IChatMessage[]>([]);
    const { setError } = useAppContext();

    const addMessage = useCallback((msg: IChatMessage) => {
        setMessages(prev => {
            const updatedMessages = [...prev, msg];
            const sortedMessages = updatedMessages.sort((a, b) => a.timestamp - b.timestamp);
            return sortedMessages;
        });
    }, [setMessages]);

    const generateSchedule = useCallback(async (userInput: string, timestamp: number) => {
        try {
            const app = getApp();
            const vertexai = getVertexAI(app, {
                location: "europe-west1"
            });
            const model = getGenerativeModel(vertexai, {
                model: "gemini-2.0-flash-001"
            });          
            const prompt = "Briefly explain to user how they should schedule their day based on the activities they want to do. Here's what they said: " + userInput;
            const response = await model.generateContentStream([prompt]);
            
            let text = "";
            for await (const chunk of response.stream) {
                text += chunk.text();
            }
            addMessage({ role: "model", content: text, timestamp });
            return text;
        } catch (error) {
            console.error("Error generating schedule", error);
            setError({
                message: "Failed to generate schedule",
                code: "generate-schedule-failed",
                error
            });
            return "";
        }
    }, [addMessage, setError]);

    return {
        messages,
        generateSchedule,
        addMessage
    };
};