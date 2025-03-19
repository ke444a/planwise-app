import { getFirestore, doc, deleteDoc, collection, query, where, getDocs } from "@react-native-firebase/firestore";
import { useMutation, useQueryClient } from "@tanstack/react-query";

const deleteUser = async (uid: string) => {
    const db = getFirestore();
    
    // Delete user document
    const userRef = doc(db, "users", uid);
    await deleteDoc(userRef);
    
    // Delete all schedules for this user
    const schedulesCollection = collection(db, "schedules");
    const q = query(
        schedulesCollection,
        where("uid", "==", uid)
    );
    const querySnapshot = await getDocs(q);
    
    // Delete each schedule document
    const deletePromises = querySnapshot.docs.map((doc) => deleteDoc(doc.ref));
    await Promise.all(deletePromises);
};

export const useDeleteUserMutation = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: deleteUser,
        onSuccess: (_, uid) => {
            queryClient.removeQueries({ queryKey: ["user", uid] });
            queryClient.removeQueries({ queryKey: ["schedule"] });
        }
    });
};
