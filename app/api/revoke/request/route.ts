import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../../../lib/auth";
import { prisma } from "../../../../lib/prisma";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { nftAddress, reason } = await req.json();

    const currentUser = await prisma.user.findUnique({
      where: { email: session.user.email! },
    });

    if (!currentUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const certificate = await prisma.certificate.findUnique({
      where: { nftAddress },
      include: {
        issuedBy: true,
      },
    });

    if (!certificate) {
      return NextResponse.json(
        { error: "Certificate not found" },
        { status: 404 },
      );
    }

    if (certificate.revoked) {
      return NextResponse.json(
        { error: "Certificate already revoked" },
        { status: 400 },
      );
    }

    const existingRequest = await prisma.revocationRequest.findFirst({
      where: {
        certificateId: certificate.id,
        requestedById: currentUser.id,
      },
    });

    if (existingRequest) {
      return NextResponse.json(
        {
          error:
            "You already have a pending revocation request for this certificate",
        },
        { status: 400 },
      );
    }

    const request = await prisma.revocationRequest.create({
      data: {
        certificateId: certificate.id,
        requestedById: currentUser.id,
        reason: reason,
      },
      include: {
        certificate: {
          include: {
            issuedBy: {
              select: {
                id: true,
                name: true,
                email: true,
                user_type: true,
              },
            },
          },
        },
        requestedBy: {
          select: {
            id: true,
            name: true,
            email: true,
            user_type: true,
          },
        },
      },
    });

    return NextResponse.json({
      success: true,
      message:
        "Revocation request submitted successfully. The issuer will review your request.",
      request,
    });
  } catch (error: any) {
    console.error("Error creating revocation request:", error);
    return NextResponse.json(
      { error: "Failed to create revocation request: " + error.message },
      { status: 500 },
    );
  }
}
