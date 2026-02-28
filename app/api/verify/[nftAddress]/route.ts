import { NextResponse } from "next/server";
import { PublicKey } from "@solana/web3.js";
import { getMetaplex } from "./../../../../lib/metaplex";
import { prisma } from "../../../../lib/prisma";

// Interface matching frontend expectations
interface CertificateData {
  name: string;
  recipient: string;
  issuer: string;
  issuedDate: string;
  mintAddress: string;
  description?: string;
  imageUrl?: string;
}

interface VerificationResponse {
  success: boolean;
  verification: {
    exists: boolean;
    revoked: boolean;
    revocationReason?: string;
    certificate?: CertificateData;
  };
  error?: string;
}

export async function GET(
  req: Request,
  { params }: { params: Promise<{ nftAddress: string }> },
) {
  try {
    const { nftAddress } = await params;

    let mintAddress: PublicKey;

    try {
      if (!nftAddress || typeof nftAddress !== "string") {
        throw new Error("NFT address is missing or invalid type");
      }
      mintAddress = new PublicKey(nftAddress);
    } catch (error) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid NFT address provided",
          verification: {
            exists: false,
            revoked: false,
          },
        },
        { status: 400 },
      );
    }

    const metaplex = getMetaplex();

    try {
      const nft = await metaplex.nfts().findByMint({ mintAddress });

      if (!nft || !nft.json) {
        return NextResponse.json(
          {
            success: false,
            error: "NFT not found on blockchain",
            verification: {
              exists: false,
              revoked: false,
            },
          },
          { status: 404 },
        );
      }

      // Check if revoked from attributes
      const attributes = nft.json.attributes || [];
      const revokedAttr = attributes.find(
        (attr: any) => attr.trait_type === "Revoked",
      );
      const isRevoked = revokedAttr?.value === "true";

      const revocationReason = attributes.find(
        (attr: any) => attr.trait_type === "Revocation Reason",
      )?.value;

      let certificateDetails: any = {};

      if (nft.json.uri) {
        try {
          const response = await fetch(nft.json.uri);
          if (response.ok) {
            certificateDetails = await response.json();
          }
        } catch (fetchError) {
          console.error(
            `Error fetching JSON from ${nft.json.uri}:`,
            fetchError,
          );
        }
      }

      // If IPFS fetch fails, try to get from database
      if (!certificateDetails || Object.keys(certificateDetails).length === 0) {
        const dbRecord = await prisma.certificate.findUnique({
          where: { nftAddress: nftAddress.trim() },
          include: {
            issuedBy: {
              select: { name: true, email: true },
            },
          },
        });

        if (dbRecord) {
          certificateDetails = {
            name: dbRecord.title,
            description: dbRecord.description,
            recipientWallet: dbRecord.destination_wallet,
            issuer: dbRecord.issuedBy?.name || "Unknown",
            issuedDate: dbRecord.mintedAt.toISOString(),
            image: dbRecord.ipfsUrl,
          };
        }
      }

      const certificateData: CertificateData = {
        name: nft.json.name || certificateDetails.name || "Certificate",
        recipient: certificateDetails.recipientWallet,
        issuer:
          certificateDetails.issuer ||
          attributes.find((a: any) => a.trait_type === "Issuer")?.value ||
          "Unknown Issuer",
        issuedDate:
          certificateDetails.issuedDate ||
          attributes.find((a: any) => a.trait_type === "Issue Date")?.value ||
          new Date().toISOString(),
        mintAddress: nftAddress,
        description:
          nft.json.description || certificateDetails.description || "",
        imageUrl: nft.json.image || certificateDetails.image || "",
      };

      // Construct response matching frontend interface
      const response: VerificationResponse = {
        success: true,
        verification: {
          exists: true,
          revoked: isRevoked,
          certificate: certificateData,
          ...(isRevoked && revocationReason ? { revocationReason } : {}),
        },
      };

      return NextResponse.json(response);
    } catch (nftError: any) {
      if (
        nftError.message?.includes("Account does not exist") ||
        nftError.message?.includes("could not find")
      ) {
        return NextResponse.json(
          {
            success: false,
            error: "NFT does not exist on blockchain",
            verification: {
              exists: false,
              revoked: false,
            },
          },
          { status: 404 },
        );
      }
      throw nftError;
    }
  } catch (err: any) {
    console.error("Verification error:", err);

    return NextResponse.json(
      {
        success: false,
        error: "Verification failed: " + (err.message || "Unknown error"),
        verification: {
          exists: false,
          revoked: false,
        },
      },
      { status: 500 },
    );
  }
}
