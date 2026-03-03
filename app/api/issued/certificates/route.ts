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
    const search = searchParams.get("search") || "";
    const status = searchParams.get("status") || "all";
    const skip = (page - 1) * limit;

    const currentUser = await prisma.user.findUnique({
      where: { email: session.user.email! },
    });

    if (!currentUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const whereClause: any = {
      issuedById: currentUser.id,
    };

    if (search) {
      whereClause.OR = [
        { title: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
        { nftAddress: { contains: search, mode: "insensitive" } },
        { destination_wallet: { contains: search, mode: "insensitive" } },
      ];
    }

    if (status !== "all") {
      whereClause.revoked = status === "revoked";
    }

    const totalCount = await prisma.certificate.count({
      where: whereClause,
    });

    const certificates = await prisma.certificate.findMany({
      where: whereClause,
      include: {
        issuedBy: {
          select: {
            name: true,
            email: true,
          },
        },
        revocationHistory: {
          include: {
            revokedBy: {
              select: {
                name: true,
                email: true,
              },
            },
          },
          take: 1,
        },
      },
      orderBy: {
        mintedAt: "desc",
      },
      skip,
      take: limit,
    });

    const formattedCertificates = certificates.map((cert) => ({
      id: cert.id,
      title: cert.title || "Untitled Certificate",
      description: cert.description,
      imageUrl: cert.ipfsUrl,
      nftAddress: cert.nftAddress,
      destinationWallet: cert.destination_wallet,
      issuedAt: cert.mintedAt,
      revoked: cert.revoked,
      revocationReason: cert.revocationHistory[0]?.reason,
      revokedAt: cert.revocationHistory[0]?.revokedAt,
      revokedBy: cert.revocationHistory[0]?.revokedBy,
    }));

    return NextResponse.json({
      success: true,
      certificates: formattedCertificates,
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
    console.error("Error fetching certificates:", error);
    return NextResponse.json(
      { error: "Failed to fetch certificates: " + error.message },
      { status: 500 },
    );
  }
}
