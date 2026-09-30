"use client";

import { useState } from "react";
import { supabase } from "../../utils/supabase";

const MIN_PASSWORD_LENGTH = 6; // Supabase's default minimum

export default function Login() {
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [isError, setIsError] = useState(false);
  const [loading, setLoading] = useState(false);

  const isSignUp = mode === "signup";
  const passwordsMismatch =
    isSignUp && confirmPassword.length > 0 && password !== confirmPassword;

  function showMessage(text: string, error = false) {
    setMessage(text);
    setIsError(error);
  }

  function switchMode(next: "login" | "signup") {
    setMode(next);
    setPassword("");
    setConfirmPassword("");
    setMessage("");
  }

  const handleSignUp = async () => {
    if (password.length < MIN_PASSWORD_LENGTH) {
      showMessage(`Password must be at least ${MIN_PASSWORD_LENGTH} characters.`, true);
      return;
    }
    if (password !== confirmPassword) {
      showMessage("Passwords do not match. Please re-enter them.", true);
      return;
    }

    setLoading(true);
    const { error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) showMessage(error.message, true);
    else showMessage("Success! Check your email to confirm your account, then log in.");
    setLoading(false);
  };

  const handleLogin = async () => {
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      showMessage(error.message, true);
      setLoading(false);
    } else {
      showMessage("Logged in successfully! Redirecting...");
      window.location.href = "/register";
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage("");
    if (isSignUp) await handleSignUp();
    else await handleLogin();
  };

  return (
    <main className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-xl shadow-sm border border-gray-100 p-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-6 text-center">
          {isSignUp ? "Create Alumni Account" : "Alumni Login"}
        </h1>

        {/* Log In / Sign Up toggle */}
        <div className="flex mb-6 bg-gray-100 rounded-lg p-1">
          {(["login", "signup"] as const).map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => switchMode(m)}
              className={`flex-1 py-2 rounded-md text-sm font-semibold transition ${
                mode === m ? "bg-white text-blue-700 shadow-sm" : "text-gray-600 hover:text-gray-900"
              }`}
            >
              {m === "login" ? "Log In" : "Sign Up"}
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <input
              id="email"
              type="email"
              autoComplete="email"
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 text-gray-900"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
              Password
            </label>
            <input
              id="password"
              type="password"
              autoComplete={isSignUp ? "new-password" : "current-password"}
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 text-gray-900"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            {isSignUp && (
              <p className="text-xs text-gray-500 mt-1">
                At least {MIN_PASSWORD_LENGTH} characters.
              </p>
            )}
          </div>

          {isSignUp && (
            <div>
              <label htmlFor="confirm-password" className="block text-sm font-medium text-gray-700 mb-1">
                Confirm Password
              </label>
              <input
                id="confirm-password"
                type="password"
                autoComplete="new-password"
                className={`w-full p-3 border rounded-lg focus:outline-none focus:ring-2 text-gray-900 ${
                  passwordsMismatch
                    ? "border-red-500 focus:ring-red-500"
                    : "border-gray-300 focus:ring-blue-600"
                }`}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
              {passwordsMismatch && (
                <p className="text-xs text-red-600 mt-1">Passwords do not match.</p>
              )}
            </div>
          )}

          {message && (
            <div
              className={`p-3 rounded-lg text-sm text-center ${
                isError ? "bg-red-50 text-red-700" : "bg-blue-50 text-blue-700"
              }`}
            >
              {message}
            </div>
          )}

          <button
            type="submit"
            disabled={loading || passwordsMismatch}
            className="w-full bg-blue-600 text-white p-3 rounded-lg font-semibold hover:bg-blue-700 transition disabled:opacity-50"
          >
            {loading ? "Loading..." : isSignUp ? "Create Account" : "Log In"}
          </button>
        </form>
      </div>
    </main>
  );
}
