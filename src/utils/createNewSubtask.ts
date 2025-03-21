export const createNewSubtask = (subtaskInput: string): ISubtask => {
    return {
        id: Math.random().toString(36).substring(2, 8),
        title: subtaskInput.trim(),
        isCompleted: false
    };
};