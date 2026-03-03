import { NextResponse } from "next/server";
import { prisma } from "./../../../../lib/prisma";
import { PublicKey } from "@solana/web3.js";
import { getMetaplex } from "./../../../../lib/metaplex";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ certs: string }> },
) {
  try {
    const { certs } = await params;

    const addresses = decodeURIComponent(certs).split(",");

    if (addresses.length === 0) {
      return NextResponse.json(
        { error: "No certificates specified" },
        { status: 400 },
      );
    }

    const certificates = await Promise.all(
      addresses.map(async (address) => {
        try {
          const dbCert = await prisma.certificate.findUnique({
            where: { nftAddress: address.trim() },
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

          const metaplex = getMetaplex();
          let onChainData = null;
          let jsonData = null;

          try {
            const mintAddress = new PublicKey(address.trim());
            const nft = await metaplex.nfts().findByMint({ mintAddress });

            onChainData = nft.json;
            const json_uri = nft.uri;

            if (json_uri) {
              try {
                const response = await fetch(json_uri);
                if (response.ok) {
                  jsonData = await response.json();
                } else {
                  console.error(
                    `Failed to fetch JSON from ${json_uri}: ${response.status}`,
                  );
                }
              } catch (fetchError) {
                console.error(
                  `Error fetching JSON from ${json_uri}:`,
                  fetchError,
                );
              }
            }
          } catch (error) {
            console.error(`Error fetching on-chain for ${address}:`, error);
          }

          // Check for revocation status
          const revoked = dbCert?.revoked || false;

          // Get revocation details
          let revocationMessage = null;
          let revokedAt = null;
          let revokedBy = null;

          if (revoked && dbCert?.revocationHistory?.[0]) {
            const revokeRecord = dbCert.revocationHistory[0];
            revocationMessage = revokeRecord.reason || "No reason provided";
            revokedAt = revokeRecord.revokedAt?.toISOString() || null;
            revokedBy = revokeRecord.revokedBy?.name || "Unknown";
          } else {
            // Check on-chain attributes for revocation info (as fallback)
            const attributes =
              onChainData?.attributes || jsonData?.attributes || [];

            const revokedAttr = attributes.find(
              (a: any) => a.trait_type === "Revoked",
            )?.value;

            if (revokedAttr === true || revokedAttr === "true") {
              revocationMessage =
                attributes.find(
                  (a: any) => a.trait_type === "Revocation Reason",
                )?.value || "Revoked by issuer";
              revokedAt =
                attributes.find((a: any) => a.trait_type === "Revoked Date")
                  ?.value || null;
              revokedBy =
                attributes.find((a: any) => a.trait_type === "Revoked By")
                  ?.value || "Issuer";
            }
          }

          return {
            nftAddress: address.trim(),
            title:
              jsonData?.name ||
              onChainData?.name ||
              dbCert?.title ||
              "Certificate",
            description:
              jsonData?.description ||
              onChainData?.description ||
              dbCert?.description ||
              "",
            image:
              jsonData?.image || onChainData?.image || dbCert?.ipfsUrl || "",
            issuer:
              dbCert?.issuedBy?.name ||
              onChainData?.attributes?.find(
                (a: any) => a.trait_type === "Issuer",
              )?.value ||
              "Unknown",
            issuedAt:
              onChainData?.attributes?.find(
                (a: any) => a.trait_type === "Issued Date",
              )?.value ||
              dbCert?.mintedAt?.toISOString() ||
              new Date().toISOString(),
            recipientName:
              onChainData?.attributes?.find(
                (a: any) => a.trait_type === "Recipient Name",
              )?.value || "Unknown",
            recipientWallet: dbCert?.destination_wallet || address.trim(),
            revoked: revoked,
            revocationMessage: revocationMessage,
            revokedAt: revokedAt,
            revokedBy: revokedBy,
            attributes: onChainData?.attributes || jsonData?.attributes || [],
          };
        } catch (error) {
          console.error(`Error processing ${address}:`, error);
          return null;
        }
      }),
    );

    const validCertificates = certificates.filter((c) => c !== null);

    if (validCertificates.length === 0) {
      return NextResponse.json(
        { error: "No valid certificates found" },
        { status: 404 },
      );
    }

    return NextResponse.json({
      success: true,
      certificates: validCertificates,
      count: validCertificates.length,
      summary: {
        total: validCertificates.length,
        active: validCertificates.filter((c) => !c.revoked).length,
        revoked: validCertificates.filter((c) => c.revoked).length,
      },
    });
  } catch (err) {
    console.error("Shared certificates error:", err);
    return NextResponse.json(
      { error: "Failed to load certificates" },
      { status: 500 },
    );
  }
}
