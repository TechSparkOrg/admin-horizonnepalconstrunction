import type { Metadata } from "next";
import { Instrument_Serif, Inter } from "next/font/google";
import { Toaster } from "sonner";
import "./globals.css";
import { cn } from "@/lib/utils";
import AppShell from "./app-shell";
import { QueryProvider } from "./query-provider";
import { AuthProvider } from "./auth-provider";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });

const instrumentSerif = Instrument_Serif({
  subsets: ["latin"],
  weight: ["400"],
  variable: "--font-serif",
});

export const metadata: Metadata = {
  title: "Amin Construction",
  description: "Amin Construction Admin Panel",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      data-scroll-behavior="smooth"
      className={cn("h-full", instrumentSerif.variable, inter.variable)}
    >
      <body className="min-h-full bg-background text-foreground antialiased font-sans">
        <link rel="preconnect" href="https://assets.horizonnepalconstruction.com" />
        <QueryProvider>
          <AuthProvider>
            <AppShell>{children}</AppShell>
          </AuthProvider>
        </QueryProvider>
        <Toaster richColors position="top-right" />
      </body>
    </html>
  );
}
