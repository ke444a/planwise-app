export const ACTIVITY_TYPES: ActivityType[] = [
    "focus_work",
    "collaborative_work",
    "repetitive_tasks",
    "health_fitness",
    "food",
    "recreation",
    "education",
    "life_maintenance",
    "misc"
];

export const ACTIVITY_PRIORITIES: ActivityPriority[] = [
    "must_do",
    "get_it_done",
    "nice_to_have",
];

export const ACTIVITY_STAMINA_COSTS: number[] = [
    0,
    1,
    2,
    4,
    6,
    8,
    10,
    15,
];

export const ACTIVITY_TYPE_TO_STR: Record<ActivityType, string> = {
    "focus_work": "Focus Work",
    "collaborative_work": "Collaborative Work",
    "repetitive_tasks": "Repetitive Tasks",
    "health_fitness": "Health & Fitness",
    "food": "Food",
    "recreation": "Recreation",
    "education": "Education",
    "life_maintenance": "Life Maintenance",
    "misc": "Miscellaneous"
};

export const DAY_STRUCTURE_TO_STR: Record<IOnboardingInfo["dayStructure"], string> = {
    "morning": "Early Bird",
    "night": "Night Owl",
    "mixed": "Paced Planner"
};

export interface IPriorityOption {
    value: ActivityPriority;
    label: string;
    emoji: string;
}

export const PRIORITY_OPTIONS: IPriorityOption[] = [
    {
        value: "must_do",
        label: "Must Do Now",
        emoji: "🔥"
    },
    {
        value: "get_it_done",
        label: "Get It Done",
        emoji: "💪"
    },
    {
        value: "nice_to_have",
        label: "Nice to Do",
        emoji: "📍"
    },
    {
        value: "routine",
        label: "Routine",
        emoji: "🔄"
    }
];