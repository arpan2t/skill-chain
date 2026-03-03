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
        { status: 400 },
      );
    }

    try {
      new PublicKey(walletAddress);
    } catch {
      return NextResponse.json(
        { error: "Invalid wallet address" },
        { status: 400 },
      );
    }

    const dbCertificates = await prisma.certificate.findMany({
      where: {
        destination_wallet: walletAddress,
      },
      include: {
        issuedBy: {
          select: { name: true, email: true },
        },
        revocationHistory: {
          take: 1,
          orderBy: { revokedAt: "desc" },
          include: {
            revokedBy: {
              select: { name: true, email: true },
            },
          },
        },
      },
      orderBy: { mintedAt: "desc" },
    });

    const metaplex = getMetaplex();
    const owner = new PublicKey(walletAddress);
    const adminKeypair = getAdminKeypair();

    const nfts = await metaplex.nfts().findAllByOwner({ owner });

    const skillChainNfts = nfts.filter(
      (nft) =>
        nft.symbol === "SKILL" ||
        nft.creators?.some((c) => c.address.equals(adminKeypair.publicKey)),
    );

    const certificates = await Promise.all(
      skillChainNfts.map(async (nft: any) => {
        try {
          const fullNft = await metaplex.nfts().load({ metadata: nft as any });
          let metadata = null;
          let dbCertificate = null;
          let flag = 0;

          // Try to get from database first for revocation info
          dbCertificate = await prisma.certificate.findUnique({
            where: {
              nftAddress: nft.mintAddress.toBase58(),
            },
            include: {
              issuedBy: {
                select: { name: true, email: true },
              },
              revocationHistory: {
                take: 1,
                orderBy: { revokedAt: "desc" },
                include: {
                  revokedBy: {
                    select: { name: true, email: true },
                  },
                },
              },
            },
          });

          if (fullNft.uri && !dbCertificate) {
            try {
              const response = await fetch(fullNft.uri);
              if (response.ok) {
                metadata = await response.json();
              }
            } catch (error) {
              console.error(
                `Error fetching metadata from ${fullNft.uri}:`,
                error,
              );
            }
          }

          let title, description, image, attributes, issuer, issuedAt, revoked;
          let revocationMessage = null;
          let revokedBy = null;
          let revokedAt = null;

          if (dbCertificate) {
            title = dbCertificate.title || fullNft.name || "N/A";
            description = dbCertificate.description || "";
            image = dbCertificate.ipfsUrl || "";
            attributes = [];
            issuer = dbCertificate.issuedBy?.name || "N/A";
            issuedAt = dbCertificate.mintedAt?.toISOString() || null;
            revoked = dbCertificate.revoked || false;

            if (revoked && dbCertificate.revocationHistory?.[0]) {
              const revokeRecord = dbCertificate.revocationHistory[0];
              revocationMessage = revokeRecord.reason || "No reason provided";
              revokedBy = revokeRecord.revokedBy?.name || "Unknown";
              revokedAt = revokeRecord.revokedAt?.toISOString() || null;
            }
          } else {
            title = metadata?.name || fullNft.name || "N/A";
            description =
              metadata?.description || fullNft.json?.description || "";
            image = metadata?.image || fullNft.json?.image || "";
            attributes = metadata?.attributes || fullNft.json?.attributes || [];

            issuer =
              attributes.find((a: any) => a.trait_type === "Issuer")?.value ||
              "N/A";

            issuedAt =
              attributes.find((a: any) => a.trait_type === "Issued Date")
                ?.value || null;

            const revokedAttr = attributes.find(
              (a: any) => a.trait_type === "Revoked",
            )?.value;

            revoked =
              revokedAttr === true || revokedAttr === "true" ? true : false;

            if (revoked) {
              revocationMessage =
                attributes.find(
                  (a: any) => a.trait_type === "Revocation Reason",
                )?.value || "Revoked by issuer";
              revokedBy =
                attributes.find((a: any) => a.trait_type === "Revoked By")
                  ?.value || "Issuer";
              revokedAt =
                attributes.find((a: any) => a.trait_type === "Revoked Date")
                  ?.value || null;
            }
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
            revocationMessage: revocationMessage,
            revokedBy: revokedBy,
            revokedAt: revokedAt,
            metadataUri: fullNft.uri,
            source: dbCertificate ? "database" : "blockchain",
          };
        } catch (error) {
          console.error(
            `Error processing NFT ${nft.mintAddress.toBase58()}:`,
            error,
          );

          try {
            const fallbackDb = await prisma.certificate.findUnique({
              where: { nftAddress: nft.mintAddress.toBase58() },
              include: {
                issuedBy: { select: { name: true, email: true } },
                revocationHistory: {
                  take: 1,
                  orderBy: { revokedAt: "desc" },
                  include: {
                    revokedBy: {
                      select: { name: true, email: true },
                    },
                  },
                },
              },
            });

            if (fallbackDb) {
              let revocationMessage = null;
              let revokedBy = null;
              let revokedAt = null;

              if (fallbackDb.revoked && fallbackDb.revocationHistory?.[0]) {
                const revokeRecord = fallbackDb.revocationHistory[0];
                revocationMessage = revokeRecord.reason || "No reason provided";
                revokedBy = revokeRecord.revokedBy?.name || "Unknown";
                revokedAt = revokeRecord.revokedAt?.toISOString() || null;
              }

              return {
                nftAddress: nft.mintAddress.toBase58(),
                title: fallbackDb.title || nft.name || "N/A",
                description: fallbackDb.description || "",
                image: fallbackDb.ipfsUrl || "",
                attributes: [],
                issuer: fallbackDb.issuedBy?.name || "N/A",
                issuedAt: fallbackDb.mintedAt?.toISOString() || null,
                revoked: fallbackDb.revoked || false,
                revocationMessage: revocationMessage,
                revokedBy: revokedBy,
                revokedAt: revokedAt,
                metadataUri: fallbackDb.metadataUri || "",
                source: "database_fallback",
              };
            }
          } catch (dbError) {
            console.error("Database fallback also failed:", dbError);
          }

          return {
            nftAddress: nft.mintAddress.toBase58(),
            title: nft.name || "Unknown Certificate",
            description: "",
            image: "",
            attributes: [],
            issuer: "Unknown",
            issuedAt: null,
            revoked: false,
            revocationMessage: null,
            revokedBy: null,
            revokedAt: null,
            metadataUri: nft.uri || "",
            source: "minimal",
          };
        }
      }),
    );

    const combined = [...dbCertificates, ...certificates];

    const unique = Array.from(
      new Map(
        combined.map((item) => {
          const dbVersion = dbCertificates.find(
            (db) => db.nftAddress === item.nftAddress,
          );

          if (dbVersion) {
            let revocationMessage = null;
            let revokedBy = null;
            let revokedAt = null;

            if (dbVersion.revoked && dbVersion.revocationHistory?.[0]) {
              const revokeRecord = dbVersion.revocationHistory[0];
              revocationMessage = revokeRecord.reason || "No reason provided";
              revokedBy = revokeRecord.revokedBy?.name || "Unknown";
              revokedAt = revokeRecord.revokedAt?.toISOString() || null;
            }

            return [
              item.nftAddress,
              {
                nftAddress: dbVersion.nftAddress,
                title: dbVersion.title,
                description: dbVersion.description || "",
                image: dbVersion.ipfsUrl || "",
                attributes: [],
                issuer: dbVersion.issuedBy?.name || "N/A",
                issuedAt: dbVersion.mintedAt?.toISOString() || null,
                revoked: dbVersion.revoked || false,
                revocationMessage: revocationMessage,
                revokedBy: revokedBy,
                revokedAt: revokedAt,
                metadataUri: dbVersion.metadataUri || "",
                source: "database_final",
              },
            ];
          }
          return [item.nftAddress, item];
        }),
      ).values(),
    );

    return NextResponse.json({
      success: true,
      data: unique,
      summary: {
        total: unique.length,
        active: unique.filter((c: any) => !c.revoked).length,
        revoked: unique.filter((c: any) => c.revoked).length,
      },
    });
  } catch (err) {
    console.error("Error fetching user certificates:", err);
    return NextResponse.json(
      { error: "Failed to fetch certificates" },
      { status: 500 },
    );
  }
}
