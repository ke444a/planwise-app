import { IAuthUser } from "@/hooks/useAuth";
import { getFirestore, doc, setDoc } from "@react-native-firebase/firestore";
import { useMutation, useQueryClient } from "@tanstack/react-query";

const createUser = async (userCreds: IAuthUser) => {
    const db = getFirestore();
    const userRef = doc(db, "users", userCreds.uid);

    await setDoc(userRef, {
        email: userCreds.email,
        fullName: userCreds.fullName,
        photoURL: userCreds.photoURL,
        onboardingInfo: null,
        createdAt: new Date()
    });
};

export const useCreateUserMutation = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: createUser,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["user"] });
        }
    });
};

