import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../../lib/auth";
import { prisma } from "../../../lib/prisma";
import { PublicKey, Transaction } from "@solana/web3.js";
import { getMetaplex } from "../../../lib/metaplex";
import { fetchFromPinata, uploadToPinata } from "../../../lib/pinata";
import { Connection, clusterApiUrl } from "@solana/web3.js";

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
    });

    if (!certificate) {
      return NextResponse.json(
        { error: "Certificate not found in database" },
        { status: 404 },
      );
    }

    if (certificate.revoked) {
      return NextResponse.json(
        { error: "Certificate already revoked" },
        { status: 400 },
      );
    }

    if (certificate.issuedById !== currentUser.id) {
      return NextResponse.json(
        {
          error:
            "Only the original issuer can revoke this certificate. Please submit a revocation request instead.",
        },
        { status: 403 },
      );
    }

    let transactionSignature = null;
    let updatedMetadataUri = null;

    try {
      const currentMetadata = await fetchFromPinata(certificate.ipfsUrl);

      const updatedMetadata = {
        ...currentMetadata,
        attributes: [
          ...(currentMetadata.attributes || []).filter(
            (attr: any) =>
              attr.trait_type !== "Revoked" &&
              attr.trait_type !== "Revocation Reason" &&
              attr.trait_type !== "Revoked By" &&
              attr.trait_type !== "Revoked At",
          ),
          { trait_type: "Revoked", value: "true" },
          { trait_type: "Revocation Reason", value: reason },
          {
            trait_type: "Revoked By",
            value: currentUser.user_wallet || currentUser.email,
          },
          { trait_type: "Revoked At", value: new Date().toISOString() },
        ],
      };

      const newMetadataUri = await uploadToPinata(updatedMetadata);

      const metaplex = getMetaplex();
      const mintAddress = new PublicKey(nftAddress);

      const nft = await metaplex.nfts().findByMint({ mintAddress });
      const { response } = await metaplex.nfts().update({
        nftOrSft: nft,
        uri: newMetadataUri,
      });

      transactionSignature = response.signature;

      updatedMetadataUri = newMetadataUri;
    } catch (blockchainError: any) {
      return NextResponse.json(
        { error: "Failed to update on-chain data: " + blockchainError.message },
        { status: 500 },
      );
    }

    const revocation = await prisma.$transaction([
      prisma.revocation.create({
        data: {
          certificateId: certificate.id,
          revokedById: currentUser.id,
          reason: reason,
          transactionSignature: transactionSignature,
        },
      }),
      prisma.certificate.update({
        where: { id: certificate.id },
        data: {
          revoked: true,
          metadataUri: updatedMetadataUri, // Store new metadata URI
        },
      }),
    ]);

    return NextResponse.json({
      success: true,
      message: "Certificate revoked successfully",
      revocation: revocation[0],
      transactionSignature,
      newMetadataUri: updatedMetadataUri,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: "Failed to revoke certificate: " + error.message },
      { status: 500 },
    );
  }
}
