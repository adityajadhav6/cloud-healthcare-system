import React, { useState, useEffect } from "react";
import axios from "axios";
import { useSearchParams, useNavigate, Link } from "react-router-dom";

const API_BASE = import.meta.env.VITE_API_BASE || "http://127.0.0.1:5000";

const ResetPassword = () => {
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get("token");

  useEffect(() => {
    if (!token) {
      setError("No reset token found. Please use the link from your email.");
    }
  }, [token]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setError("");
    setIsLoading(true);

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match. Please try again.");
      setIsLoading(false);
      return;
    }

    try {
      const response = await axios.post(`${API_BASE}/api/auth/reset-password`, {
        token,
        newPassword,
      });
      setMessage(response.data.message || "Password reset successful.");

      // Redirect to login after a short delay
      setTimeout(() => {
        navigate("/login");
      }, 3000);
    } catch (err) {
      console.error("Password reset failed:", err.response?.data || err.message);
      setError(
        err.response?.data?.error || "An unexpected error occurred. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center px-4 sm:px-6 lg:px-10">
      <div className="w-full max-w-5xl mx-auto bg-slate-800/90 border border-slate-700 rounded-3xl shadow-2xl overflow-hidden">
        <div className="grid grid-cols-1 md:grid-cols-2">
          {/* Left panel: branding (same vibe as Login) */}
          <div className="hidden md:flex flex-col justify-between bg-gradient-to-br from-cyan-500/20 via-slate-900 to-slate-900 px-8 py-10 border-r border-slate-700 relative overflow-hidden">
            {/* Soft blobs */}
            <div className="absolute top-0 left-0 w-56 h-56 bg-cyan-400/20 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute bottom-0 right-0 w-64 h-64 bg-sky-500/10 rounded-full blur-3xl pointer-events-none" />

            <div className="relative z-10">
              <h1 className="text-4xl font-extrabold text-white tracking-tight">
                HealthLink
              </h1>
              <p className="mt-3 text-cyan-200 text-sm max-w-xs">
                Smart, Secure & Scalable Healthcare System.
              </p>
            </div>

            <div className="relative z-10 mt-10 space-y-4 text-sm text-slate-200">
              <div className="flex items-start space-x-3">
                <span className="mt-1 text-cyan-400">●</span>
                <p>
                  <span className="font-semibold text-white">Protected access</span>{" "}
                  for all password reset requests.
                </p>
              </div>
              <div className="flex items-start space-x-3">
                <span className="mt-1 text-cyan-400">●</span>
                <p>
                  <span className="font-semibold text-white">
                    Secure authentication
                  </span>{" "}
                  powered by JWT and tokenized links.
                </p>
              </div>
            </div>

            <div className="relative z-10 mt-10 text-xs text-slate-400">
              © {new Date().getFullYear()} HealthLink · Smart, Secure & Scalable
              Healthcare System
            </div>
          </div>

          {/* Right panel: reset form */}
          <div className="px-6 sm:px-10 py-10 bg-slate-900">
            <div className="mb-6 text-center md:text-left">
              <h2 className="text-3xl sm:text-4xl font-bold mb-2 text-white tracking-tight">
                Reset Password
              </h2>
              <p className="text-sm text-gray-400">
                Enter a strong new password to secure your account.
              </p>
            </div>

            {token ? (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label
                    htmlFor="new-password"
                    className="block text-gray-300 font-semibold text-sm mb-2"
                  >
                    New Password
                  </label>
                  <input
                    type="password"
                    id="new-password"
                    className="w-full p-3 bg-slate-800 border border-slate-600 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500"
                    placeholder="••••••••"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                  />
                </div>

                <div>
                  <label
                    htmlFor="confirm-password"
                    className="block text-gray-300 font-semibold text-sm mb-2"
                  >
                    Confirm Password
                  </label>
                  <input
                    type="password"
                    id="confirm-password"
                    className="w-full p-3 bg-slate-800 border border-slate-600 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500"
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                  />
                </div>

                {message && (
                  <div className="bg-emerald-900/80 border border-emerald-700 text-emerald-200 px-4 py-3 rounded-lg text-sm text-center font-medium">
                    {message} Redirecting to login...
                  </div>
                )}

                {error && (
                  <div className="bg-red-900/80 border border-red-700 text-red-200 px-4 py-3 rounded-lg text-sm text-center font-medium">
                    {error}
                  </div>
                )}

                <button
                  type="submit"
                  className={`w-full bg-cyan-500 hover:bg-cyan-600 text-white py-3 rounded-xl shadow-lg transition-all duration-300 text-base font-semibold flex items-center justify-center ${
                    isLoading ? "opacity-70 cursor-not-allowed" : ""
                  }`}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <svg
                        className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                      </svg>
                      Resetting...
                    </>
                  ) : (
                    "Reset Password"
                  )}
                </button>

                <div className="mt-4 text-center text-xs text-slate-400">
                  Remembered your password?{" "}
                  <Link
                    to="/login"
                    className="text-cyan-400 hover:underline font-semibold"
                  >
                    Go back to login
                  </Link>
                </div>
              </form>
            ) : (
              <div className="text-center text-sm sm:text-base text-red-200 font-medium">
                <p className="mb-4">{error}</p>
                <Link
                  to="/login"
                  className="text-cyan-400 hover:underline font-semibold"
                >
                  Go back to login page
                </Link>
              </div>
            )}

            {/* Mobile footer tagline */}
            <div className="mt-10 text-xs text-slate-500 text-center md:hidden">
              © {new Date().getFullYear()} HealthLink · Smart, Secure & Scalable
              Healthcare System
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;
