import "expo-dev-client";
import { Stack } from "expo-router";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AppProvider } from "@/context/AppContext";
import { AuthProvider } from "@/context/AuthContext";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { useEffect } from "react";
import { LogBox } from "react-native";
import { ThemeProvider } from "@/context/ThemeContext";

const queryClient = new QueryClient();

export default function RootLayout() {
    useEffect(() => {
        // Ignore this warning because iOS apps support nested scroll views
        const logMessage = "VirtualizedLists should never be nested inside plain ScrollViews with the same orientation";
        LogBox.ignoreLogs([logMessage]);

        return () => {
            LogBox.ignoreAllLogs();
        };
    }, []);
    
    return (
        <GestureHandlerRootView>
            <ThemeProvider>
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
            </ThemeProvider>
        </GestureHandlerRootView>
    );
}
