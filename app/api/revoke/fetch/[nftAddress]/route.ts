import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../../../../lib/auth";
import { prisma } from "../../../../../lib/prisma";
import { PublicKey } from "@solana/web3.js";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ nftAddress: string }> },
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { nftAddress } = await params;

    try {
      new PublicKey(nftAddress);
    } catch (error) {
      return NextResponse.json(
        { error: "Invalid NFT address format" },
        { status: 400 },
      );
    }

    const currentUser = await prisma.user.findUnique({
      where: { email: session.user.email! },
    });

    if (!currentUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const certificate = await prisma.certificate.findUnique({
      where: { nftAddress },
      include: {
        issuedBy: {
          select: {
            id: true,
            name: true,
            email: true,
            user_wallet: true,
          },
        },
        revocationHistory: {
          include: {
            revokedBy: {
              select: { name: true, email: true },
            },
          },
        },
        revocationRequests: {
          where: { requestedById: currentUser.id },
          take: 1,
        },
      },
    });

    if (!certificate) {
      return NextResponse.json(
        { error: "Certificate not found in database" },
        { status: 404 },
      );
    }

    const canRevoke = certificate.issuedById === currentUser.id;

    const hasPendingRequest = certificate.revocationRequests.length > 0;

    const response = {
      exists: true,
      inDatabase: true,
      certificate: {
        id: certificate.id,
        nftAddress: certificate.nftAddress,
        title: certificate.title || "Untitled Certificate",
        description: certificate.description,
        imageUrl: certificate.ipfsUrl,
        issuedBy: {
          id: certificate.issuedBy.id,
          name: certificate.issuedBy.name,
          wallet: certificate.issuedBy.user_wallet,
        },
        issuedAt: certificate.mintedAt.toISOString(),
        revoked: certificate.revoked,
        revocationDetails: certificate.revocationHistory,
      },
      canRevoke,
      hasPendingRequest,
      currentUserType: currentUser.user_type,
      currentUserId: currentUser.id,
      issuerId: certificate.issuedById,
    };

    console.log("Revoke fetch response:", {
      canRevoke,
      currentUserType: currentUser.user_type,
      currentUserId: currentUser.id,
      issuerId: certificate.issuedById,
      isOriginalIssuer: certificate.issuedById === currentUser.id,
    });

    return NextResponse.json(response);
  } catch (error: any) {
    console.error("Error in revoke fetch:", error);
    return NextResponse.json(
      { error: "Failed to fetch certificate: " + error.message },
      { status: 500 },
    );
  }
}
