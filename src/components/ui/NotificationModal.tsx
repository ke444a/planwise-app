import { View, Text, Modal, TouchableOpacity } from "react-native";
import tw from "twrnc";
import { Ionicons } from "@expo/vector-icons";

interface NotificationModalProps {
    isVisible: boolean;
    onClose: () => void;
    message?: string;
}

const DEFAULT_MESSAGE = "Your stamina is maxed out! It's time to set priorities and focus on the most important things.";

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
                        size={72} 
                        style={tw`text-red-400 mb-2`}
                    />
                    <Text style={tw`text-center text-lg text-gray-950 mb-6`}>
                        {message}
                    </Text>
                    <TouchableOpacity
                        onPress={onClose}
                        style={tw`bg-gray-100 rounded-lg px-6 py-3`}
                    >
                        <Text style={tw`text-gray-950 font-medium text-center text-base`}>OK</Text>
                    </TouchableOpacity>
                </View>
            </TouchableOpacity>
        </Modal>
    );
}; 