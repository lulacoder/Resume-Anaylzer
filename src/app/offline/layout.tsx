import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: "You're Offline | Resume Analyzer",
  description: 'No internet connection. Please check your network and try again.',
};

export default function OfflineLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
