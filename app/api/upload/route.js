import { NFTStorage, File } from "nft.storage";

export const POST = async (req) => {
  try {
    const nftStorageKey = process.env.NFT_STORAGE_KEY;
    const client = new NFTStorage({ token: nftStorageKey });

    const data = await req.formData();
    const imageFile = data.get("file");

    if (!imageFile) {
      return new Response(JSON.stringify({ error: "No file provided" }), {
        status: 400,
      });
    }

    // Convert uploaded file to Blob
    const fileBlob = new File([await imageFile.arrayBuffer()], imageFile.name, {
      type: imageFile.type,
    });

    // Upload to NFT.Storage
    const cid = await client.storeBlob(fileBlob);

    // Return IPFS URL
    return new Response(
      JSON.stringify({ ipfsUrl: `https://ipfs.io/ipfs/${cid}` }),
      { status: 200 },
    );
  } catch (err) {
    console.error(err);
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
    });
  }
};
