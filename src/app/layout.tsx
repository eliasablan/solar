import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Gravity Simulator',
  description: 'Solar System Gravity Simulator',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="m-0 p-0 overflow-hidden bg-black text-white">
        {children}
      </body>
    </html>
  );
}
