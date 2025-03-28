import { View, Text, ScrollView } from "react-native";
import tw from "twrnc";
import { useState } from "react";
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
import { ButtonWithIcon } from "@/components/ui/ButtonWithIcon";
import { addMinutesToTime } from "@/utils/addMinutesToTime";

interface ActivityFormProps {
    activityDetails: Omit<IActivity, "isCompleted" | "id">;
    onActivityDetailsChange: (_details: Omit<IActivity, "isCompleted" | "id">) => void;
    submitButtonLabel: string;
    submitButtonIcon: React.ReactNode;
    onSubmit: () => void;
    selectedDate: Date;
    onDateChange: (_date: Date) => void;
}

export const ActivityForm = ({
    activityDetails,
    onActivityDetailsChange,
    submitButtonLabel,
    submitButtonIcon,
    onSubmit,
    selectedDate,
    onDateChange,
}: ActivityFormProps) => {
    const [isTypePickerVisible, setIsTypePickerVisible] = useState(false);
    const [subtaskInput, setSubtaskInput] = useState("");

    const handleSubtaskSubmit = () => {
        if (subtaskInput.trim()) {
            const newSubtask = createNewSubtask(subtaskInput);
            onActivityDetailsChange({
                ...activityDetails,
                subtasks: [...(activityDetails.subtasks || []), newSubtask]
            });
            setSubtaskInput("");
        }
    };

    const handleSubtaskRemove = (id: string) => {
        onActivityDetailsChange({
            ...activityDetails,
            subtasks: activityDetails.subtasks?.filter(subtask => subtask.id !== id) || []
        });
    };

    const handleTimeSelected = (time: { start: string; end: string }) => {
        onActivityDetailsChange({
            ...activityDetails,
            startTime: time.start,
            endTime: time.end,
        });
    };

    const handleDetailsChange = (updates: Partial<Omit<IActivity, "isCompleted" | "id">>) => {
        onActivityDetailsChange({ ...activityDetails, ...updates });
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
                    onTitleChange={(title) => handleDetailsChange({ title })}
                    setIsTypePickerVisible={setIsTypePickerVisible}
                />

                <View style={tw`mb-4`}>
                    <Text style={tw`text-2xl font-semibold text-gray-950 mb-4 dark:text-white`}>When?</Text>
                    <TimeRangePicker
                        initialTime={activityDetails.startTime}
                        durationMinutes={activityDetails.duration}
                        onTimeSelected={handleTimeSelected}
                    />
                </View>

                <DatePickerSection
                    selectedDate={selectedDate}
                    onDateChange={onDateChange}
                />

                <DurationSection
                    duration={activityDetails.duration}
                    onDurationChange={(value) => {
                        const newEndTime = addMinutesToTime(activityDetails.startTime, value);
                        handleDetailsChange({ 
                            duration: value,
                            endTime: newEndTime
                        });
                    }}
                />

                <View>
                    <Text style={tw`text-2xl font-semibold text-gray-950 mb-4 dark:text-white`}>How Urgent?</Text>
                    <PriorityPicker
                        selectedPriority={activityDetails.priority}
                        onPriorityChange={(value) => handleDetailsChange({ priority: value })}
                    />
                </View>

                <View>
                    <Text style={tw`text-2xl font-semibold text-gray-950 mb-4 dark:text-white`}>How Much Stamina?</Text>
                    <StaminaPicker
                        value={activityDetails.staminaCost}
                        onValueChange={(value) => handleDetailsChange({ staminaCost: value })}
                    />
                </View>

                <View style={tw`mb-8`}>
                    <Text style={tw`text-2xl font-semibold text-gray-950 mb-4 dark:text-white`}>Any Subtasks?</Text>
                    <SubtasksList
                        subtasks={activityDetails.subtasks || []}
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
                    disabled={!activityDetails.title.trim()}
                    testID="create-activity-button"
                />
            </View>

            <ActivityTypePickerBottomSheet
                visible={isTypePickerVisible}
                onClose={() => setIsTypePickerVisible(false)}
                onTypeSelected={(value) => handleDetailsChange({ type: value })}
                selectedType={activityDetails.type}
            />
        </>
    );
}; 