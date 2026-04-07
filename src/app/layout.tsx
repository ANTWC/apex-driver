import type { Metadata, Viewport } from 'next';
import { AuthProvider } from '@/components/AuthProvider';
import './globals.css';

export const metadata: Metadata = {
  title: 'APEX Driver — Your Master Tech in Your Pocket',
  description: 'AI-powered automotive guidance for everyday car owners. Warning lights, recall checks, maintenance schedules, and expert diagnostics.',
  manifest: '/manifest.json',
  icons: {
    icon: '/images/apex-driver-icon.png',
    apple: '/images/apex-driver-icon.png',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  themeColor: '#0a0a14',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full">
      <body className="min-h-full flex flex-col">
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
