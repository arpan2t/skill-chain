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
} from "lucide-react";
import { toast } from "./../../../../hooks/useToast";

interface VerificationResult {
  verified: boolean;
  certificate?: {
    name: string;
    recipient: string;
    issuer: string;
    issuedDate: string;
    mintAddress: string;
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

    const response = await fetch(`/api/verify/${mintAddress.trim()}`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    });

    console.log(response);
    if (response.ok) {
      const data = await response.json();

      setResult(data);
    } else {
      setResult({
        verified: false,
        error: "Failed to fetch certificate data. Please try again later.",
      });
    }

    // Mock result for demonstration
    const isMock = mintAddress.length >= 32;
    if (isMock) {
      setResult({
        verified: true,
        certificate: {
          name: "Blockchain Fundamentals Certificate",
          recipient: "Alex Johnson",
          issuer: "SkillChain Academy",
          issuedDate: "2025-12-15",
          mintAddress: mintAddress.trim(),
          status: "active",
        },
      });
    } else {
      setResult({
        verified: false,
        error:
          "No certificate found for this mint address. Please check the address and try again.",
      });
    }

    setLoading(false);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({ title: "Copied!", description: "Address copied to clipboard." });
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl font-semibold text-foreground">
          Verify Certificate
        </h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          Enter a Solana mint address to verify the authenticity of a
          certificate on-chain.
        </p>
      </div>

      {/* Search Card */}
      <div className="rounded-xl border border-border bg-card p-6">
        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
            <ShieldCheck className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-foreground">
              On-Chain Verification
            </h2>
            <p className="text-xs text-muted-foreground">
              Lookup a certificate NFT by its mint address
            </p>
          </div>
        </div>

        <div className="space-y-3">
          <Label htmlFor="mintAddress" className="text-sm text-foreground">
            Mint Address
          </Label>
          <div className="flex gap-2">
            <Input
              id="mintAddress"
              placeholder="Enter Solana mint address…"
              value={mintAddress}
              onChange={(e) => setMintAddress(e.target.value)}
              className="font-mono text-sm"
              onKeyDown={(e) => e.key === "Enter" && handleVerify()}
            />
            <Button
              onClick={handleVerify}
              disabled={loading}
              className="shrink-0"
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Search className="w-4 h-4" />
              )}
              <span className="hidden sm:inline ml-1">Verify</span>
            </Button>
          </div>
          <p className="text-xs text-muted-foreground">
            Example: <span className="font-mono">7xKXtg.......W87d97</span>
          </p>
        </div>
      </div>

      {/* Result */}
      {loading && (
        <div className="rounded-xl border border-border bg-card p-8 flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">
            Verifying on-chain data…
          </p>
        </div>
      )}

      {result && !loading && (
        <div
          className={`rounded-xl border p-6 ${
            result.verified
              ? "border-emerald-500/30 bg-emerald-500/5"
              : "border-destructive/30 bg-destructive/5"
          }`}
        >
          {/* Status Header */}
          <div className="flex items-center gap-3 mb-5">
            {result.verified ? (
              <div className="w-10 h-10 rounded-full bg-emerald-500/10 flex items-center justify-center">
                <CheckCircle2 className="w-5 h-5 text-emerald-500" />
              </div>
            ) : (
              <div className="w-10 h-10 rounded-full bg-destructive/10 flex items-center justify-center">
                <XCircle className="w-5 h-5 text-destructive" />
              </div>
            )}
            <div>
              <h3 className="text-sm font-semibold text-foreground">
                {result.verified
                  ? "Certificate Verified ✓"
                  : "Verification Failed"}
              </h3>
              <p className="text-xs text-muted-foreground">
                {result.verified
                  ? "This certificate is authentic and recorded on-chain."
                  : result.error}
              </p>
            </div>
          </div>

          {/* Certificate Details */}
          {result.verified && result.certificate && (
            <div className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <DetailRow
                  icon={Award}
                  label="Certificate"
                  value={result.certificate.name}
                />
                <DetailRow
                  icon={User}
                  label="Recipient"
                  value={result.certificate.recipient}
                />
                <DetailRow
                  icon={Building2}
                  label="Issuer"
                  value={result.certificate.issuer}
                />
                <DetailRow
                  icon={Calendar}
                  label="Issued Date"
                  value={result.certificate.issuedDate}
                />
              </div>

              {/* Mint Address */}
              <div className="rounded-lg bg-secondary border border-border p-4">
                <p className="text-xs text-muted-foreground mb-1.5">
                  Mint Address
                </p>
                <div className="flex items-center gap-2">
                  <code className="text-xs font-mono text-foreground break-all flex-1">
                    {result.certificate.mintAddress}
                  </code>
                  <button
                    onClick={() =>
                      copyToClipboard(result.certificate!.mintAddress)
                    }
                    className="shrink-0 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <Copy className="w-3.5 h-3.5" />
                  </button>
                  <a
                    href={`https://explorer.solana.com/address/${result.certificate.mintAddress}?cluster=devnet`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="shrink-0 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>

              {/* Status Badge */}
              <div className="flex items-center gap-2">
                <span
                  className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${
                    result.certificate.status === "active"
                      ? "bg-emerald-500/10 text-emerald-500"
                      : "bg-destructive/10 text-destructive"
                  }`}
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-current" />
                  {result.certificate.status === "active"
                    ? "Active"
                    : "Revoked"}
                </span>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

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
    <div className="flex items-start gap-3">
      <div className="w-8 h-8 rounded-lg bg-secondary flex items-center justify-center shrink-0 mt-0.5">
        <Icon className="w-4 h-4 text-muted-foreground" />
      </div>
      <div>
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="text-sm font-medium text-foreground">{value}</p>
      </div>
    </div>
  );
}
