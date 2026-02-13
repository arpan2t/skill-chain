"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import Link from "next/link";
import { GraduationCap, Shield, Zap, CheckCircle } from "lucide-react";

export default function RegisterForm() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleRegister = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (password.length < 8) {
      setError("Password must be at least 8 characters");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("/api/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        router.push("/login?registered=true");
      } else {
        setError(data.message || "Registration failed. Please try again.");
      }
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full lg:w-1/2 flex flex-col justify-center items-center p-8">
      <div className="w-full max-w-md">
        {/* Mobile Logo */}
        <div className="lg:hidden mb-10 text-center">
          <Link href="/" className="inline-flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#358eb8] flex items-center justify-center">
              <GraduationCap className="w-6 h-6 text-white" />
            </div>
            <span className="text-xl font-bold text-white">SkillChain</span>
          </Link>
        </div>

        <div className="text-center mb-10">
          <h2 className="text-3xl font-bold mb-2">Create an account</h2>
          <p className="text-slate-400">Join SkillChain today</p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/50 text-red-400 text-sm text-center">
            {error}
          </div>
        )}

        {/* Registration Form */}
        <form onSubmit={handleRegister} className="space-y-4">
          <div>
            <label className="block text-sm text-slate-400 mb-2">
              Organization Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Organization Pvt. Ltd."
              required
              className="w-full px-4 py-3 rounded-xl bg-slate-800 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-[#358eb8] transition-colors"
            />
          </div>

          <div>
            <label className="block text-sm text-slate-400 mb-2">
              Email address
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
              className="w-full px-4 py-3 rounded-xl bg-slate-800 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-[#358eb8] transition-colors"
            />
          </div>

          <div>
            <label className="block text-sm text-slate-400 mb-2">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              className="w-full px-4 py-3 rounded-xl bg-slate-800 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-[#358eb8] transition-colors"
            />
          </div>

          <div>
            <label className="block text-sm text-slate-400 mb-2">
              Confirm Password
            </label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="••••••••"
              required
              className="w-full px-4 py-3 rounded-xl bg-slate-800 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-[#358eb8] transition-colors"
            />
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="terms"
              required
              className="w-4 h-4 rounded bg-slate-800 border-slate-700 text-[#358eb8] focus:ring-[#358eb8] focus:ring-offset-slate-950"
            />
            <label htmlFor="terms" className="text-sm text-slate-400">
              I agree to the{" "}
              <a href="#" className="text-[#4aa3cc] hover:text-[#358eb8]">
                Terms of Service
              </a>{" "}
              and{" "}
              <a href="#" className="text-[#4aa3cc] hover:text-[#358eb8]">
                Privacy Policy
              </a>
            </label>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl bg-[#358eb8] text-white font-semibold hover:bg-[#2a7296] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Creating Account..." : "Create Account"}
          </button>
        </form>

        {/* Sign In Link */}
        <p className="text-center text-slate-400 mt-8">
          Already have an account?{" "}
          <Link
            href="/login"
            className="text-[#4aa3cc] hover:text-[#358eb8] transition-colors font-medium"
          >
            Sign in
          </Link>
        </p>

        {/* Features */}
        <div className="mt-8 pt-8 border-t border-slate-800">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="flex justify-center">
                <Shield className="w-5 h-5 text-[#358eb8]" />
              </div>
              <div className="text-xs text-slate-500 mt-1">Secure</div>
            </div>
            <div>
              <div className="flex justify-center">
                <Zap className="w-5 h-5 text-[#358eb8]" />
              </div>
              <div className="text-xs text-slate-500 mt-1">Fast</div>
            </div>
            <div>
              <div className="flex justify-center">
                <CheckCircle className="w-5 h-5 text-[#358eb8]" />
              </div>
              <div className="text-xs text-slate-500 mt-1">Verified</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
