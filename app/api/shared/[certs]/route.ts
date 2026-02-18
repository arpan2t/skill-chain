import { NextResponse } from "next/server";
import { prisma } from "./../../../../lib/prisma";
import { PublicKey } from "@solana/web3.js";
import { getMetaplex } from "./../../../../lib/metaplex";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ certs: string }> }
) {
  try {
    const { certs } = await params;
    
    const addresses = decodeURIComponent(certs).split(',');
    
    if (addresses.length === 0) {
      return NextResponse.json(
        { error: "No certificates specified" },
        { status: 400 }
      );
    }

    const certificates = await Promise.all(
      addresses.map(async (address) => {
        try {
          const dbCert = await prisma.certificate.findUnique({
            where: { nftAddress: address.trim() },
            include: {
              issuedBy: {
                select: { name: true, email: true }
              }           }
          });

          const metaplex = getMetaplex();
          let onChainData = null;
          
          try {
            const mintAddress = new PublicKey(address.trim());
            const nft = await metaplex.nfts().findByMint({ mintAddress });
            onChainData = nft.json;
          } catch (error) {
            console.error(`Error fetching on-chain for ${address}:`, error);
          }

          return {
            nftAddress: address.trim(),
            title: onChainData?.name || dbCert?.title || "Certificate",
            description: onChainData?.description || dbCert?.description || "",
            image: onChainData?.image || dbCert?.ipfsUrl || "",
            issuer: dbCert?.issuedBy?.name || onChainData?.attributes?.find(
              (a: any) => a.trait_type === "Issuer"
            )?.value || "Unknown",
            issuedAt: onChainData?.attributes?.find(
              (a: any) => a.trait_type === "Issued Date"
            )?.value || dbCert?.mintedAt?.toISOString() || new Date().toISOString(),
            recipientName: dbCert?.student?.name || onChainData?.attributes?.find(
              (a: any) => a.trait_type === "Recipient Name"
            )?.value || "Unknown",
            recipientWallet: dbCert?.destination_wallet || address.trim(),
            revoked: dbCert?.revoked || false,
            attributes: onChainData?.attributes || []
          };
        } catch (error) {
          console.error(`Error processing ${address}:`, error);
          return null;
        }
      })
    );

    const validCertificates = certificates.filter(c => c !== null);

    if (validCertificates.length === 0) {
      return NextResponse.json(
        { error: "No valid certificates found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      certificates: validCertificates,
      count: validCertificates.length
    });

  } catch (err) {
    console.error("Shared certificates error:", err);
    return NextResponse.json(
      { error: "Failed to load certificates" },
      { status: 500 }
    );
  }
}