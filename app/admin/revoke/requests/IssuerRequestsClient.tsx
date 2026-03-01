"use client";

import { useState, useEffect } from "react";
import { Session } from "next-auth";
import {
  Inbox,
  Loader2,
  CheckCircle2,
  XCircle,
  ExternalLink,
  User,
  Calendar,
  Clock,
  Hash,
  FileText,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  Search,
  Filter,
  RefreshCw,
} from "lucide-react";
import { Button } from "./../../../components/ui/button";
import { Input } from "./../../../components/ui/input";
import { Label } from "./../../../components/ui/label";
import { Textarea } from "./../../../components/ui/textarea";
import { toast } from "./../../../../hooks/useToast";

interface RevocationRequest {
  id: number;
  reason: string;
  adminNotes?: string;
  createdAt: string;
  updatedAt: string;
  status: "pending" | "approved" | "rejected";
  canApprove: boolean;
  certificate: {
    id: number;
    title: string;
    description?: string;
    nftAddress: string;
    imageUrl?: string;
    issuedBy: {
      name: string;
      email: string;
      user_wallet?: string;
    };
  };
  requestedBy: {
    id: number;
    name: string;
    email: string;
    user_wallet?: string;
    user_type: number;
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

interface IssuerRequestsClientProps {
  session: Session;
}

export default function IssuerRequestsClient({
  session,
}: IssuerRequestsClientProps) {
  const [requests, setRequests] = useState<RevocationRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<number | null>(null);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [selectedRequest, setSelectedRequest] =
    useState<RevocationRequest | null>(null);
  const [rejectReason, setRejectReason] = useState("");

  // Pagination
  const [pagination, setPagination] = useState<PaginationInfo>({
    page: 1,
    limit: 10,
    totalCount: 0,
    totalPages: 1,
    hasNextPage: false,
    hasPrevPage: false,
  });

  // Filters
  const [filterStatus, setFilterStatus] = useState("pending");
  const [searchTerm, setSearchTerm] = useState("");

  const fetchRequests = async (
    page = pagination.page,
    status = filterStatus,
  ) => {
    setLoading(true);
    try {
      const response = await fetch(
        `/api/revoke/requests?page=${page}&limit=${pagination.limit}&status=${status}`,
      );
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to fetch requests");
      }

      setRequests(data.requests);
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
    fetchRequests();
  }, []);

  const handlePageChange = (newPage: number) => {
    fetchRequests(newPage, filterStatus);
  };

  const handleFilterChange = (status: string) => {
    setFilterStatus(status);
    fetchRequests(1, status);
  };

  const handleRefresh = () => {
    fetchRequests(pagination.page, filterStatus);
  };

  const handleApprove = async (request: RevocationRequest) => {
    setProcessingId(request.id);
    try {
      const response = await fetch(`/api/revoke/requests/${request.id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "approve",
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to approve request");
      }

      toast({
        title: "Success!",
        description: data.message || "Certificate revoked successfully",
        variant: "default",
      });

      // Refresh the list
      fetchRequests(pagination.page, filterStatus);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setProcessingId(null);
    }
  };

  const handleReject = async () => {
    if (!selectedRequest) return;

    setProcessingId(selectedRequest.id);
    try {
      const response = await fetch(
        `/api/revoke/requests/${selectedRequest.id}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            action: "reject",
            adminNotes: rejectReason,
          }),
        },
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to reject request");
      }

      toast({
        title: "Request Rejected",
        description: data.message || "Revocation request has been rejected",
        variant: "default",
      });

      setShowRejectModal(false);
      setSelectedRequest(null);
      setRejectReason("");

      // Refresh the list
      fetchRequests(pagination.page, filterStatus);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setProcessingId(null);
    }
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
    return `${address.slice(0, 4)}...${address.slice(-4)}`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary/20 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 space-y-6">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
            Revocation Requests
          </h1>
          <p className="text-sm text-muted-foreground mt-2 max-w-md mx-auto">
            Manage revocation requests for certificates you've issued
          </p>
        </div>

        {/* Stats Card */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="rounded-xl border border-border/50 bg-card p-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-yellow-500/10 flex items-center justify-center">
                <Clock className="w-5 h-5 text-yellow-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">
                  {requests.filter((r) => r.status === "pending").length}
                </p>
                <p className="text-xs text-muted-foreground">
                  Pending Requests
                </p>
              </div>
            </div>
          </div>
          <div className="rounded-xl border border-border/50 bg-card p-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-green-500/10 flex items-center justify-center">
                <CheckCircle2 className="w-5 h-5 text-green-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">
                  {requests.filter((r) => r.status === "approved").length}
                </p>
                <p className="text-xs text-muted-foreground">Approved</p>
              </div>
            </div>
          </div>
          <div className="rounded-xl border border-border/50 bg-card p-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-destructive/10 flex items-center justify-center">
                <XCircle className="w-5 h-5 text-destructive" />
              </div>
              <div>
                <p className="text-2xl font-bold">
                  {requests.filter((r) => r.status === "rejected").length}
                </p>
                <p className="text-xs text-muted-foreground">Rejected</p>
              </div>
            </div>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="rounded-xl border border-border/50 bg-card/80 backdrop-blur-sm p-6">
          <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm font-medium">Filter by:</span>
              <div className="flex gap-1">
                <Button
                  variant={filterStatus === "pending" ? "default" : "outline"}
                  size="sm"
                  onClick={() => handleFilterChange("pending")}
                  className="text-xs"
                >
                  Pending
                </Button>
                <Button
                  variant={filterStatus === "approved" ? "default" : "outline"}
                  size="sm"
                  onClick={() => handleFilterChange("approved")}
                  className="text-xs"
                >
                  Approved
                </Button>
                <Button
                  variant={filterStatus === "rejected" ? "default" : "outline"}
                  size="sm"
                  onClick={() => handleFilterChange("rejected")}
                  className="text-xs"
                >
                  Rejected
                </Button>
                <Button
                  variant={filterStatus === "all" ? "default" : "outline"}
                  size="sm"
                  onClick={() => handleFilterChange("all")}
                  className="text-xs"
                >
                  All
                </Button>
              </div>
            </div>
            <div className="flex gap-2">
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

        {/* Requests List */}
        <div className="space-y-4">
          {loading ? (
            <div className="rounded-xl border border-border/50 bg-card p-12">
              <div className="flex flex-col items-center gap-3">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
                <p className="text-sm text-muted-foreground">
                  Loading requests...
                </p>
              </div>
            </div>
          ) : requests.length === 0 ? (
            <div className="rounded-xl border border-border/50 bg-card p-12">
              <div className="flex flex-col items-center gap-3">
                <Inbox className="w-12 h-12 text-muted-foreground" />
                <p className="text-sm font-medium">No requests found</p>
                <p className="text-xs text-muted-foreground">
                  {filterStatus === "pending"
                    ? "You have no pending revocation requests"
                    : `No ${filterStatus} requests to display`}
                </p>
              </div>
            </div>
          ) : (
            requests.map((request) => (
              <div
                key={request.id}
                className="rounded-xl border border-border/50 bg-card overflow-hidden hover:border-primary/30 transition-all"
              >
                {/* Request Header */}
                <div
                  className={`px-6 py-4 border-b border-border/50 ${
                    request.status === "pending"
                      ? "bg-yellow-500/5"
                      : request.status === "approved"
                        ? "bg-green-500/5"
                        : "bg-destructive/5"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center ${
                          request.status === "pending"
                            ? "bg-yellow-500/10"
                            : request.status === "approved"
                              ? "bg-green-500/10"
                              : "bg-destructive/10"
                        }`}
                      >
                        {request.status === "pending" ? (
                          <Clock className="w-4 h-4 text-yellow-500" />
                        ) : request.status === "approved" ? (
                          <CheckCircle2 className="w-4 h-4 text-green-500" />
                        ) : (
                          <XCircle className="w-4 h-4 text-destructive" />
                        )}
                      </div>
                      <div>
                        <h3 className="text-sm font-semibold">
                          {request.certificate.title}
                        </h3>
                        <p className="text-xs text-muted-foreground">
                          Requested by {request.requestedBy.name} •{" "}
                          {formatDate(request.createdAt)}
                        </p>
                      </div>
                    </div>
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${
                        request.status === "pending"
                          ? "bg-yellow-500/10 text-yellow-600"
                          : request.status === "approved"
                            ? "bg-green-500/10 text-green-600"
                            : "bg-destructive/10 text-destructive"
                      }`}
                    >
                      {request.status.charAt(0).toUpperCase() +
                        request.status.slice(1)}
                    </span>
                  </div>
                </div>

                {/* Request Content */}
                <div className="p-6">
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Left Column - Certificate Info */}
                    <div className="lg:col-span-1">
                      {request.certificate.imageUrl ? (
                        <img
                          src={request.certificate.imageUrl}
                          alt={request.certificate.title}
                          className="w-full h-32 object-cover rounded-lg border border-border/50"
                        />
                      ) : (
                        <div className="w-full h-32 bg-secondary/50 rounded-lg border border-border/50 flex items-center justify-center">
                          <FileText className="w-8 h-8 text-muted-foreground" />
                        </div>
                      )}
                    </div>

                    {/* Middle Column - Request Details */}
                    <div className="lg:col-span-1 space-y-3">
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">
                          Request Reason
                        </p>
                        <p className="text-sm bg-secondary/20 p-3 rounded-lg border border-border/30">
                          "{request.reason}"
                        </p>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <p className="text-xs text-muted-foreground">
                            Requester
                          </p>
                          <p className="text-sm font-medium">
                            {request.requestedBy.name}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {request.requestedBy.email}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">
                            Certificate
                          </p>
                          <a
                            href={`https://explorer.solana.com/address/${request.certificate.nftAddress}?cluster=devnet`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm text-primary hover:underline flex items-center gap-1"
                          >
                            {truncateAddress(request.certificate.nftAddress)}
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        </div>
                      </div>
                    </div>

                    {/* Right Column - Actions */}
                    <div className="lg:col-span-1 flex flex-col gap-2">
                      {request.status === "pending" && (
                        <>
                          <Button
                            onClick={() => handleApprove(request)}
                            disabled={processingId === request.id}
                            className="w-full bg-green-600 hover:bg-green-700 text-white"
                          >
                            {processingId === request.id ? (
                              <>
                                <Loader2 className="w-4 h-4 animate-spin mr-2" />
                                Processing...
                              </>
                            ) : (
                              <>
                                <CheckCircle2 className="w-4 h-4 mr-2" />
                                Approve & Revoke
                              </>
                            )}
                          </Button>
                          <Button
                            onClick={() => {
                              setSelectedRequest(request);
                              setShowRejectModal(true);
                            }}
                            disabled={processingId === request.id}
                            variant="outline"
                            className="w-full"
                          >
                            <XCircle className="w-4 h-4 mr-2" />
                            Reject
                          </Button>
                        </>
                      )}
                      {request.status !== "pending" && (
                        <div className="text-center p-4 bg-secondary/20 rounded-lg">
                          <p className="text-sm text-muted-foreground">
                            {request.status === "approved"
                              ? "✓ Request approved and certificate revoked"
                              : "✗ Request rejected"}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))
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

        {/* Reject Modal */}
        {showRejectModal && selectedRequest && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-card border border-border rounded-2xl max-w-md w-full">
              <div className="px-6 py-4 border-b border-border bg-destructive/5">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-destructive/10 flex items-center justify-center">
                    <XCircle className="w-5 h-5 text-destructive" />
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold">Reject Request</h2>
                    <p className="text-xs text-muted-foreground">
                      Are you sure you want to reject this revocation request?
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-6">
                <Label
                  htmlFor="rejectReason"
                  className="text-sm text-foreground/80 mb-2 block"
                >
                  Reason for Rejection (Optional)
                </Label>
                <Textarea
                  id="rejectReason"
                  placeholder="Provide a reason for rejecting this request..."
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  className="min-h-[100px] bg-background/50"
                />
              </div>

              <div className="px-6 py-4 border-t border-border flex gap-3">
                <Button
                  onClick={() => {
                    setShowRejectModal(false);
                    setSelectedRequest(null);
                    setRejectReason("");
                  }}
                  variant="outline"
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleReject}
                  disabled={processingId === selectedRequest?.id}
                  className="flex-1 bg-destructive hover:bg-destructive/90"
                >
                  {processingId === selectedRequest?.id ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin mr-2" />
                      Rejecting...
                    </>
                  ) : (
                    <>
                      <XCircle className="w-4 h-4 mr-2" />
                      Confirm Reject
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
