const DayStructureToStr: Record<IOnboardingInfo["dayStructure"], string> = {
    "morning": "Early Bird",
    "night": "Night Owl",
    "mixed": "Paced Planner"
};

export const convertDayStructureToStr = (dayStructure: IOnboardingInfo["dayStructure"]) => {
    return DayStructureToStr[dayStructure];
};