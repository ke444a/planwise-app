import { Stack } from "expo-router";

export default function ProfileLayout() {
    return (
        <Stack>
            <Stack.Screen name="index" options={{ headerShown: false }} />
            <Stack.Screen name="new" options={{ headerShown: false }} />
            <Stack.Screen name="ai-backlog" options={{ headerShown: false }} />
            <Stack.Screen name="edit/[id]" options={{ headerShown: false }} />
            <Stack.Screen name="convert-to-activity/[id]" options={{ headerShown: false }} />
        </Stack>
    );
}
