import { getFirestore, doc, updateDoc } from "@react-native-firebase/firestore";
import { useMutation, useQueryClient } from "@tanstack/react-query";

type Data = {
    uid: string;
    onboardingInfo: IOnboardingInfo;
}

const uploadOnboardingInfo = async (data: Data) => {
    const db = getFirestore();
    const userRef = doc(db, "users", data.uid);

    await updateDoc(userRef, {
        onboardingInfo: data.onboardingInfo,
    });
};

export const useUploadOnboardingInfoMutation = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: uploadOnboardingInfo,
        onMutate: async (variables) => {
            // Cancel any outgoing refetches (so they don't overwrite our optimistic update)
            await queryClient.cancelQueries({ queryKey: ["user", variables.uid] });

            // Snapshot the previous value
            const previousUser = queryClient.getQueryData<IUser>(["user", variables.uid]);

            // Optimistically update to the new value
            queryClient.setQueryData<IUser>(["user", variables.uid], (old) => {
                return {
                    ...old,
                    onboardingInfo: variables.onboardingInfo,
                } as IUser;
            });

            // Return a context object with the snapshotted value
            return { previousUser };
        },
        onError: (_err, variables, context) => {
            // If the mutation fails, roll back to the previous value
            queryClient.setQueryData(["user", variables.uid], context?.previousUser);
        },
        onSettled: (data, error, variables) => {
            // Always refetch after error or success:
            queryClient.invalidateQueries({ queryKey: ["user", variables.uid] });
        },
    });
};
