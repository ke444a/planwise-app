import ErrorModal from "@/components/ui/ErrorModal";
import { createContext, ReactNode, useCallback, useContext, useState } from "react";
// import firestore from "@react-native-firebase/firestore";
// import { useUserStore } from "@/config/store/userStore";

export interface IError {
    message?: string;
    code?: string;
    debug?: string;
    error?: any;
}

type AppContextType = {
  error: IError | null;
  setError: (_error: IError) => void;
  setRetryCallback: (_callback: () => void) => void;
};

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider = ({ children }: { children: ReactNode }) => {
    // const { user } = useUserStore();
    const [error, setErrorState] = useState<IError | null>(null);
    const [retryCallback, setRetryCallbackState] = useState<() => void>(() => () => {});

    // useEffect(() => {
    //     const logError = async () => {
    //         const replacer = (_key: string, value: any) => {
    //             if (value instanceof Error) {
    //                 return {
    //                     message: value.message,
    //                     stack: value.stack,
    //                     name: value.name
    //                 };
    //             }
    //             return value;
    //         };
    //     };

    //     logError();
    // }, [error, user]);

    const onModalClose = () => {
        if (retryCallback) {
            retryCallback();
        }
        setErrorState(null);
        setRetryCallbackState(() => () => {});
    };

    const setError = useCallback((error: IError) => {
        setErrorState(error);
    }, [setErrorState]);

    const setRetryCallback = useCallback((callback: () => void) => {
        setRetryCallbackState(() => callback);
    }, [setRetryCallbackState]);

    const value = {
        error,
        setError,
        setRetryCallback
    };

    return (
        <AppContext.Provider value={value}>
            {children}
            {error && error.code && error.message && <ErrorModal error={error} handleModalClose={onModalClose} />}
        </AppContext.Provider>
    );
};

export const useAppContext = () => {
    const context = useContext(AppContext);
    if (context === undefined) {
        throw new Error("useAppContext must be used within a AppProvider");
    }
    return context;
};
