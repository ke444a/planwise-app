import { ButtonWithIcon } from "./ui/ButtonWithIcon";
import { useAuth } from "@/hooks/useAuth";
import AntDesign from "@expo/vector-icons/AntDesign";
import { FirebaseAuthTypes } from "@react-native-firebase/auth";
import { useEffect } from "react";
import { GoogleSignin } from "@react-native-google-signin/google-signin";
import { useAppContext } from "@/context/AppContext";

interface AuthButtonProps {
    onAuth: (_userCreds: FirebaseAuthTypes.UserCredential) => void;
}

const GoogleSignInButton = ({ onAuth }: AuthButtonProps) => {
    const { signInWithGoogle } = useAuth();
    const { setError } = useAppContext();

    useEffect(() => {
        GoogleSignin.configure({
            webClientId: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID
        });
    }, []);

    const onPress = async () => {
        try {
            const userCreds = await signInWithGoogle();
            if (userCreds) {
                onAuth(userCreds);
            }
        } catch (error) {
            let errorTyped = error as FirebaseAuthTypes.NativeFirebaseAuthError;
            if (errorTyped.code !== "-5") {
                setError({
                    code: "firebase-error",
                    message: "Something went wrong while signing in with Google. Please try again.",
                    debug: "GoogleSignInButton: onSignInPress: Error signing in with Google.",
                    error
                });
            }
        }
    };

    return (
        <ButtonWithIcon
            onPress={onPress}
            icon={<AntDesign name="google" size={24} color="#1f2937" />}
            label="Google Sign-In"
            variant="secondary"
            fullWidth
        />
    );
};

export default GoogleSignInButton;
