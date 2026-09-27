'use client';

import { createContext, useContext, useMemo, useState } from 'react';

type FamilyContextValue = {
  familyId: string;
  setFamilyId: (value: string) => void;
};

const FamilyContext = createContext<FamilyContextValue | undefined>(undefined);
const DEFAULT_FAMILY_ID = '00000000-0000-0000-0000-000000000001';

export function FamilyProvider({ children }: { children: React.ReactNode }) {
  const [familyId, setFamilyId] = useState<string>(() => {
    if (typeof window === 'undefined') return DEFAULT_FAMILY_ID;
    return window.localStorage.getItem('family-hierarchy-selected-family-id') ?? DEFAULT_FAMILY_ID;
  });

  const value = useMemo(
    () => ({
      familyId,
      setFamilyId: (next: string) => {
        setFamilyId(next);
        window.localStorage.setItem('family-hierarchy-selected-family-id', next);
      },
    }),
    [familyId],
  );

  return <FamilyContext.Provider value={value}>{children}</FamilyContext.Provider>;
}

export function useFamilyContext() {
  const context = useContext(FamilyContext);
  if (!context) {
    throw new Error('useFamilyContext must be used within FamilyProvider');
  }
  return context;
}
