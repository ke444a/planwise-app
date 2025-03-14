import { useState, useRef, useEffect } from "react";
import { SafeAreaView, Animated, Dimensions } from "react-native";
import { router } from "expo-router";
import tw from "twrnc";
import StartTimeScreen from "../../../screens/onboarding/StartTimeScreen";
import EndTimeScreen from "../../../screens/onboarding/EndTimeScreen";
import DayStructureScreen from "../../../screens/onboarding/DayStructureScreen";
import PriorityActivityScreen from "../../../screens/onboarding/PriorityActivityScreen";
import { LinearGradient } from "expo-linear-gradient";

const { width } = Dimensions.get("window");

const saveToFirestore = async (collection: string, data: any) => {
    console.log(`Saving to ${collection}:`, data);
    // Simulate network delay but keep it short for smooth transitions
    await new Promise(resolve => setTimeout(resolve, 100));
    return { success: true };
};

const OnboardingScreen = () => {
    const [currentStep, setCurrentStep] = useState(0);
    const [visibleStep, setVisibleStep] = useState(0);
    const [isAnimating, setIsAnimating] = useState(false);
    const [onboardingData, setOnboardingData] = useState({
        startTime: "",
        endTime: "",
        dayStructure: "",
        priorityActivities: [] as string[]
    });

    // Animation values
    const slideAnim = useRef(new Animated.Value(0)).current;
    const opacityAnim = useRef(new Animated.Value(1)).current;

    // Handle step change with animation
    useEffect(() => {
        if (currentStep !== visibleStep && !isAnimating) {
            setIsAnimating(true);
            
            // Fade out current screen
            Animated.parallel([
                Animated.timing(opacityAnim, {
                    toValue: 0,
                    duration: 200,
                    useNativeDriver: true,
                }),
                Animated.timing(slideAnim, {
                    toValue: currentStep > visibleStep ? -width * 0.1 : width * 0.1,
                    duration: 200,
                    useNativeDriver: true,
                })
            ]).start(() => {
                // Only update the visible step after the fade out is complete
                setVisibleStep(currentStep);
                
                // Reset animation values
                slideAnim.setValue(currentStep > visibleStep ? width * 0.1 : -width * 0.1);
                
                // Small delay before fade in to ensure component switch is complete
                setTimeout(() => {
                    // Fade in new screen
                    Animated.parallel([
                        Animated.timing(opacityAnim, {
                            toValue: 1,
                            duration: 200,
                            useNativeDriver: true,
                        }),
                        Animated.timing(slideAnim, {
                            toValue: 0,
                            duration: 200,
                            useNativeDriver: true,
                        })
                    ]).start(() => {
                        setIsAnimating(false);
                    });
                }, 50); // Small delay to ensure component switch is complete
            });
        }
    }, [currentStep, visibleStep, isAnimating, opacityAnim, slideAnim]);

    // Save data for the current step and move to the next one
    const handleStepComplete = async (data: any) => {
        if (isAnimating) return;
        
        try {
            // Update local state with the new data
            const updatedData = { ...onboardingData, ...data };
            setOnboardingData(updatedData);
      
            // Save the specific data to Firestore (in background)
            const collectionName = getCollectionNameForStep(visibleStep);
            saveToFirestore(collectionName, data).catch(error => 
                console.error("Error saving to Firestore:", error)
            );
      
            // Move to the next step or complete onboarding immediately
            if (visibleStep < 3) {
                setCurrentStep(visibleStep + 1);
            } else {
                // Complete onboarding
                completeOnboarding(updatedData);
            }
        } catch (error) {
            console.error("Error handling step completion:", error);
        }
    };

    // Get the collection name based on the current step
    const getCollectionNameForStep = (step: number): string => {
        switch (step) {
        case 0: return "userStartTimes";
        case 1: return "userEndTimes";
        case 2: return "userDayStructures";
        case 3: return "userPriorityActivities";
        default: return "userPreferences";
        }
    };

    // Complete the onboarding process
    const completeOnboarding = async (data: any) => {
        try {
            // Save the complete onboarding data
            await saveToFirestore("userOnboarding", {
                ...data,
                completed: true,
                completedAt: new Date().toISOString()
            });
      
            router.replace("/(app)");
        } catch (error) {
            console.error("Error completing onboarding:", error);
        }
    };

    // Handle the start time selection
    const handleStartTimeSelected = (time: string) => {
        handleStepComplete({ startTime: time });
    };

    // Handle the end time selection
    const handleEndTimeSelected = (time: string) => {
        handleStepComplete({ endTime: time });
    };

    // Handle the day structure selection
    const handleDayStructureSelected = (structure: string) => {
        handleStepComplete({ dayStructure: structure });
    };

    // Handle the priority activities selection
    const handlePriorityActivitiesSelected = (activities: string[]) => {
        handleStepComplete({ priorityActivities: activities });
    };

    // Render the current step
    const renderStep = () => {
        // Always render the visibleStep, which only changes after fade out is complete
        switch (visibleStep) {
        case 0:
            return <StartTimeScreen onNextPress={handleStartTimeSelected} />;
        case 1:
            return <EndTimeScreen onNextPress={handleEndTimeSelected} />;
        case 2:
            return <DayStructureScreen onNextPress={handleDayStructureSelected} />;
        case 3:
            return <PriorityActivityScreen onNextPress={handlePriorityActivitiesSelected} />;
        default:
            return null;
        }
    };

    return (
        <SafeAreaView style={tw`flex-1`}>
            <LinearGradient
                colors={["#F9F4F5", "#F3E8FF", "#F9F4F5"]}
                locations={[0.3, 0.5, 0.7]}
                style={tw`absolute w-full h-full`}
            />
            <Animated.View 
                style={[
                    tw`flex-1`,
                    {
                        opacity: opacityAnim,
                        transform: [{ translateX: slideAnim }]
                    }
                ]}
            >
                {renderStep()}
            </Animated.View>
        </SafeAreaView>
    );
};

export default OnboardingScreen;
