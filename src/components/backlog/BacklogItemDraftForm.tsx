import { View, TextInput } from "react-native";
import tw from "twrnc";
import { useState, useEffect } from "react";
import { ButtonWithIcon } from "@/components/ui/ButtonWithIcon";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { DurationSection, SubtasksList } from "@/components/activity";
import { createNewSubtask } from "@/utils/createNewSubtask";

interface BacklogItemDraftFormProps {
    initialData?: Partial<IBacklogDraft>;
    onDraftDetailsChange: (_details: Omit<IBacklogDraft, "id" | "itemType" | "createdAt" | "updatedAt">) => void;
    submitButtonLabel: string;
    submitButtonIcon: React.ReactNode;
    onSubmit: () => void;
}

export const BacklogItemDraftForm = ({
    initialData,
    onDraftDetailsChange,
    submitButtonLabel,
    submitButtonIcon,
    onSubmit,
}: BacklogItemDraftFormProps) => {
    const [draftDetails, setDraftDetails] = useState<Omit<IBacklogDraft, "id" | "itemType" | "createdAt" | "updatedAt">>({
        title: "",
        duration: 15,
        isCompleted: false,
        subtasks: [],
    });
    const [subtaskInput, setSubtaskInput] = useState("");

    useEffect(() => {
        if (initialData) {
            setDraftDetails(prev => ({
                ...prev,
                title: initialData.title || "",
                duration: initialData.duration || 15,
                subtasks: initialData.subtasks || [],
                isCompleted: initialData.isCompleted || false,
            }));
        }
    }, [initialData]);

    useEffect(() => {
        onDraftDetailsChange(draftDetails);
    }, [draftDetails, onDraftDetailsChange]);

    const handleSubtaskSubmit = () => {
        if (subtaskInput.trim()) {
            const newSubtask = createNewSubtask(subtaskInput);
            setDraftDetails(prev => ({
                ...prev,
                subtasks: [...prev.subtasks, newSubtask]
            }));
            setSubtaskInput("");
        }
    };

    const handleSubtaskRemove = (id: string) => {
        setDraftDetails(prev => ({
            ...prev,
            subtasks: prev.subtasks.filter(subtask => subtask.id !== id)
        }));
    };

    return (
        <>
            <View style={tw`px-4 flex-1`}>
                <View style={tw`mb-10 flex-row items-center`}>
                    <View style={tw`h-14 w-14 bg-slate-200 rounded-lg items-center justify-center mr-3`}>
                        <MaterialCommunityIcons name="text-box-outline" size={30} style={tw`text-gray-600`} />
                    </View>
                    <TextInput
                        style={tw`border-b border-gray-300 py-2 text-xl text-gray-950 flex-1`}
                        value={draftDetails.title}
                        onChangeText={(text) => setDraftDetails(prev => ({ ...prev, title: text }))}
                        placeholder="What?"
                    />
                </View>

                <DurationSection
                    duration={draftDetails.duration}
                    onDurationChange={(value) => setDraftDetails(prev => ({ ...prev, duration: value }))}
                />

                <SubtasksList
                    subtasks={draftDetails.subtasks}
                    subtaskInput={subtaskInput}
                    onSubtaskInputChange={setSubtaskInput}
                    onSubtaskSubmit={handleSubtaskSubmit}
                    onSubtaskRemove={handleSubtaskRemove}
                />
            </View>

            <View style={tw`px-4`}>
                <ButtonWithIcon
                    label={submitButtonLabel}
                    onPress={onSubmit}
                    iconPosition="left"
                    fullWidth
                    icon={submitButtonIcon}
                    disabled={!draftDetails.title.trim()}
                />
            </View>
        </>
    );
}; 