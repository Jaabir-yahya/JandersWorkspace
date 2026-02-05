import './globals.css';
import { ClientProviders } from '@/components/ClientProviders';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-savanna-50/80">
        <ClientProviders>{children}</ClientProviders>
      </body>
    </html>
  );
}
