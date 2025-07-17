'use client';

import { AuthProvider } from '@/hooks/useAuth';

export default function AuthProviderComponent({ children }: { children: React.ReactNode }) {
  return <AuthProvider>{children}</AuthProvider>;
}