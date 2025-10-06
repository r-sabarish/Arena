import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import SessionProvider from "../components/auth/SessionProvider";
import { authOptions } from '../pages/api/auth/[...nextauth]';
import { getServerSession } from "next-auth";
import SideBar from "../components/sidebar/SideBar";
import { PlayTimeProvider } from "../context/PlayTimeContext";
import PlayTimer from "@/components/timer/PlayTimer";
import { UnitySessionProvider } from "@/context/UnitySessionContext";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Arena",
  description: "Arena: The Ultimate Coffee Break Challenge",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await getServerSession(authOptions);

  return (
    <html lang="en" className="dark">
      <body className={`${geistSans.variable} ${geistMono.variable} font-sans antialiased`}>
        <SessionProvider session={session}>
          <UnitySessionProvider>
            <PlayTimeProvider>
              <PlayTimer />
              <div className="flex min-h-screen bg-background-primary transition-colors duration-300">
                <SideBar />
                <main className="flex-1 pl-20 min-h-screen">
                  {children}
                </main>
              </div>
            </PlayTimeProvider>
          </UnitySessionProvider>
        </SessionProvider>
      </body>
    </html>
  );
}
