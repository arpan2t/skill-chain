// app/api/certificates/revoke/route.ts
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "./../../../lib/auth";
import { prisma } from "./../../../lib/prisma";
import { connection, getAdminKeypair, getMetaplex } from "./../../../lib/metaplex";
import { PublicKey } from "@solana/web3.js";

export async function POST(req: Request) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { nftAddress, reason } = body;

    if (!nftAddress || !reason) {
      return NextResponse.json(
        { error: "Missing required fields: nftAddress and reason" },
        { status: 400 }
      );
    }

    // Find certificate by NFT address
    const certificate = await prisma.certificate.findUnique({
      where: { nftAddress: nftAddress },
      include: { 
        issuedBy: true 
      },
    });

    if (!certificate) {
      return NextResponse.json(
        { error: "Certificate not found with this NFT address" },
        { status: 404 }
      );
    }

    // Check if user has permission to revoke (only issuer can revoke based on your schema)
    // user_type: 0 = admin, 1 = student
    const isIssuer = certificate.issuedById === parseInt(session.user.id);
    const isAdmin = session.user.user_type === 0;

    if (!isIssuer && !isAdmin) {
      return NextResponse.json(
        { error: "Only the issuer or admin can revoke this certificate" },
        { status: 403 }
      );
    }

    // Check if already revoked
    if (certificate.revoked) {
      return NextResponse.json(
        { error: "Certificate already revoked" },
        { status: 400 }
      );
    }

    // Get metaplex and admin keypair
    const metaplex = getMetaplex();
    const adminKeypair = getAdminKeypair();

    // Find the NFT metadata account
    const mintAddress = new PublicKey(nftAddress);
    
    // Fetch current metadata
    const nft = await metaplex.nfts().findByMint({ mintAddress });
    
    if (!nft.json) {
      throw new Error("Could not fetch NFT metadata");
    }

    // Update metadata with revocation info
    const updatedMetadata = {
      ...nft.json,
      attributes: [
        // Filter out any existing revocation attributes
        ...(nft.json.attributes?.filter(
          (attr: any) => 
            attr.trait_type !== "Revoked" && 
            attr.trait_type !== "Revocation Reason" && 
            attr.trait_type !== "Revocation Date" && 
            attr.trait_type !== "Revoked By"
        ) || []),
        { trait_type: "Revoked", value: "true" },
        { trait_type: "Revocation Reason", value: reason },
        { trait_type: "Revocation Date", value: new Date().toISOString() },
        { trait_type: "Revoked By", value: session.user.name || "Admin" },
      ],
    };

    // Upload updated metadata to Pinata
    const pinataJwt = process.env.PINATA_JWT;
    const response = await fetch(
      "https://api.pinata.cloud/pinning/pinJSONToIPFS",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${pinataJwt}`,
        },
        body: JSON.stringify({
          pinataContent: updatedMetadata,
          pinataMetadata: {
            name: `${nft.json.name}-revoked-metadata.json`,
          },
        }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Pinata error:", errorText);
      throw new Error("Failed to upload revocation metadata");
    }

    const result = await response.json();
    const newMetadataUri = `https://gateway.pinata.cloud/ipfs/${result.IpfsHash}`;

    // Update the NFT metadata on-chain
    await metaplex.nfts().update({
      nftOrSft: nft,
      uri: newMetadataUri,
      authority: adminKeypair,
    });

    // Start a transaction to update both Certificate and create RevocationHistory
    const result_data = await prisma.$transaction(async (tx) => {
      // Update certificate
      const updatedCertificate = await tx.certificate.update({
        where: { nftAddress: nftAddress },
        data: {
          revoked: true,
          metadataUri: newMetadataUri, // Store the new metadata URI
        },
        include: {
          issuedBy: {
            select: { name: true, email: true }
          }
        }
      });

      // Create revocation history record
      const revocationHistory = await tx.revocationHistory.create({
        data: {
          certificateId: certificate.id,
          revokedById: parseInt(session.user.id),
          reason: reason,
          transactionSignature: result.IpfsHash, // Using IPFS hash as transaction reference
          // revokedAt will use default now()
        },
        include: {
          revokedBy: {
            select: { name: true, email: true }
          }
        }
      });

      return { updatedCertificate, revocationHistory };
    });

    return NextResponse.json({
      success: true,
      message: "Certificate revoked successfully",
      data: {
        certificate: {
          id: result_data.updatedCertificate.id,
          nftAddress: result_data.updatedCertificate.nftAddress,
          revoked: result_data.updatedCertificate.revoked,
          metadataUri: result_data.updatedCertificate.metadataUri,
        },
        revocation: {
          id: result_data.revocationHistory.id,
          reason: result_data.revocationHistory.reason,
          revokedAt: result_data.revocationHistory.revokedAt,
          revokedBy: result_data.revocationHistory.revokedBy.name,
          transactionSignature: result_data.revocationHistory.transactionSignature,
        }
      }
    });

  } catch (err) {
    console.error("Revocation error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to revoke certificate" },
      { status: 500 }
    );
  }
}