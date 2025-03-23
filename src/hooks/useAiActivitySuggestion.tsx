import { useAppContext } from "@/context/AppContext";
import { createNewSubtask } from "@/utils/createNewSubtask";
import { getFunctions, httpsCallable } from "@react-native-firebase/functions";
import { useCallback, useState } from "react";

export interface IActivitySuggestion {
    type: ActivityType;
    duration: number;
    priority: ActivityPriority;
    staminaCost: number;
    subtasks: ISubtask[];
}

export const useAiActivitySuggestion = () => {
    const { setError } = useAppContext();
    const [isLoading, setIsLoading] = useState(false);

    const suggestActivityDetails = useCallback(async (taskTitle: string): Promise<IActivitySuggestion | null> => {
        setIsLoading(true);
        try {
            const functions = getFunctions();
            const suggestActivity = httpsCallable(functions, "suggestActivityDetails");
            const { data } = await suggestActivity({ taskTitle });
            const activitySuggestion = data as Omit<IActivitySuggestion, "subtasks"> & { subtasks: string[] };
            const subtasks = activitySuggestion.subtasks.map(subtask => createNewSubtask(subtask));
            return {
                ...activitySuggestion,
                subtasks
            };
        } catch (error) {
            console.error("Error suggesting activity details", error);
            setError({
                message: "Failed to suggest activity details",
                code: "suggest-activity-failed",
                error
            });
            return null;
        } finally {
            setIsLoading(false);
        }
    }, [setError]);

    return {
        suggestActivityDetails,
        isLoading
    };
};
