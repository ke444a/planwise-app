import { useAppContext } from "@/context/AppContext";
import { getApp } from "@react-native-firebase/app";
import { getVertexAI, getGenerativeModel } from "@react-native-firebase/vertexai";
import { useCallback, useState } from "react";


export const useAiTranscript = () => {
    const { setError } = useAppContext();
    const [isTranscribing, setIsTranscribing] = useState(false);

    const transcribeUserSpeech = useCallback(async (audioUriBase64: string): Promise<string | null> => {
        const prompt = "Generate a transcript of the provided audio. Remove any filler words and non-speech sounds. Return only the transcript without any other text.";
        try {
            setIsTranscribing(true);
            const app = getApp();
            const vertexai = getVertexAI(app, {
                location: "europe-west1"
            });
            const model = getGenerativeModel(vertexai, {
                model: "gemini-2.0-flash-001",
                generationConfig: {
                    temperature: 0.2
                }
            });
            const response = await model.generateContent([
                prompt,
                { inlineData: { mimeType: "audio/mp4", data: audioUriBase64 } }
            ]);
            const transcript = response.response.text();
            return transcript.trim();
        } catch (error) {
            setError({
                message: "Failed to transcribe user speech",
                code: "transcribe-failed",
                error
            });
            return null;
        } finally {
            setIsTranscribing(false);
        }
    }, [setError]);

    return {
        transcribeUserSpeech,
        isTranscribing
    };
};
