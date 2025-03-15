import { Redirect, Stack } from "expo-router";
import { useAuth } from "@/context/AuthContext";

export default function RootLayout() {
    const { currentUser } = useAuth();

    if (!currentUser) {
        return <Redirect href="/auth" />;
    }

    return (
        <Stack>
            <Stack.Screen name="index" options={{ headerShown: false }} />
            <Stack.Screen name="onboarding" options={{ headerShown: false }} />
        </Stack>
    );
}
