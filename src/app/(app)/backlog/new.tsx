import { useState } from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { router } from "expo-router";
import tw from "twrnc";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useAddItemToBacklogMutation } from "@/api/backlogs/addItemToBacklog";
import ScreenWrapper from "@/components/ui/ScreenWrapper";
import { BacklogItemDraftForm } from "@/components/backlog";

type DraftDetails = Omit<IBacklogDraft, "id" | "itemType" | "createdAt" | "updatedAt">;

const NewTaskScreen = () => {
    const { mutate: addItemToBacklog } = useAddItemToBacklogMutation();
    const [draftDetails, setDraftDetails] = useState<DraftDetails>({
        title: "",
        duration: 15,
        isCompleted: false,
        subtasks: []
    });

    const handleClose = () => {
        router.back();
    };

    const handleSave = () => {
        if (!draftDetails.title.trim()) return;

        addItemToBacklog({
            item: {
                ...draftDetails,
                itemType: "draft",
            }
        }, {
            onSuccess: () => {
                router.back();
            }
        });
    };

    return (
        <ScreenWrapper>
            <View style={tw`flex-row justify-between items-center px-4 py-6`}>
                <TouchableOpacity onPress={handleClose} style={tw`flex-row items-center gap-x-2`}>
                    <Ionicons name="chevron-back" size={24} style={tw`text-gray-600`} />
                    <Text style={tw`text-2xl font-semibold text-gray-600`}>New item</Text>
                </TouchableOpacity>
                <View />
            </View>

            <BacklogItemDraftForm
                onDraftDetailsChange={setDraftDetails}
                submitButtonLabel="Create"
                submitButtonIcon={<Ionicons name="checkmark" size={24} style={tw`text-gray-950`} />}
                onSubmit={handleSave}
            />
        </ScreenWrapper>
    );
};

export default NewTaskScreen;