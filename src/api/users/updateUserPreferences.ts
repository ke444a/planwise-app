import { getFirestore, doc, updateDoc } from "@react-native-firebase/firestore";
import { useMutation, useQueryClient } from "@tanstack/react-query";

type PreferenceUpdateData = {
    uid: string;
    updates: Partial<{
        "onboardingInfo.startDayTime": string;
        "onboardingInfo.endDayTime": string;
        "onboardingInfo.dayStructure": "morning" | "mixed" | "night";
        "onboardingInfo.priorityActivities": ActivityType[];
        maxStamina: number;
    }>;
}

const updateUserPreferences = async (data: PreferenceUpdateData) => {
    const db = getFirestore();
    const userRef = doc(db, "users", data.uid);
    await updateDoc(userRef, data.updates);
};

export const useUpdateUserPreferencesMutation = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: updateUserPreferences,
        onMutate: async (variables) => {
            await queryClient.cancelQueries({ queryKey: ["user", variables.uid] });

            const previousUser = queryClient.getQueryData<IUser>(["user", variables.uid]);

            queryClient.setQueryData<IUser>(["user", variables.uid], (old) => {
                if (!old) return old;

                const newUser = { ...old };
                const updates = variables.updates;

                // Handle nested onboardingInfo updates
                if (!newUser.onboardingInfo) newUser.onboardingInfo = {} as IOnboardingInfo;

                Object.entries(updates).forEach(([key, value]) => {
                    if (key.startsWith("onboardingInfo.")) {
                        const field = key.split(".")[1] as keyof IOnboardingInfo;
                        (newUser.onboardingInfo as any)[field] = value;
                    } else {
                        (newUser as any)[key] = value;
                    }
                });

                return newUser;
            });

            return { previousUser };
        },
        onError: (_err, variables, context) => {
            queryClient.setQueryData(["user", variables.uid], context?.previousUser);
        },
        onSettled: (data, error, variables) => {
            queryClient.invalidateQueries({ queryKey: ["user", variables.uid] });
        },
    });
};
