import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import AuthProviderComponent from '@/components/AuthProvider';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'FreelanceTracker - Professional Time Tracking',
  description: 'Professional time tracking and management system for freelancers and project managers',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <AuthProviderComponent>
          {children}
        </AuthProviderComponent>
      </body>
    </html>
  );
}