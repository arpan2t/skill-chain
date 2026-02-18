"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  Grid3X3,
  List,
  RefreshCw,
  AlertCircle,
  ShieldCheck,
  Check,
  XCircle,
  ChevronDown,
  ChevronUp,
  Copy,
} from "lucide-react";
import CertificateCard from "./../components/CertificateCard";

interface Certificate {
  nftAddress: string;
  title: string;
  description: string;
  image: string;
  issuer: string;
  issuedAt: string;
  recipientName: string;
  recipientWallet: string;
  revoked: boolean;
  attributes: any[];
}

interface VerificationResult {
  exists: boolean;
  revoked: boolean;
  reason?: string;
}

export default function SharedPage() {
  const searchParams = useSearchParams();
  const certsParam = searchParams.get("certs");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [view, setView] = useState<"grid" | "list">("grid");

  // Verification states - SIMPLIFIED
  const [verificationMode, setVerificationMode] = useState(false);
  const [selectedCerts, setSelectedCerts] = useState<string[]>([]);
  const [verificationResults, setVerificationResults] = useState<
    Record<string, VerificationResult>
  >({});
  const [verifying, setVerifying] = useState(false);
  const [expandedCert, setExpandedCert] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (certsParam) {
      loadCertificates();
    } else {
      setError("No certificates specified");
      setLoading(false);
    }
  }, [certsParam]);

  const loadCertificates = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `/api/shared/${encodeURIComponent(certsParam!)}`,
      );
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to load certificates");
      }

      setCertificates(data.certificates);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to load certificates",
      );
    } finally {
      setLoading(false);
    }
  };

  const refresh = () => {
    loadCertificates();
    if (verificationMode) {
      setVerificationMode(false);
      setSelectedCerts([]);
      setVerificationResults({});
    }
  };

  const toggleSelectCert = (nftAddress: string) => {
    setSelectedCerts((prev) => {
      if (prev.includes(nftAddress)) {
        return prev.filter((addr) => addr !== nftAddress);
      } else {
        return [...prev, nftAddress];
      }
    });
  };

  const toggleSelectAll = () => {
    if (selectedCerts.length === certificates.length) {
      setSelectedCerts([]);
    } else {
      setSelectedCerts(certificates.map((c) => c.nftAddress));
    }
  };

  const clearSelection = () => {
    setSelectedCerts([]);
  };

  // SIMPLIFIED: Only checks exists and revoked
  const verifySelectedCertificates = async () => {
    if (selectedCerts.length === 0) return;

    setVerifying(true);
    const results: Record<string, VerificationResult> = {};

    for (const address of selectedCerts) {
      try {
        const response = await fetch(`/api/verify/${address}`);
        const data = await response.json();

        if (data.success) {
          results[address] = {
            exists: data.verification.exists || false,
            revoked: data.verification.revoked || false,
            reason: data.verification.revocationReason,
          };
        } else {
          results[address] = {
            exists: false,
            revoked: false,
          };
        }
      } catch (err) {
        results[address] = {
          exists: false,
          revoked: false,
        };
      }
    }

    setVerificationResults(results);
    setVerifying(false);
  };

  // SIMPLIFIED: Only shows Verified (exists + active) or Not Verified
  const getVerificationBadge = (address: string) => {
    const result = verificationResults[address];
    if (!result) return null;

    // Verified = exists AND not revoked
    const isVerified = result.exists && !result.revoked;

    return isVerified ? (
      <div className="absolute top-3 right-3 z-10 bg-green-500 text-white px-2 py-1 rounded-lg text-xs font-medium flex items-center gap-1">
        <ShieldCheck className="w-3 h-3" />
        Verified
      </div>
    ) : (
      <div className="absolute top-3 right-3 z-10 bg-red-500 text-white px-2 py-1 rounded-lg text-xs font-medium flex items-center gap-1">
        <XCircle className="w-3 h-3" />
        Not Verified
      </div>
    );
  };

  const copyVerificationReport = () => {
    const report = {
      timestamp: new Date().toISOString(),
      certificates: certificates.map((cert) => ({
        title: cert.title,
        nftAddress: cert.nftAddress,
        verification: verificationResults[cert.nftAddress] || {
          exists: false,
          revoked: false,
        },
      })),
    };

    navigator.clipboard.writeText(JSON.stringify(report, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="max-w-6xl mx-auto px-6 py-12">
          <div className="h-8 w-48 bg-muted rounded animate-pulse mb-4" />
          <div className="h-4 w-64 bg-muted rounded animate-pulse mb-10" />
          <div className="grid md:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-72 bg-card border border-border rounded-xl animate-pulse"
              />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error || certificates.length === 0) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-4">
          <AlertCircle className="w-12 h-12 text-destructive mx-auto mb-4" />
          <h1 className="text-2xl font-bold mb-3">No Certificates Found</h1>
          <p className="text-muted-foreground mb-8">
            {error ||
              "The share link you clicked doesn't contain any valid certificates."}
          </p>
          <Link
            href="/"
            className="inline-flex items-center justify-center px-6 py-3 bg-primary text-primary-foreground rounded-xl hover:bg-primary/90 transition-colors"
          >
            Go to Homepage
          </Link>
        </div>
      </div>
    );
  }

  const recipientName = certificates[0]?.recipientName || "Shared";
  const verifiedCount = Object.values(verificationResults).filter(
    (r) => r.exists && !r.revoked,
  ).length;

  return (
    <div className="min-h-screen py-16 bg-background text-foreground">
      <div className="max-w-7xl mx-auto px-6 py-12">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold mb-1">Certificates</h1>
            <div className="flex items-center gap-2">
              <p className="text-xs font-mono text-muted-foreground px-2 py-1 rounded-md bg-secondary">
                Wallet: {certificates[0]?.recipientWallet.slice(0, 8)}...
                {certificates[0]?.recipientWallet.slice(-8)}
              </p>
              <span className="text-xs font-mono text-muted-foreground px-2 py-1 rounded-md bg-secondary">
                {certificates.length} shared
              </span>
              {verifiedCount > 0 && (
                <span className="text-xs text-green-600">
                  • {verifiedCount} verified
                </span>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                setVerificationMode(!verificationMode);
                if (!verificationMode) {
                  setSelectedCerts([]);
                  setVerificationResults({});
                }
              }}
              className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors flex items-center gap-2 ${
                verificationMode
                  ? "bg-primary text-primary-foreground"
                  : "bg-secondary text-secondary-foreground hover:bg-accent"
              }`}
            >
              <ShieldCheck className="w-4 h-4" />
              {verificationMode ? "Exit" : "Verify"}
            </button>

            {/* View Toggles */}
            <button
              onClick={() => setView("grid")}
              className={`p-2 rounded-lg transition-colors ${
                view === "grid"
                  ? "bg-primary text-primary-foreground"
                  : "bg-secondary text-muted-foreground hover:text-foreground"
              }`}
            >
              <Grid3X3 className="w-4 h-4" />
            </button>
            <button
              onClick={() => setView("list")}
              className={`p-2 rounded-lg transition-colors ${
                view === "list"
                  ? "bg-primary text-primary-foreground"
                  : "bg-secondary text-muted-foreground hover:text-foreground"
              }`}
            >
              <List className="w-4 h-4" />
            </button>
            <button
              onClick={refresh}
              className="p-2 rounded-lg bg-secondary text-secondary-foreground hover:bg-accent transition-colors"
              title="Refresh"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {verificationMode && selectedCerts.length > 0 && (
          <div className="mb-6 p-4 bg-card border border-border rounded-xl flex items-center justify-between sticky top-4 z-10 backdrop-blur-sm bg-opacity-90">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <div>
                <p className="font-medium">
                  {selectedCerts.length} selected for verification
                </p>
                <p className="text-xs text-muted-foreground">
                  Click verify to check authenticity
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={clearSelection}
                className="px-3 py-1.5 text-sm rounded-lg bg-secondary text-secondary-foreground hover:bg-accent transition-colors"
              >
                Clear
              </button>
              <button
                onClick={verifySelectedCertificates}
                disabled={verifying}
                className="px-4 py-1.5 text-sm rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors flex items-center gap-2 disabled:opacity-50"
              >
                {verifying ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Verifying...
                  </>
                ) : (
                  <>
                    <ShieldCheck className="w-4 h-4" />
                    Verify
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {Object.keys(verificationResults).length > 0 && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <ShieldCheck className="w-5 h-5 text-green-600" />
                <div>
                  <p className="font-medium text-green-800">
                    Verification Complete
                  </p>
                  <p className="text-sm text-green-600">
                    {
                      Object.values(verificationResults).filter(
                        (r) => r.exists && !r.revoked,
                      ).length
                    }{" "}
                    verified ·{" "}
                    {
                      Object.values(verificationResults).filter(
                        (r) => !r.exists || r.revoked,
                      ).length
                    }{" "}
                    not verified
                  </p>
                </div>
              </div>
              <button
                onClick={copyVerificationReport}
                className="px-3 py-1.5 bg-primary text-white rounded-lg hover:bg-green-100 transition-colors flex items-center gap-2"
              >
                {copied ? (
                  <Check className="w-4 h-4" />
                ) : (
                  <Copy className="w-4 h-4" />
                )}
                {copied ? "Copied!" : "Copy Report"}
              </button>
            </div>
          </div>
        )}

        {verificationMode && certificates.length > 0 && (
          <div className="mb-4 p-3 bg-secondary/50 rounded-lg flex items-center justify-between">
            <button
              onClick={toggleSelectAll}
              className="flex items-center gap-2 text-sm hover:text-primary transition-colors"
            >
              <div
                className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
                  selectedCerts.length === certificates.length
                    ? "bg-primary border-primary"
                    : "border-muted-foreground"
                }`}
              >
                {selectedCerts.length === certificates.length && (
                  <Check className="w-3 h-3 text-white" />
                )}
              </div>
              <span>
                {selectedCerts.length === certificates.length
                  ? "Deselect All"
                  : "Select All"}
              </span>
            </button>
            <span className="text-xs text-muted-foreground">
              {selectedCerts.length} of {certificates.length} selected
            </span>
          </div>
        )}

        <div
          className={
            view === "grid"
              ? "grid md:grid-cols-2 lg:grid-cols-3 gap-6"
              : "space-y-4"
          }
        >
          {certificates.map((cert) => (
            <div key={cert.nftAddress} className="relative">
              {/* Selection Checkbox */}
              {verificationMode && (
                <button
                  onClick={() => toggleSelectCert(cert.nftAddress)}
                  className="absolute top-3 left-3 z-10 w-6 h-6 rounded border-2 bg-card flex items-center justify-center hover:border-primary transition-colors"
                >
                  {selectedCerts.includes(cert.nftAddress) && (
                    <Check className="w-4 h-4 text-primary" />
                  )}
                </button>
              )}

              {getVerificationBadge(cert.nftAddress)}

              <div className="relative">
                <CertificateCard
                  certificate={{
                    nftAddress: cert.nftAddress,
                    destination_wallet: cert.recipientWallet,
                    image: cert.image,
                    title: cert.title,
                    description: cert.description,
                    revoked: cert.revoked,
                    issuer: cert.issuer,
                    issuedAt: cert.issuedAt,
                  }}
                  isAdmin={false}
                />

                {verificationResults[cert.nftAddress] && (
                  <div className="mt-2 p-3 bg-secondary/30 rounded-lg">
                    <button
                      onClick={() =>
                        setExpandedCert(
                          expandedCert === cert.nftAddress
                            ? null
                            : cert.nftAddress,
                        )
                      }
                      className="w-full flex items-center justify-between text-sm font-medium"
                    >
                      <span>Verification Details</span>
                      {expandedCert === cert.nftAddress ? (
                        <ChevronUp className="w-4 h-4" />
                      ) : (
                        <ChevronDown className="w-4 h-4" />
                      )}
                    </button>

                    {expandedCert === cert.nftAddress && (
                      <div className="mt-3 space-y-2 text-xs">
                        <div className="flex items-center justify-between">
                          <span className="text-muted-foreground">
                            On blockchain:
                          </span>
                          {verificationResults[cert.nftAddress].exists ? (
                            <span className="text-green-600">✓ Found</span>
                          ) : (
                            <span className="text-red-600">✗ Not found</span>
                          )}
                        </div>

                        <div className="flex items-center justify-between">
                          <span className="text-muted-foreground">Status:</span>
                          {verificationResults[cert.nftAddress].revoked ? (
                            <span className="text-red-600">✗ Revoked</span>
                          ) : (
                            <span className="text-green-600">✓ Active</span>
                          )}
                        </div>

                        {/* Show reason if revoked */}
                        {verificationResults[cert.nftAddress].revoked &&
                          verificationResults[cert.nftAddress].reason && (
                            <div className="mt-2 p-2 bg-red-50 rounded">
                              <p className="text-red-600 text-xs font-medium">
                                Revocation Reason:
                              </p>
                              <p className="text-red-500 text-xs mt-1">
                                {verificationResults[cert.nftAddress].reason}
                              </p>
                            </div>
                          )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-12 text-center text-sm text-muted-foreground">
          <p>Verified on Solana Blockchain</p>
        </div>
      </div>
    </div>
  );
}
