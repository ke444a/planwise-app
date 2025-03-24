import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from "react-native";
import tw from "twrnc";
import { router, Redirect } from "expo-router";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { BacklogItem } from "@/components/backlog";
import { useGetBacklogItemsQuery } from "@/api/backlogs/getBacklogItems";
import { useAppContext } from "@/context/AppContext";
import { useDeleteItemFromBacklogMutation } from "@/api/backlogs/deleteItemFromBacklog";
import { useCompleteBacklogItemMutation } from "@/api/backlogs/completeBacklogItem";
import ScreenWrapper from "@/components/ui/ScreenWrapper";
import Ionicons from "@expo/vector-icons/Ionicons";


const BacklogScreen = () => {
    const { setError } = useAppContext();
    const { data: backlogItems, isPending, isError } = useGetBacklogItemsQuery();
    const { mutate: deleteItemFromBacklog } = useDeleteItemFromBacklogMutation();
    const { mutate: completeBacklogItem } = useCompleteBacklogItemMutation();

    const handleComplete = (item: IBacklogItem) => {
        completeBacklogItem({
            itemId: item.id!,
            isCompleted: !item.isCompleted
        });
    };

    const handleDelete = (id: string) => {
        deleteItemFromBacklog(
            { id },
            {
                onError: (error) => {
                    console.error("Error deleting backlog item:", error);
                }
            }
        );
    };

    const handleEdit = (id: string) => {
        router.push(`/backlog/edit/${id}`);
    };

    const handleAddToSchedule = (id: string) => {
        const item = backlogItems?.find(item => item.id === id);
        if (!item) return;
        router.push(`/backlog/convert-to-activity/${id}`);
    };

    if (isError) {
        setError({
            message: "Unable to load your backlog items. Please try again later.",
        });
        return <Redirect href="/" />;
    }

    return (
        <ScreenWrapper>
            <View style={tw`flex-row justify-between items-center px-4 py-6`}>
                <TouchableOpacity onPress={() => router.back()} style={tw`flex-row items-center gap-x-2`}>
                    <Ionicons name="chevron-back" size={24} style={tw`text-gray-600 dark:text-white`} />
                    <Text style={tw`text-2xl font-semibold text-gray-950 dark:text-white`}>My Backlog</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => router.push("/backlog/new")}>
                    <MaterialCommunityIcons name="plus-box" size={32} style={tw`text-gray-950 dark:text-white`} />
                </TouchableOpacity>
            </View>

            {!isPending && <ScrollView 
                style={tw`px-4`}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={tw`pb-32`}
            >
                {backlogItems.length > 0 && backlogItems.map((item) => (
                    <BacklogItem 
                        key={item.id} 
                        item={item}
                        onComplete={handleComplete}
                        onDelete={handleDelete}
                        onEdit={handleEdit}
                        onAddToSchedule={handleAddToSchedule}
                    />
                ))}
            </ScrollView>}

            <TouchableOpacity
                style={[
                    tw`absolute bottom-14 right-6 w-16 h-16 bg-purple-400 rounded-full items-center justify-center`,
                    styles.floatingButton
                ]}
                onPress={() => router.push("/backlog/ai-backlog")}
            >
                <MaterialCommunityIcons name="robot" size={35} style={tw`text-white`} />
            </TouchableOpacity>
        </ScreenWrapper>
    );
};

const styles = StyleSheet.create({
    floatingButton: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
    }
});

export default BacklogScreen;
