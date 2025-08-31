import React, { useState } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";

const Register = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "patient", // Default role
    admin_secret: "", // New state for the secret
  });
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);
    
    // Create a new object to send to the backend, excluding the admin_secret
    // unless a doctor or admin role is selected.
    const dataToSend = {
      name: formData.name,
      email: formData.email,
      password: formData.password,
      role: formData.role,
    };

    if (formData.role !== "patient") {
      dataToSend.admin_secret = formData.admin_secret;
    }

    try {
      const response = await axios.post(
        "http://127.0.0.1:5000/api/auth/register",
        dataToSend
      );
      navigate("/login?registrationSuccess=true");
    } catch (err) {
      console.error("Registration failed:", err.response?.data || err.message);
      if (err.response && err.response.data && err.response.data.message) {
        setError(err.response.data.message);
      } else if (err.response && err.response.data && err.response.data.error) {
        setError(err.response.data.error);
      } else {
        setError("Registration failed. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-white">
      {/* Left side: Graphics & Branding */}
      <div className="hidden lg:flex items-center justify-center w-1/2 bg-gradient-to-br from-blue-600 to-indigo-700 p-10 relative overflow-hidden">
        {/* Animated Background Shapes */}
        <div className="absolute top-0 left-0 w-64 h-64 bg-blue-300 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob"></div>
        <div className="absolute top-0 right-0 w-64 h-64 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob animation-delay-2000"></div>
        <div className="absolute bottom-0 left-1/4 w-64 h-64 bg-green-300 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob animation-delay-4000"></div>
        
        {/* Branding Content */}
        <div className="text-center text-white relative z-10">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-24 w-24 mx-auto mb-4 animate-pulse" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.354a4 4 0 110 5.292M12 20a9.96 9.96 0 005.101-1.282A8.996 8.996 0 0112 18c-2.31 0-4.502.695-6.399 1.918A9.96 9.96 0 0012 20zm-5.46-9.742a.5.5 0 01-.115.143 1 1 0 101.414 1.414.5.5 0 01-.143-.115zm.968-.968a.5.5 0 01.115-.143 1 1 0 10-1.414-1.414.5.5 0 01.143.115zm-2.062.285a.5.5 0 01.115-.143 1 1 0 10-1.414-1.414.5.5 0 01.143.115zM12 12a4 4 0 100-8 4 4 0 000 8z" />
          </svg>
          <h1 className="text-6xl font-extrabold mb-4">Join HealthLink</h1>
          <p className="text-xl max-w-md mx-auto">
            Get started on your personal healthcare journey today.
          </p>
        </div>
      </div>
      
      {/* Right side: Register Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-white">
        <div className="w-full max-w-md">
          <h2 className="text-5xl font-extrabold mb-8 text-center text-gray-900 tracking-tight lg:text-left">
            Create Account
          </h2>
          <p className="text-center text-gray-600 mb-10 text-lg lg:text-left">
            Join our healthcare platform today.
          </p>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="name" className="block text-gray-700 font-semibold text-lg mb-2">Full Name</label>
              <input
                type="text"
                name="name"
                id="name"
                className="w-full p-4 border border-gray-300 rounded-xl focus:outline-none focus:ring-4 focus:ring-blue-200 focus:border-blue-500 transition-all duration-200 text-lg"
                placeholder="John Doe"
                value={formData.name}
                onChange={handleChange}
                required
              />
            </div>
            <div>
              <label htmlFor="email" className="block text-gray-700 font-semibold text-lg mb-2">Email Address</label>
              <input
                type="email"
                name="email"
                id="email"
                className="w-full p-4 border border-gray-300 rounded-xl focus:outline-none focus:ring-4 focus:ring-blue-200 focus:border-blue-500 transition-all duration-200 text-lg"
                placeholder="your.email@example.com"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>
            <div>
              <label htmlFor="password" className="block text-gray-700 font-semibold text-lg mb-2">Password</label>
              <input
                type="password"
                name="password"
                id="password"
                className="w-full p-4 border border-gray-300 rounded-xl focus:outline-none focus:ring-4 focus:ring-blue-200 focus:border-blue-500 transition-all duration-200 text-lg"
                placeholder="••••••••"
                value={formData.password}
                onChange={handleChange}
                required
              />
            </div>
            <div>
              <label htmlFor="role" className="block text-gray-700 font-semibold text-lg mb-2">Register As</label>
              <select
                name="role"
                id="role"
                className="w-full p-4 border border-gray-300 rounded-xl focus:outline-none focus:ring-4 focus:ring-blue-200 focus:border-blue-500 transition-all duration-200 text-lg bg-white"
                value={formData.role}
                onChange={handleChange}
              >
                <option value="patient">Patient</option>
                <option value="doctor">Doctor</option>
                <option value="admin">Admin</option>
              </select>
            </div>
            {formData.role !== "patient" && (
              <div className="transition-opacity duration-500">
                <label htmlFor="admin_secret" className="block text-gray-700 font-semibold text-lg mb-2">Admin Secret</label>
                <input
                  type="password"
                  name="admin_secret"
                  id="admin_secret"
                  className="w-full p-4 border border-gray-300 rounded-xl focus:outline-none focus:ring-4 focus:ring-red-200 focus:border-red-500 transition-all duration-200 text-lg"
                  placeholder="Enter admin secret to register as a doctor/admin"
                  value={formData.admin_secret}
                  onChange={handleChange}
                  required
                />
              </div>
            )}
            {error && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg text-center font-medium animate-shake">
                {error}
              </div>
            )}
            <button
              type="submit"
              className={`w-full bg-gradient-to-r from-blue-600 to-indigo-700 text-white p-4 rounded-xl shadow-lg hover:from-blue-700 hover:to-indigo-800 transition-all duration-300 text-xl font-bold flex items-center justify-center ${
                isLoading ? "opacity-70 cursor-not-allowed" : ""
              }`}
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Registering...
                </>
              ) : (
                "Register"
              )}
            </button>
          </form>
          <p className="text-center mt-8 text-gray-600 text-lg lg:text-left">
            Already have an account?{" "}
            <Link
              to="/login"
              className="text-blue-600 hover:underline font-semibold hover:text-indigo-700 transition-colors duration-200"
            >
              Login here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
