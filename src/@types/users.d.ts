interface IUser {
    email?: string | null;
    fullName?: string | null;
    photoURL?: string | null;
    onboardingInfo: IOnboardingInfo | null;
}

interface IOnboardingInfo {
    startDayTime: string;
    endDayTime: string;
    dayStructure: "morning" | "night" | "mixed";
    priorityActivities: string[];
}
