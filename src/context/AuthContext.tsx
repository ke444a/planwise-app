import auth, { FirebaseAuthTypes } from "@react-native-firebase/auth";
import { GoogleSignin } from "@react-native-google-signin/google-signin";
import { useContext, useEffect, useState, createContext, ReactNode } from "react";

interface IAuthUser {
    uid: string;
    email?: string | null;
    fullName?: string | null;
    photoURL?: string | null;
}

interface IAuthContext {
  currentUser: IAuthUser | null;
  token: string;
  isLoading: boolean;
  signInWithGoogle: () => Promise<FirebaseAuthTypes.UserCredential> | void;
  signOut: () => Promise<void> | void;
}

const AuthContext = createContext<IAuthContext>({
    currentUser: null,
    token: "",
    isLoading: true,
    signInWithGoogle: () => {},
    signOut: () => {},
});

export const useAuth = () => {
    return useContext(AuthContext);
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [currentUser, setCurrentUser] = useState<IAuthUser | null>(null);
    const [token, setToken] = useState("");
    const [isLoading, setIsLoading] = useState<boolean>(true);

    const onAuthStateChanged = async (user: FirebaseAuthTypes.User | null) => {
        if (user) {
            setCurrentUser({
                uid: user.uid,
                email: user.email,
                fullName: user.displayName,
                photoURL: user.photoURL,
            });
            let idToken = "";
            try {
                idToken = await user.getIdToken();
            } catch (error) {
                // Silently fail if the token is not available
                console.log("Error getting ID token", error);
            }
            setToken(idToken);
        } else {
            setCurrentUser(null);
            setToken("");
        }
        setIsLoading(false);
    };

    useEffect(() => {
        const subscriber = auth().onAuthStateChanged(onAuthStateChanged);
        return subscriber;
    }, []);

    const signOut = async () => {
        return await auth().signOut();
    };

    const signInWithGoogle = async () => {
        await GoogleSignin.hasPlayServices();
        const { data } = await GoogleSignin.signIn();
        if (!data?.idToken) {
            throw new Error("Google Sign-In failed - no identify token returned");
        }
        const googleCredential = auth.GoogleAuthProvider.credential(data.idToken);
        return await auth().signInWithCredential(googleCredential);
    };

    const value = {
        currentUser,
        token,
        isLoading,
        signInWithGoogle,
        signOut
    };

    return (
        <AuthContext.Provider value={value}>
            {!isLoading && children}
        </AuthContext.Provider>
    );
};
