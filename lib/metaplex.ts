import { Connection, Keypair } from "@solana/web3.js";
import { Metaplex, keypairIdentity } from "@metaplex-foundation/js";
import bs58 from "bs58";

export const connection = new Connection(process.env.SOLANA_RPC! , "confirmed");

let _adminKeypair: Keypair | null = null;
let _metaplex: Metaplex | null = null;


export const getAdminKeypair = (): Keypair => {
  if (_adminKeypair) return _adminKeypair;

  const privateKey = process.env.ADMIN_SECRET_KEY;
  if (!privateKey) throw new Error("ADMIN_SECRET_KEY not set");

  const secretKey = bs58.decode(privateKey);
  _adminKeypair = Keypair.fromSecretKey(secretKey);

  return _adminKeypair;
};  

export const getMetaplex = (): Metaplex => {
  if (_metaplex) return _metaplex;
  
  const adminKeypair = getAdminKeypair();
  _metaplex = Metaplex.make(connection).use(keypairIdentity(adminKeypair));
  return _metaplex;
};

// Lazy exports - only use getAdminKeypair() and getMetaplex() functions directly
// These are kept for compatibility but may throw if env vars are not set at import time
// export const adminKeypair = getAdminKeypair();
// export const metaplex = getMetaplex();
