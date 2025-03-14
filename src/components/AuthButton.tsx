import { ReactNode } from "react";
import { ButtonWithIcon } from "./ButtonWithIcon";

interface AuthButtonProps {
    onPress: () => void;
    icon: ReactNode;
    label: string;
}

const AuthButton = ({ onPress, icon, label }: AuthButtonProps) => {
    return (
        <ButtonWithIcon
            onPress={onPress}
            icon={icon}
            label={label}
            variant="secondary"
            fullWidth
        />
    );
};

export default AuthButton;
