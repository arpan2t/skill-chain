"use client";

import { useState, useEffect } from "react";
import { Session } from "next-auth";
import {
  Award,
  Search,
  Loader2,
  ExternalLink,
  Copy,
  Ban,
  ChevronLeft,
  ChevronRight,
  Download,
  Eye,
  Filter,
  RefreshCw,
  Calendar,
  User,
  Hash,
  Image as ImageIcon,
  AlertCircle,
  CheckCircle,
  XCircle,
  Clock,
} from "lucide-react";
import { Button } from "../../../components/ui/button";
import { Input } from "../../../components/ui/input";
import { Label } from "../../../components/ui/label";
import { Textarea } from "../../../components/ui/textarea";
import { toast } from "../../../../hooks/useToast";

interface Certificate {
  id: number;
  title: string;
  description?: string;
  imageUrl?: string;
  nftAddress: string;
  destinationWallet: string;
  issuedAt: string;
  revoked: boolean;
  revocationReason?: string;
  revokedAt?: string;
  revokedBy?: {
    name: string;
    email: string;
  };
}

interface PaginationInfo {
  page: number;
  limit: number;
  totalCount: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

interface IssuedCertificatesClientProps {
  session: Session;
}

export default function IssuedCertificates({
  session,
}: IssuedCertificatesClientProps) {
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedCertificate, setSelectedCertificate] =
    useState<Certificate | null>(null);
  const [showRevokeModal, setShowRevokeModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [revokeReason, setRevokeReason] = useState("");
  const [revoking, setRevoking] = useState(false);
  const [pagination, setPagination] = useState<PaginationInfo>({
    page: 1,
    limit: 10,
    totalCount: 0,
    totalPages: 1,
    hasNextPage: false,
    hasPrevPage: false,
  });

  const fetchCertificates = async (
    page = pagination.page,
    search = searchTerm,
    status = statusFilter,
  ) => {
    setLoading(true);
    try {
      const response = await fetch(
        `/api/issued/certificates?page=${page}&limit=${pagination.limit}&search=${encodeURIComponent(
          search,
        )}&status=${status}`,
      );
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to fetch certificates");
      }

      setCertificates(data.certificates);
      setPagination(data.pagination);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCertificates();
  }, []);

  const handleSearch = () => {
    fetchCertificates(1, searchTerm, statusFilter);
  };

  const handleFilterChange = (status: string) => {
    setStatusFilter(status);
    fetchCertificates(1, searchTerm, status);
  };

  const handleRefresh = () => {
    fetchCertificates(pagination.page, searchTerm, statusFilter);
  };

  const handlePageChange = (newPage: number) => {
    fetchCertificates(newPage, searchTerm, statusFilter);
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

    if (!selectedCertificate) return;

    setRevoking(true);
    try {
      const response = await fetch("/api/revoke", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nftAddress: selectedCertificate.nftAddress,
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
      fetchCertificates(pagination.page, searchTerm, statusFilter);
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

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied!",
      description: `${label} copied to clipboard.`,
    });
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const truncateAddress = (address: string) => {
    if (!address) return "";
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const getStatusBadge = (revoked: boolean) => {
    return revoked ? (
      <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-destructive/10 text-destructive">
        <XCircle className="w-3 h-3" />
        Revoked
      </span>
    ) : (
      <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-green-500/10 text-green-500">
        <CheckCircle className="w-3 h-3" />
        Active
      </span>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary/20 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 space-y-6">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
            Issued Certificates
          </h1>
          <p className="text-sm text-muted-foreground mt-2 max-w-md mx-auto">
            View and manage all certificates you have issued
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="rounded-xl border border-border/50 bg-card p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                <Award className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{pagination.totalCount}</p>
                <p className="text-xs text-muted-foreground">Total Issued</p>
              </div>
            </div>
          </div>
          <div className="rounded-xl border border-border/50 bg-card p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-green-500/10 flex items-center justify-center">
                <CheckCircle className="w-5 h-5 text-green-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">
                  {certificates.filter((c) => !c.revoked).length}
                </p>
                <p className="text-xs text-muted-foreground">Active</p>
              </div>
            </div>
          </div>
          <div className="rounded-xl border border-border/50 bg-card p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-destructive/10 flex items-center justify-center">
                <XCircle className="w-5 h-5 text-destructive" />
              </div>
              <div>
                <p className="text-2xl font-bold">
                  {certificates.filter((c) => c.revoked).length}
                </p>
                <p className="text-xs text-muted-foreground">Revoked</p>
              </div>
            </div>
          </div>
          <div className="rounded-xl border border-border/50 bg-card p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center">
                <User className="w-5 h-5 text-blue-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">
                  {new Set(certificates.map((c) => c.destinationWallet)).size}
                </p>
                <p className="text-xs text-muted-foreground">
                  Unique Recipients
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="rounded-xl border border-border/50 bg-card/80 backdrop-blur-sm p-6">
          <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
            <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
              <div className="relative flex-1 min-w-[300px]">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search by title, wallet, or NFT address..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                  className="pl-9 h-10 bg-background/50"
                />
              </div>
              <Button onClick={handleSearch} className="h-10">
                <Search className="w-4 h-4 mr-2" />
                Search
              </Button>
            </div>
            <div className="flex items-center gap-2 w-full lg:w-auto justify-end">
              <div className="flex items-center gap-1 border border-border/50 rounded-lg p-1">
                <Button
                  variant={statusFilter === "all" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => handleFilterChange("all")}
                  className="text-xs"
                >
                  All
                </Button>
                <Button
                  variant={statusFilter === "active" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => handleFilterChange("active")}
                  className="text-xs"
                >
                  Active
                </Button>
                <Button
                  variant={statusFilter === "revoked" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => handleFilterChange("revoked")}
                  className="text-xs"
                >
                  Revoked
                </Button>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={handleRefresh}
                className="gap-2"
              >
                <RefreshCw className="w-3 h-3" />
                Refresh
              </Button>
            </div>
          </div>
        </div>

        {/* Certificates Table */}
        <div className="rounded-xl border border-border/50 bg-card overflow-hidden">
          {loading ? (
            <div className="p-12">
              <div className="flex flex-col items-center gap-3">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
                <p className="text-sm text-muted-foreground">
                  Loading certificates...
                </p>
              </div>
            </div>
          ) : certificates.length === 0 ? (
            <div className="p-12">
              <div className="flex flex-col items-center gap-3">
                <Award className="w-12 h-12 text-muted-foreground" />
                <p className="text-sm font-medium">No certificates found</p>
                <p className="text-xs text-muted-foreground">
                  {searchTerm
                    ? "Try adjusting your search or filters"
                    : "You haven't issued any certificates yet"}
                </p>
              </div>
            </div>
          ) : (
            <>
              {/* Desktop Table */}
              <div className="hidden lg:block overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-secondary/30 border-b border-border/50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                        Image
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                        Title
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                        Issued Date
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                        Recipient Wallet
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/50">
                    {certificates.map((cert) => (
                      <tr
                        key={cert.id}
                        className="hover:bg-secondary/20 transition-colors"
                      >
                        <td className="px-4 py-3">
                          {cert.imageUrl ? (
                            <img
                              src={cert.imageUrl}
                              alt={cert.title}
                              className="w-10 h-10 rounded-lg object-cover border border-border/50"
                            />
                          ) : (
                            <div className="w-10 h-10 rounded-lg bg-secondary/50 flex items-center justify-center">
                              <ImageIcon className="w-5 h-5 text-muted-foreground" />
                            </div>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          <div>
                            <p className="text-sm font-medium">{cert.title}</p>
                            <p className="text-xs text-muted-foreground mt-0.5">
                              {truncateAddress(cert.nftAddress)}
                            </p>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-1 text-sm">
                            <Calendar className="w-3 h-3 text-muted-foreground" />
                            {formatDate(cert.issuedAt)}
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-mono">
                              {truncateAddress(cert.destinationWallet)}
                            </span>
                            <button
                              onClick={() =>
                                copyToClipboard(
                                  cert.destinationWallet,
                                  "Wallet address",
                                )
                              }
                              className="p-1 hover:bg-secondary/80 rounded transition-colors"
                            >
                              <Copy className="w-3 h-3 text-muted-foreground" />
                            </button>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          {getStatusBadge(cert.revoked)}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => {
                                setSelectedCertificate(cert);
                                setShowDetailsModal(true);
                              }}
                              className="p-2 hover:bg-secondary/80 rounded-lg transition-colors"
                              title="View Details"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                            <a
                              href={`https://explorer.solana.com/address/${cert.nftAddress}?cluster=devnet`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="p-2 hover:bg-secondary/80 rounded-lg transition-colors"
                              title="View on Explorer"
                            >
                              <ExternalLink className="w-4 h-4" />
                            </a>
                            {!cert.revoked && (
                              <button
                                onClick={() => {
                                  setSelectedCertificate(cert);
                                  setShowRevokeModal(true);
                                }}
                                className="p-2 hover:bg-destructive/10 hover:text-destructive rounded-lg transition-colors"
                                title="Revoke Certificate"
                              >
                                <Ban className="w-4 h-4" />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile Cards */}
              <div className="lg:hidden space-y-4 p-4">
                {certificates.map((cert) => (
                  <div
                    key={cert.id}
                    className="border border-border/50 rounded-xl p-4 space-y-3"
                  >
                    <div className="flex items-start gap-3">
                      {cert.imageUrl ? (
                        <img
                          src={cert.imageUrl}
                          alt={cert.title}
                          className="w-16 h-16 rounded-lg object-cover border border-border/50"
                        />
                      ) : (
                        <div className="w-16 h-16 rounded-lg bg-secondary/50 flex items-center justify-center">
                          <ImageIcon className="w-8 h-8 text-muted-foreground" />
                        </div>
                      )}
                      <div className="flex-1">
                        <h3 className="font-semibold">{cert.title}</h3>
                        <p className="text-xs text-muted-foreground mt-1 font-mono">
                          {truncateAddress(cert.nftAddress)}
                        </p>
                        <div className="mt-2">
                          {getStatusBadge(cert.revoked)}
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div>
                        <p className="text-xs text-muted-foreground">
                          Issued Date
                        </p>
                        <p className="text-xs">{formatDate(cert.issuedAt)}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">
                          Recipient
                        </p>
                        <div className="flex items-center gap-1">
                          <span className="text-xs font-mono">
                            {truncateAddress(cert.destinationWallet)}
                          </span>
                          <button
                            onClick={() =>
                              copyToClipboard(
                                cert.destinationWallet,
                                "Wallet address",
                              )
                            }
                            className="p-0.5 hover:bg-secondary/80 rounded"
                          >
                            <Copy className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 pt-2 border-t border-border/50">
                      <Button
                        size="sm"
                        variant="outline"
                        className="flex-1"
                        onClick={() => {
                          setSelectedCertificate(cert);
                          setShowDetailsModal(true);
                        }}
                      >
                        <Eye className="w-4 h-4 mr-2" />
                        Details
                      </Button>
                      <a
                        href={`https://explorer.solana.com/address/${cert.nftAddress}?cluster=devnet`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1"
                      >
                        <Button size="sm" variant="outline" className="w-full">
                          <ExternalLink className="w-4 h-4 mr-2" />
                          Explorer
                        </Button>
                      </a>
                      {!cert.revoked && (
                        <Button
                          size="sm"
                          variant="destructive"
                          className="flex-1"
                          onClick={() => {
                            setSelectedCertificate(cert);
                            setShowRevokeModal(true);
                          }}
                        >
                          <Ban className="w-4 h-4 mr-2" />
                          Revoke
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="flex items-center justify-between px-2">
            <p className="text-sm text-muted-foreground">
              Showing {(pagination.page - 1) * pagination.limit + 1} to{" "}
              {Math.min(
                pagination.page * pagination.limit,
                pagination.totalCount,
              )}{" "}
              of {pagination.totalCount} results
            </p>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(pagination.page - 1)}
                disabled={!pagination.hasPrevPage}
              >
                <ChevronLeft className="w-4 h-4 mr-1" />
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(pagination.page + 1)}
                disabled={!pagination.hasNextPage}
              >
                Next
                <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </div>
          </div>
        )}

        {/* Details Modal */}
        {showDetailsModal && selectedCertificate && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-card border border-border rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b border-border/50 bg-secondary/30">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-bold">Certificate Details</h2>
                  <button
                    onClick={() => setShowDetailsModal(false)}
                    className="p-2 hover:bg-secondary/80 rounded-lg transition-colors"
                  >
                    <XCircle className="w-5 h-5" />
                  </button>
                </div>
              </div>
              <div className="p-6 space-y-6">
                {selectedCertificate.imageUrl && (
                  <img
                    src={selectedCertificate.imageUrl}
                    alt={selectedCertificate.title}
                    className="w-full h-48 object-cover rounded-lg border border-border/50"
                  />
                )}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-muted-foreground">Title</p>
                    <p className="text-sm font-medium">
                      {selectedCertificate.title}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Status</p>
                    <div className="mt-1">
                      {getStatusBadge(selectedCertificate.revoked)}
                    </div>
                  </div>
                  <div className="col-span-2">
                    <p className="text-xs text-muted-foreground">NFT Address</p>
                    <div className="flex items-center gap-2 mt-1">
                      <code className="text-xs font-mono bg-secondary/50 p-2 rounded flex-1">
                        {selectedCertificate.nftAddress}
                      </code>
                      <button
                        onClick={() =>
                          copyToClipboard(
                            selectedCertificate.nftAddress,
                            "NFT address",
                          )
                        }
                        className="p-2 hover:bg-secondary/80 rounded"
                      >
                        <Copy className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  <div className="col-span-2">
                    <p className="text-xs text-muted-foreground">
                      Recipient Wallet
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <code className="text-xs font-mono bg-secondary/50 p-2 rounded flex-1">
                        {selectedCertificate.destinationWallet}
                      </code>
                      <button
                        onClick={() =>
                          copyToClipboard(
                            selectedCertificate.destinationWallet,
                            "Wallet address",
                          )
                        }
                        className="p-2 hover:bg-secondary/80 rounded"
                      >
                        <Copy className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Issued Date</p>
                    <p className="text-sm">
                      {formatDate(selectedCertificate.issuedAt)}
                    </p>
                  </div>
                  {selectedCertificate.revoked && (
                    <>
                      <div>
                        <p className="text-xs text-muted-foreground">
                          Revoked Date
                        </p>
                        <p className="text-sm">
                          {formatDate(selectedCertificate.revokedAt!)}
                        </p>
                      </div>
                      <div className="col-span-2">
                        <p className="text-xs text-muted-foreground">
                          Revocation Reason
                        </p>
                        <p className="text-sm p-3 bg-destructive/5 rounded-lg border border-destructive/30 mt-1">
                          {selectedCertificate.revocationReason}
                        </p>
                      </div>
                      <div className="col-span-2">
                        <p className="text-xs text-muted-foreground">
                          Revoked By
                        </p>
                        <p className="text-sm">
                          {selectedCertificate.revokedBy?.name} (
                          {selectedCertificate.revokedBy?.email})
                        </p>
                      </div>
                    </>
                  )}
                  {selectedCertificate.description && (
                    <div className="col-span-2">
                      <p className="text-xs text-muted-foreground">
                        Description
                      </p>
                      <p className="text-sm p-3 bg-secondary/20 rounded-lg border border-border/30 mt-1">
                        {selectedCertificate.description}
                      </p>
                    </div>
                  )}
                </div>
              </div>
              <div className="p-6 border-t border-border/50 bg-secondary/30">
                <Button
                  onClick={() => setShowDetailsModal(false)}
                  className="w-full"
                >
                  Close
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Revoke Modal */}
        {showRevokeModal && selectedCertificate && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-card border border-border rounded-2xl max-w-md w-full">
              <div className="p-6 border-b border-border/50 bg-destructive/5">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-destructive/10 flex items-center justify-center">
                    <AlertCircle className="w-5 h-5 text-destructive" />
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold">
                      Revoke Certificate
                    </h2>
                    <p className="text-xs text-muted-foreground">
                      Are you sure you want to revoke "
                      {selectedCertificate.title}"?
                    </p>
                  </div>
                </div>
              </div>
              <div className="p-6">
                <Label htmlFor="revokeReason" className="text-sm mb-2 block">
                  Reason for Revocation
                </Label>
                <Textarea
                  id="revokeReason"
                  placeholder="Please provide a detailed reason..."
                  value={revokeReason}
                  onChange={(e) => setRevokeReason(e.target.value)}
                  className="min-h-[100px]"
                />
                <div className="mt-4 p-3 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
                  <p className="text-xs text-yellow-600 flex items-center gap-2">
                    <Clock className="w-3 h-3" />
                    This action cannot be undone. The certificate will be
                    permanently revoked.
                  </p>
                </div>
              </div>
              <div className="p-6 border-t border-border/50 flex gap-3">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => {
                    setShowRevokeModal(false);
                    setRevokeReason("");
                  }}
                >
                  Cancel
                </Button>
                <Button
                  variant="destructive"
                  className="flex-1"
                  onClick={handleRevoke}
                  disabled={revoking || !revokeReason.trim()}
                >
                  {revoking ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin mr-2" />
                      Revoking...
                    </>
                  ) : (
                    <>
                      <Ban className="w-4 h-4 mr-2" />
                      Confirm Revoke
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
