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
import { ButtonWithIcon } from "@/components/ui/ButtonWithIcon";
import { addMinutesToTime } from "@/utils/addMinutesToTime";

interface ActivityFormProps {
    initialData?: Partial<IActivity>;
    onActivityDetailsChange: (_details: Omit<IActivity, "isCompleted" | "id">) => void;
    submitButtonLabel: string;
    submitButtonIcon: React.ReactNode;
    onSubmit: () => void;
    selectedDate: Date;
    onDateChange: (_date: Date) => void;
}

export const ActivityForm = ({
    initialData,
    onActivityDetailsChange,
    submitButtonLabel,
    submitButtonIcon,
    onSubmit,
    selectedDate,
    onDateChange,
}: ActivityFormProps) => {
    const [isTypePickerVisible, setIsTypePickerVisible] = useState(false);
    const [subtaskInput, setSubtaskInput] = useState("");
    const [activityDetails, setActivityDetails] = useState<Omit<IActivity, "isCompleted" | "id">>(() => ({
        title: initialData?.title || "",
        type: initialData?.type || "misc",
        startTime: initialData?.startTime || "12:00",
        endTime: initialData?.endTime || "12:15",
        duration: initialData?.duration || 15,
        priority: initialData?.priority || "must_do",
        staminaCost: initialData?.staminaCost || 0,
        subtasks: initialData?.subtasks || [],
    }));

    useEffect(() => {
        if (initialData) {
            setActivityDetails(prev => ({
                ...prev,
                title: initialData.title || prev.title,
                type: initialData.type || prev.type,
                startTime: initialData.startTime || prev.startTime,
                endTime: initialData.endTime || prev.endTime,
                duration: initialData.duration || prev.duration,
                priority: initialData.priority || prev.priority,
                staminaCost: initialData.staminaCost || prev.staminaCost,
                subtasks: initialData.subtasks || prev.subtasks,
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

                <DatePickerSection
                    selectedDate={selectedDate}
                    onDateChange={onDateChange}
                />

                <DurationSection
                    duration={activityDetails.duration}
                    onDurationChange={(value) => {
                        const newEndTime = addMinutesToTime(activityDetails.startTime, value);
                        setActivityDetails(prev => ({ 
                            ...prev, 
                            duration: value,
                            endTime: newEndTime
                        }));
                    }}
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