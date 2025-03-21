import { Redirect, Stack } from "expo-router";
import { useAuth } from "@/context/AuthContext";

export default function RootLayout() {
    const { authUser } = useAuth();
    if (!authUser) {
        return <Redirect href="/auth" />;
    }

    return (
        <Stack>
            <Stack.Screen name="index" options={{ headerShown: false }} />
            <Stack.Screen name="activity" options={{ headerShown: false }} />
            <Stack.Screen name="onboarding" options={{ headerShown: false }} />
            <Stack.Screen name="ai-planner" options={{ headerShown: false }} />
            <Stack.Screen name="profile" options={{ headerShown: false }} />
            <Stack.Screen name="backlog" options={{ headerShown: false }} />
        </Stack>
    );
}
