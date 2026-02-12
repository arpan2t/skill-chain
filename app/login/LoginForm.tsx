"use client";

import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import Link from "next/link";

export default function LoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const response = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });
    if (response?.ok) {
      router.push("/admin");
    } else {
      alert("Login failed. Please check your credentials and try again.");
    }
  };

  return (
    <div className="w-full lg:w-1/2 flex flex-col justify-center items-center p-8">
      <div className="w-full max-w-md">
        {/* Mobile Logo */}
        <div className="lg:hidden mb-10 text-center">
          <Link href="/" className="inline-flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-600 flex items-center justify-center">
              <span className="text-xl">🎓</span>
            </div>
            <span className="text-xl font-bold text-white">SkillChain</span>
          </Link>
        </div>

        <div className="text-center mb-10">
          <h2 className="text-3xl font-bold mb-2">Welcome back</h2>
          <p className="text-slate-400">Connect your wallet to continue</p>
        </div>

        {/* Email Login Option */}
        <form onSubmit={handleLogin} method="POST" className="space-y-4">
          <div>
            <label className="block text-sm text-slate-400 mb-2">
              Email address
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
              }}
              placeholder="you@example.com"
              className="w-full px-4 py-3 rounded-xl bg-slate-800 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-purple-500 transition-colors"
            />
          </div>

          <div>
            <label className="block text-sm text-slate-400 mb-2">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
              }}
              placeholder="••••••••"
              className="w-full px-4 py-3 rounded-xl bg-slate-800 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-purple-500 transition-colors"
            />
          </div>

          <div className="flex items-center justify-between text-sm">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                className="w-4 h-4 rounded bg-slate-800 border-slate-700 text-purple-500 focus:ring-purple-500 focus:ring-offset-slate-950"
              />
              <span className="text-slate-400">Remember me</span>
            </label>
            <a
              href="#"
              className="text-purple-400 hover:text-purple-300 transition-colors"
            >
              Forgot password?
            </a>
          </div>

          <button className="w-full py-3 rounded-xl bg-purple-600 text-white font-semibold hover:bg-purple-700 transition-colors">
            Sign In
          </button>
        </form>

        {/* Sign Up Link */}
        <p className="text-center text-slate-400 mt-8">
          Don't have an account?{" "}
          <Link
            href="/register"
            className="text-purple-400 hover:text-purple-300 transition-colors font-medium"
          >
            Sign up
          </Link>
        </p>

        {/* Features */}
        <div className="mt-8 pt-8 border-t border-slate-800">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-purple-400 font-bold">🔐</div>
              <div className="text-xs text-slate-500 mt-1">Secure</div>
            </div>
            <div>
              <div className="text-purple-400 font-bold">⚡</div>
              <div className="text-xs text-slate-500 mt-1">Fast</div>
            </div>
            <div>
              <div className="text-purple-400 font-bold">✓</div>
              <div className="text-xs text-slate-500 mt-1">Verified</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
