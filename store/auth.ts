import { create } from 'zustand';

export type AuthModalMode = 'login' | 'register'; 

interface AuthStore {
  isOpen: boolean;
  mode: AuthModalMode;
  email: string;
  firstName: string;
  lastName: string;
  setIsOpen: (isOpen: boolean) => void;
  setMode: (mode: AuthModalMode) => void;
  setEmail: (email: string) => void;
  setFirstName: (firstName: string) => void;
  setLastName: (lastName: string) => void;
  resetForm: () => void;
}

export const useAuthStore = create<AuthStore>((set) => ({
  isOpen: false,
  mode: 'login',
  email: '',
  firstName: '',
  lastName: '',
  setIsOpen: (isOpen) => set({ isOpen }),
  setMode: (mode) => set({ mode }),
  setEmail: (email) => set({ email }),
  setFirstName: (firstName) => set({ firstName }),
  setLastName: (lastName) => set({ lastName }),
  resetForm: () => set({ 
    email: '', 
    firstName: '', 
    lastName: '',
    mode: 'login' 
  }),
}));