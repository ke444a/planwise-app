type ActivityPriority = "must_do" | "get_it_done" | "nice_to_have" | "routine";
type ActivityType = "focus_work" | "collaborative_work" | "repetitive_tasks" | "health_fitness" | "food" | "recreation" | "education" | "life_maintenance" | "misc";

interface ISubtask {
    id: string;
    title: string;
    isCompleted: boolean;
}

interface IActivity {
    id?: string;
    title: string;
    startTime: string;
    endTime: string;
    duration: number;
    staminaCost: number;
    priority: ActivityPriority;
    type: ActivityType;
    isCompleted: boolean;
    subtasks?: ISubtask[];
}
type ActivityDetails = Omit<IActivity, "isCompleted" | "id">;

interface IBacklogDraft {
    id?: string;
    title: string;
    duration: number;
    isCompleted: boolean;
    itemType: "draft";
    subtasks: ISubtask[];
    createdAt?: any;
    updatedAt?: any;
}
interface IBacklogActivity extends IActivity {
    itemType: "activity";
    createdAt?: any;
    updatedAt?: any;
}
type IBacklogItem = IBacklogDraft | IBacklogActivity;
