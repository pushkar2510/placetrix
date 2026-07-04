"use client";

import React, { createContext, useContext } from "react";
import type { LicenseStatus, InstituteLicense } from "@/lib/supabase/license";

// Re-export types for client usage without importing the server module directly
export type { LicenseStatus, InstituteLicense };

interface LicenseContextValue {
  license: InstituteLicense | null;
  isActive: boolean;
  isAdmin: boolean;
}

const LicenseContext = createContext<LicenseContextValue>({
  license: null,
  isActive: false,
  isAdmin: false,
});

interface LicenseProviderProps {
  children: React.ReactNode;
  license: InstituteLicense | null;
  isAdmin: boolean;
}

export function LicenseProvider({ children, license, isAdmin }: LicenseProviderProps) {
  const isActive = isAdmin || license?.status === "active";

  return (
    <LicenseContext.Provider value={{ license, isActive, isAdmin }}>
      {children}
    </LicenseContext.Provider>
  );
}

export function useLicense(): LicenseContextValue {
  return useContext(LicenseContext);
}
