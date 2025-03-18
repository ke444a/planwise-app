import { View, TextInput, TouchableOpacity } from "react-native";
import tw from "twrnc";
import { useState, useEffect } from "react";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useAudioRecording } from "@/hooks/useAudioRecording";
import { useAiTranscript } from "@/hooks/useAiTranscript";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";

interface ChatInputProps {
    onSendMessage: (_message: string) => void;
}

const ChatInput = ({
    onSendMessage
}: ChatInputProps) => {
    const [inputText, setInputText] = useState("");
    const { transcribeUserSpeech } = useAiTranscript();
    const insets = useSafeAreaInsets();
    const { 
        isRecording, 
        startRecording, 
        stopRecording, 
        audioUri,
        recordingDuration
    } = useAudioRecording();

    useEffect(() => {
        if (!audioUri) return;

        (async () => {
            const transcript = await transcribeUserSpeech(audioUri);
            if (transcript) {
                setInputText(prev => prev.length > 0 ? prev + " " + transcript : transcript);
            }
        })();
    }, [audioUri, transcribeUserSpeech]);

    const handleSend = () => {
        const trimmedInputText = inputText.trim();
        if (!trimmedInputText) return;
        onSendMessage(trimmedInputText);
        setInputText("");
    };

    const handleMicPress = () => {
        if (isRecording) {
            stopRecording();
        } else {
            startRecording();
        }
    };

    const isInputActive = inputText.trim().length > 0;

    return (
        <View style={[tw`bg-gray-500 px-4 py-2 rounded-t-[30px]`, { paddingBottom: insets.bottom + 4 }]}>
            <View>
                <View style={tw`px-4 py-2 mb-2`}>
                    <TextInput
                        style={[
                            tw`text-lg text-white`,
                            { maxHeight: 120 }
                        ]}
                        placeholder="Message Planwise"
                        placeholderTextColor="rgba(255, 255, 255, 0.5)"
                        value={inputText}
                        onChangeText={setInputText}
                        multiline
                        editable={!isRecording}
                    />
                </View>
                
                <View style={tw`flex-row justify-end px-4 gap-x-2`}>
                    <TouchableOpacity onPress={handleMicPress}>
                        <MaterialCommunityIcons 
                            name={"microphone-outline"} 
                            size={32}
                            style={tw`text-white`}
                        />
                    </TouchableOpacity>

                    <TouchableOpacity
                        onPress={handleSend}
                        disabled={!isInputActive}
                        style={tw.style(!isInputActive && "opacity-50")}
                    >
                        <MaterialCommunityIcons 
                            name={isInputActive ? "arrow-up-circle" : "arrow-right-circle"} 
                            size={32} 
                            style={tw`text-white`} 
                        />
                    </TouchableOpacity>
                </View>
            </View>
        </View>
    );
};

export default ChatInput; 