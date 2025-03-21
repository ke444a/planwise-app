import { View, Text, ScrollView } from "react-native";
import tw from "twrnc";
import { useState, useEffect } from "react";
import { 
    DurationSection, 
    ActivityTypePickerBottomSheet, 
    TimeRangePicker, 
    PriorityPicker, 
    ActivityTypeAndTitlePicker, 
    StaminaPicker, 
    DatePickerSection, 
    SubtasksList 
} from "@/components/activity";
import { createNewSubtask } from "@/utils/createNewSubtask";
import { ButtonWithIcon } from "../ui/ButtonWithIcon";

interface ActivityDetailsFormProps {
    initialData: Partial<IBacklogItem>;
    showDatePicker?: boolean;
    onActivityDetailsChange: (_details: Omit<IActivity, "isCompleted" | "id">) => void;
    selectedDate?: Date;
    onDateChange?: (_date: Date) => void;
    submitButtonLabel: string;
    submitButtonIcon?: React.ReactNode;
    onSubmit: () => void;
}

export const BacklogItemActivityForm = ({
    initialData,
    showDatePicker = false,
    onActivityDetailsChange,
    selectedDate,
    onDateChange,
    submitButtonLabel,
    submitButtonIcon,
    onSubmit,
}: ActivityDetailsFormProps) => {
    const [isTypePickerVisible, setIsTypePickerVisible] = useState(false);
    const [subtaskInput, setSubtaskInput] = useState("");
    const [activityDetails, setActivityDetails] = useState<Omit<IActivity, "isCompleted" | "id">>({
        title: "",
        type: "misc",
        startTime: "09:00",
        endTime: "09:15",
        duration: 15,
        priority: "must_do",
        staminaCost: 0,
        subtasks: [],
    });

    useEffect(() => {
        if (initialData) {
            setActivityDetails(prev => ({
                ...prev,
                title: initialData.title || "",
                duration: initialData.duration || 15,
                subtasks: initialData.subtasks || [],
                ...(initialData.itemType === "activity" ? {
                    type: initialData.type,
                    priority: initialData.priority,
                    staminaCost: initialData.staminaCost,
                    startTime: initialData.startTime,
                    endTime: initialData.endTime,
                } : {}),
            }));
        }
    }, [initialData]);

    useEffect(() => {
        onActivityDetailsChange(activityDetails);
    }, [activityDetails, onActivityDetailsChange]);

    const handleSubtaskSubmit = () => {
        if (subtaskInput.trim()) {
            const newSubtask = createNewSubtask(subtaskInput);
            setActivityDetails(prev => ({
                ...prev,
                subtasks: [...prev.subtasks, newSubtask]
            }));
            setSubtaskInput("");
        }
    };

    const handleSubtaskRemove = (id: string) => {
        setActivityDetails(prev => ({
            ...prev,
            subtasks: prev.subtasks.filter(subtask => subtask.id !== id)
        }));
    };

    const handleTimeSelected = (time: { start: string; end: string }) => {
        setActivityDetails(prev => ({
            ...prev,
            startTime: time.start,
            endTime: time.end,
        }));
    };

    return (
        <>
            <ScrollView 
                style={tw`flex-1 px-4`} 
                showsVerticalScrollIndicator={false}
                contentContainerStyle={tw`gap-y-8`}
            >
                <ActivityTypeAndTitlePicker
                    title={activityDetails.title}
                    type={activityDetails.type}
                    priority={activityDetails.priority}
                    onTitleChange={(title) => setActivityDetails(prev => ({ ...prev, title }))}
                    setIsTypePickerVisible={setIsTypePickerVisible}
                />

                <View style={tw`mb-4`}>
                    <Text style={tw`text-2xl font-semibold text-gray-950 mb-4`}>When?</Text>
                    <TimeRangePicker
                        initialTime={activityDetails.startTime}
                        durationMinutes={activityDetails.duration}
                        onTimeSelected={handleTimeSelected}
                    />
                </View>

                {showDatePicker && selectedDate && onDateChange && (
                    <DatePickerSection
                        selectedDate={selectedDate}
                        onDateChange={onDateChange}
                    />
                )}

                <DurationSection
                    duration={activityDetails.duration}
                    onDurationChange={(value) => setActivityDetails(prev => ({ ...prev, duration: value }))}
                />

                <View>
                    <Text style={tw`text-2xl font-semibold text-gray-950 mb-4`}>How Urgent?</Text>
                    <PriorityPicker
                        selectedPriority={activityDetails.priority}
                        onPriorityChange={(value) => setActivityDetails(prev => ({ ...prev, priority: value }))}
                    />
                </View>

                <View>
                    <Text style={tw`text-2xl font-semibold text-gray-950 mb-4`}>How Much Stamina?</Text>
                    <StaminaPicker
                        value={activityDetails.staminaCost}
                        onValueChange={(value) => setActivityDetails(prev => ({ ...prev, staminaCost: value }))}
                    />
                </View>

                <View>
                    <Text style={tw`text-2xl font-semibold text-gray-950 mb-4`}>Any Subtasks?</Text>
                    <SubtasksList
                        subtasks={activityDetails.subtasks}
                        subtaskInput={subtaskInput}
                        onSubtaskInputChange={setSubtaskInput}
                        onSubtaskSubmit={handleSubtaskSubmit}
                        onSubtaskRemove={handleSubtaskRemove}
                    />
                </View>
            </ScrollView>

            <View style={tw`px-4 pt-4 pb-8 bg-white`}>
                <ButtonWithIcon
                    label={submitButtonLabel}
                    onPress={onSubmit}
                    iconPosition="left"
                    fullWidth
                    icon={submitButtonIcon}
                    disabled={!activityDetails.title.trim()}
                />
            </View>

            <ActivityTypePickerBottomSheet
                visible={isTypePickerVisible}
                onClose={() => setIsTypePickerVisible(false)}
                onTypeSelected={(value) => setActivityDetails(prev => ({ ...prev, type: value }))}
                selectedType={activityDetails.type}
            />
        </>
    );
}; 