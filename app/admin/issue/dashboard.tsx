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
  AlertCircle,
  CheckCircle2,
} from "lucide-react";

export default function NtfIssue(props) {
  const [walletAddress, setWalletAddress] = useState("");
  const [imageTitle, setImageTitle] = useState("");
  const [imageDesc, setImageDesc] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [mintStatus, setMintStatus] = useState<{
    type: "success" | "error" | null;
    message: string;
    nftAddress?: string;
  }>({ type: null, message: "" });

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

  const safeParseJson = async (response: Response) => {
    const text = await response.text();
    try {
      return JSON.parse(text);
    } catch {
      if (text.startsWith("<!DOCTYPE") || text.startsWith("<html")) {
        throw new Error(
          `Server error (${response.status}): The server returned an error page. Please check server logs.`,
        );
      }
      throw new Error(
        `Invalid response from server: ${text.substring(0, 100)}`,
      );
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setMintStatus({ type: null, message: "" });

    try {
      const formData = new FormData();
      formData.append("file", imageFile as File);

      const uploadResponse = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const uploadResult = await safeParseJson(uploadResponse);

      if (!uploadResponse.ok) {
        throw new Error(uploadResult.error || "Failed to upload image to IPFS");
      }

      const { ipfsUrl } = uploadResult;

      const mintResponse = await fetch("/api/mint", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          walletAddress,
          title: imageTitle,
          description: imageDesc,
          ipfsUrl,
        }),
      });

      const rawText = await mintResponse.text();
      let mintResult;
      try {
        mintResult = JSON.parse(rawText);
      } catch (e) {
        throw new Error("Server did not return valid JSON");
      }

      if (!mintResponse.ok) {
        throw new Error(mintResult.error || "Failed to mint credential");
      }

      setMintStatus({
        type: "success",
        message: "Credential minted successfully!",
        nftAddress: mintResult.certificate?.nftAddress,
      });

      setWalletAddress("");
      setImageTitle("");
      setImageDesc("");
      setImageFile(null);
      setImagePreview(null);
    } catch (error: any) {
      setMintStatus({
        type: "error",
        message: error.message || "An error occurred while minting",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const isValidWallet =
    walletAddress.length >= 32 && walletAddress.length <= 44;
  const isFormValid = isValidWallet && imageFile && imageTitle.trim();

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Top Navigation */}
      <header className="fixed top-0 left-0 right-0 h-16 bg-background/90 backdrop-blur-sm border-b border-border z-50">
        <div className="h-full max-w-6xl mx-auto px-6 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <GraduationCap className="w-6 h-6 text-primary" />
            <span className="text-lg font-semibold">SkillChain</span>
            <span className="text-xs px-2 py-0.5 rounded-full bg-secondary text-muted-foreground font-medium">
              {props.username}
            </span>
          </Link>
          <button
            onClick={() => signOut({ callbackUrl: "/login" })}
            className="px-4 py-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            Sign Out
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="pt-16 min-h-screen">
        <div className="max-w-6xl mx-auto px-6 py-16">
          {/* Page Header */}
          <div className="mb-10">
            <p className="text-sm text-muted-foreground mb-4">
              Issue Credential
            </p>
            <h1 className="text-3xl font-bold mb-2">
              Mint a New <span className="text-primary">Credential</span>
            </h1>
            <p className="text-muted-foreground max-w-md">
              Issue a verifiable credential NFT to a student's Solana wallet.
            </p>
          </div>

          {/* Status Message */}
          {mintStatus.type && (
            <div
              className={`mb-8 p-4 rounded-xl border flex items-start gap-3 ${
                mintStatus.type === "success"
                  ? "bg-green-500/10 border-green-500/30 text-green-400"
                  : "bg-destructive/10 border-destructive/30 text-destructive"
              }`}
            >
              {mintStatus.type === "success" ? (
                <CheckCircle2 className="w-5 h-5 flex-shrink-0 mt-0.5" />
              ) : (
                <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
              )}
              <div>
                <p className="font-medium">{mintStatus.message}</p>
                {mintStatus.nftAddress && (
                  <p className="text-sm mt-1 text-muted-foreground">
                    NFT Address:{" "}
                    <a
                      href={`https://explorer.solana.com/address/${mintStatus.nftAddress}?cluster=devnet`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:underline"
                    >
                      {mintStatus.nftAddress.slice(0, 8)}...
                      {mintStatus.nftAddress.slice(-8)}
                    </a>
                  </p>
                )}
              </div>
              <button
                type="button"
                onClick={() => setMintStatus({ type: null, message: "" })}
                className="ml-auto text-muted-foreground hover:text-foreground"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit}>
            <div className="rounded-xl border border-border bg-card overflow-hidden">
              {/* Progress Steps */}
              <div className="px-8 py-5 border-b border-border bg-secondary/50">
                <div className="flex items-center gap-3">
                  {[
                    { label: "Wallet", done: walletAddress && isValidWallet },
                    { label: "Title", done: imageTitle.trim() },
                    { label: "Image", done: !!imageFile },
                  ].map((step, i) => (
                    <div
                      key={step.label}
                      className="flex items-center gap-3 flex-1"
                    >
                      <div className="flex items-center gap-2">
                        <div
                          className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-medium ${
                            step.done
                              ? "bg-primary text-primary-foreground"
                              : "bg-accent text-muted-foreground"
                          }`}
                        >
                          {step.done ? "✓" : i + 1}
                        </div>
                        <span
                          className={`text-sm ${
                            step.done ? "text-primary" : "text-muted-foreground"
                          }`}
                        >
                          {step.label}
                        </span>
                      </div>
                      {i < 2 && <div className="flex-1 h-px bg-border" />}
                    </div>
                  ))}
                </div>
              </div>

              {/* Fields */}
              <div className="p-8 space-y-8">
                {/* Wallet Address */}
                <div>
                  <label className="block text-sm font-medium mb-3">
                    Receiver Wallet Address
                  </label>
                  <div className="relative">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2">
                      <Wallet className="w-5 h-5 text-muted-foreground" />
                    </div>
                    <input
                      type="text"
                      value={walletAddress}
                      onChange={(e) => setWalletAddress(e.target.value)}
                      placeholder="e.g., AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA"
                      required
                      className={`w-full pl-12 pr-4 py-3.5 rounded-lg bg-background border text-foreground placeholder-muted-foreground focus:outline-none transition-colors ${
                        walletAddress
                          ? isValidWallet
                            ? "border-primary focus:border-primary"
                            : "border-destructive focus:border-destructive"
                          : "border-border focus:border-primary"
                      }`}
                    />
                    {walletAddress && isValidWallet && (
                      <div className="absolute right-4 top-1/2 -translate-y-1/2">
                        <Check className="w-5 h-5 text-primary" />
                      </div>
                    )}
                  </div>
                  {walletAddress && !isValidWallet && (
                    <p className="text-destructive text-sm mt-2">
                      Please enter a valid Solana wallet address (32-44
                      characters)
                    </p>
                  )}
                </div>

                {/* Credential Title */}
                <div>
                  <label className="block text-sm font-medium mb-3">
                    Credential Title
                  </label>
                  <div className="relative">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2">
                      <Tag className="w-5 h-5 text-muted-foreground" />
                    </div>
                    <input
                      type="text"
                      value={imageTitle}
                      onChange={(e) => setImageTitle(e.target.value)}
                      placeholder="e.g., Bachelor of Computer Science - 2026"
                      required
                      className="w-full pl-12 pr-4 py-3.5 rounded-lg bg-background border border-border text-foreground placeholder-muted-foreground focus:outline-none focus:border-primary transition-colors"
                    />
                  </div>
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-medium mb-3">
                    Credential Description{" "}
                    <span className="text-muted-foreground font-normal">
                      (optional)
                    </span>
                  </label>
                  <textarea
                    value={imageDesc}
                    onChange={(e) => setImageDesc(e.target.value)}
                    placeholder="Brief description of the credential..."
                    className="w-full px-4 py-3.5 rounded-lg bg-background border border-border text-foreground placeholder-muted-foreground focus:outline-none focus:border-primary transition-colors min-h-[100px] resize-y"
                  />
                </div>

                {/* Image Upload */}
                <div>
                  <label className="block text-sm font-medium mb-3">
                    Credential Image
                  </label>
                  {!imagePreview ? (
                    <label className="block cursor-pointer">
                      <div className="border-2 border-dashed border-border rounded-xl p-12 text-center hover:border-primary/50 hover:bg-accent/50 transition-all">
                        <div className="w-14 h-14 rounded-full bg-accent flex items-center justify-center mx-auto mb-4">
                          <CloudUpload className="w-7 h-7 text-muted-foreground" />
                        </div>
                        <p className="text-secondary-foreground mb-1">
                          <span className="text-primary font-medium">
                            Click to upload
                          </span>{" "}
                          or drag and drop
                        </p>
                        <p className="text-sm text-muted-foreground">
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
                    <div className="relative rounded-xl overflow-hidden border border-border">
                      <img
                        src={imagePreview}
                        alt="Preview"
                        className="w-full h-72 object-contain bg-background"
                      />
                      <div className="absolute top-3 right-3">
                        <button
                          type="button"
                          disabled={isSubmitting}
                          onClick={removeImage}
                          className="w-9 h-9 rounded-full bg-destructive hover:bg-destructive/80 flex items-center justify-center transition-colors"
                        >
                          <X className="w-4 h-4 text-destructive-foreground" />
                        </button>
                      </div>
                      <div className="px-4 py-3 bg-secondary border-t border-border">
                        <div className="flex items-center gap-3">
                          <Check className="w-4 h-4 text-primary" />
                          <span className="text-sm">{imageFile?.name}</span>
                          <span className="text-sm text-muted-foreground">
                            ({((imageFile?.size || 0) / 1024).toFixed(1)} KB)
                          </span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Submit */}
              <div className="px-8 py-6 border-t border-border bg-secondary/50">
                <button
                  type="submit"
                  disabled={isSubmitting || !isFormValid}
                  className={`w-full py-3.5 rounded-lg font-semibold transition-colors flex items-center justify-center gap-2 ${
                    isSubmitting || !isFormValid
                      ? "bg-accent text-muted-foreground cursor-not-allowed"
                      : "bg-primary text-primary-foreground hover:bg-primary/90"
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

          <p className="text-center text-sm text-muted-foreground mt-8">
            This will mint a soulbound (non-transferable) NFT credential on
            Solana Devnet
          </p>
        </div>
      </main>
    </div>
  );
}
