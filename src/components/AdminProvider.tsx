"use client";

import { createContext, useContext, type ReactNode } from "react";

type AdminContextValue = { isAdmin: boolean };

// default false: components using useAdmin render the visitor view when no
// provider is mounted (e.g. in isolation tests)
const AdminContext = createContext<AdminContextValue>({ isAdmin: false });

export function AdminProvider({
  isAdmin,
  children,
}: {
  isAdmin: boolean;
  children: ReactNode;
}) {
  return <AdminContext.Provider value={{ isAdmin }}>{children}</AdminContext.Provider>;
}

export function useAdmin() {
  return useContext(AdminContext);
}
