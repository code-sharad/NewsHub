import type { Metadata } from "next";
import { Geist_Mono, Geist, Libre_Baskerville } from "next/font/google"
import "./globals.css";
import { ThemeProvider } from '@/contexts/theme-context'
import { SessionProvider } from '@/components/providers/session-provider'
import { QueryProvider } from '@/lib/providers/query-provider'
import { Toaster } from "@/components/ui/toaster"
import Script from "next/script"

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
const libreBaskerville = Libre_Baskerville({
  subsets: ["latin"],
  variable: "--font-serif",
  weight: ["400", "700"],
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
        className={`${geistSans.variable} ${geistMono.variable} ${libreBaskerville.variable} antialiased`}
      >
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-1JTZK943GC"
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-1JTZK943GC');
          `}
        </Script>
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
