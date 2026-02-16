import { createContext } from 'react';
import { User as FirebaseUser } from 'firebase/auth';

export type AppRole = 'admin' | 'student';

export interface AuthContextType {
  user: FirebaseUser | null;
  role: AppRole | null;
  loading: boolean;
  signUp: (email: string, password: string, fullName: string) => Promise<{ error: Error | null }>;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);
