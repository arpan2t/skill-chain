import { NextResponse } from "next/server";
import { PublicKey } from "@solana/web3.js";
import { getMetaplex } from "./../../../../lib/metaplex";
import { prisma } from "../../../../lib/prisma";

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
    revocationSource?: "blockchain" | "database" | "both";
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

    let exists = false;
    let isRevoked = false;
    let revocationReason = null;
    let revocationSource = null;
    let certificateData: CertificateData | null = null;

    let dbRecord = null;
    try {
      dbRecord = await prisma.certificate.findUnique({
        where: { nftAddress: nftAddress.trim() },
        include: {
          issuedBy: {
            select: { name: true, email: true, user_wallet: true },
          },
          revocationHistory: {
            include: {
              revokedBy: {
                select: { name: true, email: true },
              },
            },
          },
        },
      });

      if (dbRecord) {
        exists = true;

        if (dbRecord.revoked) {
          isRevoked = true;
          revocationSource = "database";

          if (
            dbRecord.revocationHistory &&
            dbRecord.revocationHistory.length > 0
          ) {
            revocationReason = dbRecord.revocationHistory[0].reason;
          }
        }
      }
    } catch (dbError) {
      console.error("Database error:", dbError);
    }

    let nft = null;
    let blockchainExists = false;

    try {
      nft = await metaplex.nfts().findByMint({ mintAddress });

      if (nft && nft.json) {
        blockchainExists = true;

        exists = true;

        const attributes = nft.json.attributes || [];
        const revokedAttr = attributes.find(
          (attr: any) => attr.trait_type === "Revoked",
        );
        const blockchainRevoked = revokedAttr?.value === "true";

        const blockchainReason = attributes.find(
          (attr: any) => attr.trait_type === "Revocation Reason",
        )?.value;

        if (blockchainRevoked) {
          isRevoked = true;
          revocationSource =
            revocationSource === "database" ? "both" : "blockchain";
          revocationReason = blockchainReason || revocationReason;
        }
      }
    } catch (nftError: any) {
      console.log("Blockchain check failed:", nftError.message);
      if (!dbRecord) {
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
    }

    if (exists) {
      const name = nft?.json?.name || dbRecord?.title || "Certificate";
      const description = nft?.json?.description || dbRecord?.description || "";
      const imageUrl = nft?.json?.image || dbRecord?.ipfsUrl || "";

      let recipient = "Unknown";
      if (dbRecord?.destination_wallet) {
        recipient = dbRecord.destination_wallet;
      } else if (nft?.json?.attributes) {
        const recipientAttr = nft.json.attributes.find(
          (a: any) =>
            a.trait_type === "Recipient" || a.trait_type === "Student",
        );
        if (recipientAttr) recipient = recipientAttr.value;
      }

      let issuer = "Unknown";
      if (dbRecord?.issuedBy?.name) {
        issuer = dbRecord.issuedBy.name;
      } else if (nft?.json?.attributes) {
        const issuerAttr = nft.json.attributes.find(
          (a: any) =>
            a.trait_type === "Issuer" || a.trait_type === "Institution",
        );
        if (issuerAttr) issuer = issuerAttr.value;
      }

      let issuedDate = new Date().toISOString();
      if (dbRecord?.mintedAt) {
        issuedDate = dbRecord.mintedAt.toISOString();
      } else if (nft?.json?.attributes) {
        const dateAttr = nft.json.attributes.find(
          (a: any) => a.trait_type === "Issue Date" || a.trait_type === "Date",
        );
        if (dateAttr) issuedDate = dateAttr.value;
      }

      certificateData = {
        name,
        recipient,
        issuer,
        issuedDate,
        mintAddress: nftAddress,
        description,
        imageUrl,
      };
    }

    const response: VerificationResponse = {
      success: exists,
      verification: {
        exists,
        revoked: isRevoked,
        ...(revocationReason ? { revocationReason } : {}),
        ...(revocationSource ? { revocationSource } : {}),
        ...(certificateData ? { certificate: certificateData } : {}),
      },
    };

    if (!exists) {
      return NextResponse.json(
        {
          success: false,
          error: "Certificate not found",
          verification: {
            exists: false,
            revoked: false,
          },
        },
        { status: 404 },
      );
    }

    return NextResponse.json(response);
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
