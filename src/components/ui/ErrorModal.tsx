import { Modal, Text, View } from "react-native";
import tw from "twrnc";
import FontAwesome6 from "@expo/vector-icons/FontAwesome6";
import { ButtonWithIcon } from "./ButtonWithIcon";
import { IError } from "@/context/AppContext";

interface Props {
    error: IError;
    handleModalClose: () => void;
}

const ErrorModal = (props: Props) => {
    return (
        <Modal
            animationType="slide"
            visible={true}
            presentationStyle="fullScreen"
            testID="error-modal"
        >
            <View
                style={tw`absolute top-0 w-full h-full px-6 flex items-center justify-center bg-white`}
            >
                <View style={tw`my-auto items-center`}>
                    <FontAwesome6 name="calendar-times" size={100} style={tw`text-rose-500`} />
                    <Text
                        style={tw`text-xl text-center mt-6 max-w-[80%] font-medium`}
                    >
                        {props.error?.message || "Something went wrong. Please try again later."}
                    </Text>
                </View>
                <View style={tw`w-full mt-auto mb-10`}>
                    <ButtonWithIcon
                        label="OK"
                        onPress={props.handleModalClose}
                        fullWidth
                        variant="error"
                        // icon={<FontAwesome name="check" size={20} color="white" />}
                    />
                </View>
            </View>
        </Modal>
    );
};

export default ErrorModal;
