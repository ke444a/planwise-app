import {
    View,
    Text,
    TouchableOpacity,
} from "react-native";
import tw from "twrnc";
import ActivityIcon from "@/components/activity/ActivityIcon";
import { ACTIVITY_TYPE_TO_STR, ACTIVITY_TYPES } from "@/libs/constants";
import BottomSheet from "@/components/ui/BottomSheet";

interface Props {
    visible: boolean;
    onClose: () => void;
    onTypeSelected: (_type: ActivityType) => void;
    selectedType: ActivityType;
}

const ActivityTypePickerBottomSheet = ({
    visible,
    onClose,
    onTypeSelected,
    selectedType,
}: Props) => {

    const handleTypeSelect = (type: ActivityType) => {
        onTypeSelected(type);
        onClose();
    };

    return (
        <BottomSheet visible={visible} onClose={onClose}>
            <View style={tw`flex-row flex-wrap px-4`}>
                {ACTIVITY_TYPES.map((type) => (
                    <TouchableOpacity
                        key={type}
                        style={tw`w-1/3 items-center mb-6`}
                        onPress={() => handleTypeSelect(type)}
                    >
                        <View style={tw`items-center`}>
                            <View style={[
                                tw`w-16 h-16 rounded-2xl items-center justify-center mb-2`,
                                type === selectedType ? tw`bg-purple-100` : tw`bg-gray-100`
                            ]}>
                                <ActivityIcon
                                    activityType={type}
                                    activityPriority="must_do"
                                    iconSize={28}
                                />
                            </View>
                            <Text style={tw`text-sm text-gray-600 text-center px-2`}>
                                {ACTIVITY_TYPE_TO_STR[type]}
                            </Text>
                        </View>
                    </TouchableOpacity>
                ))}
            </View>
        </BottomSheet>
    );
};

export default ActivityTypePickerBottomSheet; 