import { PRIORITY_OPTIONS } from "@/libs/constants";

export const getPriorityLabel = (priority: ActivityPriority) => {
    const priorityOption = PRIORITY_OPTIONS.find(p => p.value === priority);
    return priorityOption ? `${priorityOption.emoji} ${priorityOption.label}` : "";
};