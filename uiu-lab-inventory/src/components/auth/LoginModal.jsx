import { useState } from "react";
import Button from "../common/Button.jsx";
import { authAPI } from "../../api/auth";

export default function LoginModal({ open, onClose }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  if (!open) return null;

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await authAPI.login(email, password);
      const { token, user } = response.data;

      // Store token and user info
      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(user));

      // Redirect based on role (determined by backend)
      if (user.role === "admin") {
        window.location.href = "/admin/dashboard";
      } else {
        window.location.href = "/dashboard";
      }
    } catch (err) {
      console.error("Login failed:", err);
      setError(
        err.response?.data?.message || "Login failed. Please try again.",
      );
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-bold text-slate-900">Login to UIU Lab</h3>
          <button onClick={onClose} className="text-slate-500 text-xl">
            ✕
          </button>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          {error && (
            <div className="text-xs text-red-600 bg-red-50 border border-red-200 rounded-md px-3 py-2">
              {error}
            </div>
          )}
          <div>
            <label className="block text-sm text-slate-700 mb-1">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full border border-slate-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:border-primary-500"
              placeholder="your.email@uiu.ac.bd"
            />
          </div>
          <div>
            <label className="block text-sm text-slate-700 mb-1">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full border border-slate-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:border-primary-500"
              placeholder="••••••••"
            />
          </div>

          <div className="text-xs text-slate-600 bg-blue-50 border border-blue-200 rounded-md px-3 py-2">
            Login with your university credentials. You will be redirected based
            on your account type.
          </div>

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Logging in..." : "Login"}
          </Button>
        </form>
      </div>
    </div>
  );
}
