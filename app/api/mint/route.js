import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { connection, getAdminKeypair, getMetaplex } from "@/lib/metaplex";
import { PublicKey } from "@solana/web3.js";

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
    console.log("STEP 1: API HIT");

    // Check authentication
    const session = await getServerSession(authOptions);
    console.log("STEP 2: Session:", session?.user?.email);

    if (!session || !session.user) {
      console.log("STEP 2 FAILED: Unauthorized");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    console.log("STEP 3: Parsing body...");
    const body = await req.json();
    console.log("STEP 3 DONE: BODY =", body);

    const { walletAddress, title, ipfsUrl } = body;

    // Validate inputs
    if (!walletAddress || !title || !ipfsUrl) {
      console.log("STEP 4 FAILED: Missing fields");
      return NextResponse.json(
        { error: "Missing required fields: walletAddress, title, or ipfsUrl" },
        { status: 400 },
      );
    }

    console.log("STEP 4: Wallet validation...");
    let destinationPubkey;
    try {
      destinationPubkey = new PublicKey(walletAddress);
      console.log("STEP 4 DONE: Wallet OK:", destinationPubkey.toBase58());
    } catch {
      console.log("STEP 4 FAILED: Invalid wallet");
      return NextResponse.json(
        { error: "Invalid Solana wallet address" },
        { status: 400 },
      );
    }

    // Create NFT metadata and upload to Pinata
    console.log("STEP 5: Uploading metadata to Pinata...");
    const metadata = {
      name: title,
      description: `SkillChain Credential: ${title}`,
      image: ipfsUrl,
      symbol: "SKILL",
      attributes: [
        { trait_type: "Type", value: "Credential" },
        { trait_type: "Issuer", value: session.user.name || "SkillChain" },
        { trait_type: "Issued Date", value: new Date().toISOString() },
      ],
      properties: {
        files: [{ uri: ipfsUrl, type: "image/png" }],
        category: "image",
      },
    };

    const uri = await uploadMetadataToPinata(metadata);
    console.log("STEP 5 DONE: Pinata URI =", uri);

    // Get metaplex and admin keypair
    console.log("STEP 6: Loading Metaplex...");
    const metaplex = getMetaplex();
    console.log("STEP 6 DONE");

    console.log("STEP 7: Loading Admin Keypair...");
    const adminKeypair = getAdminKeypair();
    console.log("STEP 7 DONE: Admin =", adminKeypair.publicKey.toBase58());

    // Mint the NFT
    console.log("STEP 8: Minting NFT...");
    const { nft } = await metaplex.nfts().create({
      uri,
      name: title,
      symbol: "SKILL",
      sellerFeeBasisPoints: 0,
      tokenOwner: destinationPubkey,
      isMutable: false,
      creators: [
        {
          address: adminKeypair.publicKey,
          share: 100,
          verified: true,
        },
      ],
    });

    console.log("STEP 8 DONE: NFT =", nft.address.toBase58());

    // Save to database
    console.log("STEP 9: Saving DB...");
    const userId = parseInt(session.user.id);
    const certificate = await prisma.certificate.create({
      data: {
        destination_wallet: walletAddress,
        nftAddress: nft.address.toBase58(),
        ipfsUrl: ipfsUrl,
        issuedById: userId,
      },
    });

    console.log("STEP 9 DONE: CERT =", certificate.id);

    return NextResponse.json({
      success: true,
      message: "Credential minted successfully",
      certificate: {
        id: certificate.id,
        nftAddress: nft.address.toBase58(),
        mintTx: nft.mintAddress?.toBase58(),
        metadataUri: uri,
      },
    });
  } catch (err) {
    console.error("FULL ERROR OCCURRED:");
    console.error(err);
    console.error("ERROR STRING:", String(err));

    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
