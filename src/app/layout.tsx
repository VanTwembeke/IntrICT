import type { Metadata } from "next";
import { Geist_Mono } from "next/font/google";
import "./globals.css";
import CookieConsent from "@/components/common/CookieConsent";
import { SpeedInsights } from "@vercel/speed-insights/next";

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "IntrICT",
  description: "Professional landing page for business",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
        <html lang="en">
          <body
            className={`${geistMono.variable} font-mono antialiased`}
          >
            {children}
            <CookieConsent />
            <SpeedInsights />
          </body>
        </html>
  );
}
