import "expo-dev-client";
import { Stack } from "expo-router";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AppProvider } from "@/context/AppContext";
import { AuthProvider } from "@/context/AuthContext";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { useEffect } from "react";
import { LogBox } from "react-native";
import { getFunctions, connectFunctionsEmulator } from "@react-native-firebase/functions";

// import AsyncStorage from "@react-native-async-storage/async-storage";
// import auth from "@react-native-firebase/auth";
// import { useEffect } from "react";

const queryClient = new QueryClient();

export default function RootLayout() {
    // useEffect(() => {
    //     const signOut = async () => {
    //         await auth().signOut();
    //         await AsyncStorage.clear();
    //     };

    //     signOut();
    // }, []);
    if (__DEV__) {
        const functions = getFunctions();
        connectFunctionsEmulator(functions, "localhost", 5001);
    }

    useEffect(() => {
        const logMessage = "VirtualizedLists should never be nested inside plain ScrollViews with the same orientation";
        LogBox.ignoreLogs([logMessage]);

        return () => {
            LogBox.ignoreAllLogs();
        };
    }, []);
    
    return (
        <GestureHandlerRootView>
            <AuthProvider>
                <AppProvider>
                    <QueryClientProvider client={queryClient}>
                        <SafeAreaProvider>
                            <Stack>
                                <Stack.Screen name="auth" options={{ headerShown: false }} />
                                <Stack.Screen name="(app)" options={{ headerShown: false }} />
                            </Stack>
                        </SafeAreaProvider>
                    </QueryClientProvider>
                </AppProvider>
            </AuthProvider>
        </GestureHandlerRootView>
    );
}
