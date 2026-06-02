"use client";

import { useEffect, useState } from "react";
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
};

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

      {/* Scrolling List of Results */}
      <div className="max-w-md mx-auto p-4 space-y-4">
        {loading ? (
          <p className="text-center text-gray-500 mt-10">Loading directory...</p>
        ) : filteredBusinesses.length === 0 ? (
          <p className="text-center text-gray-500 mt-10">No businesses found.</p>
        ) : (
          filteredBusinesses.map((business) => (
            <div
              key={business.id}
              className="bg-white p-5 rounded-xl shadow-sm border border-gray-100"
            >
              <span className="text-xs font-semibold text-blue-600 uppercase tracking-wider">
                {business.category}
              </span>
              <h2 className="text-xl font-bold text-gray-900 mt-1">
                {business.business_name}
              </h2>
              
              {business.description && (
                <p className="text-gray-600 mt-2 text-sm">{business.description}</p>
              )}
              
              <div className="mt-4 pt-4 border-t border-gray-100 space-y-1 text-sm text-gray-700">
                {business.phone && <p>📞 {business.phone}</p>}
                {business.email && <p>✉️ {business.email}</p>}
                {business.website_url && (
                  <p>
                    🌐 <a href={business.website_url} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline">Website</a>
                  </p>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </main>
  );
}
