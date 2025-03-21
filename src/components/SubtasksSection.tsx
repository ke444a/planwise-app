import SubtasksList from "@/components/SubtasksList";

interface SubtasksSectionProps {
    subtasks: ISubtask[];
    subtaskInput: string;
    onSubtaskInputChange: (_text: string) => void;
    onSubtaskSubmit: () => void;
    onSubtaskRemove: (_id: string) => void;
}

export const SubtasksSection = ({
    subtasks,
    subtaskInput,
    onSubtaskInputChange,
    onSubtaskSubmit,
    onSubtaskRemove
}: SubtasksSectionProps) => {
    return (
        <SubtasksList
            subtasks={subtasks}
            subtaskInput={subtaskInput}
            onSubtaskInputChange={onSubtaskInputChange}
            onSubtaskSubmit={onSubtaskSubmit}
            onSubtaskRemove={onSubtaskRemove}
        />
    );
}; 