import { View, Text } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import tw from "twrnc";
import { TouchableOpacity } from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useState } from "react";
import { useUpdateBacklogItemMutation } from "@/api/backlogs/updateBacklogItem";
import ScreenWrapper from "@/components/ui/ScreenWrapper";
import { BacklogItemActivityForm } from "@/components/backlog";
import { BacklogItemDraftForm } from "@/components/backlog/BacklogItemDraftForm";

type DraftDetails = Omit<IBacklogDraft, "id" | "itemType" | "createdAt" | "updatedAt">;

const EditBacklogItemScreen = () => {
    const { id, backlogItem: backlogItemParam } = useLocalSearchParams();
    const item = JSON.parse(backlogItemParam as string) as IBacklogItem;
    const { mutate: updateBacklogItem } = useUpdateBacklogItemMutation();
    const [activityDetails, setActivityDetails] = useState<Omit<IActivity, "id" | "isCompleted">>(() => {
        if (item.itemType === "activity") {
            return {
                title: item.title || "",
                type: item.type || "misc",
                startTime: item.startTime || "12:00",
                endTime: item.endTime || "12:15",
                duration: item.duration || 15,
                priority: item.priority || "must_do",
                staminaCost: item.staminaCost ?? 0,
                subtasks: item.subtasks || [],
            };
        }
        return {
            title: "",
            type: "misc",
            startTime: "12:00",
            endTime: "12:15",
            duration: 15,
            priority: "must_do",
            staminaCost: 0,
            subtasks: [],
        };
    });
    const [draftDetails, setDraftDetails] = useState<DraftDetails>(() => {
        if (item.itemType === "draft") {
            return {
                title: item.title || "",
                duration: item.duration || 15,
                subtasks: item.subtasks || [],
                isCompleted: item.isCompleted || false,
            };
        }
        return {
            title: "",
            duration: 15,
            subtasks: [],
            isCompleted: false,
        };
    });

    const handleClose = () => {
        router.back();
    };

    const handleUpdateItem = () => {
        if (!id || !item) return;

        if (item.itemType === "activity" && activityDetails?.title.trim()) {
            const updatedItem = {
                id: id as string,
                ...activityDetails,
                isCompleted: item.isCompleted,
                itemType: "activity" as const,
            };
            updateBacklogItem(updatedItem);
        } else if (item.itemType === "draft" && draftDetails?.title.trim()) {
            const updatedItem = {
                id: id as string,
                ...draftDetails,
                itemType: "draft" as const,
            };
            updateBacklogItem(updatedItem);
        }
        router.back();
    };

    return (
        <ScreenWrapper>
            <View style={tw`px-4 py-6`}>
                <TouchableOpacity onPress={handleClose} style={tw`flex-row items-center gap-x-2`}>
                    <Ionicons name="chevron-back" size={24} style={tw`text-gray-600 dark:text-neutral-100`} />
                    <Text style={tw`text-2xl font-semibold text-gray-950 dark:text-white`}>
                        {item.itemType === "activity" ? "Edit Activity" : "Edit Item"}
                    </Text>
                </TouchableOpacity>
            </View>

            {item.itemType === "activity" ? (
                <BacklogItemActivityForm
                    activityDetails={activityDetails}
                    onActivityDetailsChange={setActivityDetails}
                    showDatePicker={false}
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