import { View, Text } from "react-native";
import { router } from "expo-router";
import tw from "twrnc";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { SafeAreaView } from "react-native-safe-area-context";
import GoogleSignInButton from "@/components/auth/GoogleSignInButton";
import { firebase, FirebaseAuthTypes } from "@react-native-firebase/auth";
import { useCreateUserMutation } from "@/api/users/createUser";
import { useAppContext } from "@/context/AppContext";

const AuthScreen = () => {
    const { mutate: createUser } = useCreateUserMutation();
    const { setError } = useAppContext();

    const redirectToApp = () => {
        router.replace("/(app)");
    };

    const onAuth = async (userCreds: FirebaseAuthTypes.UserCredential) => {
        if (userCreds.additionalUserInfo?.isNewUser) {
            const data = {
                uid: userCreds.user.uid,
                email: userCreds.user?.email || "",
                fullName: userCreds.user?.displayName || "",
                photoURL: userCreds.user?.photoURL || "",
            };
            createUser(data, {
                onSuccess: () => {
                    redirectToApp();
                },
                onError: (error) => {
                    setError({
                        code: "firebase-error",
                        message: "Something went wrong while signing in with Google. Please try again.",
                        debug: "AuthScreen: onAuth: Error creating user.",
                        error
                    });
                    if (firebase.auth().currentUser) {
                        firebase.auth().currentUser?.delete();
                    }
                }
            });
        } else {
            redirectToApp();
        }
    };

    return (
        <SafeAreaView style={tw`flex-1 px-6 justify-between py-20`}>
            <View style={tw`items-center mx-auto mt-20`}>
                <MaterialCommunityIcons 
                    name="bullseye-arrow" 
                    style={tw`mb-6 text-gray-400`}
                    size={80}
                />
                <Text style={tw`text-3xl font-bold text-center mb-3 max-w-[80%]`}>
                    Plan Smarter, Live Better!
                </Text>
                <Text style={tw`text-lg text-center max-w-[80%]`}>
                    An easiest way to organize your day - powered by AI
                </Text>
            </View>
            <View style={tw`w-full`}>
                <GoogleSignInButton 
                    onAuth={onAuth}
                />
            </View>
        </SafeAreaView>
    );
};

export default AuthScreen;
