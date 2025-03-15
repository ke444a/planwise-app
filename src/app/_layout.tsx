import "expo-dev-client";
import { Stack } from "expo-router";
import { AuthProvider } from "@/context/AuthContext";
import { SafeAreaProvider } from "react-native-safe-area-context";

export default function RootLayout() {
    return (
        <AuthProvider>
            <SafeAreaProvider>
                <Stack>
                    <Stack.Screen name="auth" options={{ headerShown: false }} />
                    <Stack.Screen name="(app)" options={{ headerShown: false }} />
                </Stack>
            </SafeAreaProvider>
        </AuthProvider>
    );
}
