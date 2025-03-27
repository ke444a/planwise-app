import { useAppContext } from "@/context/AppContext";
import { createNewSubtask } from "@/utils/createNewSubtask";
import { getApp } from "@react-native-firebase/app";
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
            const app = getApp();
            const functions = getFunctions(app, "europe-west1");
            const suggestActivity = httpsCallable(functions, "suggestActivityDetails");
            const { data } = await suggestActivity({ taskTitle });
            const activitySuggestion = data as Omit<IActivitySuggestion, "subtasks"> & { subtasks: string[] };
            const subtasks = activitySuggestion.subtasks.map(subtask => createNewSubtask(subtask));
            return {
                ...activitySuggestion,
                subtasks
            };
        } catch (error) {
            console.log("error", error);
            setError({
                message: "Oops, something went wrong. Please try again.",
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
