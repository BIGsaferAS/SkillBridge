import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/Providers";

const inter = Inter({ subsets: ["latin"] });

import { ThemeProvider } from "@/components/ThemeProvider"
import BackButton from "@/components/BackButton"
import RightClickHelp from "@/components/RightClickHelp"

export const metadata: Metadata = {
  title: "SkillBridge - AI Değerlendirme",
  description: "Yapay Zeka Destekli İşe Alım Platformu",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="tr" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false}>
          <Providers>
            {children}
            <BackButton />
            <RightClickHelp />
          </Providers>
        </ThemeProvider>
      </body>
    </html>
  );
}
