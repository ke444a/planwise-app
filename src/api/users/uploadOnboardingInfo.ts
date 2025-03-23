import { getFirestore, doc, updateDoc } from "@react-native-firebase/firestore";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/context/AuthContext";

const uploadOnboardingInfo = async (onboardingInfo: IOnboardingInfo, uid: string) => {
    const db = getFirestore();
    const userRef = doc(db, "users", uid);

    await updateDoc(userRef, {
        onboardingInfo: onboardingInfo,
    });
};

export const useUploadOnboardingInfoMutation = () => {
    const queryClient = useQueryClient();
    const { authUser } = useAuth();
    if (!authUser) {
        throw new Error("User not found");
    }

    return useMutation({
        mutationFn: (onboardingInfo: IOnboardingInfo) => uploadOnboardingInfo(onboardingInfo, authUser.uid),
        onMutate: async (variables) => {
            // Cancel any outgoing refetches (so they don't overwrite our optimistic update)
            await queryClient.cancelQueries({ queryKey: ["user", authUser.uid] });

            // Snapshot the previous value
            const previousUser = queryClient.getQueryData<IUser>(["user", authUser.uid]);

            // Optimistically update to the new value
            queryClient.setQueryData<IUser>(["user", authUser.uid], (old) => {
                return {
                    ...old,
                    onboardingInfo: variables,
                } as IUser;
            });

            // Return a context object with the snapshotted value
            return { previousUser };
        },
        onError: (_err, _, context) => {
            // If the mutation fails, roll back to the previous value
            queryClient.setQueryData(["user", authUser.uid], context?.previousUser);
        },
        onSettled: () => {
            // Always refetch after error or success:
            queryClient.invalidateQueries({ queryKey: ["user", authUser.uid] });
        },
    });
};
