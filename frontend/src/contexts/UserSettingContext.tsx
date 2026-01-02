// contexts/UserSettingContext.tsx
import React, { createContext, useContext, useState } from 'react';
import { UserSetting } from '@/types/userSetting';

type UserSettingContextValue = {
    settings: UserSetting | null;
    setSettings: React.Dispatch<React.SetStateAction<UserSetting | null>>;
    reset: () => void;
};

const UserSettingContext = createContext<UserSettingContextValue | null>(null);

export function UserSettingProvider({ children }: { children: React.ReactNode }) {
    const [settings, setSettings] = useState<UserSetting | null>(null);

    const reset = () => setSettings(null);

    return (
        <UserSettingContext.Provider value={{ settings, setSettings, reset }}>
            {children}
        </UserSettingContext.Provider>
    );
}

export function useUserSettingContext() {
    const ctx = useContext(UserSettingContext);
    if (!ctx) {
        throw new Error('UserSettingContext not found');
    }
    return ctx;
}
