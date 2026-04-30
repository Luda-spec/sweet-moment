import { create } from "zustand";

interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
}

interface UserStore {
  user: User | null;
  isLoading: boolean;

  setUser: (user: User | null) => void;
  fetchUser: () => Promise<void>;
}

export const useUserStore = create<UserStore>((set) => ({
  user: null,
  isLoading: true,

  setUser: (user) => set({ user }),

  fetchUser: async () => {
    try {
      set({ isLoading: true });

      const res = await fetch("/api/me");

      if (!res.ok) {
        set({ user: null, isLoading: false });
        return;
      }

      const data = await res.json();

      set({
        user: data,
        isLoading: false,
      });
    } catch (e) {
      console.error("USER FETCH ERROR", e);
      set({ user: null, isLoading: false });
    }
  },
}));