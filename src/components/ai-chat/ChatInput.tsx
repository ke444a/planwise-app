import { View, TextInput, TouchableOpacity, Text, Platform, KeyboardAvoidingView, Keyboard, ActivityIndicator } from "react-native";
import tw from "twrnc";
import { useState, useEffect, useRef } from "react";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useAudioRecording } from "@/hooks/useAudioRecording";
import { useAiTranscript } from "@/hooks/useAiTranscript";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import * as FileSystem from "expo-file-system";
import { formatRecordingDuration } from "@/utils/formatRecordingDuration";

interface ChatInputProps {
    onSendMessage: (_message: string) => void;
}

const ChatInput = ({
    onSendMessage
}: ChatInputProps) => {
    const [inputText, setInputText] = useState("");
    const { transcribeUserSpeech, isTranscribing } = useAiTranscript();
    const insets = useSafeAreaInsets();
    const audioUriTimestampRef = useRef<number | null>(null);
    const { 
        isRecording, 
        startRecording, 
        stopRecording, 
        cancelRecording,
        audioUri,
        audioUriTimestamp,
        recordingDuration
    } = useAudioRecording();

    useEffect(() => {
        if (!audioUri || !audioUriTimestamp) return;

        (async () => {
            if (audioUriTimestamp !== audioUriTimestampRef.current) {
                audioUriTimestampRef.current = audioUriTimestamp;
                const audioBase64 = await FileSystem.readAsStringAsync(audioUri, { encoding: FileSystem.EncodingType.Base64 });
                const transcript = await transcribeUserSpeech(audioBase64);
                if (transcript) {
                    setInputText(prev => prev.length > 0 ? prev + " " + transcript : transcript);
                }
            }
        })();
    }, [audioUri, audioUriTimestamp, transcribeUserSpeech]);

    const handleSend = () => {
        const trimmedInputText = inputText.trim();
        if (!trimmedInputText) return;
        onSendMessage(trimmedInputText);
        setInputText("");
        Keyboard.dismiss();
    };

    const handleMicPress = () => {
        if (isRecording) {
            stopRecording();
        } else {
            startRecording();
        }
    };
    
    const isInputActive = inputText.trim().length > 0;

    const renderRecordingInterface = () => (
        <View style={tw`flex-row items-center justify-between px-4`}>
            <View style={tw`flex-row items-center gap-x-2`}>
                <TouchableOpacity onPress={cancelRecording}>
                    <MaterialCommunityIcons 
                        name="close" 
                        size={32}
                        style={tw`text-white`}
                    />
                </TouchableOpacity>
                <Text style={tw`text-white text-lg`}>
                    {formatRecordingDuration(recordingDuration || 0)}
                </Text>
            </View>
            <TouchableOpacity onPress={stopRecording}>
                <MaterialCommunityIcons 
                    name="check-circle" 
                    size={32}
                    style={tw`text-white`}
                />
            </TouchableOpacity>
        </View>
    );

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            keyboardVerticalOffset={40}
        >
            <View style={[tw`bg-gray-500 px-4 py-2 rounded-t-[30px]`, { paddingBottom: insets.bottom + 4 }]}>
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
                        // returnKeyType="send"
                        enablesReturnKeyAutomatically={true}
                        testID="ai-chat-input"
                    />
                </View>
                {isRecording ? renderRecordingInterface() : (
                    <View style={tw`flex-row justify-end px-4 gap-x-2`}>
                        {isTranscribing ? (
                            <ActivityIndicator size={32} color="white" />
                        ) : (
                            <TouchableOpacity onPress={handleMicPress}>
                                <MaterialCommunityIcons 
                                    name={"microphone-outline"} 
                                    size={32}
                                    style={tw`text-white`}
                                />
                            </TouchableOpacity>
                        )}
                        <TouchableOpacity
                            onPress={handleSend}
                            disabled={!isInputActive}
                            style={tw.style(!isInputActive && "opacity-50")}
                            testID="ai-chat-send-button"
                        >
                            <MaterialCommunityIcons 
                                name={isInputActive ? "arrow-up-circle" : "arrow-right-circle"} 
                                size={32} 
                                style={tw`text-white`}
                            />
                        </TouchableOpacity>
                    </View>
                )}
            </View>
        </KeyboardAvoidingView>
    );
};

export default ChatInput; 