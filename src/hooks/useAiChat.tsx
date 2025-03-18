import { useAppContext } from "@/context/AppContext";
import { getApp } from "@react-native-firebase/app";
import { getVertexAI, getGenerativeModel } from "@react-native-firebase/vertexai";
import { useCallback, useState } from "react";
import { SYSTEM_PROMPT, USER_PROMPT, SCHEDULE_SCHEMA } from "./useAiChat.prompt";

export interface IChatMessage {
    role: "user" | "model";
    content: string;
    timestamp: number;
}

export const useAiChat = (userOnboardingInfo?: IOnboardingInfo | null) => {
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
            if (!userOnboardingInfo) {
                throw new Error("User onboarding info is required");
            }

            const app = getApp();
            const vertexai = getVertexAI(app, {
                location: "europe-west1"
            });
            const model = getGenerativeModel(vertexai, {
                model: "gemini-2.0-flash-001",
                systemInstruction: SYSTEM_PROMPT
            });
            // Exclude user's message that was sent a second ago (timestamp - 1) (if exists)
            // Sort messages by timestamp
            const history = messages
                .filter(msg => msg.role !== "user" || msg.timestamp !== timestamp - 1)
                .map(msg => ({
                    role: msg.role,
                    parts: [{ text: msg.content }]
                }));
            if (history.length === 0) {
                history.push({
                    role: "user",
                    parts: [{ text: USER_PROMPT(userOnboardingInfo, userInput) }]
                });
            }
            const chat = model.startChat({
                history,
                generationConfig: {
                    temperature: 0.7,
                    responseMimeType: "application/json",
                    responseSchema: SCHEDULE_SCHEMA
                }
            });
            const response = await chat.sendMessageStream([userInput]);
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
    }, [addMessage, setError, messages, userOnboardingInfo]);

    return {
        messages,
        generateSchedule,
        addMessage
    };
};