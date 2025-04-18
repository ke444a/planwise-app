import { IAuthUser } from "@/context/AuthContext";
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
        maxStamina: 25,
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

