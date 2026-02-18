"use client";

import { useWallet } from "@solana/wallet-adapter-react";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { useUserCertificates } from "./../../hooks/useUserCertificate";
import CertificateCard from "./../components/CertificateCard";
import { useState, useEffect } from "react";
import {
  GraduationCap,
  Grid3X3,
  List,
  RefreshCw,
  Award,
  CheckSquare,
  Square,
  Share2,
  QrCode,
  Copy,
  Check,
  Download,
  X,
} from "lucide-react";
import QRCode from "qrcode";

interface SelectedCertificate {
  nftAddress: string;
  name: string;
  issuer: string;
}

export default function ProfilePage() {
  const [isMounted, setIsMounted] = useState(false);
  const { publicKey, connected } = useWallet();
  const { certificates, loading, error, refresh } = useUserCertificates();
  const [view, setView] = useState<"grid" | "list">("grid");

  const [selectedCerts, setSelectedCerts] = useState<string[]>([]);
  const [selectMode, setSelectMode] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [qrCodeUrl, setQrCodeUrl] = useState<string>("");
  const [shareLink, setShareLink] = useState<string>("");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

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
    setSelectMode(false);
  };

  const generateShareContent = async () => {
    if (selectedCerts.length === 0) return;

    const certsParam = selectedCerts.join(",");
    const link = `${window.location.origin}/shared?certs=${certsParam}`;
    setShareLink(link);

    try {
      const qr = await QRCode.toDataURL(link, {
        width: 300,
        margin: 2,
        color: {
          dark: "#000000",
          light: "#ffffff",
        },
      });
      setQrCodeUrl(qr);
      setShowShareModal(true);
    } catch (err) {
      console.error("Error generating QR:", err);
    }
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(shareLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  const downloadQR = () => {
    if (!qrCodeUrl) return;

    const link = document.createElement("a");
    link.download = `skillchain-certs-${selectedCerts.length}.png`;
    link.href = qrCodeUrl;
    link.click();
  };

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
            <span className="text-xs font-mono text-muted-foreground px-2 py-1 rounded-md bg-secondary">
              {publicKey.toString()}
            </span>
          </div>

          <div className="flex items-center gap-2">
            {/* Selection Mode Toggle */}
            <button
              onClick={() => setSelectMode(!selectMode)}
              className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors flex items-center gap-2 ${
                selectMode
                  ? "bg-primary text-primary-foreground"
                  : "bg-secondary text-secondary-foreground hover:bg-accent"
              }`}
            >
              <CheckSquare className="w-4 h-4" />
              {selectMode ? "Exit Selection" : "Select"}
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

        {/* Selection Bar - Shows when items are selected */}
        {selectedCerts.length > 0 && (
          <div className="mb-6 p-4 bg-card border border-border rounded-xl flex items-center justify-between sticky top-4 z-10 backdrop-blur-sm bg-opacity-90">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center">
                <CheckSquare className="w-4 h-4" />
              </div>
              <div>
                <p className="font-medium">
                  {selectedCerts.length} certificate
                  {selectedCerts.length !== 1 ? "s" : ""} selected
                </p>
                <p className="text-xs text-muted-foreground">Ready to share</p>
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
                onClick={generateShareContent}
                className="px-4 py-1.5 text-sm rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors flex items-center gap-2"
              >
                <Share2 className="w-4 h-4" />
                Generate Share Link & QR
              </button>
            </div>
          </div>
        )}

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

        {/* Select All Option - Only in selection mode */}
        {selectMode && certificates.length > 0 && (
          <div className="mb-4 p-3 bg-secondary/50 rounded-lg flex items-center justify-between">
            <button
              onClick={toggleSelectAll}
              className="flex items-center gap-2 text-sm hover:text-primary transition-colors"
            >
              {selectedCerts.length === certificates.length ? (
                <CheckSquare className="w-4 h-4 text-primary" />
              ) : (
                <Square className="w-4 h-4" />
              )}
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
              <div key={cert.nftAddress} className="relative">
                {/* Selection Checkbox - Only visible in selection mode */}
                {selectMode && (
                  <button
                    onClick={() => toggleSelectCert(cert.nftAddress)}
                    className="absolute top-3 left-3 z-10 w-6 h-6 rounded border-2 bg-card flex items-center justify-center hover:border-primary transition-colors"
                  >
                    {selectedCerts.includes(cert.nftAddress) ? (
                      <CheckSquare className="w-4 h-4 text-primary" />
                    ) : (
                      <Square className="w-4 h-4 text-muted-foreground" />
                    )}
                  </button>
                )}
                <CertificateCard
                  certificate={{
                    nftAddress: cert.nftAddress,
                    image: cert.image,
                    title: cert.name || "Certificate",
                    description: cert.description || "",
                    revoked: cert.revoked || false,
                    issuer: cert.issuer || "Unknown",
                    issuedAt: cert.issuedAt || new Date().toISOString(),
                  }}
                  isAdmin={false}
                />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Share Modal */}
      {showShareModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-card rounded-xl max-w-md w-full p-6 border border-border">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Share Certificates</h3>
              <button
                onClick={() => setShowShareModal(false)}
                className="p-1 hover:bg-secondary rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-sm text-muted-foreground mb-4">
              Sharing {selectedCerts.length} selected certificate
              {selectedCerts.length !== 1 ? "s" : ""}
            </p>

            {/* QR Code */}
            {qrCodeUrl && (
              <div className="mb-6 p-4 bg-white rounded-lg flex justify-center">
                <img src={qrCodeUrl} alt="QR Code" className="w-48 h-48" />
              </div>
            )}

            {/* Share Link */}
            <div className="mb-6">
              <label className="text-xs text-muted-foreground mb-1 block">
                Shareable Link
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={shareLink}
                  readOnly
                  className="flex-1 px-3 py-2 bg-secondary rounded-lg text-sm font-mono"
                />
                <button
                  onClick={copyToClipboard}
                  className="px-3 py-2 bg-secondary hover:bg-accent rounded-lg transition-colors"
                  title="Copy link"
                >
                  {copied ? (
                    <Check className="w-4 h-4 text-green-500" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-2">
              <button
                onClick={downloadQR}
                className="flex-1 px-4 py-2 bg-secondary text-secondary-foreground rounded-lg hover:bg-accent transition-colors flex items-center justify-center gap-2"
              >
                <Download className="w-4 h-4" />
                Download QR
              </button>
              <a
                href={`https://twitter.com/intent/tweet?text=Check out my verified certificates on SkillChain&url=${encodeURIComponent(shareLink)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 px-4 py-2 bg-[#1DA1F2] text-white rounded-lg hover:bg-opacity-90 transition-colors flex items-center justify-center gap-2"
              >
                Share on X
              </a>
            </div>

            <p className="text-xs text-center text-muted-foreground mt-4">
              Anyone with this link can verify these certificates
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
