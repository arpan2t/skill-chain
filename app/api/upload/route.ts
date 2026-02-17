import { NextResponse } from "next/server";

export const POST = async (req) => {
  try {
    const pinataJwt = process.env.PINATA_JWT;

    if (!pinataJwt) {
      return NextResponse.json(
        { error: "PINATA_JWT environment variable is not set" },
        { status: 500 },
      );
    }

    const data = await req.formData();
    const imageFile = data.get("file");

    if (!imageFile) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    // Create form data for Pinata
    const pinataFormData = new FormData();
    pinataFormData.append("file", imageFile);

    // Upload to Pinata
    const pinataResponse = await fetch(
      "https://api.pinata.cloud/pinning/pinFileToIPFS",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${pinataJwt}`,
        },
        body: pinataFormData,
      },
    );

    if (!pinataResponse.ok) {
      const errorText = await pinataResponse.text();
      console.error("Pinata error response:", errorText);
      try {
        const errorData = JSON.parse(errorText);
        throw new Error(
          errorData.error?.message || "Failed to upload to Pinata",
        );
      } catch (parseError) {
        if (parseError.message?.includes("Failed to upload")) {
          throw parseError;
        }
        throw new Error(
          `Pinata upload failed with status ${pinataResponse.status}`,
        );
      }
    }

    // Read response as text first to safely parse
    const pinataText = await pinataResponse.text();
    let pinataResult;
    try {
      pinataResult = JSON.parse(pinataText);
    } catch (parseError) {
      console.error("Failed to parse Pinata response:", pinataText);
      throw new Error("Invalid response from Pinata");
    }

    const ipfsUrl = `https://gateway.pinata.cloud/ipfs/${pinataResult.IpfsHash}`;

    return NextResponse.json({ ipfsUrl }, { status: 200 });
  } catch (err) {
    console.error("Upload error:", err);
    return NextResponse.json(
      { error: err.message || "Upload failed" },
      { status: 500 },
    );
  }
};
