import type { Metadata } from "next";
import "./globals.css";
import Link from "next/link";

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
          <div className="max-w-md mx-auto sm:max-w-4xl px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between h-16 items-center">
              
              {/* Brand Logo/Title */}
              <div className="flex-shrink-0 flex items-center">
                <Link href="/" className="text-white font-extrabold text-lg tracking-wider">
                  HU ALUMNI
                </Link>
              </div>

              {/* Navigation Links */}
              <div className="flex space-x-2 sm:space-x-4">
                <Link 
                  href="/register" 
                  className="text-white hover:bg-[#E51937] px-3 py-2 rounded-md text-xs sm:text-sm font-medium transition"
                >
                  Add Business
                </Link>
                <Link 
                  href="/login" 
                  className="text-[#003A63] bg-white hover:bg-gray-100 px-4 py-2 rounded-md text-xs sm:text-sm font-bold shadow-sm transition"
                >
                  Login
                </Link>
              </div>

            </div>
          </div>
        </nav>

        {/* This renders whatever page the user is currently on (Home, Login, etc.) */}
        {children}
      </body>
    </html>
  );
}
