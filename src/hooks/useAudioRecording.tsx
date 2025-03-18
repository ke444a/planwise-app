import { useState, useEffect } from "react";
import { Alert } from "react-native";
import { RecordingPresets, useAudioRecorder, AudioModule } from "expo-audio";
import { useAppContext } from "@/context/AppContext";

export const useAudioRecording = () => {
    const { setError } = useAppContext();
    const [audioUriTimestamp, setAudioUriTimestamp] = useState<number | null>(null);
    const [audioUri, setAudioUri] = useState<string | null>(null);
    const [isRecording, setIsRecording] = useState(false);
    const [recordingDuration, setRecordingDuration] = useState(0);
    const audioRecorder = useAudioRecorder(RecordingPresets.HIGH_QUALITY);

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
            audioRecorder.recordForDuration(75);
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

    const cancelRecording = async () => {
        try {
            await audioRecorder.stop();
            setIsRecording(false);
        } catch (error) {
            setError({
                message: "Failed to cancel recording. Please try again.",
                code: "recording-cancel-failed",
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
            setAudioUriTimestamp(Date.now());
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

    useEffect(() => {
        const interval = setInterval(() => {
            setRecordingDuration(audioRecorder.currentTime);
        }, 1000);
        return () => clearInterval(interval);
    }, [audioRecorder.currentTime]);

    return {
        isRecording,
        startRecording,
        stopRecording,
        cancelRecording,
        recordingDuration,
        audioUri,
        audioUriTimestamp
    };
};
