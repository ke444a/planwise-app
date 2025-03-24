import { View, Text } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import tw from "twrnc";
import { TouchableOpacity } from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useState, useEffect } from "react";
import { useGetBacklogItemQuery } from "@/api/backlogs/getBacklogItem";
import { useUpdateBacklogItemMutation } from "@/api/backlogs/updateBacklogItem";
import ScreenWrapper from "@/components/ui/ScreenWrapper";
import { BacklogItemActivityForm } from "@/components/backlog";
import { BacklogItemDraftForm } from "@/components/backlog/BacklogItemDraftForm";

type ActivityDetails = Omit<IActivity, "isCompleted" | "id">;
type DraftDetails = Omit<IBacklogDraft, "id" | "itemType" | "createdAt" | "updatedAt">;

const EditBacklogItemScreen = () => {
    const { id } = useLocalSearchParams();
    const { data: item, isPending } = useGetBacklogItemQuery(id as string);
    const { mutate: updateBacklogItem } = useUpdateBacklogItemMutation();
    const [draftDetails, setDraftDetails] = useState<DraftDetails | null>(null);
    
    const [activityDetails, setActivityDetails] = useState<ActivityDetails>({
        title: "",
        type: "misc",
        startTime: "12:00",
        endTime: "12:15",
        duration: 15,
        priority: "must_do",
        staminaCost: 0,
        subtasks: [],
    });

    useEffect(() => {
        if (item && item.itemType === "activity") {
            setActivityDetails(prev => ({
                ...prev,
                title: item.title || prev.title,
                type: item.type || prev.type,
                startTime: item.startTime || prev.startTime,
                endTime: item.endTime || prev.endTime,
                duration: item.duration || prev.duration,
                priority: item.priority || prev.priority,
                staminaCost: typeof item.staminaCost === "number" ? item.staminaCost : prev.staminaCost,
                subtasks: item.subtasks || prev.subtasks,
            }));
        }
    }, [item]);

    const handleClose = () => {
        router.back();
    };

    const handleUpdateItem = () => {
        if (!id || !item) return;

        if (item.itemType === "activity" && activityDetails.title.trim()) {
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

    if (isPending || !item) {
        return null;
    }

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