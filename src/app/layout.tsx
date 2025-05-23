import type { Metadata } from "next";
import { Geist_Mono, Geist } from "next/font/google"
import "./globals.css";
import { ThemeProvider } from '@/contexts/theme-context'
import { SessionProvider } from '@/components/providers/session-provider'
import { QueryProvider } from '@/lib/providers/query-provider'
import { Toaster } from "@/components/ui/toaster"

const geistSans = Geist({
  subsets: ["latin"],
  variable: "--font-geist-sans",
  weight: ["200", "300", "400", "500", "600", "700", "800"],
});
const geistMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-geist-mono",
  weight: ["200", "300", "400", "500", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: "NewsHub - Your Shortcut to News",
  description: "Stay informed with the latest news from multiple sources in one beautiful interface.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <QueryProvider>
          <ThemeProvider>
            <SessionProvider>
              {children}
              <Toaster />
            </SessionProvider>
          </ThemeProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
