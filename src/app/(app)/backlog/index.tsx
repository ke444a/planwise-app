import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from "react-native";
import tw from "twrnc";
import { router, Redirect } from "expo-router";
import AntDesign from "@expo/vector-icons/AntDesign";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { BacklogItem } from "@/components/backlog";
import { useUserStore } from "@/libs/userStore";
import { useGetBacklogItemsQuery } from "@/api/backlogs/getBacklogItems";
import { useAppContext } from "@/context/AppContext";
import { useDeleteItemFromBacklogMutation } from "@/api/backlogs/deleteItemFromBacklog";
import { useCompleteBacklogItemMutation } from "@/api/backlogs/completeBacklogItem";
import ScreenWrapper from "@/components/ui/ScreenWrapper";

const BacklogScreen = () => {
    const { user } = useUserStore();
    const { setError } = useAppContext();
    const { data: backlogItems, isPending, isError } = useGetBacklogItemsQuery(user?.uid);
    const { mutate: deleteItemFromBacklog } = useDeleteItemFromBacklogMutation();
    const { mutate: completeBacklogItem } = useCompleteBacklogItemMutation();

    const handleComplete = (item: IBacklogItem) => {
        if (!user?.uid) return;
        completeBacklogItem({
            itemId: item.id!,
            uid: user.uid,
            isCompleted: !item.isCompleted
        });
    };

    const handleDelete = (id: string) => {
        if (!user?.uid) return;
        deleteItemFromBacklog(
            { id, uid: user.uid },
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
        if (!item || !user?.uid) return;
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
            <View style={tw`px-4 pt-6`}>
                <View style={tw`flex-row justify-between items-center mb-6`}>
                    <Text style={tw`text-2xl font-semibold text-gray-950`}>Your backlog</Text>
                    <TouchableOpacity onPress={() => router.back()}>
                        <AntDesign name="closecircle" size={24} style={tw`text-gray-500`} />
                    </TouchableOpacity>
                </View>

                <TouchableOpacity 
                    style={tw`flex-row items-center p-4 bg-white rounded-xl mb-6 border border-dashed border-gray-300`}
                    onPress={() => router.push("/backlog/new")}
                >
                    <View style={tw`w-8 h-8 rounded-full bg-purple-100 items-center justify-center mr-3`}>
                        <AntDesign name="plus" size={20} style={tw`text-purple-400`} />
                    </View>
                    <Text style={tw`text-gray-600 text-lg font-medium`}>Add new item</Text>
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
                onPress={() => {
                    console.log("Open AI chat to create backlog items");
                }}
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
