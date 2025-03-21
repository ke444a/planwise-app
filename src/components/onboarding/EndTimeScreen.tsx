import { useState } from "react";
import { View, Text } from "react-native";
import tw from "twrnc";
import { ButtonWithIcon } from "@/components/ui/ButtonWithIcon";
import TimePicker from "@/components/onboarding/TimePicker";
import { Ionicons } from "@expo/vector-icons";

interface EndTimeScreenProps {
    onNextPress: (_time: string) => void;
}

const EndTimeScreen: React.FC<EndTimeScreenProps> = ({ onNextPress }) => {
    const [selectedTime, setSelectedTime] = useState("21:00");

    const handleNextPress = () => {
        onNextPress(selectedTime);
    };

    return (
        <View style={tw`flex-1 justify-between`}>
            <View>
                <Text style={tw`text-3xl font-semibold text-gray-950 mb-3 max-w-[70%]`}>
                        When do You Want to Finish Your Day?
                </Text>
                <Text style={tw`text-lg text-gray-500 font-medium mb-8`}>
                        I won't schedule anything past this time - your evenings are yours!
                </Text>
                <TimePicker 
                    initialTime={selectedTime}
                    onTimeSelected={setSelectedTime}
                    mode="evening"
                />
            </View>
                
            <View style={tw`mt-4`}>
                <ButtonWithIcon
                    label="Next"
                    onPress={handleNextPress}
                    iconPosition="left"
                    fullWidth
                    icon={<Ionicons name="arrow-forward" size={24} style={tw`text-gray-950`} />}
                    disabled={selectedTime === ""}
                />
            </View>
        </View>
    );
};

export default EndTimeScreen; 