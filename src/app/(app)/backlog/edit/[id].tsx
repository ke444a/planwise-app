import { View, Text } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import tw from "twrnc";
import { TouchableOpacity } from "react-native";
import AntDesign from "@expo/vector-icons/AntDesign";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useState } from "react";
import { useUserStore } from "@/libs/userStore";
import { useGetBacklogItemQuery } from "@/api/backlogs/getBacklogItem";
import { useUpdateBacklogItemMutation } from "@/api/backlogs/updateBacklogItem";
import ScreenWrapper from "@/components/ui/ScreenWrapper";
import { BacklogItemActivityForm } from "@/components/backlog";
import { BacklogItemDraftForm } from "@/components/backlog/BacklogItemDraftForm";

type ActivityDetails = Omit<IActivity, "isCompleted" | "id">;
type DraftDetails = Omit<IBacklogDraft, "id" | "itemType" | "createdAt" | "updatedAt">;

const EditBacklogItemScreen = () => {
    const { id } = useLocalSearchParams();
    const { user } = useUserStore();
    const { data: item, isPending } = useGetBacklogItemQuery(id as string, user?.uid || "");
    const { mutate: updateBacklogItem } = useUpdateBacklogItemMutation();
    const [activityDetails, setActivityDetails] = useState<ActivityDetails | null>(null);
    const [draftDetails, setDraftDetails] = useState<DraftDetails | null>(null);

    const handleClose = () => {
        router.back();
    };

    const handleUpdateItem = () => {
        if (!user?.uid || !id || !item) return;

        if (item.itemType === "activity" && activityDetails?.title.trim()) {
            const updatedItem = {
                id: id as string,
                ...activityDetails,
                isCompleted: item.isCompleted,
                itemType: "activity" as const,
            };
            updateBacklogItem({ item: updatedItem, uid: user.uid });
        } else if (item.itemType === "draft" && draftDetails?.title.trim()) {
            const updatedItem = {
                id: id as string,
                ...draftDetails,
                itemType: "draft" as const,
            };
            updateBacklogItem({ item: updatedItem, uid: user.uid });
        }
        router.back();
    };

    if (isPending || !item) {
        return null;
    }

    return (
        <ScreenWrapper>
            <View style={tw`flex-row justify-between items-center px-4 py-6`}>
                <Text style={tw`text-2xl font-semibold`}>
                    {item.itemType === "activity" ? "Edit Activity" : "Edit Item"}
                </Text>
                <TouchableOpacity onPress={handleClose}>
                    <AntDesign name="closecircle" size={24} style={tw`text-gray-500`} />
                </TouchableOpacity>
            </View>

            {item.itemType === "activity" ? (
                <BacklogItemActivityForm
                    initialData={item}
                    showDatePicker={false}
                    onActivityDetailsChange={setActivityDetails}
                    submitButtonLabel="Update"
                    submitButtonIcon={<Ionicons name="checkmark" size={24} style={tw`text-gray-950`} />}
                    onSubmit={handleUpdateItem}
                />
            ) : (
                <BacklogItemDraftForm
                    initialData={item}
                    onDraftDetailsChange={setDraftDetails}
                    submitButtonLabel="Update"
                    submitButtonIcon={<Ionicons name="checkmark" size={24} style={tw`text-gray-950`} />}
                    onSubmit={handleUpdateItem}
                />
            )}
        </ScreenWrapper>
    );
};

export default EditBacklogItemScreen; 