import type { Metadata } from "next";
import { Nunito } from "next/font/google";
import "./globals.css";
import { NextAuthProvider } from "@/components/providers/session-provider";
import { Header } from "@/components/shared/header";
import { UserProvider } from "@/components/providers/UserProvider";

import { CartDrawer, AuthModal } from "@/components/shared";

const nunito = Nunito({
  subsets: ['cyrillic'],
  variable: '--font-nunito',
  weight: ['400', '500', '600', '700', '800', '900'],
});

export const metadata: Metadata = {
  title: "Sweet moment",
  description: "Cake shop",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {

  return (
    <html lang="ru">
      <head>
        <link rel="icon" href="/logo.svg" />
      </head>

      <body className={nunito.className}>
        <NextAuthProvider>
          <UserProvider /> 
          
          <Header />

          {children}

          <CartDrawer />
          <AuthModal />
          
        </NextAuthProvider>
      </body>
    </html>
  );
}