import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'IELTS Prep.AI',
  description: 'IELTS Speaking Practice with AI',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
