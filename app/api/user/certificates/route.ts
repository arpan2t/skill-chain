import { NextResponse } from "next/server";
import { PublicKey } from "@solana/web3.js";
import { getAdminKeypair, getMetaplex } from "./../../../../lib/metaplex";
import { prisma } from "./../../../../lib/prisma";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const walletAddress = body.wallet;
    
    if (!walletAddress) {
      return NextResponse.json(
        { error: "Wallet address required" },
        { status: 400 }
      );
    }

    try {
      new PublicKey(walletAddress);
    } catch {
      return NextResponse.json(
        { error: "Invalid wallet address" },
        { status: 400 }
      );
    }

    const dbCertificates = await prisma.certificate.findMany({
      where: { 
        destination_wallet: walletAddress,
        revoked: false 
      },
      include: {
        issuedBy: {
          select: { name: true, email: true }
        }
      },
      orderBy: { mintedAt: "desc" }
    });

    const metaplex = getMetaplex();
    const owner = new PublicKey(walletAddress);
    const adminKeypair = getAdminKeypair();
    
    const nfts = await metaplex.nfts().findAllByOwner({ owner });

    const skillChainNfts = nfts.filter(nft => 
      nft.symbol === "SKILL" || 
      nft.creators?.some(c => c.address.equals(adminKeypair.publicKey))
    );

    const certificates = await Promise.all(
      skillChainNfts.map(async (nft : any) => {
        try {
          const fullNft = await metaplex.nfts().load({ metadata: nft as any });
          let metadata = null;
          let dbCertificate = null;
          let flag = 0;
          
          if (fullNft.uri) {
            try {
              const response = await fetch(fullNft.uri);
              if (response.ok) {
                metadata = await response.json();
              } else {
                dbCertificate = await prisma.certificate.findUnique({
                  where: { 
                    nftAddress: nft.mintAddress.toBase58() 
                  },
                  include: {
                    issuedBy: {
                      select: { name: true, email: true }
                    }
                  }
                });
                flag = 1;
              }
            } catch (error) {
              console.error(`Error fetching metadata from ${fullNft.uri}:`, error);
              dbCertificate = await prisma.certificate.findUnique({
                where: { 
                  nftAddress: nft.mintAddress.toBase58()
                },
                include: {
                  issuedBy: {
                    select: { name: true, email: true }
                  }
                }
              });
              flag = 1;
            }
          }

          // Determine which source to use for each field
          let title, description, image, attributes, issuer, issuedAt , revoked;
          
          if (flag === 1 && dbCertificate) {
            // Use database data
            title = dbCertificate.title || fullNft.name || "N/A";
            description = dbCertificate.description || "";
            image = dbCertificate.ipfsUrl || "";
            attributes = []; // Could construct from db data if needed
            issuer = dbCertificate.issuedBy?.name || "N/A";
            issuedAt = dbCertificate.mintedAt?.toISOString() || null;
            revoked = dbCertificate.revoked || false;
          } else {
            // Use on-chain metadata
            title = metadata?.name || fullNft.name || "N/A";
            description = metadata?.description || fullNft.json?.description || "";
            image = metadata?.image || fullNft.json?.image || "";
            attributes = metadata?.attributes || fullNft.json?.attributes || [];
            
            // Try to get issuer and date from attributes
            issuer = attributes.find(
              (a: any) => a.trait_type === "Issuer"
            )?.value || "N/A";
            
            issuedAt = attributes.find(
              (a: any) => a.trait_type === "Issued Date"
            )?.value || null;

            const revokedAttr = attributes.find(
            (a: any) => a.trait_type === "Revoked"
          )?.value;
          
           revoked = revokedAttr === true || revokedAttr === "true" ? true : false;
          }

          return {
            nftAddress: nft.mintAddress.toBase58(),
            title: title || nft.name,
            description: description,
            image: image,
            attributes: attributes,
            issuer: issuer,
            issuedAt: issuedAt,
            revoked: revoked,
            metadataUri: fullNft.uri,
            source: flag === 1 ? "database_fallback" : "onchain"
          };
        } catch (error) {
          console.error(`Error processing NFT ${nft.mintAddress.toBase58()}:`, error);
          
          try {
            const fallbackDb = await prisma.certificate.findUnique({
              where: { nftAddress: nft.mintAddress.toBase58() },
              include: { issuedBy: { select: { name: true, email: true } } }
            });
            
            if (fallbackDb) {
              return {
                nftAddress: nft.mintAddress.toBase58(),
                title: fallbackDb.title||nft.name || "N/A",
                description: fallbackDb.description || "",
                image: fallbackDb.ipfsUrl || "",
                attributes: [],
                issuer: fallbackDb.issuedBy?.name || "N/A",
                issuedAt: fallbackDb.mintedAt?.toISOString() || null,
                revoked: fallbackDb.revoked || false,
                metadataUri: fallbackDb.metadataUri || "",
                source: "database_emergency"
              };
            }
          } catch (dbError) {
            console.error("Database fallback also failed:", dbError);
          }
          
          // Ultimate fallback
          return {
            nftAddress: nft.mintAddress.toBase58(),
            title: nft.name || "Unknown Certificate",
            description: "",
            image: "",
            attributes: [],
            issuer: "Unknown",
            issuedAt: null,
            revoked: false,
            metadataUri: nft.uri || "",
            source: "minimal"
          };
        }
      })
    );

    const combined = [...dbCertificates, ...certificates];
    
    // Remove duplicates, preferring database entries
    const unique = Array.from(
      new Map(
        combined.map(item => {
          // Check if this item has a database version we should prefer
          const dbVersion = dbCertificates.find(db => db.nftAddress === item.nftAddress);
          return [item.nftAddress, dbVersion ? {
            nftAddress: dbVersion.nftAddress,
            title: dbVersion.title,
            description: dbVersion.description || "",
            image: dbVersion.ipfsUrl || "",
            attributes: [],
            issuer: dbVersion.issuedBy?.name || "N/A",
            issuedAt: dbVersion.mintedAt?.toISOString() || null,
            revoked: dbVersion.revoked || false,
            metadataUri: dbVersion.metadataUri || "",
            source: "database_final"
          } : item];
        })
      ).values()
    );

    return NextResponse.json({
      success: true,
      data: unique,
      summary: {
        total: unique.length,
        fromDatabase: dbCertificates.length,
        fromOnChain: certificates.filter(c => c.source === "onchain").length,
        fromDatabaseFallback: certificates.filter(c => c.source === "database_fallback").length,
        fromEmergencyFallback: certificates.filter(c => c.source === "database_emergency").length,
        minimal: certificates.filter(c => c.source === "minimal").length
      }
    });

  } catch (err) {
    console.error("Error fetching user certificates:", err);
    return NextResponse.json(
      { error: "Failed to fetch certificates" },
      { status: 500 }
    );
  }
}