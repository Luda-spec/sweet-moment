'use client';

import { useEffect } from "react";
import { useUserStore } from "@/store/user";

export const UserProvider = () => {
  const fetchUser = useUserStore((s) => s.fetchUser);

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  return null;
};