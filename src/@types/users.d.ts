interface IUser {
    email?: string | null;
    fullName?: string | null;
    photoURL?: string | null;
    onboardingInfo: IOnboardingInfo | null;
    maxStamina: number;
}

interface IOnboardingInfo {
    startDayTime: string;
    endDayTime: string;
    dayStructure: "morning" | "night" | "mixed";
    priorityActivities: string[];
}
