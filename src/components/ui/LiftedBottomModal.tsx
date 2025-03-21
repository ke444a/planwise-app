import {
    Modal,
    View,
    TouchableWithoutFeedback,
} from "react-native";
import tw from "twrnc";

interface Props {
    visible: boolean;
    onClose: () => void;
    children: React.ReactNode;
}

const LiftedBottomModal = ({ visible, onClose, children }: Props) => {
    return (
        <Modal
            visible={visible}
            transparent={true}
            animationType="slide"
            onRequestClose={onClose}
        >
            <TouchableWithoutFeedback onPress={onClose}>
                <View style={tw`flex-1 justify-end bg-black/30`}>
                    <TouchableWithoutFeedback>
                        <View style={tw`bg-white rounded-3xl mx-4 mb-12 shadow-lg`}>
                            {children}
                        </View>
                    </TouchableWithoutFeedback>
                </View>
            </TouchableWithoutFeedback>
        </Modal>
    );
};

export default LiftedBottomModal; 