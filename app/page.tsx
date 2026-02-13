"use client";

import { WalletButton } from "./components/WalletButton";
import { GraduationCap, Shield, Zap, Globe, ArrowRight } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen bg-slate-950 text-white">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 backdrop-blur-md bg-slate-950/80 border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-[#358eb8] flex items-center justify-center">
              <GraduationCap className="w-6 h-6 text-white" />
            </div>
            <span className="text-xl font-bold text-[#358eb8]">SkillChain</span>
          </div>
          <div className="hidden md:flex items-center gap-8 text-sm text-slate-300">
            <a href="#features" className="hover:text-white transition-colors">
              Features
            </a>
            <a href="#about" className="hover:text-white transition-colors">
              About
            </a>
            <a href="#contact" className="hover:text-white transition-colors">
              Contact
            </a>
          </div>
          <WalletButton />
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-40 pb-32 px-6">
        <div className="max-w-5xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#358eb8]/10 border border-[#358eb8]/20 text-[#4aa3cc] text-sm mb-8">
            <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></span>
            Powered by Solana
          </div>

          <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
            Your Skills.
            <br />
            <span className="text-[#358eb8]">Verified Forever.</span>
          </h1>

          <p className="text-xl text-slate-400 max-w-xl mx-auto mb-12">
            The future of academic credentials. Secure, verifiable, and truly
            yours.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <WalletButton />
            <a
              href="#features"
              className="px-8 py-3 rounded-full border border-slate-700 text-slate-300 hover:bg-slate-800 transition-all flex items-center gap-2"
            >
              Explore <ArrowRight className="w-4 h-4" />
            </a>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Why SkillChain?
            </h2>
            <p className="text-slate-400 max-w-lg mx-auto">
              A new standard for digital credentials.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="p-8 rounded-2xl bg-slate-800/30 border border-slate-700 hover:border-[#358eb8]/50 transition-all">
              <div className="w-14 h-14 rounded-xl bg-[#358eb8]/20 flex items-center justify-center mb-6">
                <Shield className="w-7 h-7 text-[#358eb8]" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Tamper-Proof</h3>
              <p className="text-slate-400">
                Credentials stored on-chain can never be altered or forged.
              </p>
            </div>

            <div className="p-8 rounded-2xl bg-slate-800/30 border border-slate-700 hover:border-[#4aa3cc]/50 transition-all">
              <div className="w-14 h-14 rounded-xl bg-[#4aa3cc]/20 flex items-center justify-center mb-6">
                <Zap className="w-7 h-7 text-[#4aa3cc]" />
              </div>
              <h3 className="text-xl font-semibold mb-3">
                Instant Verification
              </h3>
              <p className="text-slate-400">
                Verify any credential in seconds, not days.
              </p>
            </div>

            <div className="p-8 rounded-2xl bg-slate-800/30 border border-slate-700 hover:border-[#2a7296]/50 transition-all">
              <div className="w-14 h-14 rounded-xl bg-[#2a7296]/20 flex items-center justify-center mb-6">
                <Globe className="w-7 h-7 text-[#2a7296]" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Truly Portable</h3>
              <p className="text-slate-400">
                Your achievements follow you, wherever you go.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="py-24 px-6 bg-slate-900/50">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Built for the Future
          </h2>
          <p className="text-lg text-slate-400 leading-relaxed mb-8">
            SkillChain leverages Solana's high-speed blockchain to create a
            seamless experience for issuing and verifying academic credentials.
            Whether you're an institution looking to modernize your records or a
            professional showcasing your achievements, SkillChain has you
            covered.
          </p>
          <div className="flex justify-center gap-8 text-center">
            <div>
              <div className="text-3xl font-bold text-[#358eb8]">Secure</div>
              <div className="text-sm text-slate-500">Blockchain-backed</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-[#4aa3cc]">Fast</div>
              <div className="text-sm text-slate-500">Sub-second finality</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-[#2a7296]">
                Affordable
              </div>
              <div className="text-sm text-slate-500">Minimal fees</div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-6">
        <div className="max-w-3xl mx-auto text-center">
          <div className="p-12 rounded-3xl bg-[#358eb8]/10 border border-[#358eb8]/20">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Get Started Today
            </h2>
            <p className="text-slate-400 mb-8 max-w-md mx-auto">
              Connect your wallet and experience the next generation of
              verifiable credentials.
            </p>
            <WalletButton />
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer id="contact" className="py-12 px-6 border-t border-slate-800">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-[#358eb8] flex items-center justify-center">
              <GraduationCap className="w-5 h-5 text-white" />
            </div>
            <span className="font-semibold text-[#358eb8]">SkillChain</span>
          </div>
          <p className="text-slate-500 text-sm">
            © 2026 SkillChain. All rights reserved.
          </p>
          <div className="flex items-center gap-6 text-slate-400 text-sm">
            <a href="#" className="hover:text-white transition-colors">
              Twitter
            </a>
            <a href="#" className="hover:text-white transition-colors">
              Discord
            </a>
            <a href="#" className="hover:text-white transition-colors">
              GitHub
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
