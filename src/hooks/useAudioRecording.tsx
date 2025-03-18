import { useState, useEffect } from "react";
import { Alert } from "react-native";
import { RecordingPresets, useAudioRecorder, AudioModule, useAudioRecorderState } from "expo-audio";
import { useAppContext } from "@/context/AppContext";

export const useAudioRecording = () => {
    const { setError } = useAppContext();
    const [audioUri, setAudioUri] = useState<string | null>(null);
    const [isRecording, setIsRecording] = useState(false);
    const audioRecorder = useAudioRecorder(RecordingPresets.HIGH_QUALITY);
    const { durationMillis } = useAudioRecorderState(audioRecorder);

    useEffect(() => {
        (async () => {
            const status = await AudioModule.requestRecordingPermissionsAsync();
            if (!status.granted) {
                Alert.alert("Permission to access microphone was denied");
            }
        })();
    }, []);

    const startRecording = async () => {
        try {
            await audioRecorder.prepareToRecordAsync();
            audioRecorder.recordForDuration(60);
            setIsRecording(true);
        } catch (error) {
            setError({
                message: "Failed to start recording. Please try again.",
                code: "recording-start-failed",
                error
            });
            setIsRecording(false);
        }
    };

    const stopRecording = async () => {
        try {
            await audioRecorder.stop();
            setIsRecording(false);
            
            const audioUri = audioRecorder.uri;
            if (!audioUri) {
                setError({
                    message: "No audio was recorded. Please try again.",
                    code: "recording-failed"
                });
                return null;
            }
            setAudioUri(audioUri);
        } catch (error) {
            setError({
                message: "Failed to process your recording. Please try again.",
                code: "processing-failed",
                error
            });
            return null;
        } finally {
            setIsRecording(false);
        }
    };

    return {
        isRecording,
        startRecording,
        stopRecording,
        recordingDuration: durationMillis,
        audioUri
    };
};
