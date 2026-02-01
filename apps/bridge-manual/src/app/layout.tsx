import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { TenantProvider } from "@/context/TenantContext";
import { ClientLayout } from "@/components/ClientLayout";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Project Bridge - Business Management",
  description: "Simple business management for African informal economy",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <TenantProvider>
          <ClientLayout>{children}</ClientLayout>
        </TenantProvider>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var theme = localStorage.getItem('theme') || 'light';
                  var el = document.getElementById('theme-wrapper');
                  if (el) el.classList.add(theme);
                } catch (e) {}
              })();
            `,
          }}
        />
      </body>
    </html>
  );
}
