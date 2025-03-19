// import auth, { FirebaseAuthTypes } from "@react-native-firebase/auth";
// import { GoogleSignin } from "@react-native-google-signin/google-signin";
// import { useEffect, useState, useCallback } from "react";
// import { useUserStore } from "@/config/userStore";

// export interface IAuthUser {
//     uid: string;
//     email?: string | null;
//     fullName?: string | null;
//     photoURL?: string | null;
// }

// export const useAuth = () => {
//     const { setUser } = useUserStore();
//     const [isLoading, setIsLoading] = useState<boolean>(true);

//     const onAuthStateChanged = useCallback(async (firebaseUser: FirebaseAuthTypes.User | null) => {
//         if (firebaseUser) {
//             const authUser: IAuthUser = {
//                 uid: firebaseUser.uid,
//                 email: firebaseUser.email,
//                 fullName: firebaseUser.displayName,
//                 photoURL: firebaseUser.photoURL,
//             };
            
//             let idToken = "";
//             try {
//                 idToken = await firebaseUser.getIdToken();
//             } catch (error) {
//                 // Silently fail if the token is not available
//                 console.log("Error getting ID token", error);
//             }
//             setUser({ 
//                 ...authUser,
//                 token: idToken,
//                 onboardingInfo: null,
//                 maxStamina: 25
//             });
//         } else {
//             setUser(null);
//         }
//         setIsLoading(false);
//     }, [setUser]);

//     useEffect(() => {
//         const subscriber = auth().onAuthStateChanged(onAuthStateChanged);
//         return subscriber;
//     }, [onAuthStateChanged]);

//     const signOut = async () => {
//         return await auth().signOut();
//     };

//     const signInWithGoogle = async () => {
//         await GoogleSignin.hasPlayServices();
//         const { data } = await GoogleSignin.signIn();
//         if (!data?.idToken) {
//             throw new Error("Google Sign-In failed - no identity token returned");
//         }
//         const googleCredential = auth.GoogleAuthProvider.credential(data.idToken);
//         return await auth().signInWithCredential(googleCredential);
//     };

//     return {
//         isLoading,
//         signInWithGoogle,
//         signOut
//     };
// };
