import { View, Text, TouchableOpacity, StyleSheet, Alert } from "react-native";
import tw from "twrnc";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { router } from "expo-router";
import Ionicons from "@expo/vector-icons/Ionicons";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { useAuth } from "@/context/AuthContext";
import { useDeleteUserMutation } from "@/api/users/deleteUser";
import { GoogleSignin } from "@react-native-google-signin/google-signin";
import { getAuth, GoogleAuthProvider, reauthenticateWithCredential } from "firebase/auth";
import { useAppContext } from "@/context/AppContext";

const AdvancedScreen = () => {
    const insets = useSafeAreaInsets();
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
            const auth = getAuth();
            const user = auth.currentUser;
            if (!user) throw new Error("No user signed in");

            GoogleSignin.configure({
                webClientId: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID
            });
            await GoogleSignin.hasPlayServices();
            const { data } = await GoogleSignin.signIn();
            if (!data?.idToken) throw new Error("Failed to get Google ID token");

            const credential = GoogleAuthProvider.credential(data.idToken);
            await reauthenticateWithCredential(user, credential);
            await deleteUser(user.uid);
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
        <View style={tw`flex-1 bg-purple-50`}>
            <View style={[tw`bg-purple-50`, { paddingTop: insets.top }]} />
            <View style={[tw`flex-1 bg-zinc-100 rounded-t-3xl`, styles.containerShadow]}>
                <View style={tw`px-4 py-6`}>
                    <View style={tw`flex-row justify-between items-center mb-8`}>
                        <View style={tw`w-1/3`}>
                            <TouchableOpacity 
                                onPress={() => router.back()}
                                style={tw`mr-4`}
                            >
                                <Ionicons name="chevron-back" size={24} style={tw`text-gray-950`} />
                            </TouchableOpacity>
                        </View>
                        <Text style={tw`text-2xl font-semibold`}>Advanced</Text>
                        <View style={tw`w-1/3`} />
                    </View>

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
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    containerShadow: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: -2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
});

export default AdvancedScreen;
