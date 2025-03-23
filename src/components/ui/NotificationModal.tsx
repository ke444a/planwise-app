import { View, Text, Modal, TouchableOpacity } from "react-native";
import tw from "twrnc";
import { Ionicons } from "@expo/vector-icons";

interface NotificationModalProps {
    isVisible: boolean;
    onClose: () => void;
    message?: string;
}

const DEFAULT_MESSAGE = "You're pushing it! Your stamina is maxed out. It's time to focus on the most important things. You can add more activities to your backlog.";

export const NotificationModal = ({ 
    isVisible, 
    onClose, 
    message = DEFAULT_MESSAGE
}: NotificationModalProps) => {
    return (
        <Modal
            animationType="fade"
            transparent={true}
            visible={isVisible}
            onRequestClose={onClose}
        >
            <TouchableOpacity 
                style={tw`flex-1 justify-center items-center bg-black bg-opacity-50`}
                activeOpacity={1}
                onPress={onClose}
            >
                <View style={tw`bg-white rounded-2xl p-6 m-4 w-80 items-center shadow-lg`}>
                    <Ionicons 
                        name="warning"
                        size={48} 
                        style={tw`text-orange-500 mb-4`}
                    />
                    <Text style={tw`text-center text-base text-gray-700 mb-6`}>
                        {message}
                    </Text>
                    <TouchableOpacity
                        onPress={onClose}
                        style={tw`bg-gray-100 rounded-full px-6 py-3`}
                    >
                        <Text style={tw`text-gray-700 font-medium`}>Got it</Text>
                    </TouchableOpacity>
                </View>
            </TouchableOpacity>
        </Modal>
    );
}; 