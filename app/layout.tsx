import type { Metadata } from "next";
import { Instrument_Serif, Inter } from "next/font/google";
import { Toaster } from "sonner";
import "./globals.css";
import { cn } from "@/lib/utils";
import AppShell from "./app-shell";
import { QueryProvider } from "./query-provider";

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
      className={cn("h-full", instrumentSerif.variable, inter.variable)}
    >
      <body className="min-h-full bg-background text-foreground antialiased font-sans">
        <QueryProvider>
          <AppShell>{children}</AppShell>
        </QueryProvider>
        <Toaster richColors position="top-right" />
      </body>
    </html>
  );
}
