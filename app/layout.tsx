import type { Metadata } from "next";
import "./globals.css";
import Link from "next/link";
import NavLinks from "./NavLinks";

export const metadata: Metadata = {
  title: "Alumni Business Directory",
  description: "A business registry and lookup tool for alumni.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-gray-50 min-h-screen font-sans text-gray-900">
        {/* Global Navigation Bar */}
        <nav className="bg-[#003A63] border-b-4 border-[#E51937] shadow-md sticky top-0 z-50">
          <div className="max-w-md mx-auto sm:max-w-6xl px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between h-16 items-center">
              
              {/* Brand Logo/Title */}
              <div className="flex items-center mr-2">
                <Link href="/" className="text-white font-extrabold text-sm sm:text-lg leading-tight sm:tracking-wide">
                  Howard University Alumni Club in DFW
                </Link>
              </div>

              {/* Navigation Links (change when logged in) */}
              <NavLinks />

            </div>
          </div>
        </nav>

        {/* This renders whatever page the user is currently on (Home, Login, etc.) */}
        {children}
      </body>
    </html>
  );
}
