import { Redirect, Stack } from "expo-router";
import { useUserStore } from "@/config/userStore";

export default function RootLayout() {
    const { user } = useUserStore();
    if (!user || !user.token) {
        return <Redirect href="/auth" />;
    }

    return (
        <Stack>
            <Stack.Screen name="index" options={{ headerShown: false }} />
            <Stack.Screen name="onboarding" options={{ headerShown: false }} />
            <Stack.Screen name="ai-planner" options={{ headerShown: false }} />
        </Stack>
    );
}
