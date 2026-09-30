"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "../utils/supabase";

const secondaryClass =
  "text-white hover:bg-[#E51937] px-3 py-2 rounded-md text-xs sm:text-sm font-medium transition";
const primaryClass =
  "text-[#003A63] bg-white hover:bg-gray-100 px-4 py-2 rounded-md text-xs sm:text-sm font-bold shadow-sm transition";

// Header links that change depending on whether an alum is logged in
export default function NavLinks() {
  // undefined = still checking, so nothing flickers on page load
  const [loggedIn, setLoggedIn] = useState<boolean | undefined>(undefined);

  useEffect(() => {
    // Fires once with the current session, then on every log in / log out
    const { data } = supabase.auth.onAuthStateChange((_event, session) => {
      setLoggedIn(!!session);
    });
    return () => data.subscription.unsubscribe();
  }, []);

  const handleLogOut = async () => {
    await supabase.auth.signOut();
    window.location.href = "/";
  };

  if (loggedIn === undefined) return null;

  return (
    <div className="flex space-x-2 sm:space-x-4">
      {loggedIn ? (
        <>
          <Link href="/register" className={secondaryClass}>
            My Listings
          </Link>
          <button type="button" onClick={handleLogOut} className={primaryClass}>
            Log Out
          </button>
        </>
      ) : (
        <>
          <Link href="/register" className={secondaryClass}>
            Add Business
          </Link>
          <Link href="/login" className={primaryClass}>
            Log In / Sign Up
          </Link>
        </>
      )}
    </div>
  );
}
