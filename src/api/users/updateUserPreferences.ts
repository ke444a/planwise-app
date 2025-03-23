import { useAuth } from "@/context/AuthContext";
import { getFirestore, doc, updateDoc } from "@react-native-firebase/firestore";
import { useMutation, useQueryClient } from "@tanstack/react-query";

type PreferenceUpdateData = {
    updates: Partial<{
        "onboardingInfo.startDayTime": string;
        "onboardingInfo.endDayTime": string;
        "onboardingInfo.dayStructure": "morning" | "mixed" | "night";
        "onboardingInfo.priorityActivities": ActivityType[];
        maxStamina: number;
    }>;
}

const updateUserPreferences = async (data: PreferenceUpdateData, uid: string) => {
    const db = getFirestore();
    const userRef = doc(db, "users", uid);
    await updateDoc(userRef, data.updates);
};

export const useUpdateUserPreferencesMutation = () => {
    const queryClient = useQueryClient();
    const { authUser } = useAuth();
    if (!authUser) {
        throw new Error("User not found");
    }

    return useMutation({
        mutationFn: (data: PreferenceUpdateData) => updateUserPreferences(data, authUser.uid),
        onMutate: async (variables) => {
            await queryClient.cancelQueries({ queryKey: ["user", authUser.uid] });

            const previousUser = queryClient.getQueryData<IUser>(["user", authUser.uid]);

            queryClient.setQueryData<IUser>(["user", authUser.uid], (old) => {
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
        onError: (_err, _, context) => {
            queryClient.setQueryData(["user", authUser.uid], context?.previousUser);
        },
        onSettled: () => {
            queryClient.invalidateQueries({ queryKey: ["user", authUser.uid] });
        },
    });
};
