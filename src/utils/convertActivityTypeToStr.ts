const ActivityTypeToStr: Record<ActivityType, string> = {
    "focus_work": "Focus Work",
    "collaborative_work": "Collaborative Work",
    "repetitive_tasks": "Repetitive Tasks",
    "health_fitness": "Health & Fitness",
    "food": "Food",
    "recreation": "Recreation",
    "education": "Education",
    "life_maintenance": "Life Maintenance",
    "misc": "Misc"
};

export const convertActivityTypeToStr = (activityCodes: ActivityType[]) => {
    return activityCodes.map((code) => ActivityTypeToStr[code]);
};
