import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "./../../../lib/auth";
import { prisma } from "./../../../lib/prisma";
import {
  connection,
  getAdminKeypair,
  getMetaplex,
} from "./../../../lib/metaplex";
import { PublicKey } from "@solana/web3.js";
import { TokenStandard } from "@metaplex-foundation/mpl-token-metadata";

// Helper function to upload metadata JSON to Pinata
async function uploadMetadataToPinata(metadata) {
  const pinataJwt = process.env.PINATA_JWT;
  if (!pinataJwt) {
    throw new Error("PINATA_JWT environment variable is not set");
  }

  const response = await fetch(
    "https://api.pinata.cloud/pinning/pinJSONToIPFS",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${pinataJwt}`,
      },
      body: JSON.stringify({
        pinataContent: metadata,
        pinataMetadata: {
          name: `${metadata.name}-metadata.json`,
        },
      }),
    },
  );

  if (!response.ok) {
    const errorText = await response.text();
    console.error("Pinata error response:", errorText);
    try {
      const errorData = JSON.parse(errorText);
      throw new Error(
        errorData.error?.message || "Failed to upload metadata to Pinata",
      );
    } catch (parseError) {
      if (parseError.message?.includes("Failed to upload metadata")) {
        throw parseError;
      }
      throw new Error(
        `Failed to upload metadata to Pinata: ${response.status}`,
      );
    }
  }

  // Read response as text first to safely parse
  let result = await response.json();

  if (!result.IpfsHash) {
    throw new Error("Pinata did not return IpfsHash");
  }
  return `https://gateway.pinata.cloud/ipfs/${result.IpfsHash}`;
}

// process.exit();
export async function POST(req) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();

    const { walletAddress, title, description, ipfsUrl } = body;

    // Validate inputs
    if (!walletAddress || !title || !ipfsUrl) {
      return NextResponse.json(
        { error: "Missing required fields: walletAddress, title, or ipfsUrl" },
        { status: 400 },
      );
    }

    let destinationPubkey;
    try {
      destinationPubkey = new PublicKey(walletAddress);
    } catch {
      return NextResponse.json(
        { error: "Invalid Solana wallet address" },
        { status: 400 },
      );
    }

    // Create NFT metadata and upload to Pinata
    const metadata = {
      name: title,
      description: `${description || ""}`,
      image: ipfsUrl,
      symbol: "SKILL",
      attributes: [
        { trait_type: "Type", value: "Credential" },
        { trait_type: "Issuer", value: session.user.name || "SkillChain" },
        { trait_type: "Issued Date", value: new Date().toISOString() },
        { trait_type: "Revoked", value: "false" },
        { trait_type: "Revocation Reason", value: "" },
        { trait_type: "Revocation Date", value: "" },
        { trait_type: "Revoked By", value: "" },
      ],
      properties: {
        files: [{ uri: ipfsUrl, type: "image/png" }],
        category: "image",
        revocationHistory: [],
      },
    };

    const uri = await uploadMetadataToPinata(metadata);

    // Get metaplex and admin keypair
    const metaplex = getMetaplex();

    const adminKeypair = getAdminKeypair();

    // Mint the NFT
    const { nft } = await metaplex.nfts().create({
      uri,
      name: title,
      description: `${description || ""}`,
      symbol: "SKILL",
      sellerFeeBasisPoints: 0,
      tokenOwner: destinationPubkey,

      tokenStandard: TokenStandard.ProgrammableNonFungible,
      ruleSet: null, // required for non-transferable pNFT

      updateAuthority: adminKeypair,
      mintAuthority: adminKeypair,
      freezeAuthority: adminKeypair,

      isMutable: false,
      creators: [
        {
          address: adminKeypair.publicKey,
          share: 100,
          verified: true,
        },
      ],
    });

    // Save to database
    const userId = parseInt(session.user.id);
    const certificate = await prisma.certificate.create({
      data: {
        destination_wallet: walletAddress,
        nftAddress: nft.address.toBase58(),
        ipfsUrl: ipfsUrl,
        issuedById: userId,
        metadataUri: uri,
        title: title,
        description: description,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Credential minted successfully",
      certificate: {
        id: certificate.id,
        nftAddress: nft.address.toBase58(),
        mintTx: nft.mintAddress?.toBase58(),
        metadataUri: uri,
        title: title,
      },
    });
  } catch (err) {
    console.error("FULL ERROR OCCURRED:");
    console.error(err);
    console.error("ERROR STRING:", String(err));

    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
