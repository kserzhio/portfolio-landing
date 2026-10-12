import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { motionBootScript } from "@/lib/motion";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Serhii Kostenko — Frontend Developer & Accessibility Specialist",
  description:
    "Senior Frontend Developer and DHS Trusted Tester. 10 years of building interfaces — now making sure everyone can use them.",
};

export const viewport: Viewport = {
  themeColor: "#000000",
  colorScheme: "dark",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    // data-motion / .js are set before paint by the boot script.
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable}`} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: motionBootScript }} />
      </head>
      <body>{children}</body>
    </html>
  );
}
