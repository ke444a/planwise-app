import { View, TextInput, Text, ScrollView } from "react-native";
import tw from "twrnc";
import { useState, useEffect } from "react";
import { ButtonWithIcon } from "@/components/ui/ButtonWithIcon";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { DurationSection, SubtasksList } from "@/components/activity";
import { createNewSubtask } from "@/utils/createNewSubtask";
import { useTheme } from "@/context/ThemeContext";

interface BacklogItemDraftFormProps {
    initialData?: IBacklogDraft;
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
    const { colorScheme } = useTheme();
    const [draftDetails, setDraftDetails] = useState<Omit<IBacklogDraft, "id" | "itemType" | "createdAt" | "updatedAt">>({
        title: initialData?.title || "",
        duration: initialData?.duration || 15,
        isCompleted: initialData?.isCompleted || false,
        subtasks: initialData?.subtasks || [],
    });
    const [subtaskInput, setSubtaskInput] = useState("");

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
            <ScrollView style={tw`px-4 flex-1`} contentContainerStyle={tw`gap-y-10`} showsVerticalScrollIndicator={false}>
                <View style={tw`flex-row items-center`}>
                    <View style={tw`h-14 w-14 bg-slate-200 rounded-lg items-center justify-center mr-3`}>
                        <MaterialCommunityIcons name="text-box-outline" size={30} style={tw`text-gray-600`} />
                    </View>
                    <TextInput
                        style={tw`border-b border-gray-300 py-2 text-xl text-gray-950 dark:text-white flex-1`}
                        value={draftDetails.title}
                        onChangeText={(text) => setDraftDetails(prev => ({ ...prev, title: text }))}
                        placeholder="What?"
                        placeholderTextColor={colorScheme === "dark" ? "rgba(255, 255, 255, 0.5)" : "#4b5563"}
                        testID="backlog-item-input"
                    />
                </View>

                <DurationSection
                    duration={draftDetails.duration}
                    onDurationChange={(value) => setDraftDetails(prev => ({ ...prev, duration: value }))}
                />
                <View>
                    <Text style={tw`text-2xl font-semibold text-gray-950 dark:text-white mb-4`}>Any Subtasks?</Text>
                    <SubtasksList
                        subtasks={draftDetails.subtasks}
                        subtaskInput={subtaskInput}
                        onSubtaskInputChange={setSubtaskInput}
                        onSubtaskSubmit={handleSubtaskSubmit}
                        onSubtaskRemove={handleSubtaskRemove}
                    />
                </View>
            </ScrollView>

            <View style={tw`px-4 mt-6 mb-12`}>
                <ButtonWithIcon
                    label={submitButtonLabel}
                    onPress={onSubmit}
                    iconPosition="left"
                    fullWidth
                    icon={submitButtonIcon}
                    disabled={!draftDetails.title.trim()}
                    testID="backlog-item-create-button"
                />
            </View>
        </>
    );
}; 