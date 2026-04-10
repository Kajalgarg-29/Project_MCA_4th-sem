import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import ReduxProvider from "./redux";
import SessionWrapper from "./sessionWrapper";
import { RoleProvider } from "@/context/RoleContext";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "ManageX",
  description: "Project Management Dashboard",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body className={inter.className}>
        <SessionWrapper>
          <ReduxProvider>
            <RoleProvider>
              {children}
            </RoleProvider>
          </ReduxProvider>
        </SessionWrapper>
      </body>
    </html>
  );
}

