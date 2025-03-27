import { useState, useEffect, useCallback } from "react";
import { Dimensions, View } from "react-native";
import { router } from "expo-router";
import tw from "twrnc";
import { LinearGradient } from "expo-linear-gradient";
import Animated, { 
    useSharedValue, 
    useAnimatedStyle, 
    withTiming,
    Easing
} from "react-native-reanimated";
import { StartTimeScreen, EndTimeScreen, DayStructureScreen, PriorityActivityScreen } from "@/components/onboarding";
import { useUploadOnboardingInfoMutation } from "@/api/users/uploadOnboardingInfo";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useAppContext } from "@/context/AppContext";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

const OnboardingScreen = () => {
    const insets = useSafeAreaInsets();
    const { mutate: uploadOnboardingInfo } = useUploadOnboardingInfoMutation();
    const [currentStep, setCurrentStep] = useState(0);
    const [visibleStep, setVisibleStep] = useState(0);
    const [isAnimating, setIsAnimating] = useState(false);
    const [onboardingData, setOnboardingData] = useState<Partial<IOnboardingInfo>>({});
    const { setError } = useAppContext();

    const slideAnim = useSharedValue(0);
    const opacityAnim = useSharedValue(1);

    const animateToNextStep = useCallback((nextStep: number) => {
        if (isAnimating) return;
        
        setIsAnimating(true);
        const direction = nextStep > visibleStep ? -1 : 1;
        
        // Animate out
        opacityAnim.value = withTiming(0, { 
            duration: 200,
            easing: Easing.out(Easing.ease)
        });
        
        slideAnim.value = withTiming(SCREEN_WIDTH * 0.1 * direction, { 
            duration: 200,
            easing: Easing.out(Easing.ease)
        });
        
        setTimeout(() => {
            setVisibleStep(nextStep);
            slideAnim.value = SCREEN_WIDTH * -0.1 * direction;
            
            // Small delay before animating in
            setTimeout(() => {
                opacityAnim.value = withTiming(1, { 
                    duration: 200,
                    easing: Easing.in(Easing.ease)
                });
                
                slideAnim.value = withTiming(0, { 
                    duration: 200,
                    easing: Easing.in(Easing.ease)
                });
                
                // Set animation complete after animation duration
                setTimeout(() => {
                    setIsAnimating(false);
                }, 250);
            }, 50);
        }, 250);
    }, [visibleStep, isAnimating, slideAnim, opacityAnim]);

    useEffect(() => {
        if (currentStep !== visibleStep && !isAnimating) {
            animateToNextStep(currentStep);
        }
    }, [currentStep, visibleStep, animateToNextStep, isAnimating]);

    const handleStepComplete = (data: any) => {
        if (isAnimating) return;
        
        const dataTypeByStep = [
            "startDayTime",
            "endDayTime",
            "dayStructure",
            "priorityActivities"
        ];

        const dataType = dataTypeByStep[visibleStep];
        const updatedData = { ...onboardingData, [dataType]: data };
        setOnboardingData(updatedData);
        
        if (visibleStep < 3) {
            setCurrentStep(visibleStep + 1);
        } else {
            if (!updatedData.startDayTime || !updatedData.endDayTime || !updatedData.dayStructure || !updatedData.priorityActivities) return;
            uploadOnboardingInfo(
                updatedData as IOnboardingInfo,
                {
                    onSuccess: () => {
                        router.replace("/(app)");
                    },
                    onError: (error) => {
                        setError({
                            message: "Something went wrong while uploading onboarding details. Please try again later.",
                            debug: "OnboardingScreen: handleStepComplete: Error uploading onboarding info.",
                            error: error
                        });
                    }
                }
            );
        }
    };

    const animatedStyle = useAnimatedStyle(() => {
        return {
            opacity: opacityAnim.value,
            transform: [{ translateX: slideAnim.value }]
        };
    });

    return (
        <View style={tw`flex-1`}>
            <LinearGradient
                colors={["#F9F4F5", "#F3E8FF", "#F9F4F5"]}
                locations={[0.3, 0.5, 0.7]}
                style={tw`absolute w-full h-full`}
            />
            <Animated.View style={[tw`flex-1 px-6`, animatedStyle, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
                {visibleStep === 0 && <StartTimeScreen onNextPress={handleStepComplete} />}
                {visibleStep === 1 && <EndTimeScreen onNextPress={handleStepComplete} />}
                {visibleStep === 2 && <DayStructureScreen onNextPress={handleStepComplete} />}
                {visibleStep === 3 && <PriorityActivityScreen onNextPress={handleStepComplete} />}
            </Animated.View>
        </View>
    );
};

export default OnboardingScreen;
