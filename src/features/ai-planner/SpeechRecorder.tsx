// import { Alert } from "react-native";
// import { Ionicons } from "@expo/vector-icons";
// import tw from "twrnc";
// import { BaseButton } from "@/components/ui/ButtonWithIcon";
// import { useAudioRecorder, AudioModule, RecordingPresets } from "expo-audio";
// import { useEffect } from "react";
// import { useAppContext } from "@/context/AppContext";

// interface SpeechRecorderProps {
//     isRecording: boolean;
//     onStopRecording: (_audioUri: string) => void;
// }

// const SpeechRecorder = ({ isRecording, onStopRecording }: SpeechRecorderProps) => {
//     const { setError } = useAppContext();
//     const audioRecorder = useAudioRecorder(RecordingPresets.HIGH_QUALITY);
    
//     useEffect(() => {
//         (async () => {
//             const status = await AudioModule.requestRecordingPermissionsAsync();
//             if (!status.granted) {
//                 Alert.alert("Permission to access microphone was denied");
//             }
//         })();
//     }, []);

//     useEffect(() => {
//         const handleRecording = async () => {
//             if (isRecording) {
//                 await audioRecorder.prepareToRecordAsync();
//                 audioRecorder.record();
//             } else if (audioRecorder.isRecording) {
//                 await audioRecorder.stop();
//                 const audioUri = audioRecorder.uri;
//                 if (!audioUri) {
//                     setError({
//                         message: "No audio was recorded. Please try again.",
//                         code: "recording-failed"
//                     });
//                     return;
//                 }
//                 onStopRecording(audioUri);
//             }
//         };
//         handleRecording();
//     }, [isRecording, audioRecorder, setError, onStopRecording]);

//     const handlePress = () => {
//         if (isRecording) {
//             // This is handled by the useEffect
//         } else {
//             // This is handled by the useEffect
//         }
//     };

//     return (
//         <BaseButton onPress={handlePress} variant={isRecording ? "secondary" : "primary"}>
//             <Ionicons 
//                 name={isRecording ? "stop" : "mic"} 
//                 size={32} 
//                 style={tw`text-gray-950`} 
//             />
//         </BaseButton>
//     );
// };

// export default SpeechRecorder;