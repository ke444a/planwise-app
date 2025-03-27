import { getFirestore, doc, deleteDoc, collection, query, where, getDocs } from "@react-native-firebase/firestore";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/context/AuthContext";

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

    const backlogCollection = collection(db, "backlog");
    const backlogQuery = query(backlogCollection, where("uid", "==", uid));
    const backlogQuerySnapshot = await getDocs(backlogQuery);
    
    // Delete each schedule document
    const deletePromises = querySnapshot.docs.map((doc) => deleteDoc(doc.ref))
        .concat(backlogQuerySnapshot.docs.map((doc) => deleteDoc(doc.ref)));
    await Promise.all(deletePromises);
};

export const useDeleteUserMutation = () => {
    const queryClient = useQueryClient();
    const { authUser } = useAuth();
    if (!authUser) {
        throw new Error("User not found");
    }

    return useMutation({
        mutationFn: () => deleteUser(authUser.uid),
        onSuccess: () => {
            queryClient.removeQueries({ queryKey: ["user", authUser.uid] });
            queryClient.removeQueries({ queryKey: ["schedule"] });
        }
    });
};
