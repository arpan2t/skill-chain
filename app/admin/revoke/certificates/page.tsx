"use client";

import { useState } from "react";
import { Session } from "next-auth";
import {
  Ban,
  Search,
  Loader2,
  AlertCircle,
  Shield,
  AlertTriangle,
  User,
  Calendar,
  Clock,
  Hash,
  Send,
  FileText,
  Info,
} from "lucide-react";
import { Button } from "./../../../components/ui/button";
import { Input } from "./../../../components/ui/input";
import { Label } from "./../../../components/ui/label";
import { Textarea } from "./../../../components/ui/textarea";
import { toast } from "./../../../../hooks/useToast";

interface CertificateData {
  id?: number;
  nftAddress: string;
  title: string;
  description?: string;
  imageUrl?: string;
  issuedBy: {
    id: number;
    name: string;
    wallet?: string;
  };
  issuedAt: string;
  revoked: boolean;
  revocationDetails?: Array<{
    id: number;
    reason: string;
    revokedAt: string;
    revokedBy: {
      name: string;
      email: string;
    };
    transactionSignature?: string;
  }>;
}

interface RevokeClientProps {
  session: Session;
}

export default function RevokeClient({ session }: RevokeClientProps) {
  const [nftAddress, setNftAddress] = useState("");
  const [loading, setLoading] = useState(false);
  const [revoking, setRevoking] = useState(false);
  const [certificate, setCertificate] = useState<CertificateData | null>(null);
  const [canRevoke, setCanRevoke] = useState(false);
  const [hasPendingRequest, setHasPendingRequest] = useState(false);
  const [showRevokeModal, setShowRevokeModal] = useState(false);
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [showRevocationDetails, setShowRevocationDetails] = useState(false);
  const [revokeReason, setRevokeReason] = useState("");
  const [error, setError] = useState<string | null>(null);

  const handleSearch = async () => {
    if (!nftAddress.trim()) {
      toast({
        title: "Missing Address",
        description: "Please enter an NFT address to search.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    setError(null);
    setCertificate(null);

    try {
      const response = await fetch(`/api/revoke/fetch/${nftAddress.trim()}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to fetch certificate");
      }

      setCertificate(data.certificate);
      setCanRevoke(data.canRevoke);
      setHasPendingRequest(data.hasPendingRequest);
    } catch (error: any) {
      setError(error.message);
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRevoke = async () => {
    if (!revokeReason.trim()) {
      toast({
        title: "Reason Required",
        description: "Please provide a reason for revocation.",
        variant: "destructive",
      });
      return;
    }

    setRevoking(true);

    try {
      const response = await fetch("/api/revoke", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nftAddress: certificate?.nftAddress,
          reason: revokeReason,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to revoke certificate");
      }

      toast({
        title: "Success!",
        description: "Certificate revoked successfully.",
        variant: "default",
      });

      setShowRevokeModal(false);
      setRevokeReason("");

      handleSearch();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setRevoking(false);
    }
  };

  const handleRequestRevocation = async () => {
    if (!revokeReason.trim()) {
      toast({
        title: "Reason Required",
        description: "Please provide a reason for revocation request.",
        variant: "destructive",
      });
      return;
    }

    setRevoking(true);

    try {
      const response = await fetch("/api/revoke/request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nftAddress: certificate?.nftAddress,
          reason: revokeReason,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to submit request");
      }

      toast({
        title: "Request Submitted!",
        description: "Your revocation request has been sent to the issuer.",
        variant: "default",
      });

      setShowRequestModal(false);
      setRevokeReason("");
      setHasPendingRequest(true);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setRevoking(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const truncateAddress = (address: string) => {
    if (!address) return "";
    return `${address.slice(0, 4)}...${address.slice(-4)}`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary/20 py-8">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 space-y-6">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-destructive to-destructive/60 bg-clip-text text-transparent">
            Revoke Certificate
          </h1>
          <p className="text-sm text-muted-foreground mt-2 max-w-md mx-auto">
            Search for a certificate to revoke or request revocation.
          </p>
        </div>

        <div className="rounded-2xl border border-border/50 bg-card/80 backdrop-blur-sm p-6 md:p-8 shadow-lg">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-destructive/20 to-destructive/5 flex items-center justify-center">
              <Ban className="w-6 h-6 text-destructive" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-foreground">
                Find Certificate
              </h2>
              <p className="text-xs text-muted-foreground">
                Enter the NFT mint address to check revocation status
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <Label htmlFor="nftAddress" className="text-sm text-foreground/80">
              NFT Mint Address
            </Label>
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Hash className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="nftAddress"
                  placeholder="Enter Solana mint address..."
                  value={nftAddress}
                  onChange={(e) => setNftAddress(e.target.value)}
                  className="font-mono text-sm pl-9 h-12 bg-background/50 border-border/50 focus:border-destructive transition-all"
                  onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                />
              </div>
              <Button
                onClick={handleSearch}
                disabled={loading}
                className="h-12 px-6 bg-gradient-to-r from-destructive to-destructive/80 hover:from-destructive/90 hover:to-destructive/70 transition-all duration-300 shadow-lg shadow-destructive/25"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    Searching...
                  </>
                ) : (
                  <>
                    <Search className="w-4 h-4 mr-2" />
                    Search
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-4 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-destructive shrink-0 mt-0.5" />
            <p className="text-sm text-destructive">{error}</p>
          </div>
        )}

        {/* Certificate Details */}
        {certificate && (
          <div className="rounded-2xl border border-border/50 bg-card overflow-hidden">
            {/* Status Header */}
            <div
              className={`px-6 py-4 border-b border-border/50 ${
                certificate.revoked
                  ? "bg-destructive/5"
                  : canRevoke
                    ? "bg-primary/5"
                    : "bg-yellow-500/5"
              }`}
            >
              <div className="flex items-center gap-3">
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                    certificate.revoked
                      ? "bg-destructive/10"
                      : canRevoke
                        ? "bg-primary/10"
                        : "bg-yellow-500/10"
                  }`}
                >
                  {certificate.revoked ? (
                    <Ban className="w-5 h-5 text-destructive" />
                  ) : canRevoke ? (
                    <Shield className="w-5 h-5 text-primary" />
                  ) : (
                    <AlertTriangle className="w-5 h-5 text-yellow-500" />
                  )}
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-foreground">
                    {certificate.revoked
                      ? "Certificate Revoked"
                      : canRevoke
                        ? "You can revoke this certificate"
                        : "Request Revocation"}
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    {certificate.revoked
                      ? "This certificate has been permanently revoked"
                      : canRevoke
                        ? "As the issuer, you have permission to revoke this certificate"
                        : "You can request the issuer to revoke this certificate"}
                  </p>
                </div>
              </div>
            </div>

            {/* Certificate Content */}
            <div className="p-6 space-y-6">
              {/* Image */}
              {certificate.imageUrl && (
                <div className="rounded-xl overflow-hidden border border-border/50">
                  <img
                    src={certificate.imageUrl}
                    alt={certificate.title}
                    className="w-full h-48 object-cover"
                  />
                </div>
              )}

              {/* Details Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <DetailCard
                  icon={FileText}
                  label="Certificate Name"
                  value={certificate.title}
                />
                <DetailCard
                  icon={User}
                  label="Issued By"
                  value={certificate.issuedBy.name}
                  subValue={
                    certificate.issuedBy.wallet &&
                    truncateAddress(certificate.issuedBy.wallet)
                  }
                />
                <DetailCard
                  icon={Calendar}
                  label="Issued Date"
                  value={formatDate(certificate.issuedAt)}
                />
                <DetailCard
                  icon={Hash}
                  label="Mint Address"
                  value={truncateAddress(certificate.nftAddress)}
                  subValue={certificate.nftAddress}
                  isAddress={true}
                />
              </div>

              {/* Description */}
              {certificate.description && (
                <div className="rounded-xl bg-secondary/20 border border-border/50 p-4">
                  <p className="text-xs text-muted-foreground/70 mb-2">
                    Description
                  </p>
                  <p className="text-sm text-foreground/90">
                    {certificate.description}
                  </p>
                </div>
              )}

              {/* Revocation Details - Show if revoked */}
              {certificate.revoked &&
                certificate.revocationDetails &&
                certificate.revocationDetails.length > 0 && (
                  <div className="rounded-xl bg-destructive/5 border border-destructive/30 p-4">
                    <button
                      onClick={() =>
                        setShowRevocationDetails(!showRevocationDetails)
                      }
                      className="w-full flex items-center justify-between text-left"
                    >
                      <div className="flex items-center gap-2">
                        <Info className="w-4 h-4 text-destructive" />
                        <span className="text-sm font-semibold text-destructive">
                          Revocation Details
                        </span>
                      </div>
                      <span className="text-xs text-destructive">
                        {showRevocationDetails ? "Hide" : "Show"}
                      </span>
                    </button>

                    {showRevocationDetails && (
                      <div className="mt-4 space-y-4">
                        {certificate.revocationDetails.map((detail, index) => (
                          <div key={index} className="space-y-3">
                            <div className="flex items-start gap-2">
                              <span className="text-xs font-medium text-destructive/80 min-w-[80px]">
                                Reason:
                              </span>
                              <p className="text-sm text-foreground/90 flex-1">
                                {detail.reason}
                              </p>
                            </div>

                            <div className="flex items-start gap-2">
                              <span className="text-xs font-medium text-destructive/80 min-w-[80px]">
                                Revoked By:
                              </span>
                              <p className="text-sm text-foreground/90">
                                {detail.revokedBy.name} (
                                {detail.revokedBy.email})
                              </p>
                            </div>

                            <div className="flex items-start gap-2">
                              <span className="text-xs font-medium text-destructive/80 min-w-[80px]">
                                Revoked At:
                              </span>
                              <p className="text-sm text-foreground/90">
                                {formatDate(detail.revokedAt)}
                              </p>
                            </div>

                            {detail.transactionSignature && (
                              <div className="flex items-start gap-2">
                                <span className="text-xs font-medium text-destructive/80 min-w-[80px]">
                                  Transaction:
                                </span>
                                <a
                                  href={`https://explorer.solana.com/tx/${detail.transactionSignature}?cluster=devnet`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-sm text-primary hover:underline font-mono"
                                >
                                  {truncateAddress(detail.transactionSignature)}
                                </a>
                              </div>
                            )}

                            {index <
                              certificate.revocationDetails.length - 1 && (
                              <div className="border-t border-destructive/20 my-3" />
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

              {/* Action Buttons */}
              {!certificate.revoked && (
                <div className="pt-4 border-t border-border/50">
                  {canRevoke ? (
                    <Button
                      onClick={() => setShowRevokeModal(true)}
                      className="w-full h-12 bg-destructive hover:bg-destructive/90 text-destructive-foreground"
                    >
                      <Ban className="w-4 h-4 mr-2" />
                      Revoke Certificate
                    </Button>
                  ) : (
                    <Button
                      onClick={() => setShowRequestModal(true)}
                      disabled={hasPendingRequest}
                      className="w-full h-12 bg-yellow-500 hover:bg-yellow-600 text-white"
                    >
                      <Send className="w-4 h-4 mr-2" />
                      {hasPendingRequest
                        ? "Revocation Request Pending"
                        : "Request Revocation"}
                    </Button>
                  )}
                </div>
              )}

              {/* Pending Request Indicator */}
              {hasPendingRequest && !canRevoke && (
                <div className="rounded-lg bg-yellow-500/10 border border-yellow-500/30 p-3">
                  <p className="text-xs text-yellow-600 flex items-center gap-2">
                    <Clock className="w-3 h-3" />
                    You have a pending revocation request for this certificate
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Revoke Confirmation Modal */}
        {showRevokeModal && (
          <RevocationModal
            title="Confirm Revocation"
            description="Are you sure you want to revoke this certificate? This action cannot be undone."
            reason={revokeReason}
            onReasonChange={setRevokeReason}
            onConfirm={handleRevoke}
            onCancel={() => {
              setShowRevokeModal(false);
              setRevokeReason("");
            }}
            loading={revoking}
            actionLabel="Revoke Certificate"
          />
        )}

        {/* Request Revocation Modal */}
        {showRequestModal && (
          <RevocationModal
            title="Request Revocation"
            description="Please provide a reason for requesting revocation. The issuer will review your request."
            reason={revokeReason}
            onReasonChange={setRevokeReason}
            onConfirm={handleRequestRevocation}
            onCancel={() => {
              setShowRequestModal(false);
              setRevokeReason("");
            }}
            loading={revoking}
            actionLabel="Submit Request"
            isRequest={true}
          />
        )}
      </div>
    </div>
  );
}

function DetailCard({
  icon: Icon,
  label,
  value,
  subValue,
  isAddress,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
  subValue?: string;
  isAddress?: boolean;
}) {
  return (
    <div className="flex items-start gap-3 p-4 rounded-xl bg-secondary/20 border border-border/30">
      <div className="w-8 h-8 rounded-lg bg-secondary/50 flex items-center justify-center shrink-0">
        <Icon className="w-4 h-4 text-muted-foreground" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-xs text-muted-foreground/70">{label}</p>
        <p className="text-sm font-medium text-foreground truncate">{value}</p>
        {subValue && (
          <p className="text-xs font-mono text-muted-foreground/50 mt-1 truncate">
            {subValue}
          </p>
        )}
      </div>
    </div>
  );
}

function RevocationModal({
  title,
  description,
  reason,
  onReasonChange,
  onConfirm,
  onCancel,
  loading,
  actionLabel,
  isRequest = false,
}: {
  title: string;
  description: string;
  reason: string;
  onReasonChange: (value: string) => void;
  onConfirm: () => void;
  onCancel: () => void;
  loading: boolean;
  actionLabel: string;
  isRequest?: boolean;
}) {
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-card border border-border rounded-2xl max-w-md w-full">
        <div
          className={`px-6 py-4 border-b border-border flex items-center gap-3 ${
            isRequest ? "bg-yellow-500/5" : "bg-destructive/5"
          }`}
        >
          <div
            className={`w-10 h-10 rounded-full ${
              isRequest ? "bg-yellow-500/10" : "bg-destructive/10"
            } flex items-center justify-center`}
          >
            {isRequest ? (
              <Send className="w-5 h-5 text-yellow-500" />
            ) : (
              <AlertTriangle className="w-5 h-5 text-destructive" />
            )}
          </div>
          <div>
            <h2 className="text-lg font-semibold">{title}</h2>
            <p className="text-xs text-muted-foreground">{description}</p>
          </div>
        </div>

        <div className="p-6">
          <Label
            htmlFor="reason"
            className="text-sm text-foreground/80 mb-2 block"
          >
            Reason for {isRequest ? "Request" : "Revocation"}
          </Label>
          <Textarea
            id="reason"
            placeholder="Please provide a detailed reason..."
            value={reason}
            onChange={(e) => onReasonChange(e.target.value)}
            className="min-h-[100px] bg-background/50"
          />
        </div>

        <div className="px-6 py-4 border-t border-border flex gap-3">
          <Button
            onClick={onCancel}
            disabled={loading}
            variant="outline"
            className="flex-1"
          >
            Cancel
          </Button>
          <Button
            onClick={onConfirm}
            disabled={loading || !reason.trim()}
            className={`flex-1 ${
              isRequest
                ? "bg-yellow-500 hover:bg-yellow-600"
                : "bg-destructive hover:bg-destructive/90"
            }`}
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
                {isRequest ? "Submitting..." : "Revoking..."}
              </>
            ) : (
              actionLabel
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
