import { useState } from "react";
import { View, Text, Modal, TouchableOpacity, TextInput } from "react-native";
import tw from "twrnc";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { DurationPickerBottomSheet } from "./DurationPickerBottomSheet";
import { ButtonWithIcon } from "@/components/ui/ButtonWithIcon";
import Ionicons from "@expo/vector-icons/Ionicons";

interface NewItemModalProps {
    visible: boolean;
    onClose: () => void;
    onSave: (_title: string, _duration: number) => void;
}

const DURATION_OPTIONS = [
    { label: "15m", minutes: 15 },
    { label: "30m", minutes: 30 },
    { label: "45m", minutes: 45 },
    { label: "1hr", minutes: 60 },
    { label: "1hr 30m", minutes: 90 },
];

const NewItemModal = ({ visible, onClose, onSave }: NewItemModalProps) => {
    const insets = useSafeAreaInsets();
    const [title, setTitle] = useState("");
    const [selectedDuration, setSelectedDuration] = useState<number | null>(null);
    const [isDurationPickerVisible, setIsDurationPickerVisible] = useState(false);

    const handleSave = () => {
        if (title.trim() && selectedDuration) {
            onSave(title.trim(), selectedDuration);
            resetForm();
            onClose();
        }
    };

    const resetForm = () => {
        setTitle("");
        setSelectedDuration(null);
    };

    const handleClose = () => {
        resetForm();
        onClose();
    };

    return (
        <>
            <Modal
                visible={visible}
                animationType="slide"
                presentationStyle="formSheet"
            >
                <View style={[tw`flex-1 bg-white`, { paddingTop: insets.top }]}>
                    {/* Header */}
                    <View style={tw`px-4 py-4 flex-row items-center justify-between border-b border-gray-200`}>
                        <TouchableOpacity onPress={handleClose}>
                            <Text style={tw`text-gray-500 text-lg`}>Cancel</Text>
                        </TouchableOpacity>
                        <Text style={tw`text-xl font-semibold`}>New item</Text>
                        <View style={tw`w-16`} /> {/* Spacer for alignment */}
                    </View>

                    {/* Content */}
                    <View style={tw`px-4 pt-6 flex-1`}>
                        <View>
                            <Text style={tw`text-base font-medium text-gray-600 mb-2`}>What?</Text>
                            <TextInput
                                style={tw`border-b border-gray-300 py-2 text-lg text-gray-900`}
                                placeholder="Enter task title"
                                value={title}
                                onChangeText={setTitle}
                                autoFocus
                            />
                        </View>

                        <View style={tw`mt-8`}>
                            <View style={tw`flex-row items-center justify-between mb-4`}>
                                <Text style={tw`text-base font-medium text-gray-600`}>How long?</Text>
                                <TouchableOpacity onPress={() => setIsDurationPickerVisible(true)}>
                                    <Text style={tw`text-purple-500 font-medium`}>More...</Text>
                                </TouchableOpacity>
                            </View>
                            <View style={tw`flex-row justify-between bg-gray-100 rounded-2xl p-1`}>
                                {DURATION_OPTIONS.map((option) => (
                                    <TouchableOpacity
                                        key={option.label}
                                        style={[
                                            tw`flex-1 py-3 rounded-xl items-center`,
                                            selectedDuration === option.minutes && tw`bg-white shadow`
                                        ]}
                                        onPress={() => setSelectedDuration(option.minutes)}
                                    >
                                        <Text style={[
                                            tw`text-base font-medium`,
                                            selectedDuration === option.minutes ? tw`text-gray-950` : tw`text-gray-500`
                                        ]}>
                                            {option.label}
                                        </Text>
                                    </TouchableOpacity>
                                ))}
                            </View>
                        </View>
                    </View>

                    {/* Footer */}
                    <View style={tw`px-4 pb-8`}>
                        <ButtonWithIcon
                            label="Add to backlog"
                            onPress={handleSave}
                            iconPosition="right"
                            fullWidth
                            icon={<Ionicons name="arrow-forward" size={24} style={tw`text-white`} />}
                            disabled={!title.trim() || !selectedDuration}
                        />
                    </View>
                </View>
            </Modal>

            <DurationPickerBottomSheet
                visible={isDurationPickerVisible}
                onClose={() => setIsDurationPickerVisible(false)}
                onDurationSelected={(minutes) => {
                    setSelectedDuration(minutes);
                    setIsDurationPickerVisible(false);
                }}
            />
        </>
    );
};

export default NewItemModal;
