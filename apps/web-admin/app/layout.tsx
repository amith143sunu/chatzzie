import './globals.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Chatzie Admin Backoffice',
  description: 'Enterprise Administration Portal for Chatzie Voice & Video Platform',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-slate-50 antialiased selection:bg-blue-600 selection:text-white">
        {children}
      </body>
    </html>
  );
}
