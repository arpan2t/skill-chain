"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import {
  CheckBadgeIcon,
  XCircleIcon,
  DocumentDuplicateIcon,
  ArrowLeftIcon,
  ShieldCheckIcon,
  ClockIcon,
  UserIcon,
  BuildingOfficeIcon,
  QrCodeIcon,
} from "@heroicons/react/24/outline";

interface CertificateData {
  nftAddress: string;
  name: string;
  description: string;
  image: string;
  issuer: string;
  issuerWallet: string;
  recipientName: string;
  recipientWallet: string;
  issuedAt: string;
  revoked: boolean;
  revokedReason?: string;
  attributes: any[];
}

export default function VerifyContent() {
  const searchParams = useSearchParams();
  const certsParam = searchParams.get("certs");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [certificates, setCertificates] = useState([]);
  const [expandedCert, setExpandedCert] = useState(null);
  const [copySuccess, setCopySuccess] = useState(null);

  useEffect(() => {
    if (certsParam) {
      verifyCertificates();
    } else {
      setError("No certificates specified");
      setLoading(false);
    }
  }, [certsParam]);

  const verifyCertificates = async () => {
    setLoading(true);
    setError(null);

    try {
      const nftAddresses = certsParam!.split(",");

      if (nftAddresses.length === 0) {
        throw new Error("No valid certificates to verify");
      }

      const results = await Promise.allSettled(
        nftAddresses.map(async (address) => {
          const cleanAddress = address.trim();
          const encodedAddress = encodeURIComponent(cleanAddress);
          const response = await fetch(`/api/verify/${encodedAddress}`);
          if (!response.ok) {
            throw new Error(`Failed to verify ${address}`);
          }
          const data = await response.json();
          return data.data;
        }),
      );

      const verifiedCerts = results
        .filter(
          (result): result is PromiseFulfilledResult<CertificateData> =>
            result.status === "fulfilled",
        )
        .map((result) => result.value);

      if (verifiedCerts.length === 0) {
        throw new Error("No certificates could be verified");
      }

      setCertificates(verifiedCerts);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Verification failed");
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopySuccess(id);
    setTimeout(() => setCopySuccess(null), 2000);
  };

  const getStatusBadge = (cert: CertificateData) => {
    if (cert.revoked) {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-destructive/10 text-destructive border border-destructive/30">
          <XCircleIcon className="w-3.5 h-3.5" />
          Revoked
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary border border-primary/30">
        <CheckBadgeIcon className="w-3.5 h-3.5" />
        Active
      </span>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background text-foreground">
        <div className="max-w-4xl mx-auto px-6 py-12">
          <div className="mb-10 space-y-3">
            <div className="h-8 w-64 bg-secondary rounded-lg animate-pulse" />
            <div className="h-4 w-96 bg-secondary rounded animate-pulse" />
          </div>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="rounded-xl border border-border bg-card p-6"
              >
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-lg bg-secondary animate-pulse" />
                  <div className="flex-1 space-y-2">
                    <div className="h-5 w-48 bg-secondary rounded animate-pulse" />
                    <div className="h-4 w-32 bg-secondary rounded animate-pulse" />
                    <div className="h-3 w-40 bg-secondary rounded animate-pulse" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error || certificates.length === 0) {
    return (
      <div className="min-h-screen bg-background text-foreground flex items-center justify-center">
        <div className="text-center max-w-md px-6">
          <div className="w-16 h-16 rounded-full bg-destructive/10 border border-destructive/30 flex items-center justify-center mx-auto mb-6">
            <XCircleIcon className="w-8 h-8 text-destructive" />
          </div>
          <h2 className="text-2xl font-bold text-foreground mb-2">
            Verification Failed
          </h2>
          <p className="text-muted-foreground mb-8">
            {error || "No certificates could be verified"}
          </p>
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors font-medium"
          >
            <ArrowLeftIcon className="w-4 h-4" />
            Return Home
          </Link>
        </div>
      </div>
    );
  }

  const activeCerts = certificates.filter((c) => !c.revoked).length;
  const revokedCerts = certificates.filter((c) => c.revoked).length;

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="max-w-4xl mx-auto px-6 py-12">
        {/* Header */}
        <div className="mb-10">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6"
          >
            <ArrowLeftIcon className="w-4 h-4" />
            Back
          </Link>

          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-primary/10 border border-primary/30 flex items-center justify-center flex-shrink-0">
              <ShieldCheckIcon className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">
                Certificate Batch Verification
              </h1>
              <p className="text-muted-foreground text-sm mt-1">
                {certificates.length} certificate
                {certificates.length !== 1 ? "s" : ""} verified on Solana
                blockchain
              </p>
              <div className="flex items-center gap-3 mt-3">
                <span className="inline-flex items-center gap-1 text-xs font-medium text-primary bg-primary/10 px-2 py-1 rounded-full">
                  {activeCerts} Active
                </span>
                {revokedCerts > 0 && (
                  <span className="inline-flex items-center gap-1 text-xs font-medium text-destructive bg-destructive/10 px-2 py-1 rounded-full">
                    {revokedCerts} Revoked
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Certificates List */}
        <div className="space-y-4">
          {certificates.map((cert, index) => {
            const certData = cert.database || cert.blockchain;
            const issuer = cert.database?.issuedBy;

            return (
              <div
                key={cert.nftAddress || index}
                className="rounded-xl border border-border bg-card overflow-hidden"
              >
                {/* Certificate Header */}
                <button
                  className="w-full text-left p-5 hover:bg-accent/50 transition-colors"
                  onClick={() =>
                    setExpandedCert(
                      expandedCert === cert.nftAddress ? null : cert.nftAddress,
                    )
                  }
                >
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-lg bg-secondary overflow-hidden flex-shrink-0">
                      {certData?.image && (
                        <Image
                          src={certData.image}
                          alt={certData?.name || "Certificate"}
                          width={56}
                          height={56}
                          className="object-cover w-full h-full"
                        />
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold text-foreground truncate">
                          {certData?.name || "Certificate"}
                        </h3>
                        {getStatusBadge({
                          ...cert,
                          revoked: cert.verification?.status === "revoked",
                        })}
                      </div>
                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
                        <span className="inline-flex items-center gap-1">
                          <UserIcon className="w-3.5 h-3.5" />
                          {certData?.attributes?.find(
                            (a: any) => a.trait_type === "Recipient Name",
                          )?.value || "Unknown"}
                        </span>
                        <span className="inline-flex items-center gap-1">
                          <BuildingOfficeIcon className="w-3.5 h-3.5" />
                          {issuer?.name ||
                            certData?.attributes?.find(
                              (a: any) => a.trait_type === "Issuer",
                            )?.value ||
                            "Unknown"}
                        </span>
                        <span className="inline-flex items-center gap-1">
                          <ClockIcon className="w-3.5 h-3.5" />
                          {new Date(
                            cert.verification?.timestamp,
                          ).toLocaleDateString()}
                        </span>
                      </div>
                    </div>

                    <div className="flex-shrink-0 text-muted-foreground">
                      <svg
                        className={`w-5 h-5 transition-transform ${expandedCert === cert.nftAddress ? "rotate-180" : ""}`}
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 9l-7 7-7-7"
                        />
                      </svg>
                    </div>
                  </div>
                </button>

                {/* Expanded Details */}
                {expandedCert === cert.nftAddress && (
                  <div className="border-t border-border bg-secondary/30">
                    <div className="grid md:grid-cols-2 gap-6 p-6">
                      {/* Left Column */}
                      <div>
                        <h4 className="flex items-center gap-2 text-sm font-semibold text-foreground mb-4">
                          <QrCodeIcon className="w-4 h-4 text-primary" />
                          Certificate Details
                        </h4>
                        <div className="space-y-4">
                          <div>
                            <p className="text-xs text-muted-foreground mb-1">
                              NFT Address
                            </p>
                            <div className="flex items-center gap-2">
                              <code className="text-xs font-mono text-foreground bg-background px-2 py-1.5 rounded border border-border break-all">
                                {cert.nftAddress}
                              </code>
                              <button
                                onClick={() =>
                                  copyToClipboard(
                                    cert.nftAddress,
                                    cert.nftAddress,
                                  )
                                }
                                className="p-1.5 hover:bg-accent rounded transition-colors flex-shrink-0"
                              >
                                <DocumentDuplicateIcon className="w-4 h-4 text-muted-foreground" />
                              </button>
                            </div>
                            {copySuccess === cert.nftAddress && (
                              <p className="text-xs text-primary mt-1">
                                Copied!
                              </p>
                            )}
                          </div>

                          {certData?.description && (
                            <div>
                              <p className="text-xs text-muted-foreground mb-1">
                                Description
                              </p>
                              <p className="text-sm text-foreground">
                                {certData.description}
                              </p>
                            </div>
                          )}

                          {certData?.attributes && (
                            <div>
                              <p className="text-xs text-muted-foreground mb-2">
                                Attributes
                              </p>
                              <div className="grid grid-cols-2 gap-2">
                                {certData.attributes
                                  .filter(
                                    (attr: any) =>
                                      ![
                                        "Revoked",
                                        "Revocation Reason",
                                        "Revoked By",
                                      ].includes(attr.trait_type),
                                  )
                                  .map((attr: any, idx: number) => (
                                    <div
                                      key={idx}
                                      className="bg-background rounded-lg border border-border p-2.5"
                                    >
                                      <p className="text-[10px] text-muted-foreground uppercase tracking-wider">
                                        {attr.trait_type}
                                      </p>
                                      <p className="text-xs text-foreground font-medium mt-0.5">
                                        {attr.value}
                                      </p>
                                    </div>
                                  ))}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Right Column */}
                      <div>
                        <h4 className="flex items-center gap-2 text-sm font-semibold text-foreground mb-4">
                          <ShieldCheckIcon className="w-4 h-4 text-primary" />
                          Verification Details
                        </h4>
                        <div className="space-y-3">
                          <div className="bg-background rounded-lg border border-border p-3">
                            <p className="text-xs text-muted-foreground">
                              Method
                            </p>
                            <p className="text-sm text-foreground font-medium">
                              {cert.verification?.method}
                            </p>
                          </div>
                          <div className="bg-background rounded-lg border border-border p-3">
                            <p className="text-xs text-muted-foreground">
                              Time
                            </p>
                            <p className="text-sm text-foreground font-medium">
                              {new Date(
                                cert.verification?.timestamp,
                              ).toLocaleString()}
                            </p>
                          </div>
                          <div className="bg-background rounded-lg border border-border p-3">
                            <p className="text-xs text-muted-foreground">
                              Response Time
                            </p>
                            <p className="text-sm text-foreground font-medium">
                              {cert.verification?.responseTime}
                            </p>
                          </div>

                          {cert.verification?.status === "revoked" && (
                            <div className="bg-destructive/5 rounded-lg border border-destructive/30 p-3">
                              <p className="text-xs text-destructive">
                                Revocation Reason
                              </p>
                              <p className="text-sm text-destructive font-medium">
                                {cert.database?.revocationHistory?.[0]
                                  ?.reason || "Not specified"}
                              </p>
                            </div>
                          )}

                          <a
                            href={`https://explorer.solana.com/address/${cert.nftAddress}?cluster=devnet`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 text-sm text-primary hover:text-primary/80 transition-colors mt-2"
                          >
                            View on Solana Explorer →
                          </a>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="mt-16 text-center space-y-2">
          <div className="flex items-center justify-center gap-2">
            <ShieldCheckIcon className="w-4 h-4 text-primary" />
            <span className="text-sm text-muted-foreground">
              All certificates verified on Solana blockchain
            </span>
          </div>
          <p className="text-xs text-muted-foreground">
            Batch ID: {certsParam?.slice(0, 20)}...
          </p>
          <p className="text-xs text-muted-foreground/60">
            This verification is permanent and cryptographically signed
          </p>
        </div>

        <div className="mt-4 text-center">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeftIcon className="w-4 h-4" />
            Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}
