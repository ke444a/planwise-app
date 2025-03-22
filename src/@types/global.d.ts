interface IAudioUri {
    uri: string;
    timestamp: number;
}

interface IChatMessage {
    role: "user" | "model";
    content: string;
    timestamp: number;
}

interface IActivityGenAI {
    title: string;
    estimated_duration: number;
    subtasks?: string[];
}

interface IBacklogItemGenAI {
    title: string;
    estimated_duration: number;
    subtasks?: string[];
}
