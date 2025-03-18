export const convertFromJsonToActivity = (json: any): IActivity[] => {
    const activities: IActivity[] = [];
    json.forEach((activity: any) => {
        activities.push({
            id: activity.id,
            title: activity.title,
            startTime: activity.start_time,
            endTime: activity.end_time,
            duration: activity.duration,
            staminaCost: activity.stamina_cost,
            priority: activity.priority,
            type: activity.category,
            isCompleted: false,
            subtasks: []
        });
    });
    return activities;
};