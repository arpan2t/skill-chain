import axios from "axios";

const PINATA_JWT = process.env.PINATA_JWT;
const PINATA_GATEWAY =
  process.env.NEXT_PUBLIC_PINATA_GATEWAY || "https://gateway.pinata.cloud";

export interface PinataMetadata {
  name: string;
  description: string;
  image: string;
  attributes: Array<{
    trait_type: string;
    value: string | number;
  }>;
  external_url?: string;
  properties?: any;
}

export async function uploadToPinata(
  metadata: PinataMetadata,
): Promise<string> {
  try {
    const response = await axios.post(
      "https://api.pinata.cloud/pinning/pinJSONToIPFS",
      metadata,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${PINATA_JWT}`,
        },
      },
    );

    return `ipfs://${response.data.IpfsHash}`;
  } catch (error) {
    console.error("Error uploading to Pinata:", error);
    throw new Error("Failed to upload to IPFS");
  }
}

export async function fetchFromPinata(
  ipfsUrl: string,
): Promise<PinataMetadata> {
  try {
    const url = ipfsUrl.replace("ipfs://", `${PINATA_GATEWAY}/ipfs/`);

    const response = await axios.get(url);
    return response.data;
  } catch (error) {
    console.error("Error fetching from Pinata:", error);
    throw new Error("Failed to fetch from IPFS");
  }
}
