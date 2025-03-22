import { randomUUID } from "expo-crypto";

export const createNewSubtask = (subtaskInput: string): ISubtask => {
    return {
        id: randomUUID().slice(0, 8),
        title: subtaskInput.trim(),
        isCompleted: false
    };
};