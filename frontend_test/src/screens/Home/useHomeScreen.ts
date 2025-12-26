
import { useState } from 'react';

export type RunningMode = '측정' | '티어' | '고스트';

export const useHomeScreen = () => {
    const [activeMode, setActiveMode] = useState<RunningMode>('측정');

    const handleModeChange = (mode: RunningMode) => {
        setActiveMode(mode);
    };

    return {
        activeMode,
        handleModeChange,
    };
};
