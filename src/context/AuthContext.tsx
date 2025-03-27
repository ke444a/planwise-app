import { useUserStore } from "@/libs/userStore";
import { getApp } from "@react-native-firebase/app";
import _auth, { 
    FirebaseAuthTypes, 
    signOut as _signOut, 
    signInWithCredential, 
    onAuthStateChanged as _onAuthStateChanged, 
    getAuth
} from "@react-native-firebase/auth";
import { GoogleSignin } from "@react-native-google-signin/google-signin";
import { useContext, useEffect, useState, createContext, ReactNode, useCallback } from "react";

export interface IAuthUser {
    uid: string;
    email?: string | null;
    fullName?: string | null;
    photoURL?: string | null;
}

interface IAuthContext {
  authUser: IAuthUser | null;
  token: string;
  isLoading: boolean;
  signInWithGoogle: () => Promise<FirebaseAuthTypes.UserCredential> | void;
  signOut: () => Promise<void> | void;
}

const AuthContext = createContext<IAuthContext>({
    authUser: null,
    token: "",
    isLoading: true,
    signInWithGoogle: () => {},
    signOut: () => {},
});

export const useAuth = () => {
    return useContext(AuthContext);
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const app = getApp();
    const auth = getAuth(app);
    const { setUser: setUserZustandStore } = useUserStore();
    const [authUser, setAuthUser] = useState<IAuthUser | null>(null);
    const [token, setToken] = useState("");
    const [isLoading, setIsLoading] = useState<boolean>(true);

    const onAuthStateChanged = useCallback(async (user: FirebaseAuthTypes.User | null) => {
        if (user) {
            const userData: IAuthUser = {
                uid: user.uid,
                email: user.email,
                fullName: user.displayName,
                photoURL: user.photoURL,
            };

            setAuthUser(userData);
            let idToken = "";
            try {
                idToken = await user.getIdToken();
            } catch (_error) {
            }
            setToken(idToken);
            setUserZustandStore({
                ...userData,
                token: idToken,
                onboardingInfo: null,
                maxStamina: 25
            });
        } else {
            setAuthUser(null);
            setToken("");
            setUserZustandStore(null);
        }
        setIsLoading(false);
    }, [setUserZustandStore]);

    useEffect(() => {
        const subscriber = _onAuthStateChanged(auth, onAuthStateChanged);
        return subscriber;
    }, [onAuthStateChanged, auth]);

    const signOut = async () => {
        return await _signOut(auth);
    };

    const signInWithGoogle = async () => {
        await GoogleSignin.hasPlayServices();
        const { data } = await GoogleSignin.signIn();
        if (!data?.idToken) {
            throw new Error("Google Sign-In failed - no identify token returned");
        }
        const googleCredential = _auth.GoogleAuthProvider.credential(data.idToken);
        return await signInWithCredential(auth, googleCredential);
    };

    const value = {
        authUser,
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
