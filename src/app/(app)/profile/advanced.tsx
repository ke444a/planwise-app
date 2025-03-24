import { View, Text, TouchableOpacity, Alert } from "react-native";
import tw from "twrnc";
import { router } from "expo-router";
import Ionicons from "@expo/vector-icons/Ionicons";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { useAuth } from "@/context/AuthContext";
import { useDeleteUserMutation } from "@/api/users/deleteUser";
import { GoogleSignin } from "@react-native-google-signin/google-signin";
import { useAppContext } from "@/context/AppContext";
import ScreenWrapper from "@/components/ui/ScreenWrapper";
import { getApp } from "@react-native-firebase/app";
import auth, { getAuth, reauthenticateWithCredential } from "@react-native-firebase/auth";

const AdvancedScreen = () => {
    const { signOut } = useAuth();
    const { mutateAsync: deleteUser } = useDeleteUserMutation();
    const { setError } = useAppContext();

    const onSignOutPress = async () => {
        try {
            await signOut();
        } catch (error) {
            setError({
                code: "firebase-error",
                message: "Something went wrong. Please try again later.",
                debug: "AdvancedScreen: onSignOutPress: Signing out user failed",
                error
            });
        }
    };
    
    const onDeleteAccountPress = () => {
        Alert.alert(
            "Delete Account",
            "This is a sensitive action that requires re-authenticating with your existing account. Are you sure you want to continue?",
            [
                {
                    text: "Cancel",
                    style: "cancel"
                },
                {
                    text: "Yes, Delete",
                    onPress: deleteAccount
                }
            ]
        );
    };

    const deleteAccount = async () => {
        try {
            const app = getApp();
            const authApp = getAuth(app);
            const user = authApp.currentUser;
            if (!user) throw new Error("No user signed in");

            GoogleSignin.configure({
                webClientId: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID
            });
            await GoogleSignin.hasPlayServices();
            const { data } = await GoogleSignin.signIn();
            if (!data?.idToken) throw new Error("Failed to get Google ID token");

            const credential = auth.GoogleAuthProvider.credential(data.idToken);
            await reauthenticateWithCredential(user, credential);
            await deleteUser();
            await user.delete();
        } catch (error) {
            setError({
                code: "firebase-error",
                message: "Something went wrong while deleting your account. Please try again later.",
                debug: "AdvancedScreen: deleteAccount: Deleting user account failed",
                error
            });
        }
    };

    return (
        <ScreenWrapper>
            <View style={tw`px-4 py-6`}>
                <TouchableOpacity onPress={() => router.back()} style={tw`flex-row items-center gap-x-2 mb-8`}>
                    <Ionicons name="chevron-back" size={24} style={tw`text-gray-600 dark:text-neutral-100`} />
                    <Text style={tw`text-2xl font-semibold text-gray-950 dark:text-white`}>Advanced</Text>
                </TouchableOpacity>

                <TouchableOpacity 
                    style={tw`flex-row items-center p-3 bg-white border border-gray-200 rounded-xl mb-3`}
                    onPress={onSignOutPress}
                >
                    <MaterialIcons name="logout" size={22} style={tw`text-blue-500 mr-1`} />
                    <Text style={tw`text-blue-500 text-lg font-medium`}>Sign Out</Text>
                </TouchableOpacity>

                <TouchableOpacity 
                    style={tw`flex-row items-center p-3 bg-white border border-gray-200 rounded-xl`}
                    onPress={onDeleteAccountPress}
                >
                    <Ionicons name="trash" size={22} style={tw`text-red-400 mr-1`} />
                    <Text style={tw`text-red-400 text-lg font-semibold`}>Delete Account</Text>
                </TouchableOpacity>
            </View>
        </ScreenWrapper>
    );
};

export default AdvancedScreen;
