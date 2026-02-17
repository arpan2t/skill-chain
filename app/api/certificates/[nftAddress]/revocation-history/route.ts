// app/api/certificates/revocation-requests/route.ts
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "./../../../../../lib/auth";
import { prisma } from "./../../../../../lib/prisma";

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if user is verified to issue/revoke (is_verified = 1)
    if (session.user.is_verified !== 1) {
      return NextResponse.json(
        { error: "You are not verified to handle revocation requests" },
        { status: 403 }
      );
    }

    const url = new URL(req.url);
    const certificateId = url.searchParams.get("certificateId");

    // Build where clause
    const where: any = {
      certificate: {
        issuedById: parseInt(session.user.id) // Only show requests for certificates this user issued
      }
    };

    // Filter by specific certificate if provided
    if (certificateId) {
      where.certificateId = parseInt(certificateId);
    }

    const requests = await prisma.revocationRequest.findMany({
      where,
      include: {
        requestedBy: {
          select: { 
            id: true,
            name: true, 
            email: true,
            user_wallet: true,
            user_type: true
          }
        },
        certificate: {
          select: {
            id: true,
            nftAddress: true,
            destination_wallet: true,
            ipfsUrl: true,
            mintedAt: true,
            revoked: true,
            metadataUri: true
          }
        }
      },
      orderBy: { createdAt: "desc" }
    });

    return NextResponse.json({
      success: true,
      data: requests
    });

  } catch (err) {
    console.error("Fetch requests error:", err);
    return NextResponse.json(
      { error: "Failed to fetch revocation requests" },
      { status: 500 }
    );
  }
}