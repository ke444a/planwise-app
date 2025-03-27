import { Stack } from "expo-router";

export default function ActivityLayout() {
    return (
        <Stack>
            <Stack.Screen name="add" options={{ headerShown: false }} />
            <Stack.Screen name="edit/[id]" options={{ headerShown: false }} />
            <Stack.Screen name="focus" options={{ headerShown: false }} />
        </Stack>
    );
}
