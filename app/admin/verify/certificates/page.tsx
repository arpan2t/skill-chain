"use client";
import { useState } from "react";
import { Button } from "./../../../components/ui/button";
import { Input } from "./../../../components/ui/input";
import { Label } from "./../../../components/ui/label";
import {
  ShieldCheck,
  Search,
  CheckCircle2,
  XCircle,
  Loader2,
  Copy,
  ExternalLink,
  Award,
  User,
  Calendar,
  Building2,
  Ban,
  Wallet,
  BadgeCheck,
  Clock,
  Hash,
  Sparkles,
} from "lucide-react";
import { toast } from "./../../../../hooks/useToast";

interface VerificationResponse {
  success: boolean;
  verification: {
    exists: boolean;
    revoked: boolean;
    certificate?: {
      name: string;
      recipient: string;
      issuer: string;
      issuedDate: string;
      mintAddress: string;
      description?: string;
      imageUrl?: string;
    };
  };
  error?: string;
}

interface VerificationResult {
  verified: boolean;
  certificate?: {
    name: string;
    recipient: string;
    issuer: string;
    issuedDate: string;
    mintAddress: string;
    description?: string;
    imageUrl?: string;
    status: "active" | "revoked";
  };
  error?: string;
}

export default function VerifyPage() {
  const [mintAddress, setMintAddress] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<VerificationResult | null>(null);

  const handleVerify = async () => {
    if (!mintAddress.trim()) {
      toast({
        title: "Missing Mint Address",
        description: "Please enter a valid Solana mint address to verify.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    setResult(null);

    try {
      const response = await fetch(`/api/verify/${mintAddress.trim()}`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      });

      const data: VerificationResponse = await response.json();
      console.log("API Response:", data);

      if (response.ok && data.success) {
        if (data.verification.exists && data.verification.certificate) {
          setResult({
            verified: true,
            certificate: {
              name: data.verification.certificate.name,
              recipient: data.verification.certificate.recipient,
              issuer: data.verification.certificate.issuer,
              issuedDate: data.verification.certificate.issuedDate,
              mintAddress: mintAddress.trim(),
              description: data.verification.certificate.description,
              imageUrl: data.verification.certificate.imageUrl,
              status: data.verification.revoked ? "revoked" : "active",
            },
          });
        } else {
          setResult({
            verified: false,
            error: data.error || "Certificate not found",
          });
        }
      } else {
        setResult({
          verified: false,
          error:
            data.error ||
            "Failed to fetch certificate data. Please try again later.",
        });
      }
    } catch (error) {
      console.error("Verification error:", error);
      setResult({
        verified: false,
        error: "An error occurred while verifying. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied!",
      description: "Address copied to clipboard.",
    });
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const truncateAddress = (address: string) => {
    if (!address) return "";
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary/20 py-8">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 space-y-6">
        {/* Header with decorative elements */}
        <div className="relative mb-8">
          <div
            className="absolute inset-0 flex items-center"
            aria-hidden="true"
          >
            <div className="w-full border-t border-border" />
          </div>
          <div className="relative flex justify-center">
            <div className="bg-background px-4 flex items-center gap-2 text-primary">
              <BadgeCheck className="w-5 h-5" />
              <span className="text-sm font-medium uppercase tracking-wider">
                Certificate Verification
              </span>
            </div>
          </div>
        </div>

        {/* Hero Section */}
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
            Verify Certificate
          </h1>
          <p className="text-sm text-muted-foreground mt-2 max-w-md mx-auto">
            Enter a Solana mint address to verify the authenticity of a
            certificate on-chain.
          </p>
        </div>

        {/* Search Card - Glassmorphism effect */}
        <div className="rounded-2xl border border-border/50 bg-card/80 backdrop-blur-sm p-6 md:p-8 shadow-lg">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
              <ShieldCheck className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-foreground">
                On-Chain Verification
              </h2>
              <p className="text-xs text-muted-foreground">
                Lookup a certificate NFT by its mint address
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <Label htmlFor="mintAddress" className="text-sm text-foreground/80">
              Mint Address
            </Label>
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Hash className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="mintAddress"
                  placeholder="Enter Solana mint address..."
                  value={mintAddress}
                  onChange={(e) => setMintAddress(e.target.value)}
                  className="font-mono text-sm pl-9 h-12 bg-background/50 border-border/50 focus:border-primary transition-all"
                  onKeyDown={(e) => e.key === "Enter" && handleVerify()}
                />
              </div>
              <Button
                onClick={handleVerify}
                disabled={loading}
                className="h-12 px-6 bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 transition-all duration-300 shadow-lg shadow-primary/25"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    Verifying...
                  </>
                ) : (
                  <>
                    <Search className="w-4 h-4 mr-2" />
                    Verify
                  </>
                )}
              </Button>
            </div>
            <p className="text-xs text-muted-foreground/70 flex items-center gap-1">
              <Sparkles className="w-3 h-3" />
              Example: <span className="font-mono">7xKXtg...W87d97</span>
            </p>
          </div>
        </div>

        {/* Loading State - Skeleton */}
        {loading && (
          <div className="rounded-2xl border border-border/50 bg-card/80 backdrop-blur-sm p-8 flex flex-col items-center gap-4">
            <div className="relative">
              <Loader2 className="w-10 h-10 animate-spin text-primary" />
              <div className="absolute inset-0 blur-xl bg-primary/20 rounded-full" />
            </div>
            <div className="text-center">
              <p className="text-sm font-medium text-foreground">
                Verifying on-chain data
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                This may take a few seconds...
              </p>
            </div>
          </div>
        )}

        {/* Result */}
        {result && !loading && (
          <div
            className={`rounded-2xl border overflow-hidden transition-all duration-500 animate-in fade-in slide-in-from-bottom-4 ${
              result.verified
                ? result.certificate?.status === "revoked"
                  ? "border-orange-500/30 bg-gradient-to-br from-orange-500/5 via-transparent to-transparent"
                  : "border-emerald-500/30 bg-gradient-to-br from-emerald-500/5 via-transparent to-transparent"
                : "border-destructive/30 bg-gradient-to-br from-destructive/5 via-transparent to-transparent"
            }`}
          >
            {/* Status Header */}
            <div className="px-6 py-4 border-b border-border/50 bg-secondary/20">
              <div className="flex items-center gap-3">
                <div
                  className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                    result.verified
                      ? result.certificate?.status === "revoked"
                        ? "bg-orange-500/10"
                        : "bg-emerald-500/10"
                      : "bg-destructive/10"
                  }`}
                >
                  {result.verified ? (
                    result.certificate?.status === "revoked" ? (
                      <Ban className="w-6 h-6 text-orange-500" />
                    ) : (
                      <CheckCircle2 className="w-6 h-6 text-emerald-500" />
                    )
                  ) : (
                    <XCircle className="w-6 h-6 text-destructive" />
                  )}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-semibold text-foreground">
                      {result.verified
                        ? result.certificate?.status === "revoked"
                          ? "Certificate Revoked"
                          : "Certificate Verified"
                        : "Verification Failed"}
                    </h3>
                    <span
                      className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium ${
                        result.verified
                          ? result.certificate?.status === "revoked"
                            ? "bg-orange-500/10 text-orange-500"
                            : "bg-emerald-500/10 text-emerald-500"
                          : "bg-destructive/10 text-destructive"
                      }`}
                    >
                      <span className="w-1 h-1 rounded-full bg-current" />
                      {result.verified
                        ? result.certificate?.status === "revoked"
                          ? "Revoked"
                          : "Active"
                        : "Error"}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground/80 mt-0.5">
                    {result.verified
                      ? result.certificate?.status === "revoked"
                        ? "This certificate has been revoked and is no longer valid."
                        : "This certificate is authentic and recorded on-chain."
                      : result.error}
                  </p>
                </div>
              </div>
            </div>

            {/* Certificate Details */}
            {result.verified && result.certificate && (
              <div className="p-6 space-y-6">
                {/* Certificate Image with gradient overlay */}
                {result.certificate.imageUrl && (
                  <div className="relative rounded-xl overflow-hidden border border-border/50 group">
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                    <img
                      src={result.certificate.imageUrl}
                      alt={result.certificate.name}
                      className="w-full h-56 object-cover"
                    />
                    <div className="absolute bottom-3 left-3 right-3">
                      <p className="text-white text-sm font-medium truncate opacity-0 group-hover:opacity-100 transition-opacity">
                        {result.certificate.name}
                      </p>
                    </div>
                  </div>
                )}

                {/* Certificate Info Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <InfoCard
                    icon={Award}
                    label="Certificate Name"
                    value={result.certificate.name}
                  />
                  <InfoCard
                    icon={Wallet}
                    label="Recipient Wallet"
                    value={result.certificate.recipient}
                    isAddress={true}
                    onCopy={() =>
                      copyToClipboard(result.certificate!.recipient)
                    }
                  />
                  <InfoCard
                    icon={Building2}
                    label="Issuer"
                    value={result.certificate.issuer}
                  />
                  <InfoCard
                    icon={Calendar}
                    label="Issued Date"
                    value={formatDate(result.certificate.issuedDate)}
                  />
                </div>

                {/* Description */}
                {result.certificate.description && (
                  <div className="rounded-xl bg-secondary/30 border border-border/50 p-4">
                    <p className="text-xs text-muted-foreground/70 mb-2 flex items-center gap-1.5">
                      <span className="w-1 h-1 rounded-full bg-primary/50" />
                      Description
                    </p>
                    <p className="text-sm text-foreground/90 leading-relaxed">
                      {result.certificate.description}
                    </p>
                  </div>
                )}

                {/* Mint Address - Fixed overflow issue */}
                <div className="rounded-xl bg-secondary/40 border border-border/50 p-4">
                  <p className="text-xs text-muted-foreground/70 mb-2 flex items-center gap-1.5">
                    <Hash className="w-3 h-3" />
                    Mint Address
                  </p>
                  <div className="flex items-center gap-2 bg-background/50 rounded-lg p-2 border border-border/30">
                    <code className="text-xs font-mono text-foreground/90 truncate flex-1">
                      {result.certificate.mintAddress}
                    </code>
                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        onClick={() =>
                          copyToClipboard(result.certificate!.mintAddress)
                        }
                        className="p-1.5 hover:bg-secondary rounded-lg transition-colors group"
                        title="Copy address"
                      >
                        <Copy className="w-3.5 h-3.5 text-muted-foreground group-hover:text-foreground" />
                      </button>
                      <a
                        href={`https://explorer.solana.com/address/${result.certificate.mintAddress}?cluster=devnet`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-1.5 hover:bg-secondary rounded-lg transition-colors group"
                        title="View on Explorer"
                      >
                        <ExternalLink className="w-3.5 h-3.5 text-muted-foreground group-hover:text-foreground" />
                      </a>
                    </div>
                  </div>
                </div>

                {/* Footer with timestamp */}
                <div className="flex items-center justify-between pt-2 border-t border-border/30">
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground/60">
                    <Clock className="w-3 h-3" />
                    <span>Verified on {new Date().toLocaleString()}</span>
                  </div>
                  {result.certificate.status === "revoked" && (
                    <span className="text-xs text-orange-500/70 flex items-center gap-1">
                      <Ban className="w-3 h-3" />
                      Revoked Certificate
                    </span>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// Enhanced DetailRow component with better layout
function DetailRow({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-start gap-3 p-3 rounded-xl bg-secondary/20 border border-border/30 hover:border-border/60 transition-colors">
      <div className="w-8 h-8 rounded-lg bg-secondary/50 flex items-center justify-center shrink-0">
        <Icon className="w-4 h-4 text-muted-foreground" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-xs text-muted-foreground/70">{label}</p>
        <p className="text-sm font-medium text-foreground truncate">{value}</p>
      </div>
    </div>
  );
}

// New InfoCard component for better organization
function InfoCard({
  icon: Icon,
  label,
  value,
  isAddress = false,
  onCopy,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
  isAddress?: boolean;
  onCopy?: () => void;
}) {
  const truncateAddress = (addr: string) => {
    if (!addr) return "";
    return `${addr.slice(0, 4)}...${addr.slice(-4)}`;
  };

  return (
    <div className="flex items-start gap-3 p-4 rounded-xl bg-secondary/20 border border-border/30 hover:border-border/60 transition-all group">
      <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center shrink-0">
        <Icon className="w-4 h-4 text-primary" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-xs text-muted-foreground/70 mb-1">{label}</p>
        <div className="flex items-center gap-2">
          <p className="text-sm font-medium text-foreground break-all">
            {isAddress ? truncateAddress(value) : value}
          </p>
          {isAddress && onCopy && (
            <button
              onClick={onCopy}
              className="opacity-0 group-hover:opacity-100 transition-opacity shrink-0"
              title="Copy wallet address"
            >
              <Copy className="w-3.5 h-3.5 text-muted-foreground hover:text-foreground" />
            </button>
          )}
        </div>
        {isAddress && (
          <p className="text-xs font-mono text-muted-foreground/50 mt-1 truncate">
            {value}
          </p>
        )}
      </div>
    </div>
  );
}
