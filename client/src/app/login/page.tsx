"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

export default function LoginPage() {
  const router = useRouter();
  const { setAuth } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch(`${backendUrl}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.message || "Login failed");
        return;
      }
      if (!data.user) {
        setError("Login successful but no user data was returned.");
        return;
      }
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
      setAuth(data.user, data.token);

      // Redirect based on user role
      if (data.user.role === "delivery") {
        router.push("/dashboard");
      } else {
        router.push("/orders");
      }
    } catch (err) {
      setError("An error occurred while trying to log in.");
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-200">
      <nav className="bg-gray-800 text-white py-2 px-4 flex justify-between items-center shadow-lg">
        <h1 className="text-2xl font-bold">Quick Commerce</h1>
        <a href="/" className="text-white text-sm hover:underline">
          Home
        </a>
      </nav>

      <div className="flex-grow flex items-center justify-center">
        <div className="bg-white shadow-lg rounded-lg p-6 w-full max-w-md">
          <h1 className="text-3xl font-bold mb-6 text-center text-gray-800">
            Login
          </h1>
          {error && (
            <p className="text-red-500 mb-4 text-center bg-red-100 p-2 rounded">
              {error}
            </p>
          )}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-gray-700 font-semibold mb-2">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full border px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-gray-700 font-semibold mb-2">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full border px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            <button
              type="submit"
              className="w-full bg-blue-500 text-white px-4 py-3 rounded-lg hover:bg-blue-600 transition"
            >
              Login
            </button>
          </form>
          <p className="mt-4 text-sm text-center">
            Don't have an account?{" "}
            <a
              href="/register"
              className="text-blue-500 underline hover:text-blue-600"
            >
              Register
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
