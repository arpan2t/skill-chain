"use client";

import { useState } from "react";
import Link from "next/link";
import { signOut } from "next-auth/react";
import {
  GraduationCap,
  Plus,
  Wallet,
  Tag,
  CloudUpload,
  X,
  Check,
  Zap,
  Loader2,
} from "lucide-react";

export default function AdminDashboard() {
  const [walletAddress, setWalletAddress] = useState("");
  const [imageTitle, setImageTitle] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setImageFile(null);
    setImagePreview(null);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);

    console.log({
      walletAddress,
      imageTitle,
      imageFile,
    });

    await new Promise((resolve) => setTimeout(resolve, 2000));

    alert("Credential minted successfully!");
    setIsSubmitting(false);

    setWalletAddress("");
    setImageTitle("");
    setImageFile(null);
    setImagePreview(null);
  };

  const isValidWallet =
    walletAddress.length >= 32 && walletAddress.length <= 44;
  const isFormValid = isValidWallet && imageFile && imageTitle.trim();

  return (
    <div className="min-h-screen bg-slate-950">
      {/* Top Navigation */}
      <header className="fixed top-0 left-0 right-0 h-16 bg-slate-900/95 backdrop-blur border-b border-slate-800 z-50">
        <div className="h-full px-6 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-[#358eb8] flex items-center justify-center">
              <GraduationCap className="w-5 h-5 text-white" />
            </div>
            <span className="text-lg font-bold text-white">SkillChain</span>
            <span className="text-xs px-2 py-1 rounded-full bg-[#358eb8]/20 text-[#4aa3cc] font-medium">
              Admin
            </span>
          </Link>

          <div className="flex items-center gap-4">
            <button
              onClick={() => signOut({ callbackUrl: "/login" })}
              className="px-4 py-2 text-sm text-slate-400 hover:text-white transition-colors"
            >
              Sign Out
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="pt-16 min-h-screen">
        <div className="max-w-5xl mx-auto px-6 py-12">
          {/* Page Header */}
          <div className="flex flex-row gap-4">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-[#358eb8] mb-6">
              <Plus className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">
                Issue New Credential
              </h1>
              <p className="text-slate-400">
                Mint a verifiable credential NFT to a student's Solana wallet
              </p>
            </div>
          </div>

          {/* Form Card */}
          <form onSubmit={handleSubmit}>
            <div className="bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden">
              {/* Form Header */}
              <div className="px-8 py-6 border-b border-slate-800 bg-slate-800/30">
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${walletAddress && isValidWallet ? "bg-green-600 text-white" : "bg-slate-700 text-slate-400"}`}
                    >
                      {walletAddress && isValidWallet ? "✓" : "1"}
                    </div>
                    <span
                      className={`text-sm ${walletAddress && isValidWallet ? "text-green-400" : "text-slate-500"}`}
                    >
                      Wallet
                    </span>
                  </div>
                  <div className="flex-1 h-px bg-slate-700" />
                  <div className="flex items-center gap-2">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${imageTitle.trim() ? "bg-green-600 text-white" : "bg-slate-700 text-slate-400"}`}
                    >
                      {imageTitle.trim() ? "✓" : "2"}
                    </div>
                    <span
                      className={`text-sm ${imageTitle.trim() ? "text-green-400" : "text-slate-500"}`}
                    >
                      Title
                    </span>
                  </div>
                  <div className="flex-1 h-px bg-slate-700" />
                  <div className="flex items-center gap-2">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${imageFile ? "bg-green-600 text-white" : "bg-slate-700 text-slate-400"}`}
                    >
                      {imageFile ? "✓" : "3"}
                    </div>
                    <span
                      className={`text-sm ${imageFile ? "text-green-400" : "text-slate-500"}`}
                    >
                      Image
                    </span>
                  </div>
                </div>
              </div>

              {/* Form Content */}
              <div className="p-8 space-y-8">
                {/* Wallet Address */}
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-3">
                    Reciever Wallet Address
                  </label>
                  <div className="relative">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2">
                      <Wallet className="w-5 h-5 text-slate-500" />
                    </div>
                    <input
                      type="text"
                      value={walletAddress}
                      onChange={(e) => setWalletAddress(e.target.value)}
                      placeholder="e.g., AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA"
                      required
                      className={`w-full pl-12 pr-4 py-4 rounded-xl bg-slate-800 border text-white placeholder-slate-500 focus:outline-none transition-all ${
                        walletAddress
                          ? isValidWallet
                            ? "border-green-500 focus:border-green-500"
                            : "border-red-500 focus:border-red-500"
                          : "border-slate-700 focus:border-[#358eb8]"
                      }`}
                    />
                    {walletAddress && isValidWallet && (
                      <div className="absolute right-4 top-1/2 -translate-y-1/2">
                        <Check className="w-5 h-5 text-green-500" />
                      </div>
                    )}
                  </div>
                  {walletAddress && !isValidWallet && (
                    <p className="text-red-400 text-sm mt-2">
                      Please enter a valid Solana wallet address (32-44
                      characters)
                    </p>
                  )}
                </div>

                {/* Credential Title */}
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-3">
                    Credential Title
                  </label>
                  <div className="relative">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2">
                      <Tag className="w-5 h-5 text-slate-500" />
                    </div>
                    <input
                      type="text"
                      value={imageTitle}
                      onChange={(e) => setImageTitle(e.target.value)}
                      placeholder="e.g., Bachelor of Computer Science - 2026"
                      required
                      className="w-full pl-12 pr-4 py-4 rounded-xl bg-slate-800 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-[#358eb8] transition-all"
                    />
                  </div>
                </div>

                {/* Image Upload */}
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-3">
                    Credential Image
                  </label>

                  {!imagePreview ? (
                    <label className="block cursor-pointer">
                      <div className="border-2 border-dashed border-slate-700 rounded-xl p-12 text-center hover:border-[#358eb8] hover:bg-slate-800/50 transition-all">
                        <div className="w-16 h-16 rounded-full bg-slate-800 flex items-center justify-center mx-auto mb-4">
                          <CloudUpload className="w-8 h-8 text-slate-500" />
                        </div>
                        <p className="text-slate-300 mb-1">
                          <span className="text-[#4aa3cc] font-medium">
                            Click to upload
                          </span>{" "}
                          or drag and drop
                        </p>
                        <p className="text-sm text-slate-500">
                          PNG, JPG or WEBP (max 5MB)
                        </p>
                      </div>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageChange}
                        className="hidden"
                      />
                    </label>
                  ) : (
                    <div className="relative rounded-xl overflow-hidden bg-slate-800 border border-slate-700">
                      <img
                        src={imagePreview}
                        alt="Preview"
                        className="w-full h-72 object-contain bg-slate-900"
                      />
                      <div className="absolute top-3 right-3">
                        <button
                          type="button"
                          onClick={removeImage}
                          className="w-10 h-10 rounded-full bg-red-600 hover:bg-red-500 flex items-center justify-center transition-colors"
                        >
                          <X className="w-5 h-5 text-white" />
                        </button>
                      </div>
                      <div className="px-4 py-3 bg-slate-800 border-t border-slate-700">
                        <div className="flex items-center gap-3">
                          <Check className="w-5 h-5 text-green-500" />
                          <span className="text-sm text-slate-300">
                            {imageFile?.name}
                          </span>
                          <span className="text-sm text-slate-500">
                            ({((imageFile?.size || 0) / 1024).toFixed(1)} KB)
                          </span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Form Footer */}
              <div className="px-8 py-6 border-t border-slate-800 bg-slate-800/30">
                <button
                  type="submit"
                  disabled={isSubmitting || !isFormValid}
                  className={`w-full py-4 rounded-xl font-semibold text-lg transition-all flex items-center justify-center gap-3 ${
                    isSubmitting || !isFormValid
                      ? "bg-slate-700 text-slate-500 cursor-not-allowed"
                      : "bg-[#358eb8] text-white hover:bg-[#2a7296] active:scale-[0.99]"
                  }`}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Minting Credential...
                    </>
                  ) : (
                    <>
                      <Zap className="w-5 h-5" />
                      Mint Credential NFT
                    </>
                  )}
                </button>
              </div>
            </div>
          </form>

          {/* Help Text */}
          <p className="text-center text-sm text-slate-500 mt-6">
            This will mint a soulbound (non-transferable) NFT credential to the
            student's wallet on Solana Devnet
          </p>
        </div>
      </main>
    </div>
  );
}
