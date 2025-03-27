import { TouchableOpacity, ActivityIndicator } from "react-native";
import tw from "twrnc";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useAiActivitySuggestion } from "@/hooks/useAiActivitySuggestion";

interface AiSuggestionButtonProps {
    title: string | undefined;
    onSuggestion: (_suggestion: IActivity) => void;
    onShowToast: () => void;
}

export const AiSuggestionButton = ({ 
    title,
    onSuggestion,
    onShowToast
}: AiSuggestionButtonProps) => {
    const { suggestActivityDetails, isLoading } = useAiActivitySuggestion();

    const handleAiSuggest = async () => {
        if (!title?.trim()) {
            onShowToast();
            return;
        }

        try {
            const suggestion = await suggestActivityDetails(title);
            if (suggestion) {
                onSuggestion({
                    type: suggestion.type,
                    duration: suggestion.duration,
                    priority: suggestion.priority,
                    staminaCost: suggestion.staminaCost,
                    subtasks: suggestion.subtasks,
                    title,
                    startTime: "12:00",
                    endTime: "12:15",
                    isCompleted: false
                });
            }
        } catch (error) {
            console.error("Error getting AI suggestion:", error);
        }
    };

    return (
        <TouchableOpacity 
            onPress={handleAiSuggest}
            disabled={isLoading}
            style={tw`${!title ? "opacity-50" : ""}`}
        >
            {isLoading ? (
                <ActivityIndicator color="#C084FC" size="small" />
            ) : (
                <Ionicons name="sparkles" size={24} style={tw`text-purple-400`} />
            )}
        </TouchableOpacity>
    );
}; 