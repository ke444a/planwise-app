import { View, Text } from "react-native";
import { router } from "expo-router";
import tw from "twrnc";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { SafeAreaView } from "react-native-safe-area-context";
import GoogleSignInButton from "@/components/GoogleSignInButton";
import { firebase, FirebaseAuthTypes } from "@react-native-firebase/auth";


export default function Auth() {
    const redirectToApp = () => {
        router.replace("/(app)");
    };

    const onAuth = async (userCreds: FirebaseAuthTypes.UserCredential) => {
        if (userCreds.additionalUserInfo?.isNewUser) {
            // createUser({
            //     firebaseUid: userCreds.user.uid,
            //     fullName: userCreds.user?.displayName || "",
            //     email: userCreds.additionalUserInfo?.profile?.email || userCreds.user?.email || "",
            //     avatarUrl: userCreds.user?.photoURL || "",
            // },
            // {
            //     onError: (error) => {
            //         setError({
            //             code: "firebase-error",
            //             message: "An error occurred while creating your account. Please try again.",
            //             debug: "AuthScreen: onAuth: Error creating user.",
            //             error
            //         });
            //         if (firebase.auth().currentUser) {
            //             firebase.auth().currentUser?.delete();
            //         }
            //     },
            //     onSuccess: async () => {
            //         await analytics().logSignUp({
            //             method: signUpMethod
            //         });
            //         await setUserId(userCreds.user.uid);
            //         redirectToApp();
            //     }
            // });
            redirectToApp();
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
}
