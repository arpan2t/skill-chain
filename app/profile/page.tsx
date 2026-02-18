"use client";

import { useWallet } from "@solana/wallet-adapter-react";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { useUserCertificates } from "./../../hooks/useUserCertificate";
import CertificateCard from "./../components/CertificateCard";
import { useState, useEffect } from "react";
import { GraduationCap, Grid3X3, List, RefreshCw, Award } from "lucide-react";

export default function ProfilePage() {
  const [isMounted, setIsMounted] = useState(false);
  const { publicKey, connected } = useWallet();
  const { certificates, loading, error, refresh } = useUserCertificates();
  const [view, setView] = useState<"grid" | "list">("grid");

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
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

  if (!connected || !publicKey) {
    return (
      <div className="min-h-screen bg-background text-foreground flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-3">My Certificates</h1>
          <p className="text-muted-foreground mb-6">
            Connect your wallet to view your certificates
          </p>
          <WalletMultiButton />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-16 bg-background text-foreground">
      <div className="max-w-7xl mx-auto px-6 py-12">
        {/* Header */}
        <div className="flex items-center justify-between mb-10">
          <div>
            <h1 className="text-2xl font-bold mb-1">My Certificates</h1>
            <span className=" text-xs font-mono text-muted-foreground px-2 py-1 rounded-md bg-secondary">
              {publicKey.toString()}
            </span>
          </div>

          <div className="flex items-center gap-2">
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
              className="px-4 py-2 text-sm font-medium rounded-lg bg-secondary text-secondary-foreground hover:bg-accent transition-colors flex items-center gap-2"
            >
              <RefreshCw className="w-4 h-4" /> Refresh
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-10">
          {[
            { label: "Total Certificates", value: certificates.length },
            {
              label: "Active",
              value: certificates.filter((c) => !c.revoked).length,
            },
            {
              label: "Revoked",
              value: certificates.filter((c) => c.revoked).length,
            },
          ].map(({ label, value }) => (
            <div
              key={label}
              className="p-5 rounded-xl bg-card border border-border"
            >
              <p className="text-xs text-muted-foreground mb-1">{label}</p>
              <p className="text-2xl font-bold">{value}</p>
            </div>
          ))}
        </div>

        {/* Content */}
        {loading ? (
          <div className="flex justify-center py-20">
            <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        ) : error ? (
          <p className="text-destructive text-center py-10">Error: {error}</p>
        ) : certificates.length === 0 ? (
          <div className="text-center py-20">
            <Award className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-lg font-semibold mb-1">No certificates yet</p>
            <p className="text-sm text-muted-foreground">
              You haven't received any certificates yet.
            </p>
          </div>
        ) : (
          <div
            className={
              view === "grid"
                ? "grid md:grid-cols-2 lg:grid-cols-3 gap-6"
                : "space-y-4"
            }
          >
            {certificates.map((cert) => (
              <CertificateCard
                key={cert.nftAddress}
                certificate={{
                  ...cert,
                }}
                isAdmin={false}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
