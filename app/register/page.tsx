"use client";

import { useState, useEffect } from "react";
import { supabase } from "../../utils/supabase";

const LOGO_BUCKET = "business-logos";
const MAX_LOGO_BYTES = 2 * 1024 * 1024; // 2 MB, matches the bucket limit
const LOGO_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];

export default function RegisterBusiness() {
  const [businessName, setBusinessName] = useState("");
  const [category, setCategory] = useState("");
  const [description, setDescription] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [website, setWebsite] = useState("");
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);

  // 1. Verify the user is logged in when the page loads
  useEffect(() => {
    async function checkUser() {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUserId(user.id);
      } else {
        // Redirect back to login if they bypassed the login screen
        window.location.href = "/login";
      }
    }
    checkUser();
  }, []);

  // Free the preview's object URL when it is replaced or the page unmounts
  useEffect(() => {
    return () => {
      if (logoPreview) URL.revokeObjectURL(logoPreview);
    };
  }, [logoPreview]);

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null;
    setMessage("");

    if (file && !LOGO_TYPES.includes(file.type)) {
      setMessage("Error: Thumbnail must be a JPG, PNG, WebP, or GIF image.");
      e.target.value = "";
      return;
    }
    if (file && file.size > MAX_LOGO_BYTES) {
      setMessage("Error: Thumbnail must be 2 MB or smaller.");
      e.target.value = "";
      return;
    }

    setLogoFile(file);
    setLogoPreview(file ? URL.createObjectURL(file) : null);
  };

  // 2. Handle the form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    if (!userId) {
      setMessage("Authentication error. Please log in again.");
      setLoading(false);
      return;
    }

    // Upload the thumbnail first (into the user's own folder) so we can store its URL
    let logoUrl: string | null = null;
    if (logoFile) {
      const ext = logoFile.name.split(".").pop()?.toLowerCase() || "jpg";
      const path = `${userId}/${crypto.randomUUID()}.${ext}`;
      const { error: uploadError } = await supabase.storage
        .from(LOGO_BUCKET)
        .upload(path, logoFile, { contentType: logoFile.type });

      if (uploadError) {
        setMessage(`Error uploading thumbnail: ${uploadError.message}`);
        setLoading(false);
        return;
      }
      logoUrl = supabase.storage.from(LOGO_BUCKET).getPublicUrl(path).data.publicUrl;
    }

    // Insert the form data into the Supabase table
    const { error } = await supabase.from("businesses").insert([
      {
        user_id: userId,
        business_name: businessName,
        category: category,
        description: description,
        phone: phone,
        email: email,
        website_url: website,
        logo_url: logoUrl,
      },
    ]);

    if (error) {
      setMessage(`Error: ${error.message}`);
      setLoading(false);
    } else {
      setMessage("Success! Your business was submitted and will appear in the directory once an administrator approves it.");
      // Give the user a moment to read the success message, then redirect to the home page
      setTimeout(() => {
        window.location.href = "/";
      }, 4000);
    }
  };

  return (
    <main className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto bg-white rounded-xl shadow-sm border border-gray-100 p-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Register Your Business
        </h1>
        <p className="text-gray-600 mb-8">
          Add your details to the Howard University Alumni Club directory so fellow members can find your services.
        </p>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Business Name *
              </label>
              <input
                type="text"
                required
                placeholder="e.g., WareShop Consulting, LLC"
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-blue-600 text-gray-900"
                value={businessName}
                onChange={(e) => setBusinessName(e.target.value)}
              />
            </div>

            <div className="sm:col-span-2">
              <label htmlFor="logo" className="block text-sm font-medium text-gray-700 mb-1">
                Thumbnail (headshot or company logo)
              </label>
              <div className="flex items-center gap-4">
                {logoPreview ? (
                  // eslint-disable-next-line @next/next/no-img-element -- local blob preview
                  <img
                    src={logoPreview}
                    alt="Thumbnail preview"
                    className="w-16 h-16 flex-shrink-0 rounded-full object-cover border border-gray-200"
                  />
                ) : (
                  <div className="w-16 h-16 flex-shrink-0 rounded-full bg-gray-100 border border-dashed border-gray-300" />
                )}
                <input
                  id="logo"
                  type="file"
                  accept={LOGO_TYPES.join(",")}
                  onChange={handleLogoChange}
                  className="block w-full text-sm text-gray-700 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-blue-50 file:text-blue-700 file:font-semibold hover:file:bg-blue-100"
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Optional. Square images work best. JPG, PNG, WebP, or GIF up to 2 MB.
              </p>
            </div>

            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Category *
              </label>
              <input
                type="text"
                required
                placeholder="e.g., Technology Consulting, CPA, Medical Doctor"
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 text-gray-900"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Brief Description
              </label>
              <textarea
                rows={3}
                placeholder="Describe your services or expertise..."
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 text-gray-900"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Phone Number
              </label>
              <input
                type="tel"
                placeholder="(555) 123-4567"
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 text-gray-900"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Business Email
              </label>
              <input
                type="email"
                placeholder="contact@yourbusiness.com"
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 text-gray-900"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Website URL
              </label>
              <input
                type="url"
                placeholder="https://www.yourbusiness.com"
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 text-gray-900"
                value={website}
                onChange={(e) => setWebsite(e.target.value)}
              />
            </div>
          </div>

          {message && (
            <div className={`p-4 rounded-lg text-sm font-medium ${message.includes('Error') ? 'bg-red-50 text-red-700' : 'bg-green-50 text-green-700'}`}>
              {message}
            </div>
          )}

          <div className="pt-4 border-t border-gray-100">
            <button
              type="submit"
              disabled={loading || !userId}
              className="w-full bg-blue-600 text-white p-4 rounded-lg font-bold text-lg hover:bg-blue-700 transition disabled:opacity-50"
            >
              {loading ? "Registering..." : "Add to Directory"}
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}
