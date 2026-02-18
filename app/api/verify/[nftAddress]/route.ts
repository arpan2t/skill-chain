import { NextResponse } from "next/server";
import { PublicKey } from "@solana/web3.js";
import { getMetaplex } from "./../../../../lib/metaplex";
import { ClockFading } from "lucide-react";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ nftAddress: string }> }
) {
  try {
    const { nftAddress } = await params;
    const mintAddress = new PublicKey(nftAddress);
    

    const metaplex = getMetaplex();
    
    const nft = await metaplex.nfts().findByMint({ mintAddress });
    
    if (!nft || !nft.json) {
      return NextResponse.json({
        success: false,
        error: "NFT not found on blockchain",
        verification: {
          exists: false,
          revoked: false  // Non-existent = not revoked
        }
      });
    }

    const attributes = nft.json.attributes || [];
    const revokedAttr = attributes.find(
      (attr: any) => attr.trait_type === "Revoked"
    );
    const isRevoked = revokedAttr?.value === "true";
    
    const revocationReason = attributes.find(
      (attr: any) => attr.trait_type === "Revocation Reason"
    )?.value;

    return NextResponse.json({
      success: true,
      verification: {
        exists: true,
        revoked: isRevoked,
        ...(isRevoked && revocationReason ? { revocationReason } : {})
      }
    });
    
  } catch (err: any) {
    console.error("Verification error:", err);
    
    if (err.message?.includes("Account does not exist") || 
        err.message?.includes("could not find")) {
      return NextResponse.json({
        success: false,
        error: "NFT does not exist on blockchain",
        verification: {
          exists: false,
          revoked: false
        }
      });
    }
    
    return NextResponse.json({
      success: false,
      error: "Verification failed: " + (err.message || "Unknown error"),
      verification: {
        exists: false,
        revoked: false
      }
    }, { status: 500 });
  }
}