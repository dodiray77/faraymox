import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import PrimeSSRProvider from "./prime-ssr-provider";
import ThemeProvider from "@/components/ThemeProvider";
const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "FARAYMOX",
  description: "Infra Dashboard",
};

export default function RootLayout({ children }) {
  return (
    <html
      lang="id"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="bg-slate-950 text-slate-100 antialiased selection:bg-emerald-500/30">
        <ThemeProvider>
          <PrimeSSRProvider>{children}</PrimeSSRProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
