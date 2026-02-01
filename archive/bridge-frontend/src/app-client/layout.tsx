import "../styles/nairobi-optimized.css";

// Nairobi-optimized global styles for African commerce
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>Project Bridge - African Commerce Platform</title>
      </head>
      <body className="font-mobile text-foreground bg-background">
        {children}
      </body>
    </html>
  );
}
