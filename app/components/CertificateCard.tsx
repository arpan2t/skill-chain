"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { format } from "date-fns";
import {
  ExternalLink,
  Copy,
  Check,
  ChevronDown,
  ChevronUp,
  ImageOff,
  ShieldAlert,
} from "lucide-react";

interface CertificateCardProps {
  certificate: {
    nftAddress: string;
    destination_wallet: string;
    image: string;
    title: string;
    description?: string;
    revoked: boolean;
    issuer: string;
    student: { name: string; walletAddress: string };
    issuedAt?: string;
  };
  isAdmin?: boolean;
}

export default function CertificateCard({
  certificate,
  isAdmin,
}: CertificateCardProps) {
  const [showDetails, setShowDetails] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const handleShare = async () => {
    try {
      await navigator.clipboard.writeText(
        `${window.location.origin}/verify/${certificate.nftAddress}`,
      );
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  const formattedDate = certificate.issuedAt
    ? format(new Date(certificate.issuedAt), "PPP")
    : null;

  if (!isMounted) {
    return (
      <div className="rounded-xl border border-border bg-card overflow-hidden">
        <div className="h-48 bg-muted animate-pulse" />
        <div className="p-5 space-y-3">
          <div className="h-5 bg-muted rounded w-3/4 animate-pulse" />
          <div className="h-4 bg-muted rounded w-1/2 animate-pulse" />
          <div className="h-4 bg-muted rounded w-2/3 animate-pulse" />
        </div>
      </div>
    );
  }

  return (
    <div
      className={`rounded-xl border overflow-hidden transition-shadow hover:shadow-lg ${
        certificate.revoked
          ? "border-destructive/40 bg-destructive/5"
          : "border-border bg-card"
      }`}
    >
      {/* Image */}
      <div className="relative h-48 bg-secondary">
        {certificate.image ? (
          <Image
            src={certificate.image}
            alt={certificate.title}
            className="object-cover"
            fill
            suppressHydrationWarning
          />
        ) : (
          <div className="flex items-center justify-center h-full">
            <ImageOff className="w-10 h-10 text-muted-foreground" />
          </div>
        )}

        {certificate.revoked && (
          <div className="absolute top-3 right-3 bg-destructive text-destructive-foreground px-2.5 py-1 rounded-md text-xs font-medium flex items-center gap-1">
            <ShieldAlert className="w-3 h-3" /> Revoked
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-5">
        <h3 className="font-semibold text-base mb-1">{certificate.title}</h3>

        {formattedDate && (
          <p className="text-xs text-muted-foreground mb-2">
            Issued At : {formattedDate}
          </p>
        )}

        <p className="text-xs text-muted-foreground mb-3">
          Issuer: {certificate.issuer}
        </p>

        {/* NFT Address */}
        <div className="bg-secondary rounded-lg p-2.5 mb-3">
          <p className="text-xs font-mono text-muted-foreground">
            {certificate.nftAddress.slice(0, 8)}...
            {certificate.nftAddress.slice(-8)}
          </p>
        </div>

        {/* Description toggle */}
        {certificate.description && (
          <button
            onClick={() => setShowDetails(!showDetails)}
            className="text-sm text-primary hover:opacity-80 mb-2 flex items-center gap-1"
          >
            {showDetails ? "Hide details" : "Show details"}
            {showDetails ? (
              <ChevronUp className="w-3 h-3" />
            ) : (
              <ChevronDown className="w-3 h-3" />
            )}
          </button>
        )}

        {showDetails && certificate.description && (
          <p className="text-sm text-muted-foreground mb-3 p-3 bg-secondary rounded-lg">
            {certificate.description}
          </p>
        )}

        {/* Actions */}
        <div className="flex items-center gap-3 mt-3 pt-3 border-t border-border">
          <a
            href={`https://explorer.solana.com/address/${certificate.nftAddress}?cluster=devnet`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-primary hover:opacity-80 flex items-center gap-1"
          >
            Explorer <ExternalLink className="w-3 h-3" />
          </a>

          <button
            onClick={handleShare}
            className="text-xs text-muted-foreground hover:text-foreground ml-auto flex items-center gap-1 transition-colors"
          >
            {copySuccess ? (
              <>
                <Check className="w-3 h-3 text-green-500" /> Copied!
              </>
            ) : (
              <>
                <Copy className="w-3 h-3" /> Share
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
