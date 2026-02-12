import { Connection, Keypair, PublicKey, clusterApiUrl } from "@solana/web3.js";
import { Metaplex, keypairIdentity, bundlrStorage } from "@metaplex-foundation/js";

// Use your devnet or mainnet cluster
export const connection = new Connection(clusterApiUrl("devnet"));

// Load your admin wallet (mint authority)
const secretKey = Uint8Array.from(
  JSON.parse(process.env.ADMIN_SECRET_KEY)
);
export const adminKeypair = Keypair.fromSecretKey(secretKey);

export const metaplex = Metaplex.make(connection)
  .use(keypairIdentity(adminKeypair))
  .use(bundlrStorage());
