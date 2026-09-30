"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { supabase } from "../utils/supabase";

// This defines the shape of our data based on your SQL table
type Business = {
  id: string;
  business_name: string;
  category: string;
  description: string | null;
  phone: string | null;
  email: string | null;
  website_url: string | null;
  logo_url: string | null;
};

// "Ware Intelligence" -> "WI"; shown when a listing has no thumbnail
function initials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0].toUpperCase())
    .join("");
}

export default function Home() {
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);

  // Fetch the data from Supabase when the page loads
  useEffect(() => {
    async function fetchBusinesses() {
      const { data, error } = await supabase
        .from("businesses")
        .select("*")
        .eq("is_approved", true) // This is the new filter!
        .order("business_name", { ascending: true });

      if (error) {
        console.error("Error fetching businesses:", error);
      } else {
        setBusinesses(data || []);
      }
      setLoading(false);
    }
    
    fetchBusinesses();
  }, []);

  // Filter the list as the user types
  const filteredBusinesses = businesses.filter((b) => {
    const searchLower = searchQuery.toLowerCase();
    return (
      b.business_name.toLowerCase().includes(searchLower) ||
      b.category.toLowerCase().includes(searchLower)
    );
  });

  return (
    <main className="min-h-screen bg-gray-50 pb-10">
      {/* Search Bar Section */}
      <div className="bg-white border-b shadow-sm p-6 mb-6">
        <div className="max-w-md mx-auto">
          <input
            type="text"
            placeholder="Search 'CPA', 'Dentist', or name..."
            className="w-full p-3 border border-gray-300 rounded-lg shadow-inner focus:outline-none focus:ring-2 focus:ring-blue-600 text-gray-900"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Grid of Results: 1 column on phones, 2 on tablets, 3 on desktops */}
      <div className="max-w-6xl mx-auto p-4">
        {loading ? (
          <p className="text-center text-gray-500 mt-10">Loading directory...</p>
        ) : filteredBusinesses.length === 0 ? (
          <p className="text-center text-gray-500 mt-10">No businesses found.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredBusinesses.map((business) => (
              <div
                key={business.id}
                className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 flex flex-col"
              >
                <div className="mb-4">
                  <div className="flex items-start gap-4">
                    {business.logo_url ? (
                      <Image
                        src={business.logo_url}
                        alt={`${business.business_name} logo`}
                        width={64}
                        height={64}
                        className="w-16 h-16 flex-shrink-0 rounded-full object-cover border border-gray-200"
                      />
                    ) : (
                      <div
                        aria-hidden="true"
                        className="w-16 h-16 flex-shrink-0 rounded-full bg-[#003A63] text-white flex items-center justify-center text-lg font-bold"
                      >
                        {initials(business.business_name)}
                      </div>
                    )}
                    <div className="min-w-0">
                      <span className="text-xs font-semibold text-blue-600 uppercase tracking-wider">
                        {business.category}
                      </span>
                      <h2 className="text-xl font-bold text-gray-900 mt-1 break-words">
                        {business.business_name}
                      </h2>
                    </div>
                  </div>
              
                  {business.description && (
                    <p className="text-gray-600 mt-2 text-sm">{business.description}</p>
                  )}
                </div>
              
                {/* mt-auto keeps contact details lined up along the bottom of each row */}
                <div className="mt-auto pt-4 border-t border-gray-100 space-y-1 text-sm text-gray-700 break-words">
                  {business.phone && <p>📞 {business.phone}</p>}
                  {business.email && <p>✉️ {business.email}</p>}
                  {business.website_url && (
                    <p>
                      🌐 <a href={business.website_url} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline">Website</a>
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
