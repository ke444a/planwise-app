import { Redirect, Stack } from "expo-router";
import { useAuth } from "@/context/AuthContext";
import { useTheme } from "@/context/ThemeContext";

export default function RootLayout() {
    const { authUser } = useAuth();
    const { memoBuster } = useTheme();
    
    if (!authUser) {
        return <Redirect href="/auth" />;
    }

    return (
        <Stack key={memoBuster}>
            <Stack.Screen name="index" options={{ headerShown: false }} />
            <Stack.Screen name="activity" options={{ headerShown: false }} />
            <Stack.Screen name="onboarding" options={{ headerShown: false }} />
            <Stack.Screen name="ai-planner" options={{ headerShown: false }} />
            <Stack.Screen name="profile" options={{ headerShown: false }} />
            <Stack.Screen name="backlog" options={{ headerShown: false }} />
        </Stack>
    );
}
