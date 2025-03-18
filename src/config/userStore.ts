import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";

interface IUserState extends IUser {
    uid: string;
    token: string;
}

interface UserState {
    user: IUserState | null;
    setUser: (_user: IUserState | null) => void;
    updateUser: (_userData: Partial<IUserState>) => void;
}

export const useUserStore = create<UserState>()(
    persist(
        (set) => ({
            user: null,
            setUser: (user) => set({ user }),
            updateUser: (userData) => set((state) => ({ user: state.user ? { ...state.user, ...userData } : null })),
        }),
        {
            name: "user-storage",
            storage: createJSONStorage(() => AsyncStorage),
        }
    )
);
