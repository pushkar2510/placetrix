"use client";

import React, { createContext, useContext } from "react";
import type { LicenseStatus, InstituteLicense } from "@/lib/supabase/license";
import type { UserProfile } from "@/lib/supabase/profile";

// Re-export types for client usage without importing the server module directly
export type { LicenseStatus, InstituteLicense };

interface LicenseContextValue {
  license: InstituteLicense | null;
  isActive: boolean;
  isAdmin: boolean;
  user: UserProfile | null;
}

const LicenseContext = createContext<LicenseContextValue>({
  license: null,
  isActive: false,
  isAdmin: false,
  user: null,
});

interface LicenseProviderProps {
  children: React.ReactNode;
  license: InstituteLicense | null;
  isAdmin: boolean;
  user: UserProfile | null;
}

export function LicenseProvider({ children, license, isAdmin, user }: LicenseProviderProps) {
  const isActive = isAdmin || license?.status === "active";

  return (
    <LicenseContext.Provider value={{ license, isActive, isAdmin, user }}>
      {children}
    </LicenseContext.Provider>
  );
}

export function useLicense(): LicenseContextValue {
  return useContext(LicenseContext);
}
