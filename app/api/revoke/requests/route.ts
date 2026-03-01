import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../../../lib/auth";
import { prisma } from "../../../../lib/prisma";

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const status = searchParams.get("status") || "pending";
    const skip = (page - 1) * limit;

    // Get current user
    const currentUser = await prisma.user.findUnique({
      where: { email: session.user.email! },
    });

    if (!currentUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Build where clause
    const whereClause: any = {
      certificate: {
        issuedById: currentUser.id,
      },
    };

    if (status !== "all") {
      // For now, we only have pending status since approved/rejected would delete the request
      // You might want to add a status field to RevocationRequest model
      whereClause.AND = [
        {
          certificate: {
            revoked: status === "approved" ? true : false,
          },
        },
      ];
    }

    const totalCount = await prisma.revocationRequest.count({
      where: {
        certificate: {
          issuedById: currentUser.id,
        },
      },
    });

    const requests = await prisma.revocationRequest.findMany({
      where: {
        certificate: {
          issuedById: currentUser.id,
        },
      },
      include: {
        certificate: {
          include: {
            issuedBy: {
              select: {
                name: true,
                email: true,
                user_wallet: true,
              },
            },
          },
        },
        requestedBy: {
          select: {
            id: true,
            name: true,
            email: true,
            user_wallet: true,
            user_type: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
      skip,
      take: limit,
    });

    const enhancedRequests = requests.map((request) => ({
      ...request,
      status: request.certificate.revoked ? "approved" : "pending",
      canApprove: !request.certificate.revoked,
    }));

    return NextResponse.json({
      success: true,
      requests: enhancedRequests,
      pagination: {
        page,
        limit,
        totalCount,
        totalPages: Math.ceil(totalCount / limit),
        hasNextPage: page < Math.ceil(totalCount / limit),
        hasPrevPage: page > 1,
      },
    });
  } catch (error: any) {
    console.error("Error fetching revocation requests:", error);
    return NextResponse.json(
      { error: "Failed to fetch revocation requests: " + error.message },
      { status: 500 },
    );
  }
}
