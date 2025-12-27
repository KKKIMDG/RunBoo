import React, { createContext, useContext, useState, useCallback } from 'react';

export type NavTab = '홈' | '코스' | '도전' | '통계';

interface NavigationContextType {
  activeTab: NavTab;
  setActiveTab: (tab: NavTab) => void;
}

const NavigationContext = createContext<NavigationContextType | undefined>(undefined);

export function NavigationProvider({ children }: { children: React.ReactNode }) {
  const [activeTab, setActiveTab] = useState<NavTab>('홈');

  return (
    <NavigationContext.Provider value={{ activeTab, setActiveTab }}>
      {children}
    </NavigationContext.Provider>
  );
}

export function useNavigation() {
  const context = useContext(NavigationContext);
  if (context === undefined) {
    throw new Error('useNavigation must be used within NavigationProvider');
  }
  return context;
}
