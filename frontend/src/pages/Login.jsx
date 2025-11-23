import React, { useState } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";

const API_BASE = import.meta.env.VITE_API_BASE || "http://127.0.0.1:5000";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [forgotPasswordEmail, setForgotPasswordEmail] = useState("");
  const [forgotPasswordMessage, setForgotPasswordMessage] = useState("");
  const [isForgotPassword, setIsForgotPassword] = useState(false);

  const navigate = useNavigate();

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);
    try {
      const response = await axios.post(`${API_BASE}/api/auth/login`, {
        email,
        password,
      });
      const { token, role, name } = response.data;
      localStorage.setItem("token", token);
      localStorage.setItem("role", role);
      localStorage.setItem("name", name);

      if (role === "admin") {
        navigate("/admin");
      } else if (role === "doctor") {
        navigate("/doctor");
      } else if (role === "patient") {
        navigate("/patient");
      }
    } catch (error) {
      if (error.response) {
        setError(
          error.response.data.error ||
            "An unexpected error occurred. Please try again later."
        );
      } else {
        setError("An unexpected error occurred. Please try again later.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPasswordSubmit = async (e) => {
    e.preventDefault();
    setForgotPasswordMessage("");
    setIsLoading(true);
    try {
      await axios.post(`${API_BASE}/api/auth/forgot-password`, {
        email: forgotPasswordEmail,
      });
      setForgotPasswordMessage(
        "A password reset link has been sent to your email."
      );
    } catch (error) {
      setForgotPasswordMessage(
        "Failed to send reset link. Please check the email and try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center px-4 sm:px-6 lg:px-10">
      <div className="w-full max-w-5xl mx-auto bg-slate-800/90 border border-slate-700 rounded-3xl shadow-2xl overflow-hidden">
        {/* 2-column layout on md+ */}
        <div className="grid grid-cols-1 md:grid-cols-2">
          {/* Left panel: branding / info */}
          <div className="hidden md:flex flex-col justify-between bg-gradient-to-br from-cyan-500/20 via-slate-900 to-slate-900 px-8 py-10 border-r border-slate-700">
            <div>
              <h1 className="text-4xl font-extrabold text-white tracking-tight">
                HealthLink
              </h1>
              <p className="mt-3 text-cyan-200 text-sm">
                Secure & scalable healthcare platform.
              </p>
            </div>

            <div className="mt-10 space-y-4 text-sm text-slate-200">
              <div className="flex items-start space-x-3">
                <span className="mt-1 text-cyan-400">●</span>
                <p>
                  <span className="font-semibold text-white">
                    Role-based dashboards
                  </span>{" "}
                  for patients, doctors, and admins.
                </p>
              </div>
              <div className="flex items-start space-x-3">
                <span className="mt-1 text-cyan-400">●</span>
                <p>
                  <span className="font-semibold text-white">
                    AI-powered assistant
                  </span>{" "}
                  to help with appointments and health queries.
                </p>
              </div>
              <div className="flex items-start space-x-3">
                <span className="mt-1 text-cyan-400">●</span>
                <p>
                  <span className="font-semibold text-white">
                    Secure EHR management
                  </span>{" "}
                  with JWT-based authentication.
                </p>
              </div>
            </div>

            <div className="mt-10 text-xs text-slate-400">
              © {new Date().getFullYear()} HealthLink · Smart, Secure & Scalable
              Healthcare System
            </div>
          </div>

          {/* Right panel: forms */}
          <div className="px-6 sm:px-10 py-10">
            {!isForgotPassword ? (
              <>
                <div className="mb-8 text-center md:text-left">
                  <h2 className="text-3xl font-bold text-white">
                    Welcome Back
                  </h2>
                  <p className="text-sm text-gray-400 mt-2">
                    Log in to manage appointments, records, and more.
                  </p>
                </div>

                <form onSubmit={handleLoginSubmit} className="space-y-6">
                  <div>
                    <label
                      htmlFor="email"
                      className="block text-gray-300 font-semibold text-sm mb-2"
                    >
                      Email Address
                    </label>
                    <input
                      type="email"
                      id="email"
                      className="w-full p-3 bg-slate-700 border border-slate-600 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
                      placeholder="your.email@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="password"
                      className="block text-gray-300 font-semibold text-sm mb-2"
                    >
                      Password
                    </label>
                    <input
                      type="password"
                      id="password"
                      className="w-full p-3 bg-slate-700 border border-slate-600 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                  </div>

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
                        Logging in...
                      </>
                    ) : (
                      "Login"
                    )}
                  </button>

                  <div className="flex items-center justify-between text-xs sm:text-sm text-gray-400 mt-2">
                    <span
                      className="cursor-pointer text-cyan-400 hover:underline"
                      onClick={() => setIsForgotPassword(true)}
                    >
                      Forgot password?
                    </span>
                    <span>
                      Don&apos;t have an account?{" "}
                      <Link
                        to="/register"
                        className="text-cyan-400 hover:underline font-semibold"
                      >
                        Register
                      </Link>
                    </span>
                  </div>
                </form>
              </>
            ) : (
              <>
                <div className="mb-8 text-center md:text-left">
                  <h2 className="text-3xl font-bold text-white">
                    Forgot Password
                  </h2>
                  <p className="text-sm text-gray-400 mt-2">
                    Enter your email and we&apos;ll send you a reset link.
                  </p>
                </div>

                <form
                  onSubmit={handleForgotPasswordSubmit}
                  className="space-y-6"
                >
                  <div>
                    <label
                      htmlFor="forgot-email"
                      className="block text-gray-300 font-semibold text-sm mb-2"
                    >
                      Email Address
                    </label>
                    <input
                      type="email"
                      id="forgot-email"
                      className="w-full p-3 bg-slate-700 border border-slate-600 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
                      placeholder="your.email@example.com"
                      value={forgotPasswordEmail}
                      onChange={(e) => setForgotPasswordEmail(e.target.value)}
                      required
                    />
                  </div>

                  {forgotPasswordMessage && (
                    <div
                      className={`px-4 py-3 rounded-lg text-center text-sm font-medium ${
                        forgotPasswordMessage.includes("sent")
                          ? "bg-green-900/80 text-green-200 border border-green-700"
                          : "bg-red-900/80 text-red-200 border border-red-700"
                      }`}
                    >
                      {forgotPasswordMessage}
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
                        Sending...
                      </>
                    ) : (
                      "Send Reset Link"
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => setIsForgotPassword(false)}
                    className="w-full text-cyan-400 font-semibold mt-4 hover:underline text-sm"
                  >
                    &larr; Back to Login
                  </button>
                </form>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
