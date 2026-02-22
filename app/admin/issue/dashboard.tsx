"use client";

import { useState } from "react";
import {
  Wallet,
  Tag,
  CloudUpload,
  X,
  Check,
  Zap,
  Loader2,
  AlertCircle,
  CheckCircle2,
  ExternalLink,
  Copy,
  Download,
  AlertTriangle,
} from "lucide-react";

export default function NtfIssue(props) {
  const [walletAddress, setWalletAddress] = useState("");
  const [imageTitle, setImageTitle] = useState("");
  const [imageDesc, setImageDesc] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [showConfirmModal, setShowConfirmModal] = useState<boolean>(false);
  const [showSuccessModal, setShowSuccessModal] = useState<boolean>(false);
  const [mintStatus, setMintStatus] = useState<{
    type: "success" | "error" | null;
    message: string;
    nftAddress?: string;
    mintData?: {
      walletAddress: string;
      title: string;
      description: string;
      imageUrl: string;
      timestamp: string;
    };
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
    setShowConfirmModal(true);
  };

  const handleConfirmMint = async () => {
    setShowConfirmModal(false);
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
        mintData: {
          walletAddress,
          title: imageTitle,
          description: imageDesc || "No description provided",
          imageUrl: imagePreview || "",
          timestamp: new Date().toLocaleString(),
        },
      });

      setShowSuccessModal(true);

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

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const isValidWallet =
    walletAddress.length >= 32 && walletAddress.length <= 44;
  const isFormValid = isValidWallet && imageFile && imageTitle.trim();

  return (
    <div className="min-h-screen bg-background text-foreground">
      <main className="min-h-screen">
        <div className="max-w-6xl mx-auto px-6">
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

          {showConfirmModal && (
            <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
              <div className="bg-card border border-border rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                <div className="sticky top-0 bg-card border-b border-border px-6 py-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-yellow-500/20 flex items-center justify-center">
                      <AlertTriangle className="w-5 h-5 text-yellow-400" />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold">Confirm Minting</h2>
                      <p className="text-sm text-muted-foreground">
                        Please review the credential details before minting
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setShowConfirmModal(false)}
                    className="w-8 h-8 rounded-full bg-accent hover:bg-accent/80 flex items-center justify-center transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div className="p-6 space-y-6">
                  <div className="rounded-xl border border-border overflow-hidden">
                    <div className="bg-gradient-to-br from-primary/20 to-secondary p-4">
                      <div className="aspect-square max-w-xs mx-auto rounded-lg overflow-hidden border-2 border-border">
                        <img
                          src={imagePreview || ""}
                          alt={imageTitle}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    </div>
                    <div className="p-4 bg-secondary/50 border-t border-border">
                      <h3 className="font-semibold text-lg">{imageTitle}</h3>
                      <p className="text-sm text-muted-foreground mt-1">
                        {imageDesc || "No description provided"}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="bg-secondary/30 rounded-xl p-4 border border-border">
                      <h4 className="text-sm font-medium text-muted-foreground mb-3">
                        RECIPIENT DETAILS
                      </h4>
                      <div className="space-y-3">
                        <div className="flex items-start justify-between">
                          <span className="text-sm text-muted-foreground">
                            Wallet Address
                          </span>
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-mono">
                              {walletAddress.slice(0, 4)}...
                              {walletAddress.slice(-4)}
                            </span>
                            <button
                              onClick={() => copyToClipboard(walletAddress)}
                              className="p-1 hover:bg-accent rounded transition-colors"
                              title="Copy address"
                            >
                              <Copy className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="bg-secondary/30 rounded-xl p-4 border border-border">
                      <h4 className="text-sm font-medium text-muted-foreground mb-3">
                        CREDENTIAL DETAILS
                      </h4>
                      <div className="space-y-3">
                        <div className="flex items-start justify-between">
                          <span className="text-sm text-muted-foreground">
                            Title
                          </span>
                          <span className="text-sm font-medium">
                            {imageTitle}
                          </span>
                        </div>
                        <div className="flex items-start justify-between">
                          <span className="text-sm text-muted-foreground">
                            Description
                          </span>
                          <span className="text-sm text-right max-w-[200px]">
                            {imageDesc || "No description"}
                          </span>
                        </div>
                        <div className="flex items-start justify-between">
                          <span className="text-sm text-muted-foreground">
                            Image Name
                          </span>
                          <span className="text-sm">{imageFile?.name}</span>
                        </div>
                        <div className="flex items-start justify-between">
                          <span className="text-sm text-muted-foreground">
                            Image Size
                          </span>
                          <span className="text-sm">
                            {((imageFile?.size || 0) / 1024).toFixed(1)} KB
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="bg-primary/5 rounded-xl p-4 border border-primary/20">
                      <div className="flex items-start gap-3">
                        <Zap className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                        <div>
                          <p className="text-sm font-medium text-primary">
                            Network: Solana Devnet
                          </p>
                          <p className="text-xs text-muted-foreground mt-1">
                            This will mint a soulbound (non-transferable) NFT
                            credential. This action cannot be undone.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="sticky bottom-0 bg-card border-t border-border px-6 py-4 flex gap-3">
                  <button
                    onClick={() => setShowConfirmModal(false)}
                    className="flex-1 py-2.5 rounded-lg border border-border hover:bg-accent transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleConfirmMint}
                    disabled={isSubmitting}
                    className={`flex-1 py-2.5 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors font-semibold flex items-center justify-center gap-2 ${
                      isSubmitting ? "opacity-50 cursor-not-allowed" : ""
                    }`}
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Minting...
                      </>
                    ) : (
                      <>
                        <Zap className="w-4 h-4" />
                        Confirm Mint
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Success Modal */}
          {showSuccessModal && mintStatus.mintData && (
            <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
              <div className="bg-card border border-border rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                <div className="sticky top-0 bg-card border-b border-border px-6 py-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center">
                      <CheckCircle2 className="w-5 h-5 text-green-400" />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold">Credential Minted!</h2>
                      <p className="text-sm text-muted-foreground">
                        NFT has been issued successfully
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setShowSuccessModal(false)}
                    className="w-8 h-8 rounded-full bg-accent hover:bg-accent/80 flex items-center justify-center transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div className="p-6 space-y-6">
                  <div className="rounded-xl border border-border overflow-hidden">
                    <div className="bg-gradient-to-br from-primary/20 to-secondary p-4">
                      <div className="aspect-square max-w-xs mx-auto rounded-lg overflow-hidden border-2 border-border">
                        <img
                          src={mintStatus.mintData.imageUrl}
                          alt={mintStatus.mintData.title}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    </div>
                    <div className="p-4 bg-secondary/50 border-t border-border">
                      <h3 className="font-semibold text-lg">
                        {mintStatus.mintData.title}
                      </h3>
                      <p className="text-sm text-muted-foreground mt-1">
                        {mintStatus.mintData.description}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="bg-secondary/30 rounded-xl p-4 border border-border">
                      <h4 className="text-sm font-medium text-muted-foreground mb-3">
                        NFT DETAILS
                      </h4>
                      <div className="space-y-3">
                        <div className="flex items-start justify-between">
                          <span className="text-sm text-muted-foreground">
                            NFT Address
                          </span>
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-mono">
                              {mintStatus.nftAddress?.slice(0, 4)}...
                              {mintStatus.nftAddress?.slice(-4)}
                            </span>
                            <button
                              onClick={() =>
                                copyToClipboard(mintStatus.nftAddress || "")
                              }
                              className="p-1 hover:bg-accent rounded transition-colors"
                              title="Copy address"
                            >
                              <Copy className="w-3.5 h-3.5" />
                            </button>
                            <a
                              href={`https://explorer.solana.com/address/${mintStatus.nftAddress}?cluster=devnet`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="p-1 hover:bg-accent rounded transition-colors text-primary"
                              title="View on Explorer"
                            >
                              <ExternalLink className="w-3.5 h-3.5" />
                            </a>
                          </div>
                        </div>

                        <div className="flex items-start justify-between">
                          <span className="text-sm text-muted-foreground">
                            Receiver
                          </span>
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-mono">
                              {mintStatus.mintData.walletAddress.slice(0, 4)}...
                              {mintStatus.mintData.walletAddress.slice(-4)}
                            </span>
                            <button
                              onClick={() =>
                                copyToClipboard(
                                  mintStatus.mintData?.walletAddress || "",
                                )
                              }
                              className="p-1 hover:bg-accent rounded transition-colors"
                              title="Copy address"
                            >
                              <Copy className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>

                        <div className="flex items-start justify-between">
                          <span className="text-sm text-muted-foreground">
                            Network
                          </span>
                          <span className="text-sm px-2 py-1 bg-accent rounded-full">
                            Solana Devnet
                          </span>
                        </div>

                        <div className="flex items-start justify-between">
                          <span className="text-sm text-muted-foreground">
                            Minted
                          </span>
                          <span className="text-sm">
                            {mintStatus.mintData.timestamp}
                          </span>
                        </div>

                        <div className="flex items-start justify-between">
                          <span className="text-sm text-muted-foreground">
                            Type
                          </span>
                          <span className="text-sm px-2 py-1 bg-primary/20 text-primary rounded-full">
                            Soulbound (Non-transferable)
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="sticky bottom-0 bg-card border-t border-border px-6 py-4 flex gap-3">
                  <button
                    onClick={() => {
                      window.print();
                    }}
                    className="flex-1 py-2.5 rounded-lg border border-border hover:bg-accent transition-colors flex items-center justify-center gap-2"
                  >
                    <Download className="w-4 h-4" />
                    Download Certificate
                  </button>
                  <button
                    onClick={() => setShowSuccessModal(false)}
                    className="flex-1 py-2.5 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors font-semibold"
                  >
                    Done
                  </button>
                </div>
              </div>
            </div>
          )}

          {mintStatus.type === "error" && !showSuccessModal && (
            <div className="mb-8 p-4 rounded-xl border bg-destructive/10 border-destructive/30 text-destructive flex items-start gap-3">
              <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium">{mintStatus.message}</p>
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

          <form onSubmit={handleSubmit}>
            <div className="rounded-xl border border-border bg-card overflow-hidden">
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

              <div className="p-8 space-y-8">
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
                        {!isSubmitting && (
                          <button
                            type="button"
                            onClick={removeImage}
                            className="w-9 h-9 rounded-full bg-destructive hover:bg-destructive/80 flex items-center justify-center transition-colors"
                          >
                            <X className="w-4 h-4 text-destructive-foreground" />
                          </button>
                        )}
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
                      Review & Mint Credential
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
