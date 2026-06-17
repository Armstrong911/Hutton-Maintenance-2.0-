import type { Metadata } from "next";
import { PT_Serif } from "next/font/google";
import "./globals.css";
import { auth } from "@/lib/auth";
import { SessionProvider } from "next-auth/react";

const ptSerif = PT_Serif({
  subsets: ["latin"],
  weight: ["400", "700"],
  style: ["normal", "italic"],
  variable: "--font-pt-serif",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Hutton | Strata Maintenance",
  description: "BC Strata Maintenance Tracking",
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  return (
    <html lang="en" className={ptSerif.variable}>
      <body>
        <SessionProvider session={session}>{children}</SessionProvider>
      </body>
    </html>
  );
}